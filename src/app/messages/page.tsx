'use client';
import { useState, useEffect, useRef, Suspense, useCallback } from 'react';
import { Send, Search, Loader2, Image as ImageIcon, CheckCheck, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { supabase } from '@/lib/supabase';
import { getConversations, sendMessage, getConversation, markAsRead } from '@/lib/messages';
import { formatRelativeDate } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';
import InlineFeedback from '@/components/feedback/InlineFeedback';

function MessagesContent() {
    const { user } = useAuthStore();
    const searchParams = useSearchParams();
    const convIdFromUrl = searchParams.get('conv');

    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);
    const [convs, setConvs] = useState<any[]>([]);
    const [activeConv, setActiveConv] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [search, setSearch] = useState('');

    const userRef = useRef<any>(null);
    const activeRef = useRef<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Sync refs instantly
    useEffect(() => { userRef.current = user; }, [user]);
    useEffect(() => { activeRef.current = activeConv; }, [activeConv]);

    const loadData = useCallback(async (isBg = false) => {
        if (!userRef.current) return;
        if (!isBg) { setLoading(true); setErr(null); }
        try {
            const data = await getConversations(userRef.current.id);
            setConvs(data || []);

            if (convIdFromUrl && !activeRef.current) {
                const target = data.find((c: any) => c.id === convIdFromUrl);
                if (target) await handleSelect(target);
            } else if (data.length > 0 && !activeRef.current && !convIdFromUrl) {
                await handleSelect(data[0]);
            }
        } catch (e: any) {
            console.error('[Messaging V2] Sync error:', e);
            setErr(e.message || 'Échec de synchronisation');
        } finally {
            if (!isBg) setLoading(false);
        }
    }, [convIdFromUrl]);

    const handleSelect = async (conv: any) => {
        if (!conv?.id || !userRef.current?.id) return;
        if (activeRef.current?.id === conv.id && messages.length > 0) return;

        setActiveConv(conv);
        setMessages([]);
        try {
            const res = await getConversation(conv.id, userRef.current.id);
            if (res) {
                setMessages(res.messages || []);
                await markAsRead(conv.id, userRef.current.id);
                setConvs(prev => prev.map(c => c.id === conv.id ? { ...c, unread: false } : c));
            }
        } catch (e) {
            console.error('[Messaging V2] Fetch failed:', e);
        }
    };

    // V2 BULLETPROOF REAL-TIME LISTENER
    useEffect(() => {
        if (!user?.id) return;

        const channelId = `v2_msg_${user.id}_${Math.random().toString(36).substring(7)}`;
        console.log('[Messaging V2] Connecting Real-Time channel:', channelId);

        // We listen exclusively to the chat_messages table
        const channel = supabase.channel(channelId)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, (payload) => {
                const msg = payload.new as any;
                const currentActive = activeRef.current;
                const currentUser = userRef.current;

                console.log('[Messaging V2] Real-time message arrived!', msg);

                // 1. Update Active Window
                if (currentActive?.id === msg.chat_id) {
                    setMessages(prev => {
                        // Duplicate Protection
                        if (prev.some(m => m.id === msg.id)) return prev;

                        // Replace Optimsitic Message
                        const tempIndex = prev.findIndex(m => String(m.id).startsWith('temp-') && m.text === msg.text);
                        if (tempIndex !== -1) {
                            const next = [...prev];
                            next[tempIndex] = msg;
                            return next;
                        }

                        return [...prev, msg];
                    });

                    // Mark as read instantly if window is open
                    if (msg.sender_id !== currentUser?.id) {
                        markAsRead(msg.chat_id, currentUser.id).catch(console.error);
                    }
                }

                // 2. Update Sidebar List
                setConvs(prev => {
                    const idx = prev.findIndex(c => c.id === msg.chat_id);
                    if (idx === -1) {
                        // Brand new chat started by someone else!
                        loadData(true);
                        return prev;
                    }

                    const next = [...prev];
                    next[idx] = {
                        ...next[idx],
                        lastMessage: msg.text || '📷 Photo',
                        lastMessageAt: msg.created_at,
                        unread: currentActive?.id !== msg.chat_id && msg.sender_id !== currentUser?.id
                    };
                    return next.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
                });
            })
            .subscribe((status, err) => {
                console.log('[Messaging V2] Status:', status);
                if (err) console.error('[Messaging V2] Subscription Error', err);
            });

        return () => {
            console.log('[Messaging V2] Tearing down channel', channelId);
            supabase.removeChannel(channel);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]); // CRITICAL: Removed loadData so channel never disconnects on state changes

    useEffect(() => { loadData(); }, [user?.id, loadData]);
    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const handleSend = async (img?: string) => {
        const currentUser = userRef.current;
        const currentActive = activeRef.current;

        if ((!input.trim() && !img) || !currentActive?.id || !currentUser) return;

        const txt = input.trim();
        const cid = currentActive.id;
        // The receiver is the contact we're talking to
        const receiverId = currentActive.participant.id;

        console.log('[Messaging UI] 1. Triggered handleSend:', { txt, cid, receiverId, img });

        setInput('');

        const tempId = `temp-${Date.now()}`;
        const tempMsg = {
            id: tempId,
            text: txt,
            image_url: img,
            sender_id: currentUser.id,
            receiver_id: receiverId,
            created_at: new Date().toISOString(),
            is_read: false
        };

        // Optimistic UI updates
        console.log('[Messaging UI] 2. Applying Optimistic Message:', tempMsg);
        setMessages(prev => [...prev, tempMsg]);
        setConvs(prev => {
            const idx = prev.findIndex(c => c.id === cid);
            if (idx === -1) return prev;
            const next = [...prev];
            next[idx] = {
                ...next[idx],
                lastMessage: txt || '📷 Photo',
                lastMessageAt: tempMsg.created_at,
                unread: false
            };
            return next.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
        });

        // Network Execution
        try {
            console.log('[Messaging UI] 3. Calling API sendMessage...');
            const realMsg = await sendMessage(cid, currentUser.id, receiverId, txt, img);
            console.log('[Messaging UI] 4. API Success! Real message received:', realMsg);

            // Absolutely safe UI sync that prevents race conditions with websockets
            setMessages(prev => {
                const cleaned = prev.filter(m => m.id !== tempId);
                // The websocket might have already pushed the realMsg
                if (cleaned.some(m => m.id === realMsg.id)) {
                    console.log('[Messaging UI] 5a. Realtime already delivered the message, keeping websocket version.');
                    return cleaned;
                }
                console.log('[Messaging UI] 5b. Manually syncing database message into UI state array.');
                return [...cleaned, realMsg];
            });
            console.log('[Messaging UI] 6. Send flow fully completed successfully.');

        } catch (err: any) {
            console.error('[Messaging UI] OVERALL SEND FAILED:', err);
            setMessages(prev => prev.filter(m => m.id !== tempId));
            alert(`L'envoi a échoué: ${err?.message || 'Erreur inconnue'}`);
        }
    };

    if (loading) return <div style={{ height: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 className="animate-spin text-blue-500" size={40} /></div>;

    if (err) return (
        <div style={{ height: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
            <AlertCircle size={48} color="#ef4444" />
            <p style={{ fontWeight: 600 }}>{err}</p>
            <button onClick={() => loadData()} style={{ padding: '10px 24px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer' }}>Réessayer</button>
        </div>
    );

    const filtered = convs.filter(c =>
        String(c.participant?.first_name || '').toLowerCase().includes(search.toLowerCase()) ||
        String(c.lastMessage || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex h-[calc(100vh-80px)] md:h-[calc(100vh-140px)] bg-white m-0 md:m-5 md:rounded-3xl overflow-hidden border border-slate-200 shadow-sm">

            {/* Sidebar */}
            <div className={`${activeConv ? 'hidden md:flex' : 'flex'} w-full md:w-[380px] border-r-0 md:border-r border-slate-200 flex-col`}>
                <div style={{ padding: '24px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '20px' }}>Messages</h2>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Chercher..." style={{ width: '100%', height: '48px', paddingLeft: '48px', border: 'none', background: '#f1f5f9', borderRadius: '16px', fontSize: '15px' }} />
                    </div>
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {filtered.map(c => (
                        <button key={c.id} onClick={() => handleSelect(c)} style={{ width: '100%', padding: '16px 24px', display: 'flex', gap: '16px', border: 'none', background: activeConv?.id === c.id ? '#eff6ff' : 'white', cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid #f8fafc' }}>
                            <div style={{ position: 'relative' }}>
                                <img src={c.participant?.profile_photo || '/placeholder-user.png'} style={{ width: '56px', height: '56px', borderRadius: '18px', objectFit: 'cover' }} />
                                {c.unread && <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '14px', height: '14px', background: '#ef4444', borderRadius: '50%', border: '2.5px solid white' }} />}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span style={{ fontWeight: 800, fontSize: '15.5px' }}>{c.participant?.first_name}</span>
                                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>{formatRelativeDate(c.lastMessageAt)}</span>
                                </div>
                                <p style={{ fontSize: '13.5px', color: c.unread ? '#2563eb' : '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: c.unread ? 700 : 400 }}>{c.lastMessage}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`${!activeConv ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-slate-50`}>
                {activeConv ? (
                    <>
                        <div style={{ padding: '18px 20px', background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <button className="md:hidden flex items-center justify-center w-10 h-10 bg-slate-100 rounded-full mr-2" onClick={() => setActiveConv(null)}>
                                ⬅
                            </button>
                            <img src={activeConv.participant?.profile_photo || '/placeholder-user.png'} style={{ width: '42px', height: '42px', borderRadius: '14px', objectFit: 'cover' }} />
                            <div>
                                <h3 style={{ fontWeight: 800, fontSize: '16.5px' }}>{activeConv.participant?.first_name} {activeConv.participant?.last_name}</h3>
                                <p style={{ fontSize: '11px', color: '#10b981', fontWeight: 800 }}>● EN LIGNE</p>
                            </div>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {messages.map((m, idx) => {
                                const isMe = String(m.sender_id || '').toLowerCase() === String(user?.id || '').toLowerCase();
                                return (
                                    <div key={m.id || idx} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: '10px' }}>
                                        {!isMe && <img src={activeConv.participant?.profile_photo || '/placeholder-user.png'} style={{ width: '30px', height: '30px', borderRadius: '10px' }} />}
                                        <div style={{ maxWidth: '75%', display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                                            {m.image_url && <img src={m.image_url} style={{ maxWidth: '100%', borderRadius: '18px', marginBottom: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }} />}
                                            {m.text && <div style={{ background: isMe ? '#2563eb' : 'white', color: isMe ? 'white' : '#1e293b', padding: '14px 20px', borderRadius: isMe ? '20px 20px 4px 20px' : '20px 20px 20px 4px', fontSize: '15px', fontWeight: 500, border: isMe ? 'none' : '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>{m.text}</div>}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                                                <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700 }}>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                {isMe && <CheckCheck size={14} color={m.is_read ? "#10b981" : "#94a3b8"} />}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        <div style={{ padding: '16px 20px', background: 'white', borderTop: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => { const u = prompt('Lien image:'); if (u) handleSend(u); }} style={{ width: '45px', height: '45px', borderRadius: '15px', border: 'none', background: '#f1f5f9', cursor: 'pointer', flexShrink: 0 }}><ImageIcon size={20} color="#64748b" /></button>
                                <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Écrire..." style={{ flex: 1, height: '45px', padding: '0 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '15px', fontSize: '15px', minWidth: 0 }} />
                                <button onClick={() => handleSend()} disabled={!input.trim()} style={{ width: '45px', height: '45px', background: input.trim() ? '#2563eb' : '#cbd5e1', color: 'white', border: 'none', borderRadius: '15px', cursor: 'pointer', flexShrink: 0 }}><Send size={20} /></button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>
                        <Send size={64} style={{ opacity: 0.2, marginBottom: '20px' }} />
                        <p style={{ fontWeight: 600, marginBottom: '40px' }}>Sélectionnez un contact pour discuter</p>

                        <div style={{ opacity: 0.8, pointerEvents: 'auto' }}>
                            <InlineFeedback feature="messaging" title="Que pensez-vous de la messagerie ?" type="emotes" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function MessagesPage() {
    return (
        <Suspense fallback={<div style={{ height: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 className="animate-spin text-blue-500" /></div>}>
            <MessagesContent />
        </Suspense>
    );
}
