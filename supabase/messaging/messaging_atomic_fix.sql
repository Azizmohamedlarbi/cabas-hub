-- CABAS HUB - FINAL RELIABILITY SQL
-- Ensures zero recursion and stable joins

-- 1. Table Settings
ALTER TABLE profiles REPLICA IDENTITY FULL;
ALTER TABLE conversations REPLICA IDENTITY FULL;
ALTER TABLE conversation_participants REPLICA IDENTITY FULL;
ALTER TABLE messages REPLICA IDENTITY FULL;

-- 2. Correct Publication
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR ALL TABLES;

-- 3. Simplified Non-Recursive RLS
-- Using a subquery in a scalar context (EXISTS) is safer than JOINs or recursive policies
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "conv_select_policy" ON conversations;
CREATE POLICY "conv_select_policy" ON conversations
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM conversation_participants 
    WHERE conversation_participants.conversation_id = id 
    AND conversation_participants.user_id = auth.uid()
  )
);

ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "cp_select_policy" ON conversation_participants;
CREATE POLICY "cp_select_policy" ON conversation_participants
FOR SELECT USING (user_id = auth.uid());

-- 4. Messaging Metadata Sync (The Heartbeat)
CREATE OR REPLACE FUNCTION sync_conv_meta()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET 
    last_message_text = COALESCE(NEW.text, '🖼️ Photo'),
    last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_sync_conv_meta ON messages;
CREATE TRIGGER tr_sync_conv_meta
AFTER INSERT ON messages
FOR EACH ROW EXECUTE FUNCTION sync_conv_meta();

-- 5. Helper Function for Read Status
CREATE OR REPLACE FUNCTION mark_as_read_v2(cid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE conversation_participants
  SET last_read_at = now()
  WHERE conversation_id = cid AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
