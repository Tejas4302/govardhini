
-- Add a role change tracking system
-- First check if active_role column exists, if not add it
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'active_role') THEN
    ALTER TABLE public.users ADD COLUMN active_role TEXT;
  END IF;
END $$;

-- Update existing users to have their active_role match their designation
UPDATE public.users SET active_role = designation WHERE active_role IS NULL;

-- Make active_role not null now that we've populated it
ALTER TABLE public.users ALTER COLUMN active_role SET NOT NULL;

-- Add check constraint to ensure valid roles (drop first if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.constraint_column_usage 
             WHERE constraint_name = 'check_active_role') THEN
    ALTER TABLE public.users DROP CONSTRAINT check_active_role;
  END IF;
END $$;

ALTER TABLE public.users ADD CONSTRAINT check_active_role 
  CHECK (active_role IN ('Field Officer', 'Office Staff', 'Admin'));

-- Create role change history table to track all role changes
CREATE TABLE IF NOT EXISTS public.user_role_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  old_role TEXT,
  new_role TEXT NOT NULL,
  changed_by UUID REFERENCES public.users(id),
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reason TEXT
);

-- Enable RLS on role history table
ALTER TABLE public.user_role_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view role history" ON public.user_role_history;
DROP POLICY IF EXISTS "Admins can insert role history" ON public.user_role_history;

-- Create RLS policies for role history
CREATE POLICY "Admins can view role history" ON public.user_role_history
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND active_role = 'Admin' 
    AND status = 'approved'
  )
);

CREATE POLICY "Admins can insert role history" ON public.user_role_history
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND active_role = 'Admin' 
    AND status = 'approved'
  )
);

-- Create function to handle role changes
CREATE OR REPLACE FUNCTION public.change_user_role(
  target_user_id UUID,
  new_role TEXT,
  change_reason TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  old_role TEXT;
  admin_user_id UUID;
BEGIN
  -- Get current user (admin)
  admin_user_id := auth.uid();
  
  -- Check if current user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = admin_user_id 
    AND active_role = 'Admin' 
    AND status = 'approved'
  ) THEN
    RAISE EXCEPTION 'Only approved admins can change user roles';
  END IF;
  
  -- Get old role
  SELECT active_role INTO old_role 
  FROM public.users 
  WHERE id = target_user_id;
  
  IF old_role IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Don't allow changing role if it's the same
  IF old_role = new_role THEN
    RAISE EXCEPTION 'User already has this role';
  END IF;
  
  -- Update user's active role
  UPDATE public.users 
  SET active_role = new_role 
  WHERE id = target_user_id;
  
  -- Record the change in history
  INSERT INTO public.user_role_history (
    user_id, 
    old_role, 
    new_role, 
    changed_by, 
    reason
  ) VALUES (
    target_user_id, 
    old_role, 
    new_role, 
    admin_user_id, 
    change_reason
  );
END;
$$;
