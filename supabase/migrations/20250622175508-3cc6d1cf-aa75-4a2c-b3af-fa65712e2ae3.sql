
-- Add database trigger to prevent login for non-approved users
CREATE OR REPLACE FUNCTION public.check_user_login_status()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Only allow approved users to be used for authentication
  IF NEW.status != 'approved' THEN
    RAISE EXCEPTION 'Account not yet approved by administrator. Please contact admin for approval.';
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Add unique constraint to prevent phone number conflicts between users and farmers
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_phone_numbers ON public.farmers(phone_number);

-- Add RLS policies for admin-only access to user management
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy to allow admins to view all users
CREATE POLICY "Admins can view all users" ON public.users
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() 
    AND u.designation = 'Admin' 
    AND u.status = 'approved'
  )
);

-- Policy to allow admins to update user status
CREATE POLICY "Admins can update user status" ON public.users
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() 
    AND u.designation = 'Admin' 
    AND u.status = 'approved'
  )
);

-- Policy to allow admins to delete users
CREATE POLICY "Admins can delete users" ON public.users
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() 
    AND u.designation = 'Admin' 
    AND u.status = 'approved'
  )
);
