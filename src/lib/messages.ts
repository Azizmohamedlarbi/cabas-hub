import { supabase } from './supabase';

export async function getConversations(userId: string) {
    if (!userId) return [];
    console.log('[Messaging V2] Fetching chats for user:', userId);

    // Fetch all chats where the user is either user1 or user2
    const { data: chats, error } = await supabase
        .from('chats')
        .select(`
            id,
            user1_id,
            user2_id,
            last_message,
            last_message_at,
            user1:profiles!chats_user1_id_fkey(id, first_name, last_name, profile_photo),
            user2:profiles!chats_user2_id_fkey(id, first_name, last_name, profile_photo)
        `)
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .order('last_message_at', { ascending: false });

    if (error) {
        console.error('[Messaging V2] getConversations Error:', error.message);
        throw error;
    }

    // Process the results into a unified format for the UI
    const processed = await Promise.all((chats || []).map(async (chat: any) => {
        // Identify the "other" person in the chat
        const isUser1 = chat.user1_id === userId;
        const contact = isUser1 ? chat.user2 : chat.user1;
        const contactId = isUser1 ? chat.user2_id : chat.user1_id;

        // Check if there are unread messages sent TO the current user
        const { count, error: countErr } = await supabase
            .from('chat_messages')
            .select('id', { count: 'exact', head: true })
            .eq('chat_id', chat.id)
            .eq('receiver_id', userId)
            .eq('is_read', false);

        return {
            id: chat.id,
            participant: contact || { first_name: 'Utilisateur inconnu', id: contactId },
            lastMessage: chat.last_message || 'Nouvelle discussion',
            lastMessageAt: chat.last_message_at || new Date().toISOString(),
            unread: count ? count > 0 : false
        };
    }));

    return processed;
}

export async function getConversation(chatId: string, userId: string) {
    if (!chatId || !userId) return null;
    console.log('[Messaging V2] Opening chat:', chatId);

    // 1. Fetch Chat Info
    const { data: chat, error: chatErr } = await supabase
        .from('chats')
        .select(`
            id,
            user1_id,
            user2_id,
            user1:profiles!chats_user1_id_fkey(id, first_name, last_name, profile_photo),
            user2:profiles!chats_user2_id_fkey(id, first_name, last_name, profile_photo)
        `)
        .eq('id', chatId)
        .single();

    if (chatErr) {
        console.error('[Messaging V2] getConversation Error:', chatErr.message);
        return null;
    }

    // Identify Contact
    const isUser1 = chat.user1_id === userId;
    const contact = isUser1 ? chat.user2 : chat.user1;
    const contactId = isUser1 ? chat.user2_id : chat.user1_id;

    // 2. Fetch Messages
    const { data: messages, error: msgErr } = await supabase
        .from('chat_messages')
        .select('id, text, image_url, created_at, sender_id, receiver_id, is_read')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

    return {
        id: chat.id,
        participant: contact || { first_name: 'Contact', id: contactId },
        messages: messages || []
    };
}

// --- AUTH TOKEN TRACKER TO AVOID GOTRUE DEADLOCKS ---
let cachedJwtToken = '';

// Eagerly grab token on module load
if (typeof window !== 'undefined') {
    supabase.auth.getSession().then(({ data }) => {
        if (data?.session?.access_token) cachedJwtToken = data.session.access_token;
    }).catch(console.error);

    supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.access_token) cachedJwtToken = session.access_token;
    });
}

export async function sendMessage(chatId: string, senderId: string, receiverId: string, text: string, imageUrl?: string) {
    console.log('[Messaging V2 - API] 1. Starting sendMessage', { chatId, senderId, receiverId, text });

    const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Supabase Timeout: The network promise hung infinitely without responding.")), 5000)
    );

    try {
        const token = cachedJwtToken || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        console.log('[Messaging V2 - API] 2. Executing direct raw fetch to bypass Supabase queue deadlock');

        const fetchPromise = fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/chat_messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                'Authorization': `Bearer ${token}`,
                'Prefer': 'return=representation' // This forces Supabase to return the inserted record (like .select().single())
            },
            body: JSON.stringify({
                chat_id: chatId,
                sender_id: senderId,
                receiver_id: receiverId,
                text: text,
                image_url: imageUrl || null,
                is_read: false
            })
        }).then(async res => {
            if (!res.ok) {
                const errText = await res.text();
                throw new Error(`Erreur de base de données HTTP ${res.status}: ${errText}`);
            }
            return res.json();
        });

        // Race the database insert against the 5 second timeout
        const responseData = await Promise.race([fetchPromise, timeoutPromise]) as any;
        const data = Array.isArray(responseData) ? responseData[0] : responseData;

        console.log('[Messaging V2 - API] 3. Successfully inserted message into DB natively:', data?.id);
        return data;

    } catch (err: any) {
        console.error('[Messaging V2 - API] 4. Executed Catch Block:', err.message);
        throw err;
    }
}

export async function markAsRead(chatId: string, userId: string) {
    if (!chatId || !userId) return;
    try {
        const token = cachedJwtToken || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/chat_messages?chat_id=eq.${chatId}&receiver_id=eq.${userId}&is_read=eq.false`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ is_read: true })
        });
    } catch (e) {
        console.warn('[Messaging V2] markAsRead skipped:', e);
    }
}

export async function getOrCreateConversation(currentUserId: string, targetUserId: string) {
    try {
        // We use the new simplified RPC function exclusively
        const { data: chatId, error } = await supabase.rpc('get_or_create_chat_v2', {
            other_user_id: targetUserId
        });

        if (error) throw error;
        return chatId;
    } catch (err: any) {
        console.error('[Messaging V2] getOrCreateChat error:', err.message);
        throw err;
    }
}
