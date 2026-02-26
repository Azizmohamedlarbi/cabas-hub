-- CABAS HUB - MESSAGING V2 REBUILD
-- WARNING: This script drops all old messaging history to establish a perfectly clean, reliable 2-table schema.

-- 1. TEARDOWN OF OLD SYSTEM
DROP PUBLICATION IF EXISTS supabase_realtime;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversation_participants CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;

-- 2. CREATE NEW STREAMLINED TABLES
-- We merge the concept of "conversation" and "participants" into one 'chats' table.
-- A chat is defined strictly by the two users in it.
CREATE TABLE chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    last_message TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    -- Enforce uniqueness regardless of who initiated the chat
    UNIQUE(user1_id, user2_id),
    CHECK (user1_id != user2_id) -- Prevent self-chat
);

-- Index the users for lightning fast sidebar loading
CREATE INDEX idx_chats_users ON chats(user1_id, user2_id);

CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    text TEXT,
    image_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index for loading chat history instantly
CREATE INDEX idx_chat_messages_chat_id ON chat_messages(chat_id);
-- Index for filtering unread notifications system-wide
CREATE INDEX idx_chat_messages_receiver_read ON chat_messages(receiver_id, is_read);

-- 3. ENSURE REPLICA IDENTITY (The secret to reliable Real-Time)
ALTER TABLE chats REPLICA IDENTITY FULL;
ALTER TABLE chat_messages REPLICA IDENTITY FULL;
ALTER TABLE profiles REPLICA IDENTITY FULL;

-- 4. ATOMIC METADATA UPDATE TRIGGER
-- Replaces old complex triggers. When a message is sent, instantly update the chat snippet.
CREATE OR REPLACE FUNCTION update_chat_metadata()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE chats 
    SET 
        last_message = COALESCE(NEW.text, '📷 Photo'),
        last_message_at = NEW.created_at
    WHERE id = NEW.chat_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_update_chat_metadata
AFTER INSERT ON chat_messages
FOR EACH ROW EXECUTE FUNCTION update_chat_metadata();

-- 5. PURE AND FAST ROW LEVEL SECURITY (RLS)
-- We avoid all SELECT subqueries! Realtime simply checks if auth.uid() matches sender or receiver.
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Chats RLS
CREATE POLICY "Users can view their chats" ON chats 
FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create chats" ON chats 
FOR INSERT WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can update their chats" ON chats 
FOR UPDATE USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Chat Messages RLS
CREATE POLICY "Users can view their chat messages" ON chat_messages 
FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can insert chat messages" ON chat_messages 
FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update chat messages (read status)" ON chat_messages 
FOR UPDATE USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- 6. RPC HELPERS TO KEEP FRONTEND STUPID SIMPLE
CREATE OR REPLACE FUNCTION get_or_create_chat_v2(other_user_id UUID)
RETURNS UUID AS $$
DECLARE
    found_chat_id UUID;
    my_uid UUID := auth.uid();
    uid1 UUID;
    uid2 UUID;
BEGIN
    IF my_uid = other_user_id THEN
        RAISE EXCEPTION 'Cannot chat with yourself';
    END IF;

    -- Sort UUIDs consistently to ensure the UNIQUE constraint hits perfectly
    IF my_uid < other_user_id THEN
        uid1 := my_uid;
        uid2 := other_user_id;
    ELSE
        uid1 := other_user_id;
        uid2 := my_uid;
    END IF;

    -- 1. Try to find existing
    SELECT id INTO found_chat_id FROM chats 
    WHERE user1_id = uid1 AND user2_id = uid2;

    -- 2. Insert if not found
    IF found_chat_id IS NULL THEN
        INSERT INTO chats (user1_id, user2_id) 
        VALUES (uid1, uid2) 
        RETURNING id INTO found_chat_id;
    END IF;

    RETURN found_chat_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 7. REBUILD PUBLICATION EXCLUSIVELY FOR V2 TABLES
CREATE PUBLICATION supabase_realtime FOR TABLE chats, chat_messages;
