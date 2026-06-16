-- AgroMart Database Schema for Virtual Market System
-- This script contains all DDL statements to set up or update required tables on Supabase.

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. BUYER PROFILES
CREATE TABLE IF NOT EXISTS public.buyer_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    shop_name TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    profile_photo TEXT,
    banner_image TEXT,
    contact_number TEXT,
    address TEXT NOT NULL,
    google_maps_url TEXT,
    business_type TEXT CHECK (business_type IN ('Wholesaler', 'Retailer', 'Exporter', 'Processor', 'Other')) NOT NULL DEFAULT 'Other',
    gst_number TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    ratings NUMERIC(3, 2) DEFAULT 5.0,
    reviews_count INTEGER DEFAULT 0,
    working_days TEXT DEFAULT 'Monday - Saturday',
    timings TEXT DEFAULT '09:00 AM - 06:00 PM',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for buyer_profiles
ALTER TABLE public.buyer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to buyer profiles" 
    ON public.buyer_profiles FOR SELECT USING (true);

CREATE POLICY "Allow users to insert their own buyer profile" 
    ON public.buyer_profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow users to update their own buyer profile" 
    ON public.buyer_profiles FOR UPDATE USING (auth.uid() = id);


-- 2. FARMER PROFILES
CREATE TABLE IF NOT EXISTS public.farmer_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    profile_photo TEXT,
    banner_image TEXT,
    contact_number TEXT,
    address TEXT NOT NULL,
    google_maps_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    ratings NUMERIC(3, 2) DEFAULT 5.0,
    reviews_count INTEGER DEFAULT 0,
    trust_score INTEGER DEFAULT 0 CHECK (trust_score BETWEEN 0 AND 100),
    active_crops TEXT,
    farming_type TEXT DEFAULT 'organic' CHECK (farming_type IN ('organic', 'chemical', 'mixed')),
    bank_name TEXT,
    bank_account TEXT,
    bank_ifsc TEXT,
    gat_number TEXT,
    soil_type TEXT DEFAULT 'black',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for farmer_profiles
ALTER TABLE public.farmer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to farmer profiles" 
    ON public.farmer_profiles FOR SELECT USING (true);

CREATE POLICY "Allow users to insert their own farmer profile" 
    ON public.farmer_profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow users to update their own farmer profile" 
    ON public.farmer_profiles FOR UPDATE USING (auth.uid() = id);


-- 3. CROP LISTINGS
CREATE TABLE IF NOT EXISTS public.crop_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID REFERENCES public.farmer_profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL CHECK (quantity > 0),
    unit TEXT NOT NULL,
    expected_price NUMERIC(10, 2) NOT NULL CHECK (expected_price > 0),
    description TEXT,
    harvest_date DATE,
    quality_type TEXT NOT NULL,
    location TEXT NOT NULL,
    status TEXT DEFAULT 'Available' CHECK (status IN ('Available', 'Reserved', 'Sold')) NOT NULL,
    images TEXT[] DEFAULT '{}',
    latitude NUMERIC(9, 6),
    longitude NUMERIC(9, 6),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for crop_listings
ALTER TABLE public.crop_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to active crop listings" 
    ON public.crop_listings FOR SELECT USING (true);

CREATE POLICY "Allow farmers to insert their crop listings" 
    ON public.crop_listings FOR INSERT WITH CHECK (auth.uid() = farmer_id);

CREATE POLICY "Allow farmers to update their crop listings" 
    ON public.crop_listings FOR UPDATE USING (auth.uid() = farmer_id);

CREATE POLICY "Allow farmers to delete their crop listings" 
    ON public.crop_listings FOR DELETE USING (auth.uid() = farmer_id);


-- 4. BUYER CROP PRICES (Buying rates configuration)
CREATE TABLE IF NOT EXISTS public.buyer_crop_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID REFERENCES public.buyer_profiles(id) ON DELETE CASCADE NOT NULL,
    crop_name TEXT NOT NULL,
    buying_price NUMERIC(10, 2) NOT NULL CHECK (buying_price > 0),
    unit TEXT NOT NULL,
    location TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for buyer_crop_prices
