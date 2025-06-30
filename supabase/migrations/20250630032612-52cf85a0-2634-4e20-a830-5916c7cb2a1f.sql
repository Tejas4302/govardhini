
-- First drop the trigger that depends on the function
DROP TRIGGER IF EXISTS admin_notification_new_signup ON public.users;

-- Now we can drop the function
DROP FUNCTION IF EXISTS public.notify_admin_new_signup();

-- Remove the change_user_role function
DROP FUNCTION IF EXISTS public.change_user_role(uuid, text, text);

-- Remove the user_role_history table since we're removing role changes
DROP TABLE IF EXISTS public.user_role_history;

-- Remove the user_role_assignments table since we're removing role changes
DROP TABLE IF EXISTS public.user_role_assignments;

-- Update the users table to set default status to 'approved' since admin creates users
ALTER TABLE public.users ALTER COLUMN status SET DEFAULT 'approved';

-- Update all existing pending users to approved since verification is no longer needed
UPDATE public.users SET status = 'approved' WHERE status = 'pending';

-- Remove RLS policies that check approval status
DROP POLICY IF EXISTS "Only approved users can access" ON public.users;
DROP POLICY IF EXISTS "Only approved admins can manage users" ON public.users;

-- Remove the check_user_status function
DROP FUNCTION IF EXISTS public.check_user_status();

-- Remove the check_user_login_status function  
DROP FUNCTION IF EXISTS public.check_user_login_status();

-- Remove other triggers that check user status
DROP TRIGGER IF EXISTS check_user_status_trigger ON public.users;
DROP TRIGGER IF EXISTS check_user_login_status_trigger ON public.users;

-- Create a simple RLS policy for users table
CREATE POLICY "Users can manage users" ON public.users
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Add password reset functionality
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL,
  otp TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '10 minutes'),
  used BOOLEAN DEFAULT false
);

-- Enable RLS on password reset tokens
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Create policy for password reset tokens
CREATE POLICY "Anyone can manage password reset tokens" ON public.password_reset_tokens
  FOR ALL 
  USING (true)
  WITH CHECK (true);
