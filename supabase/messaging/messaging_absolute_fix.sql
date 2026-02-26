-- CABAS HUB - THE ABSOLUTE REAL-TIME MESSAGING FIX
-- Run this script in the Supabase SQL Editor. 
-- It creates a receiver_id column and uses it for RLS, completely bypassing Postgres subquery limitations in Real-Time.

-- 1. Ensure Full Replica Identity
ALTER TABLE conversations REPLICA IDENTITY FULL;
ALTER TABLE conversation_participants REPLICA IDENTITY FULL;
ALTER TABLE messages REPLICA IDENTITY FULL;
ALTER TABLE profiles REPLICA IDENTITY FULL;

-- 2. Add receiver_id to messages
ALTER TABLE messages ADD COLUMN IF NOT EXISTS receiver_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- 3. Populate existing receiver_ids
UPDATE messages m
SET receiver_id = cp.user_id
FROM conversation_participants cp
WHERE cp.conversation_id = m.conversation_id
  AND cp.user_id != m.sender_id
  AND m.receiver_id IS NULL;

-- 4. Create trigger to automatically assign receiver_id for new messages
CREATE OR REPLACE FUNCTION set_message_receiver()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.receiver_id IS NULL THEN
    SELECT user_id INTO NEW.receiver_id
    FROM conversation_participants
    WHERE conversation_id = NEW.conversation_id
      AND user_id != NEW.sender_id
    LIMIT 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_set_message_receiver ON messages;
CREATE TRIGGER tr_set_message_receiver
BEFORE INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION set_message_receiver();

-- 5. Set Lightning-Fast RLS using ONLY direct column comparisons!
DROP POLICY IF EXISTS "msg_select_policy" ON messages;
DROP POLICY IF EXISTS "msg_insert_policy" ON messages;
DROP POLICY IF EXISTS "msg_update_policy" ON messages;
DROP POLICY IF EXISTS "msg_delete_policy" ON messages;
DROP POLICY IF EXISTS "Users can view messages." ON messages;
DROP POLICY IF EXISTS "Users can send messages to their conversations." ON messages;
DROP POLICY IF EXISTS "Users can view their messages" ON messages;

CREATE POLICY "msg_select_policy" ON messages
FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "msg_insert_policy" ON messages
FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "msg_update_policy" ON messages
FOR UPDATE USING (auth.uid() = sender_id);

CREATE POLICY "msg_delete_policy" ON messages
FOR DELETE USING (auth.uid() = sender_id);

-- 6. Rebuild the Realtime Publication just in case
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR ALL TABLES;

-- 7. Add index for receiver_id
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
