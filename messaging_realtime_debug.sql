-- FIXING THE PUBLICATION ERROR
-- This script properly resets the Realtime publication and ensures
-- messages are broadcasted without RLS silently dropping them.

-- 1. Correctly recreate the publication. 
-- Since it was FOR ALL TABLES, we first DROP it completely, 
-- then recreate it explicitly for the tables we need.
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE messages, conversations, conversation_participants;

-- 2. Ensure Replica Identity FULL is strictly applied
ALTER TABLE messages REPLICA IDENTITY FULL;
ALTER TABLE conversations REPLICA IDENTITY FULL;
ALTER TABLE conversation_participants REPLICA IDENTITY FULL;

-- 3. Override the Select Policy with a Bulletproof version for Real-Time Workers
-- Supabase Real-Time evaluates the SELECT policy of a table before broadcasting.
-- If the sender_id or receiver_id evaluation times out, it drops the message.
DROP POLICY IF EXISTS "msg_select_policy" ON messages;

CREATE POLICY "msg_select_policy" ON messages
FOR SELECT USING (
  -- The sender and receiver can see it
  auth.uid() = sender_id OR 
  auth.uid() = receiver_id
);

-- 4. Verify Receiver ID population
-- Let's make sure that for new messages, receiver_id is actually not null
-- Otherwise the SELECT policy will drop it for the receiver.
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
