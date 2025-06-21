
-- Create farmers table
CREATE TABLE public.farmers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id TEXT NOT NULL UNIQUE,
  farmer_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  village TEXT NOT NULL,
  date_of_onboarding DATE NOT NULL DEFAULT CURRENT_DATE,
  added_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cattle table
CREATE TABLE public.cattle (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cattle_id TEXT NOT NULL UNIQUE,
  farmer_id TEXT NOT NULL REFERENCES public.farmers(farmer_id) ON DELETE CASCADE,
  cattle_type TEXT NOT NULL CHECK (cattle_type IN ('cow', 'buffalo')),
  breed TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 0 AND age <= 25),
  date_of_onboarding DATE NOT NULL DEFAULT CURRENT_DATE,
  added_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create health_checks table
CREATE TABLE public.health_checks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_id TEXT NOT NULL UNIQUE,
  cattle_id TEXT NOT NULL REFERENCES public.cattle(cattle_id) ON DELETE CASCADE,
  check_date DATE NOT NULL DEFAULT CURRENT_DATE,
  body_temperature DECIMAL(4,1) NOT NULL,
  health_issue TEXT,
  issue_type TEXT CHECK (issue_type IN ('respiratory', 'digestive', 'injury', 'other')),
  reported_by TEXT NOT NULL,
  alert_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create milk_production table
CREATE TABLE public.milk_production (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_id TEXT NOT NULL UNIQUE,
  cattle_id TEXT NOT NULL REFERENCES public.cattle(cattle_id) ON DELETE CASCADE,
  production_date DATE NOT NULL DEFAULT CURRENT_DATE,
  milk_produced DECIMAL(8,2) NOT NULL CHECK (milk_produced >= 0),
  recorded_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create feed_requests table
CREATE TABLE public.feed_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id TEXT NOT NULL UNIQUE,
  farmer_id TEXT NOT NULL REFERENCES public.farmers(farmer_id) ON DELETE CASCADE,
  request_date DATE NOT NULL DEFAULT CURRENT_DATE,
  feed_type TEXT NOT NULL CHECK (feed_type IN ('green_fodder', 'dry_fodder', 'mineral_mix')),
  quantity DECIMAL(8,2) NOT NULL CHECK (quantity > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'delivered')),
  requested_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_farmers_farmer_id ON public.farmers(farmer_id);
CREATE INDEX idx_farmers_village ON public.farmers(village);
CREATE INDEX idx_cattle_farmer_id ON public.cattle(farmer_id);
CREATE INDEX idx_cattle_cattle_id ON public.cattle(cattle_id);
CREATE INDEX idx_health_checks_cattle_id ON public.health_checks(cattle_id);
CREATE INDEX idx_health_checks_date ON public.health_checks(check_date);
CREATE INDEX idx_milk_production_cattle_id ON public.milk_production(cattle_id);
CREATE INDEX idx_milk_production_date ON public.milk_production(production_date);
CREATE INDEX idx_feed_requests_farmer_id ON public.feed_requests(farmer_id);
CREATE INDEX idx_feed_requests_status ON public.feed_requests(status);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cattle ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milk_production ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allowing all operations for now - we'll refine when auth is implemented)
CREATE POLICY "Enable all operations for farmers" ON public.farmers FOR ALL USING (true);
CREATE POLICY "Enable all operations for cattle" ON public.cattle FOR ALL USING (true);
CREATE POLICY "Enable all operations for health_checks" ON public.health_checks FOR ALL USING (true);
CREATE POLICY "Enable all operations for milk_production" ON public.milk_production FOR ALL USING (true);
CREATE POLICY "Enable all operations for feed_requests" ON public.feed_requests FOR ALL USING (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER set_farmers_updated_at
  BEFORE UPDATE ON public.farmers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_cattle_updated_at
  BEFORE UPDATE ON public.cattle
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_feed_requests_updated_at
  BEFORE UPDATE ON public.feed_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
