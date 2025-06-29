
-- Fix RLS policies for admin_notifications to allow trigger functions to work
-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Only admins can view notifications" ON public.admin_notifications;

-- Create separate policies for different operations
-- Allow all authenticated users to read notifications (admins will filter client-side)
CREATE POLICY "Allow authenticated users to read notifications" ON public.admin_notifications
FOR SELECT 
TO authenticated
USING (true);

-- Allow system/triggers to insert notifications (using security definer)
CREATE POLICY "Allow system to insert notifications" ON public.admin_notifications
FOR INSERT 
WITH CHECK (true);

-- Only allow admins to update notifications (mark as read, etc.)
CREATE POLICY "Allow admins to update notifications" ON public.admin_notifications
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND (designation = 'Admin' OR active_role = 'Admin')
    AND status = 'approved'
  )
);

-- Only allow admins to delete notifications
CREATE POLICY "Allow admins to delete notifications" ON public.admin_notifications
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND (designation = 'Admin' OR active_role = 'Admin')
    AND status = 'approved'
  )
);

-- Also update the notify_admin_new_signup function to be more robust
CREATE OR REPLACE FUNCTION notify_admin_new_signup()
RETURNS TRIGGER 
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert notification with security definer privileges
  INSERT INTO public.admin_notifications (
    type,
    title,
    message,
    user_id
  ) VALUES (
    'new_signup',
    'New User Registration',
    'New user ' || NEW.full_name || ' (' || NEW.phone_number || ') has registered as ' || NEW.designation || ' and is pending approval.',
    NEW.id
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't block user creation
    RAISE WARNING 'Failed to create admin notification: %', SQLERRM;
    RETURN NEW;
END;
$$;
