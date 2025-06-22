
-- Add user status for approval workflow
ALTER TABLE public.users ADD COLUMN status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));

-- Create proper farmer-cattle relationships
ALTER TABLE public.cattle_profiles ADD COLUMN farmer_id UUID REFERENCES public.farmers(id) ON DELETE CASCADE;

-- Update existing cattle records to link with farmers (where possible by phone)
UPDATE public.cattle_profiles 
SET farmer_id = (
  SELECT f.id 
  FROM public.farmers f 
  WHERE f.phone_number = public.cattle_profiles.owner_phone 
  LIMIT 1
) 
WHERE farmer_id IS NULL;

-- Create SMS notifications tracking table
CREATE TABLE public.sms_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID REFERENCES public.farmers(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('onboarding', 'health_update', 'milk_production', 'feed_request')),
  message_content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user role assignments table (separate from users table)
CREATE TABLE public.user_role_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES public.users(id),
  role_assigned TEXT NOT NULL CHECK (role_assigned IN ('Field Officer', 'Office Staff', 'Admin')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role_assigned)
);

-- Create indexes for better performance
CREATE INDEX idx_users_status ON public.users(status);
CREATE INDEX idx_cattle_profiles_farmer_id ON public.cattle_profiles(farmer_id);
CREATE INDEX idx_sms_notifications_farmer_id ON public.sms_notifications(farmer_id);
CREATE INDEX idx_sms_notifications_status ON public.sms_notifications(status);
CREATE INDEX idx_user_role_assignments_user_id ON public.user_role_assignments(user_id);

-- Enable RLS on new tables
ALTER TABLE public.sms_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_role_assignments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for new tables
CREATE POLICY "Enable all operations for sms_notifications" ON public.sms_notifications FOR ALL USING (true);
CREATE POLICY "Enable all operations for user_role_assignments" ON public.user_role_assignments FOR ALL USING (true);

-- Add function to automatically create SMS notification on farmer registration
CREATE OR REPLACE FUNCTION create_farmer_onboarding_sms()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.sms_notifications (
    farmer_id, 
    phone_number, 
    message_type, 
    message_content
  ) VALUES (
    NEW.id,
    NEW.phone_number,
    'onboarding',
    'Welcome to Govardhini! Your farmer registration has been completed. ID: ' || NEW.id || '. You will receive updates about your cattle management activities.'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for farmer onboarding SMS
CREATE TRIGGER farmer_onboarding_sms_trigger
  AFTER INSERT ON public.farmers
  FOR EACH ROW EXECUTE FUNCTION create_farmer_onboarding_sms();
