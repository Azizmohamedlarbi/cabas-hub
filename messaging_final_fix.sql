-- FINAL REALTIME STABILITY FIX

-- 1. Ensure Replica Identity is FULL for messaging tables
-- This ensures that the 'old' record is available and all columns are present in 'new'
ALTER TABLE conversations REPLICA IDENTITY FULL;
ALTER TABLE messages REPLICA IDENTITY FULL;
ALTER TABLE conversation_participants REPLICA IDENTITY FULL;

-- 2. Verify and Repair Publication
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE 
    messages, 
    conversations, 
    conversation_participants, 
    profiles;

-- 3. Ensure RLS allows the 'service' to broadcast
-- (Already handled by standard Supabase setup, but good to verify)
