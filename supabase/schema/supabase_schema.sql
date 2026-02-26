-- CABAS HUB - Supabase Schema
-- Run this in the Supabase SQL Editor

-- 1. Create Tables

-- PROFILES (Extended User Data)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  business_name TEXT,
  user_type TEXT CHECK (user_type IN ('buyer', 'seller', 'admin')) DEFAULT 'buyer',
  email TEXT UNIQUE,
  phone TEXT,
  address_city TEXT,
  address_wilaya TEXT,
  bio TEXT,
  anae_verified BOOLEAN DEFAULT FALSE,
  rating_average FLOAT DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  profile_photo TEXT,
  cover_photo TEXT,
  specialties TEXT[],
  import_countries TEXT[],
  status TEXT CHECK (status IN ('active', 'suspended')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- CATEGORIES
CREATE TABLE categories (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  icon TEXT,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- PRODUCTS
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price_wholesale FLOAT,
  price_retail FLOAT NOT NULL,
  currency TEXT DEFAULT 'DZD',
  quantity INTEGER DEFAULT 0,
  min_order_quantity INTEGER DEFAULT 1,
  origin_country TEXT,
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  specifications JSONB DEFAULT '{}'::jsonb,
  wholesale_only BOOLEAN DEFAULT FALSE,
  retail_only BOOLEAN DEFAULT FALSE,
  negotiable BOOLEAN DEFAULT FALSE,
  pre_order BOOLEAN DEFAULT FALSE,
  shipping_included BOOLEAN DEFAULT FALSE,
  shipping_cost FLOAT DEFAULT 0,
  wilaya_coverage TEXT[],
  delivery_time TEXT,
  tags TEXT[],
  status TEXT CHECK (status IN ('active', 'pending', 'rejected', 'flagged')) DEFAULT 'pending',
  views INTEGER DEFAULT 0,
  favorites_count INTEGER DEFAULT 0,
  rating_average FLOAT DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ORDERS
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  buyer_id UUID REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
  seller_id UUID REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
  total_amount FLOAT NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')) DEFAULT 'pending',
  shipping_address JSONB NOT NULL,
  escrow_released BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ORDER ITEMS
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL,
  price_at_purchase FLOAT NOT NULL,
  title_at_purchase TEXT NOT NULL
);

-- TRIPS
CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  destination_country TEXT NOT NULL,
  destination_city TEXT NOT NULL,
  flag TEXT,
  departure_date DATE NOT NULL,
  return_date DATE,
  budget_available FLOAT,
  accept_pre_orders BOOLEAN DEFAULT TRUE,
  pre_orders_count INTEGER DEFAULT 0,
  notes TEXT,
  status TEXT CHECK (status IN ('upcoming', 'ongoing', 'completed')) DEFAULT 'upcoming',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- FAVORITES
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, product_id)
);

-- REVIEWS
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  target_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- Can review seller too
  rating INTEGER CHECK (rating BETWEEN 1 AND 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Row Level Security (RLS) Policies

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;


-- Public Read Access
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Categories are viewable by everyone." ON categories FOR SELECT USING (true);
CREATE POLICY "Active products are viewable by everyone." ON products FOR SELECT USING (status = 'active');
CREATE POLICY "Trips are viewable by everyone." ON trips FOR SELECT USING (true);

-- Helper Functions for RLS
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND user_type = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Authenticated Access
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- Admin Access
CREATE POLICY "Admins can manage all profiles." ON profiles FOR ALL 
  USING (is_admin());

-- Product Management
CREATE POLICY "Sellers can manage their own products." ON products FOR ALL 
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Admins can manage all products." ON products FOR ALL 
  USING (is_admin());

-- Order Management
CREATE POLICY "Buyers can view their own orders." ON orders FOR SELECT 
  USING (auth.uid() = buyer_id);
CREATE POLICY "Sellers can view their associated orders." ON orders FOR SELECT 
  USING (auth.uid() = seller_id);
CREATE POLICY "Sellers can update their associated orders." ON orders FOR UPDATE
  USING (auth.uid() = seller_id);
CREATE POLICY "Buyers can create orders." ON orders FOR INSERT 
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Admins can manage all orders." ON orders FOR ALL 
  USING (is_admin());

-- Order Items
CREATE POLICY "Users can view their own order items." ON order_items FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
  ));

CREATE POLICY "Buyers can insert their own order items." ON order_items FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND orders.buyer_id = auth.uid()
  ));

CREATE POLICY "Admins can manage all order items." ON order_items FOR ALL 
  USING (is_admin());

-- Favorites
CREATE POLICY "Users can manage their own favorites." ON favorites FOR ALL 
  USING (auth.uid() = user_id);

-- Trips
CREATE POLICY "Sellers can manage their own trips." ON trips FOR ALL 
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Admins can manage all trips." ON trips FOR ALL 
  USING (is_admin());


-- 3. Automatic Profile Creation on Signup (Trigger)

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, user_type)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    COALESCE(new.raw_user_meta_data->>'user_type', 'buyer')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 4. Initial Seed Data (Categories)

INSERT INTO categories (name, icon, slug) VALUES
('Électronique', '📱', 'electronique'),
('Textile & Mode', '👗', 'textile-mode'),
('Cosmétiques', '💄', 'cosmetiques'),
('Maison & Déco', '🏠', 'maison-deco'),
('Alimentation', '🥗', 'alimentation'),
('Sport & Loisirs', '⚽', 'sport-loisirs'),
('Beauté & Santé', '💊', 'beaute-sante'),
('Jouets & Enfants', '🧸', 'jouets-enfants');


