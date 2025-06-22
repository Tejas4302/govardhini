
-- Remove SMS-related database objects
DROP TRIGGER IF EXISTS farmer_onboarding_sms_trigger ON public.farmers;
DROP FUNCTION IF EXISTS create_farmer_onboarding_sms();
DROP TABLE IF EXISTS public.sms_notifications CASCADE;
