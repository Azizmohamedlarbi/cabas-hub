-- MESSAGING SYSTEM DEFINITIVE RESET
-- Run this in Supabase SQL Editor to ensure a clean state

-- 1. Cleanup old logic
DROP TRIGGER IF EXISTS on_message_inserted_update_conv ON messages;
DROP FUNCTION IF EXISTS update_conversation_metadata();
DROP FUNCTION IF EXISTS mark_conversation_as_read(UUID);

-- 2. Ensure Schema is Perfect
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS last_message_text TEXT;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE conversation_participants ADD COLUMN IF NOT EXISTS last_read_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE messages ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 3. Replica Identity (Crucial for Realtime)
ALTER TABLE conversations REPLICA IDENTITY FULL;
ALTER TABLE conversation_participants REPLICA IDENTITY FULL;
ALTER TABLE messages REPLICA IDENTITY FULL;
ALTER TABLE profiles REPLICA IDENTITY FULL;

-- 4. Unified Sync Trigger
CREATE OR REPLACE FUNCTION sync_conversation_metadata()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET 
    last_message_text = NEW.text,
    last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_sync_conv_on_msg
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION sync_conversation_metadata();

-- 5. Atomic Mark As Read Function
CREATE OR REPLACE FUNCTION mark_conversation_as_read(conv_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE conversation_participants
  SET last_read_at = now()
  WHERE conversation_id = conv_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Realtime Publication (The RIGHT way)
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR ALL TABLES;

-- 7. High Performance Indexes
CREATE INDEX IF NOT EXISTS idx_msg_conv_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_msg_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_cp_user_id ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_cp_conv_id ON conversation_participants(conversation_id);