-- 5. Messaging System
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL CONSTRAINT fk_conversation REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL CONSTRAINT fk_user REFERENCES profiles(id) ON DELETE CASCADE,
  UNIQUE(conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL CONSTRAINT fk_msg_conversation REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL CONSTRAINT fk_msg_sender REFERENCES profiles(id) ON DELETE SET NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Profile Verification (Transitioned to anae_verified boolean)
-- Note: verification_status column was removed as we now use anae_verified directly.

-- Ensure handle_new_user is correct and clean
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, user_type, anae_verified)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    COALESCE(new.raw_user_meta_data->>'user_type', 'buyer'),
    CASE WHEN new.raw_user_meta_data->>'user_type' = 'seller' THEN FALSE ELSE TRUE END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS for messaging
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Helper Function for RLS to avoid recursion
-- SECURITY DEFINER ensures it runs with high privileges, bypassing RLS for its internal query
CREATE OR REPLACE FUNCTION get_my_conversations()
RETURNS SETOF UUID AS $$
BEGIN
  RETURN QUERY SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Messaging RLS Policies
DROP POLICY IF EXISTS "Users can view their own conversations." ON conversations;
CREATE POLICY "Users can view their own conversations." ON conversations
  FOR SELECT USING (id IN (SELECT get_my_conversations()));

DROP POLICY IF EXISTS "Users can create conversations." ON conversations;
CREATE POLICY "Users can create conversations." ON conversations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can view participants." ON conversation_participants;
CREATE POLICY "Users can view participants." ON conversation_participants
  FOR SELECT USING (conversation_id IN (SELECT get_my_conversations()));

DROP POLICY IF EXISTS "Users can add themselves and others to conversations." ON conversation_participants;
CREATE POLICY "Users can add themselves and others to conversations." ON conversation_participants
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can view messages." ON messages;
CREATE POLICY "Users can view messages." ON messages
  FOR SELECT USING (conversation_id IN (SELECT get_my_conversations()));

DROP POLICY IF EXISTS "Users can send messages to their conversations." ON messages;
CREATE POLICY "Users can send messages to their conversations." ON messages
  FOR INSERT WITH CHECK (
    conversation_id IN (SELECT get_my_conversations())
    AND sender_id = auth.uid()
  );


-- 7. Helper Functions

-- Atomic function to start a conversation with participants
CREATE OR REPLACE FUNCTION start_new_conversation(other_user_id UUID)
RETURNS UUID AS $$
DECLARE
    new_conv_id UUID;
BEGIN
    -- Prevent self-messaging
    IF auth.uid() = other_user_id THEN
        RAISE EXCEPTION 'Vous ne pouvez pas démarrer une conversation avec vous-même.';
    END IF;

    -- 1. Create the conversation
    INSERT INTO conversations DEFAULT VALUES
    RETURNING id INTO new_conv_id;

    -- 2. Add current user as participant
    INSERT INTO conversation_participants (conversation_id, user_id)
    VALUES (new_conv_id, auth.uid());

    -- 3. Add other user as participant
    INSERT INTO conversation_participants (conversation_id, user_id)
    VALUES (new_conv_id, other_user_id);

    RETURN new_conv_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Find a 1:1 conversation between exactly these two users
CREATE OR REPLACE FUNCTION get_conversation_between_users(u1 UUID, u2 UUID)
RETURNS UUID AS $$
DECLARE
    conv_id UUID;
BEGIN
    SELECT cp1.conversation_id INTO conv_id
    FROM conversation_participants cp1
    JOIN conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
    WHERE cp1.user_id = u1 
      AND cp2.user_id = u2
      AND (SELECT count(*) FROM conversation_participants WHERE conversation_id = cp1.conversation_id) = 2
    LIMIT 1;
    
    RETURN conv_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 8. Notifications System
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, -- 'info', 'success', 'warning', 'order'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications." ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications." ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- 9. Automatic Rating Calculation Triggers

-- Function to update Product Rating
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    UPDATE products
    SET 
      rating_average = (SELECT AVG(rating) FROM reviews WHERE product_id = NEW.product_id),
      rating_count = (SELECT COUNT(*) FROM reviews WHERE product_id = NEW.product_id)
    WHERE id = NEW.product_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE products
    SET 
      rating_average = COALESCE((SELECT AVG(rating) FROM reviews WHERE product_id = OLD.product_id), 0),
      rating_count = (SELECT COUNT(*) FROM reviews WHERE product_id = OLD.product_id)
    WHERE id = OLD.product_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_review_upsert_product
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_product_rating();

-- Function to update Profile (Seller) Rating
CREATE OR REPLACE FUNCTION update_profile_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    UPDATE profiles
    SET 
      rating_average = (SELECT AVG(rating) FROM reviews WHERE target_id = NEW.target_id),
      rating_count = (SELECT COUNT(*) FROM reviews WHERE target_id = NEW.target_id)
    WHERE id = NEW.target_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE profiles
    SET 
      rating_average = COALESCE((SELECT AVG(rating) FROM reviews WHERE target_id = OLD.target_id), 0),
      rating_count = (SELECT COUNT(*) FROM reviews WHERE target_id = OLD.target_id)
    WHERE id = OLD.target_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_review_upsert_profile
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_rating();

-- 10. Realtime Setup
-- Enable real-time for messages to allow instant chat updates
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
