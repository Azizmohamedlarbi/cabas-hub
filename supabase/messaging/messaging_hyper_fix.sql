-- MESSAGING HYPER-STABILITY SQL FIX

-- 1. Force Full Replica Identity for ALL involved tables
-- This is essential for the join-heavy real-time payloads
ALTER TABLE profiles REPLICA IDENTITY FULL;
ALTER TABLE conversations REPLICA IDENTITY FULL;
ALTER TABLE messages REPLICA IDENTITY FULL;
ALTER TABLE conversation_participants REPLICA IDENTITY FULL;

-- 2. Clean Publication and Re-Add everything correctly
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE 
    messages, 
    conversations, 
    conversation_participants, 
    profiles;

-- 3. Optimization: Add index for conversation participant lookup if missing
CREATE INDEX IF NOT EXISTS idx_conv_participants_user_id ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conv_id ON messages(conversation_id);
