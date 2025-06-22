
-- Drop existing tables to start fresh with new structure
DROP TABLE IF EXISTS public.health_checks CASCADE;
DROP TABLE IF EXISTS public.milk_production CASCADE;
DROP TABLE IF EXISTS public.feed_requests CASCADE;
DROP TABLE IF EXISTS public.cattle CASCADE;
DROP TABLE IF EXISTS public.farmers CASCADE;

-- Create users table for authentication and user management
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  designation TEXT NOT NULL CHECK (designation IN ('Field Officer', 'Office Staff', 'Admin')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create farmers table with expanded address fields
CREATE TABLE public.farmers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL UNIQUE,
  aadhaar_number TEXT,
  state TEXT NOT NULL,
  district TEXT NOT NULL,
  taluk TEXT NOT NULL,
  town_or_village TEXT NOT NULL,
  pincode TEXT NOT NULL,
  added_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cattle_profiles table
CREATE TABLE public.cattle_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_name TEXT NOT NULL,
  cattle_id TEXT NOT NULL UNIQUE,
  breed TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Cow', 'Buffalo')),
  dob DATE NOT NULL,
  lactation BOOLEAN NOT NULL DEFAULT FALSE,
  weight_kg NUMERIC(8,2) NOT NULL CHECK (weight_kg > 0),
  owner_phone TEXT NOT NULL,
  added_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create health_checkups table
CREATE TABLE public.health_checkups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cattle_id TEXT NOT NULL REFERENCES public.cattle_profiles(cattle_id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  temperature NUMERIC(4,1) NOT NULL CHECK (temperature >= 35 AND temperature <= 45),
  issue TEXT,
  issue_type TEXT,
  recovery_status TEXT,
  added_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create milk_production table with 3-day constraint
CREATE TABLE public.milk_production (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cattle_id TEXT NOT NULL REFERENCES public.cattle_profiles(cattle_id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  quantity_litres NUMERIC(8,2) NOT NULL CHECK (quantity_litres >= 0),
  shift TEXT,
  recorded_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Unique constraint to prevent duplicate entries within 3 days for same cattle
  UNIQUE(cattle_id, date)
);

-- Create feed_requests table
CREATE TABLE public.feed_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cattle_id TEXT NOT NULL REFERENCES public.cattle_profiles(cattle_id) ON DELETE CASCADE,
  farmer_phone TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  feed_type TEXT NOT NULL,
  quantity_kg NUMERIC(8,2) NOT NULL CHECK (quantity_kg > 0),
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Delivered')),
  requested_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_farmers_phone ON public.farmers(phone_number);
CREATE INDEX idx_farmers_added_by ON public.farmers(added_by);
CREATE INDEX idx_cattle_profiles_cattle_id ON public.cattle_profiles(cattle_id);
CREATE INDEX idx_cattle_profiles_added_by ON public.cattle_profiles(added_by);
CREATE INDEX idx_health_checkups_cattle_id ON public.health_checkups(cattle_id);
CREATE INDEX idx_health_checkups_date ON public.health_checkups(date);
CREATE INDEX idx_milk_production_cattle_id ON public.milk_production(cattle_id);
CREATE INDEX idx_milk_production_date ON public.milk_production(date);
CREATE INDEX idx_feed_requests_cattle_id ON public.feed_requests(cattle_id);
CREATE INDEX idx_feed_requests_status ON public.feed_requests(status);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cattle_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_checkups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milk_production ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allowing all operations for now - we'll refine when auth is implemented)
CREATE POLICY "Enable all operations for users" ON public.users FOR ALL USING (true);
CREATE POLICY "Enable all operations for farmers" ON public.farmers FOR ALL USING (true);
CREATE POLICY "Enable all operations for cattle_profiles" ON public.cattle_profiles FOR ALL USING (true);
CREATE POLICY "Enable all operations for health_checkups" ON public.health_checkups FOR ALL USING (true);
CREATE POLICY "Enable all operations for milk_production" ON public.milk_production FOR ALL USING (true);
CREATE POLICY "Enable all operations for feed_requests" ON public.feed_requests FOR ALL USING (true);

-- Function to check 3-day constraint for milk production
CREATE OR REPLACE FUNCTION check_milk_production_interval()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if there's an existing entry within 3 days for the same cattle
  IF EXISTS (
    SELECT 1 FROM public.milk_production 
    WHERE cattle_id = NEW.cattle_id 
    AND date BETWEEN (NEW.date - INTERVAL '3 days') AND (NEW.date + INTERVAL '3 days')
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
  ) THEN
    RAISE EXCEPTION 'Milk production already recorded within 3 days for this cattle';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for milk production 3-day constraint
CREATE TRIGGER milk_production_interval_check
  BEFORE INSERT OR UPDATE ON public.milk_production
  FOR EACH ROW EXECUTE FUNCTION check_milk_production_interval();
