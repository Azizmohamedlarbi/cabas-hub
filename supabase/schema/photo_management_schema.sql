-- PHOTO MANAGEMENT SYSTEM
-- Run this in the Supabase SQL Editor after the main schema

-- PLATFORM SETTINGS (admin-configurable key-value store)
CREATE TABLE platform_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed default photo email
INSERT INTO platform_settings (key, value) VALUES ('photo_email', 'photos@cabashub.dz');
INSERT INTO platform_settings (key, value) VALUES ('photo_email_subject_prefix', 'Photo -');

-- RLS for platform_settings
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
-- Everyone can read settings (email is public so user can see where to send)
CREATE POLICY "Anyone can read platform settings." ON platform_settings FOR SELECT USING (true);
-- Only admins can modify
CREATE POLICY "Admins can manage platform settings." ON platform_settings FOR ALL USING (is_admin());


-- PHOTO REQUESTS
CREATE TABLE photo_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  target_type TEXT CHECK (target_type IN ('profile_photo', 'cover_photo', 'product_image')) NOT NULL,
  target_id UUID, -- product id when target_type = 'product_image', NULL otherwise
  description TEXT, -- user's description of the photo (for email path)
  proposed_url TEXT, -- URL: user fills directly (Path A) OR admin fills after receiving email (Path B)
  path TEXT CHECK (path IN ('self', 'email')) NOT NULL DEFAULT 'self',
  -- 'self' = user pasted URL directly (Path A)
  -- 'email' = user sent email, waiting for admin to paste URL (Path B)
  status TEXT CHECK (status IN ('pending_url', 'pending_review', 'approved', 'rejected')) NOT NULL DEFAULT 'pending_review',
  -- pending_url  = email path, waiting for admin to add URL
  -- pending_review = self path, admin validates user's URL
  -- approved = applied
  -- rejected = rejected with note
  admin_note TEXT,
  last_applied_at TIMESTAMP WITH TIME ZONE, -- tracks the 3-day lock for products
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for photo_requests
ALTER TABLE photo_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own photo requests." ON photo_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create photo requests." ON photo_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all photo requests." ON photo_requests
  FOR ALL USING (is_admin());
