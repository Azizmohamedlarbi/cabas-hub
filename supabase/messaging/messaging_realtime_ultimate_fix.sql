-- CABAS HUB - DEFINITIVE MESSAGING REAL-TIME FIX
-- Run this in the Supabase SQL Editor to fix the issue where
-- messages stop passing between users after 1 or 2 attempts.

-- 1. Ensure Replica Identity is FULL for all relevant tables
-- This ensures Real-Time sends the full record payload including relations
ALTER TABLE conversations REPLICA IDENTITY FULL;
ALTER TABLE conversation_participants REPLICA IDENTITY FULL;
ALTER TABLE messages REPLICA IDENTITY FULL;
ALTER TABLE profiles REPLICA IDENTITY FULL;

-- 2. Clean up old problematic policies for 'messages'
-- The old policy used 'get_my_conversations()' which is extremely slow
-- and causes Supabase Real-Time workers to drop the broadcast quietly.
DROP POLICY IF EXISTS "Users can view messages." ON messages;
DROP POLICY IF EXISTS "Users can send messages to their conversations." ON messages;
DROP POLICY IF EXISTS "Users can view their messages" ON messages;
DROP POLICY IF EXISTS "msg_select_policy" ON messages;
DROP POLICY IF EXISTS "msg_insert_policy" ON messages;
DROP POLICY IF EXISTS "msg_update_policy" ON messages;
DROP POLICY IF EXISTS "msg_delete_policy" ON messages;

-- 3. Create extremely fast and robust RLS policies for 'messages'
-- A raw EXISTS is highly optimized in PostgreSQL and doesn't break Real-Time
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "msg_select_policy" ON messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM conversation_participants 
    WHERE conversation_participants.conversation_id = messages.conversation_id 
    AND conversation_participants.user_id = auth.uid()
  )
);

CREATE POLICY "msg_insert_policy" ON messages
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM conversation_participants 
    WHERE conversation_participants.conversation_id = messages.conversation_id 
    AND conversation_participants.user_id = auth.uid()
  )
  AND sender_id = auth.uid()
);

CREATE POLICY "msg_update_policy" ON messages
FOR UPDATE USING (sender_id = auth.uid());

CREATE POLICY "msg_delete_policy" ON messages
FOR DELETE USING (sender_id = auth.uid());

-- 4. Rebuild the Realtime Publication
-- This forces Supabase to properly broadcast events for all tables, including messages!
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR ALL TABLES;

-- 5. Atomic check to assure indexes are in place for lightning speed RLS
CREATE INDEX IF NOT EXISTS idx_participants_user_id ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_participants_conv_id ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_conv_id ON messages(conversation_id);
