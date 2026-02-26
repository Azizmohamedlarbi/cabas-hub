-- =========================================================================
-- CABAS HUB - MONETIZATION SYSTEM (FREEMIUM / EARLY ADOPTER / PRO)
-- =========================================================================

-- 1. ENUMS (If they don't already exist, handle gracefully)
DO $$ BEGIN
    CREATE TYPE user_plan_type AS ENUM ('free', 'early_adopter', 'pro');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_proof_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. UPDATE PROFILES TABLE
-- We need to add the billing management columns to the existing profiles table.
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS plan user_plan_type DEFAULT 'free',
    ADD COLUMN IF NOT EXISTS is_founder boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS plan_expires_at timestamptz DEFAULT null;

-- NOTE: The first 200 users can simply have their `plan` updated to 'early_adopter' and `is_founder` to true by the admin or automatically during the sign-up process inside Javascript.


-- 3. CREATE NEW SUBSCRIPTION OFFLINE PAYMENTS TABLE
-- Used by users to submit CCP/Baridimob screenshot proofs to request Pro upgrade
CREATE TABLE IF NOT EXISTS public.subscription_payments (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_requested text NOT NULL, -- e.g., 'pro_seller_monthly', 'pro_buyer_monthly'
    proof_image_url text NOT NULL, -- url to the uploaded image in storage
    amount_paid numeric, -- optional field if user writes how much they sent
    status payment_proof_status NOT NULL DEFAULT 'pending',
    admin_notes text DEFAULT null,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT subscription_payments_pkey PRIMARY KEY (id)
);

-- RLS for Subscription Payments
ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;

-- Users can insert their own proofs
CREATE POLICY "Users can create their own payment proofs" 
ON public.subscription_payments FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can view their own proofs
CREATE POLICY "Users can view their own payment proofs" 
ON public.subscription_payments FOR SELECT 
USING (auth.uid() = user_id);

-- Only Admins can view all, update status, and manage completely
CREATE POLICY "Admins have full access to payments" 
ON public.subscription_payments FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND user_type = 'admin'
    )
);

-- 4. CREATE STORAGE BUCKET FOR PAYMENT PROOFS
-- (Run this assuming the 'payment_proofs' bucket does not exist)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('payment_proofs', 'payment_proofs', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for payment_proofs
CREATE POLICY "Users can upload their own proofs" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'payment_proofs' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Admins can read all proofs
CREATE POLICY "Admins can view all payment proofs" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'payment_proofs' AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND user_type = 'admin'
));

-- Users can view their own proofs
CREATE POLICY "Users can view own proofs" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'payment_proofs' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text);
