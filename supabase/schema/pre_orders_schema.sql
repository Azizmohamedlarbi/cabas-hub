-- PRE-ORDERS / TRIP PROPOSALS
-- Run this in the Supabase SQL Editor

-- TABLE
CREATE TABLE pre_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  product_description TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  target_price FLOAT,
  notes TEXT,
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
  seller_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE pre_orders ENABLE ROW LEVEL SECURITY;

-- Buyers can see their own proposals
CREATE POLICY "Buyers can view their own pre-orders." ON pre_orders
  FOR SELECT USING (auth.uid() = buyer_id);

-- Sellers can see proposals for their trips
CREATE POLICY "Sellers can view pre-orders for their trips." ON pre_orders
  FOR SELECT USING (auth.uid() = seller_id);

-- Buyers can create proposals
CREATE POLICY "Buyers can create pre-orders." ON pre_orders
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Sellers can update status of proposals on their trips
CREATE POLICY "Sellers can update pre-orders on their trips." ON pre_orders
  FOR UPDATE USING (auth.uid() = seller_id);

-- Admins can do everything
CREATE POLICY "Admins can manage all pre-orders." ON pre_orders
  FOR ALL USING (is_admin());

-- AUTO-INCREMENT counter on trips.pre_orders_count
CREATE OR REPLACE FUNCTION increment_trip_pre_orders()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE trips SET pre_orders_count = pre_orders_count + 1 WHERE id = NEW.trip_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_pre_order_created
  AFTER INSERT ON pre_orders
  FOR EACH ROW EXECUTE FUNCTION increment_trip_pre_orders();
