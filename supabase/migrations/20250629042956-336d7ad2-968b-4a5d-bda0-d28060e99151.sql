
-- Update the change_user_role function to check both designation and active_role columns
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
  
  -- Check if current user is admin (check both designation and active_role)
  IF NOT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = admin_user_id 
    AND (designation = 'Admin' OR active_role = 'Admin')
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
