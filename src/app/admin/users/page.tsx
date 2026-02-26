'use client';
import { useState, useEffect } from 'react';
import { Search, ShieldCheck, ShieldX, UserCheck, UserX, Loader2, Image as ImageIcon, ChevronDown, ChevronUp, X, MessageSquare } from 'lucide-react';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { getUsers, verifySeller, updateProfileStatus, updateUserType, updateUserPlan, updateUserFounderStatus } from '@/lib/admin';
import { getOrCreateConversation } from '@/lib/messages';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';

export default function AdminUsersPage() {
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<'all' | 'seller' | 'buyer' | 'admin'>('all');
    const [anaeFilter, setAnaeFilter] = useState<'all' | 'verified' | 'unverified'>('all');
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    // Photo panel per user
    const [openPhotoPanel, setOpenPhotoPanel] = useState<string | null>(null);
    const [photoInputs, setPhotoInputs] = useState<Record<string, { profile: string; cover: string }>>({});
    const [photoLoading, setPhotoLoading] = useState<string | null>(null);
    const [photoMsg, setPhotoMsg] = useState<Record<string, { type: 'ok' | 'err'; text: string }>>({});

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await getUsers();
            setUsers(data);
            // Init photo inputs
            const inputs: Record<string, { profile: string; cover: string }> = {};
            data.forEach((u: any) => { inputs[u.id] = { profile: '', cover: '' }; });
            setPhotoInputs(inputs);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const filteredUsers = users.filter(u => {
        const name = `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase();
        const matchSearch = !search || name.includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
        const matchType = typeFilter === 'all' || u.user_type === typeFilter;
        const matchAnae = anaeFilter === 'all' || (anaeFilter === 'verified' ? u.anae_verified : !u.anae_verified);
        return matchSearch && matchType && matchAnae;
    });

    const handleVerify = async (id: string) => {
        if (!confirm('Passer ce vendeur en statut "Vérifié" ?')) return;
        try { await verifySeller(id); await fetchUsers(); }
        catch { alert('Erreur lors de la vérification'); }
    };

    const handleToggleStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
        if (!confirm(`Changer le statut en "${newStatus}" ?`)) return;
        try { await updateProfileStatus(id, newStatus); await fetchUsers(); }
        catch { alert('Erreur lors de la mise à jour'); }
    };

    const handleChangeUserType = async (id: string, newType: 'buyer' | 'seller' | 'admin') => {
        if (!confirm(`Changer le type en "${newType}" ?`)) return;
        try { await updateUserType(id, newType); await fetchUsers(); }
        catch { alert('Erreur lors du changement de type'); }
    };

    const handleChangePlan = async (id: string, newPlan: 'free' | 'early_adopter' | 'pro') => {
        let durationMonths: number | null = null;

        if (newPlan !== 'free') {
            const promptResult = window.prompt(`Durée de l'abonnement en mois pour le plan "${newPlan}" ?\n(Laissez vide pour un accès illimité)`);

            if (promptResult === null) return; // User clicked Cancel

            if (promptResult.trim() !== '') {
                const parsed = parseInt(promptResult.trim());
                if (isNaN(parsed) || parsed <= 0) {
                    alert('Veuillez entrer un nombre de mois valide (ex: 1, 3, 12).');
                    return;
                }
                durationMonths = parsed;
            }
        }

        const confirmMsg = newPlan === 'free'
            ? `Changer le plan en "Free" ? (Supprimera l'expiration)`
            : durationMonths
                ? `Activer le plan "${newPlan}" pour ${durationMonths} mois ?`
                : `Activer le plan "${newPlan}" en ILLIMITÉ ?`;

        if (!confirm(confirmMsg)) return;

        try {
            await updateUserPlan(id, newPlan, durationMonths);
            await fetchUsers();
        }
        catch { alert('Erreur lors du changement de plan'); }
    };

    const handleToggleFounder = async (id: string, currentIsFounder: boolean) => {
        const newValue = !currentIsFounder;
        if (!confirm(`Passer is_founder à ${newValue} ?`)) return;
        try { await updateUserFounderStatus(id, newValue); await fetchUsers(); }
        catch { alert('Erreur lors du changement du statut fondateur'); }
    };

    const applyPhoto = async (userId: string, field: 'profile_photo' | 'cover_photo', url: string) => {
        if (!url.trim()) return;
        setPhotoLoading(`${userId}-${field}`);
        setPhotoMsg(m => ({ ...m, [userId]: { type: 'ok', text: '' } }));
        try {
            const { error } = await supabase.from('profiles').update({ [field]: url.trim() }).eq('id', userId);
            if (error) throw error;
            setPhotoMsg(m => ({ ...m, [userId]: { type: 'ok', text: `✅ ${field === 'profile_photo' ? 'Photo de profil' : 'Photo de couverture'} appliquée !` } }));
            setPhotoInputs(v => ({ ...v, [userId]: { ...v[userId], [field === 'profile_photo' ? 'profile' : 'cover']: '' } }));
            await fetchUsers();
        } catch (err: any) {
            setPhotoMsg(m => ({ ...m, [userId]: { type: 'err', text: `❌ ${err.message}` } }));
        } finally {
            setPhotoLoading(null);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f1f5f9' }}>
            <div style={{ display: 'flex' }}>
                <AdminSidebar />
                <main style={{ flex: 1, padding: '28px', overflowX: 'auto' }}>
                    <div style={{ marginBottom: '24px' }}>
                        <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '4px' }}>👤 Gestion des Utilisateurs</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{users.length} utilisateurs inscrits — modérez les comptes et gérez leurs photos</p>
                    </div>

                    {/* Filters */}
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <div style={{ position: 'relative', flex: '1', minWidth: '200px', maxWidth: '320px' }}>
                            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." className="input-base" style={{ paddingLeft: '34px', fontSize: '13px' }} />
                        </div>
                        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)} style={{ padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '13px', background: 'white', cursor: 'pointer' }}>
                            <option value="all">Tous les types</option>
                            <option value="seller">Vendeurs</option>
                            <option value="buyer">Acheteurs</option>
                            <option value="admin">Administrateurs</option>
                        </select>
                        <select value={anaeFilter} onChange={e => setAnaeFilter(e.target.value as any)} style={{ padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '13px', background: 'white', cursor: 'pointer' }}>
                            <option value="all">Statut ANAE: Tous</option>
                            <option value="verified">✅ Vérifié ANAE</option>
                            <option value="unverified">⏳ Non vérifié</option>
                        </select>
                        <button onClick={fetchUsers} style={{ padding: '9px', border: '1px solid var(--border)', background: 'white', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>🔄</button>
                        <p style={{ marginLeft: 'auto', fontSize: '13px', color: 'var(--text-muted)' }}>{filteredUsers.length} résultat(s)</p>
                    </div>

                    {/* User list */}
                    {loading ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
                            <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {filteredUsers.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', background: 'white', borderRadius: 'var(--radius-lg)' }}>Aucun utilisateur trouvé</div>
                            )}
                            {filteredUsers.map(u => {
                                const isPhotoOpen = openPhotoPanel === u.id;
                                const inputs = photoInputs[u.id] || { profile: '', cover: '' };
                                const msg = photoMsg[u.id];
                                return (
                                    <div key={u.id} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                                        {/* Main row */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', flexWrap: 'wrap' }}>
                                            {/* Avatar */}
                                            <img
                                                src={u.profile_photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.first_name || 'U')}&background=e2e8f0&color=475569&size=48`}
                                                alt=""
                                                style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid var(--border)' }}
                                            />
                                            <div style={{ flex: 1, minWidth: '150px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                    <p style={{ fontWeight: 700, fontSize: '14px' }}>{u.first_name} {u.last_name}</p>
                                                    <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, background: u.user_type === 'admin' ? '#fee2e2' : u.user_type === 'seller' ? '#eff6ff' : '#f8fafc', color: u.user_type === 'admin' ? '#991b1b' : u.user_type === 'seller' ? '#1e40af' : '#475569' }}>
                                                        {u.user_type === 'admin' ? '🛡️ Admin' : u.user_type === 'seller' ? '🏪 Vendeur' : '🛒 Acheteur'}
                                                    </span>
                                                    <span className={`badge ${u.status === 'active' ? 'badge-green' : 'badge-red'}`}>{u.status === 'active' ? 'Actif' : 'Suspendu'}</span>
                                                    {u.user_type === 'seller' && (
                                                        u.anae_verified
                                                            ? <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#22c55e', fontWeight: 600, fontSize: '11px' }}><ShieldCheck size={12} />Vérifié</span>
                                                            : <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#f59e0b', fontWeight: 600, fontSize: '11px' }}><ShieldX size={12} />Non vérifié</span>
                                                    )}
                                                </div>
                                                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{u.email} · {u.address_city || '—'} · Inscrit {u.created_at ? formatDate(u.created_at) : '—'}</p>
                                            </div>
                                            {/* Actions */}
                                            <div style={{ display: 'flex', gap: '6px', flexShrink: 0, flexWrap: 'wrap', alignItems: 'center' }}>
                                                {/* Photo panel toggle */}
                                                <button onClick={() => setOpenPhotoPanel(isPhotoOpen ? null : u.id)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 10px', border: `1.5px solid ${isPhotoOpen ? '#3b82f6' : 'var(--border)'}`, borderRadius: 'var(--radius-sm)', background: isPhotoOpen ? '#eff6ff' : 'white', cursor: 'pointer', color: isPhotoOpen ? '#1d4ed8' : 'var(--text-secondary)', fontSize: '12px', fontWeight: 600 }}>
                                                    <ImageIcon size={13} /> Photos {isPhotoOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        const { user } = (await import('@/store/auth')).useAuthStore.getState();
                                                        if (!user) return;
                                                        try {
                                                            const convId = await getOrCreateConversation(user.id, u.id);
                                                            window.location.href = `/messages?conv=${convId}`;
                                                        } catch (err) {
                                                            console.error(err);
                                                            alert('Erreur lors du démarrage de la conversation');
                                                        }
                                                    }}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 10px', border: '1.5px solid var(--secondary)', borderRadius: 'var(--radius-sm)', background: 'white', cursor: 'pointer', color: 'var(--secondary)', fontSize: '12px', fontWeight: 600 }}
                                                >
                                                    <MessageSquare size={13} /> Contacter
                                                </button>
                                                <select value={u.user_type} onChange={e => handleChangeUserType(u.id, e.target.value as any)} style={{ padding: '5px 8px', borderRadius: 'var(--radius-sm)', fontSize: '11px', fontWeight: 600, border: '1px solid var(--border)', background: 'white', cursor: 'pointer' }}>
                                                    <option value="buyer">🛒 Acheteur</option>
                                                    <option value="seller">🏪 Vendeur</option>
                                                    <option value="admin">🛡️ Admin</option>
                                                </select>
                                                <select value={u.plan || 'free'} onChange={e => handleChangePlan(u.id, e.target.value as any)} style={{ padding: '5px 8px', borderRadius: 'var(--radius-sm)', fontSize: '11px', fontWeight: 600, border: '1px solid var(--border)', background: 'white', cursor: 'pointer' }}>
                                                    <option value="free">Free</option>
                                                    <option value="early_adopter">Early Adopter</option>
                                                    <option value="pro">Pro</option>
                                                </select>
                                                <button onClick={() => handleToggleFounder(u.id, !!u.is_founder)} style={{ padding: '5px 10px', background: u.is_founder ? '#fef3c7' : 'white', border: `1.5px solid ${u.is_founder ? '#f59e0b' : 'var(--border)'}`, borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: u.is_founder ? '#d97706' : 'var(--text-secondary)', fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                    ⭐ Fondateur
                                                </button>
                                                {u.user_type === 'seller' && !u.anae_verified && (
                                                    <button onClick={() => handleVerify(u.id)} style={{ padding: '5px 10px', background: 'var(--primary-bg)', border: '1.5px solid var(--primary)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: 'var(--primary)', fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                        <UserCheck size={11} /> Vérifier
                                                    </button>
                                                )}
                                                <button onClick={() => handleToggleStatus(u.id, u.status)} style={{ padding: '5px 10px', background: u.status === 'active' ? '#fef2f2' : 'var(--primary-bg)', border: `1.5px solid ${u.status === 'active' ? '#fecaca' : 'var(--primary)'}`, borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: u.status === 'active' ? '#ef4444' : 'var(--primary)', fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                    {u.status === 'active' ? <><UserX size={11} /> Suspendre</> : <><UserCheck size={11} /> Activer</>}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Expandable photo panel */}
                                        {isPhotoOpen && (
                                            <div style={{ borderTop: '1px solid var(--border)', padding: '20px', background: '#f8fafc' }}>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) 2fr', gap: '32px' }}>
                                                    {/* Details Section */}
                                                    <div>
                                                        <h3 style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            📋 Informations Détaillées
                                                        </h3>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'white', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                                                            <div>
                                                                <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Nom de la boutique</p>
                                                                <p style={{ fontSize: '13px', fontWeight: 600 }}>{u.business_name || 'Non renseigné'}</p>
                                                            </div>
                                                            <div>
                                                                <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Téléphone</p>
                                                                <p style={{ fontSize: '13px', fontWeight: 600 }}>{u.phone || 'Non renseigné'}</p>
                                                            </div>
                                                            <div>
                                                                <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Localisation</p>
                                                                <p style={{ fontSize: '13px', fontWeight: 600 }}>{u.address_wilaya ? `${u.address_wilaya} (${u.address_city || ''})` : 'Non renseigné'}</p>
                                                            </div>
                                                            <div>
                                                                <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Bio / Description</p>
                                                                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4', marginTop: '4px' }}>{u.bio || 'Aucune bio'}</p>
                                                            </div>
                                                            {u.specialties && u.specialties.length > 0 && (
                                                                <div>
                                                                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Spécialités</p>
                                                                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                                                                        {u.specialties.map((s: string) => <span key={s} style={{ fontSize: '10px', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{s}</span>)}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Photos Section */}
                                                    <div>
                                                        <h3 style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '16px' }}>📸 Gestion des Photos</h3>
                                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                                            {/* Profile photo */}
                                                            <div>
                                                                <label style={{ fontWeight: 600, fontSize: '12px', display: 'block', marginBottom: '8px' }}>Photo de profil actuelle</label>
                                                                <img
                                                                    src={u.profile_photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.first_name || 'U')}&size=80`}
                                                                    alt=""
                                                                    style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', marginBottom: '12px', border: '3px solid white', boxShadow: 'var(--shadow-sm)' }}
                                                                />
                                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                                    <input
                                                                        type="url"
                                                                        placeholder="Coller lien photo profil..."
                                                                        value={inputs.profile}
                                                                        onChange={e => setPhotoInputs(v => ({ ...v, [u.id]: { ...v[u.id], profile: e.target.value } }))}
                                                                        className="input-base"
                                                                        style={{ flex: 1, fontSize: '12px' }}
                                                                        onKeyDown={e => { if (e.key === 'Enter') applyPhoto(u.id, 'profile_photo', inputs.profile); }}
                                                                    />
                                                                    <button
                                                                        onClick={() => applyPhoto(u.id, 'profile_photo', inputs.profile)}
                                                                        disabled={photoLoading === `${u.id}-profile_photo` || !inputs.profile.trim()}
                                                                        style={{ padding: '8px 12px', background: '#1d4ed8', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 700, fontSize: '12px', opacity: !inputs.profile.trim() ? 0.6 : 1 }}
                                                                    >
                                                                        {photoLoading === `${u.id}-profile_photo` ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : 'Appliquer'}
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {/* Cover photo */}
                                                            <div>
                                                                <label style={{ fontWeight: 600, fontSize: '12px', display: 'block', marginBottom: '8px' }}>Photo de couverture actuelle</label>
                                                                {u.cover_photo ? (
                                                                    <img src={u.cover_photo} alt="" style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '12px', border: '1px solid var(--border)' }} />
                                                                ) : (
                                                                    <div style={{ width: '100%', height: '80px', background: '#e2e8f0', borderRadius: 'var(--radius-md)', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>Aucune couverture</div>
                                                                )}
                                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                                    <input
                                                                        type="url"
                                                                        placeholder="Coller lien couverture..."
                                                                        value={inputs.cover}
                                                                        onChange={e => setPhotoInputs(v => ({ ...v, [u.id]: { ...v[u.id], cover: e.target.value } }))}
                                                                        className="input-base"
                                                                        style={{ flex: 1, fontSize: '12px' }}
                                                                        onKeyDown={e => { if (e.key === 'Enter') applyPhoto(u.id, 'cover_photo', inputs.cover); }}
                                                                    />
                                                                    <button
                                                                        onClick={() => applyPhoto(u.id, 'cover_photo', inputs.cover)}
                                                                        disabled={photoLoading === `${u.id}-cover_photo` || !inputs.cover.trim()}
                                                                        style={{ padding: '8px 12px', background: '#1d4ed8', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 700, fontSize: '12px', opacity: !inputs.cover.trim() ? 0.6 : 1 }}
                                                                    >
                                                                        {photoLoading === `${u.id}-cover_photo` ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : 'Appliquer'}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {msg?.text && (
                                                            <div style={{ marginTop: '16px', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: msg.type === 'ok' ? '#f0fdf4' : '#fef2f2', border: `1px solid ${msg.type === 'ok' ? '#bbf7d0' : '#fecaca'}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <span style={{ fontSize: '13px', color: msg.type === 'ok' ? '#166534' : '#991b1b', fontWeight: 600 }}>{msg.text}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
