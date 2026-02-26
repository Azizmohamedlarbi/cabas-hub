-- FIX FOR REALTIME DELIVERY

-- Ensure ALL messaging tables are in the realtime publication
-- This is CRITICAL for the client to receive updates automatically
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE conversation_participants;

-- Note: 'messages' should already be in there, but just in case:
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'messages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE messages;
    END IF;
EXCEPTION WHEN others THEN
    -- Fallback if publication doesn't exist yet
    NULL;
END $$;