ALTER TABLE public.buyer_crop_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to buyer crop prices" 
    ON public.buyer_crop_prices FOR SELECT USING (true);

CREATE POLICY "Allow buyers to manage their crop prices" 
    ON public.buyer_crop_prices FOR ALL USING (auth.uid() = buyer_id);


-- 5. BUYER DEMANDS
CREATE TABLE IF NOT EXISTS public.buyer_demands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID REFERENCES public.buyer_profiles(id) ON DELETE CASCADE NOT NULL,
    crop_name TEXT NOT NULL,
    required_quantity NUMERIC(10, 2) NOT NULL CHECK (required_quantity > 0),
    expected_price NUMERIC(10, 2) NOT NULL CHECK (expected_price > 0),
    location TEXT NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Fulfilled', 'Cancelled')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for buyer_demands
ALTER TABLE public.buyer_demands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to buyer demands" 
    ON public.buyer_demands FOR SELECT USING (true);

CREATE POLICY "Allow buyers to manage their own demands" 
    ON public.buyer_demands FOR ALL USING (auth.uid() = buyer_id);


-- 6. CHATS (Conversations)
CREATE TABLE IF NOT EXISTS public.chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_id UUID REFERENCES public.crop_listings(id) ON DELETE SET NULL,
    crop_name TEXT NOT NULL,
    buyer_id UUID REFERENCES public.buyer_profiles(id) ON DELETE CASCADE NOT NULL,
    farmer_id UUID REFERENCES public.farmer_profiles(id) ON DELETE CASCADE NOT NULL,
    unread_for_buyer BOOLEAN DEFAULT FALSE,
    unread_for_farmer BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for chats
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to view their chats" 
    ON public.chats FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = farmer_id);

CREATE POLICY "Allow users to create chats" 
    ON public.chats FOR INSERT WITH CHECK (auth.uid() = buyer_id OR auth.uid() = farmer_id);

CREATE POLICY "Allow users to update chat unread status" 
    ON public.chats FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = farmer_id);


-- 7. MESSAGES (Chat history)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID NOT NULL,
    sender_role TEXT CHECK (sender_role IN ('buyer', 'farmer')) NOT NULL,
    text TEXT NOT NULL,
    discussion_type TEXT DEFAULT 'general' CHECK (discussion_type IN ('general', 'price', 'quantity', 'delivery')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to view chat messages" 
    ON public.messages FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.chats 
            WHERE chats.id = messages.chat_id 
            AND (chats.buyer_id = auth.uid() OR chats.farmer_id = auth.uid())
        )
    );

CREATE POLICY "Allow users to send messages" 
    ON public.messages FOR INSERT WITH CHECK (
        sender_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.chats 
            WHERE chats.id = messages.chat_id 
            AND (chats.buyer_id = auth.uid() OR chats.farmer_id = auth.uid())
        )
    );


-- 8. FAVORITES
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    crop_id UUID REFERENCES public.crop_listings(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, crop_id)
);

-- Enable RLS for favorites
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to manage their own favorites" 
    ON public.favorites FOR ALL USING (auth.uid() = user_id);


-- 9. RATINGS AND REVIEWS
CREATE TABLE IF NOT EXISTS public.ratings_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    reviewer_name TEXT NOT NULL,
    reviewer_role TEXT CHECK (reviewer_role IN ('Farmer', 'Buyer', 'Admin')) NOT NULL,
    target_id UUID NOT NULL, -- Can match buyer_profiles.id or farmer_profiles.id
    rating INTEGER CHECK (rating BETWEEN 1 AND 5) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for ratings_reviews
ALTER TABLE public.ratings_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to reviews" 
    ON public.ratings_reviews FOR SELECT USING (true);

CREATE POLICY "Allow users to insert reviews" 
    ON public.ratings_reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Allow users to delete/update their own reviews" 
    ON public.ratings_reviews FOR ALL USING (auth.uid() = reviewer_id);
