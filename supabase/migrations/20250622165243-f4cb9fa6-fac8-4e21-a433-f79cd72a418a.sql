
-- Add a status column to track user approval state if not exists
-- and ensure proper role management structure

-- Check if we need to add any missing columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS approved_by uuid,
ADD COLUMN IF NOT EXISTS approved_at timestamp with time zone;

-- Create or update the user approval trigger
CREATE OR REPLACE FUNCTION public.check_user_status()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Only allow login for approved users
  IF NEW.status != 'approved' THEN
    RAISE EXCEPTION 'Account not yet approved by administrator';
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Add role hierarchy and permissions table
CREATE TABLE IF NOT EXISTS public.user_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL,
  permission text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(role, permission)
);

-- Insert default permissions for different roles
INSERT INTO public.user_permissions (role, permission) VALUES
('Admin', 'manage_users'),
('Admin', 'approve_users'),
('Admin', 'change_roles'),
('Admin', 'view_analytics'),
('Admin', 'manage_farmers'),
('Admin', 'manage_cattle'),
('Field Officer', 'manage_farmers'),
('Field Officer', 'manage_cattle'),
('Field Officer', 'view_analytics'),
('Office Staff', 'view_analytics'),
('Office Staff', 'manage_farmers')
ON CONFLICT (role, permission) DO NOTHING;

-- Create function to check user permissions
CREATE OR REPLACE FUNCTION public.user_has_permission(user_id uuid, required_permission text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.users u
    JOIN public.user_permissions up ON u.designation = up.role
    WHERE u.id = user_id 
    AND up.permission = required_permission
    AND u.status = 'approved'
  );
$$;
