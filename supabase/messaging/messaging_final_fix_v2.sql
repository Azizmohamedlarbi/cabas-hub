-- DEFINITIVE MESSAGING STABILITY FIX
-- Additive and non-destructive where possible.

-- 1. Ensure Columns Exist
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS last_message_text TEXT;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE messages ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. Ensure Replica Identity (Essential for Realtime)
ALTER TABLE conversations REPLICA IDENTITY FULL;
ALTER TABLE conversation_participants REPLICA IDENTITY FULL;
ALTER TABLE messages REPLICA IDENTITY FULL;
ALTER TABLE profiles REPLICA IDENTITY FULL;

-- 3. Simplified, Non-Recursive RLS for Conversations
-- Previous policies using subqueries in IN clauses can be slow or cause recursion issues
DROP POLICY IF EXISTS "Users can view their own conversations." ON conversations;
CREATE POLICY "Users can view their own conversations." ON conversations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversation_participants 
            WHERE conversation_participants.conversation_id = id 
            AND conversation_participants.user_id = auth.uid()
        )
    );

-- 4. Messaging Metadata Sync Trigger
CREATE OR REPLACE FUNCTION update_conv_metadata()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET 
    last_message_text = COALESCE(NEW.text, 'Image'),
    last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_update_conv_metadata ON messages;
CREATE TRIGGER tr_update_conv_metadata
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conv_metadata();

-- 5. Realtime Maintenance
-- Ensure tables are in the publication without dropping it
DO $$
BEGIN
    INSERT INTO pg_publication_tables (pubname, schemaname, tablename)
    VALUES ('supabase_realtime', 'public', 'messages')
    ON CONFLICT DO NOTHING;
    
    INSERT INTO pg_publication_tables (pubname, schemaname, tablename)
    VALUES ('supabase_realtime', 'public', 'conversations')
    ON CONFLICT DO NOTHING;
EXCEPTION WHEN others THEN
    -- If table-level addition fails, attempt to just add the tables
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE messages;
        ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
    EXCEPTION WHEN others THEN NULL;
    END;
END $$;
