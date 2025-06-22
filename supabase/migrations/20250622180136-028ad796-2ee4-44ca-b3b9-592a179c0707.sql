
-- Fix infinite recursion in RLS policies by using security definer functions

-- First, create a security definer function to get current user role safely
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT designation FROM public.users WHERE id = auth.uid();
$$;

-- Create a security definer function to get current user status safely
CREATE OR REPLACE FUNCTION public.get_current_user_status()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT status FROM public.users WHERE id = auth.uid();
$$;

-- Create a security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND designation = 'Admin' 
    AND status = 'approved'
  );
$$;

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update user status" ON public.users;
DROP POLICY IF EXISTS "Admins can delete users" ON public.users;

-- Create new policies using security definer functions to avoid recursion

-- Policy to allow users to read their own data (essential for login)
CREATE POLICY "Users can view own data" ON public.users
FOR SELECT 
USING (id = auth.uid());

-- Policy to allow admins to view all users (using security definer function)
CREATE POLICY "Admins can view all users" ON public.users
FOR SELECT 
USING (public.is_current_user_admin());

-- Policy to allow admins to update user status (using security definer function)
CREATE POLICY "Admins can update user status" ON public.users
FOR UPDATE 
USING (public.is_current_user_admin());

-- Policy to allow admins to delete users (using security definer function)
CREATE POLICY "Admins can delete users" ON public.users
FOR DELETE 
USING (public.is_current_user_admin());

-- Update user_permissions policies to use security definer functions
DROP POLICY IF EXISTS "Allow admins to insert permissions" ON public.user_permissions;
DROP POLICY IF EXISTS "Allow admins to update permissions" ON public.user_permissions;
DROP POLICY IF EXISTS "Allow admins to delete permissions" ON public.user_permissions;

CREATE POLICY "Allow admins to insert permissions" 
ON public.user_permissions 
FOR INSERT 
TO authenticated 
WITH CHECK (public.is_current_user_admin());

CREATE POLICY "Allow admins to update permissions" 
ON public.user_permissions 
FOR UPDATE 
TO authenticated 
USING (public.is_current_user_admin());

CREATE POLICY "Allow admins to delete permissions" 
ON public.user_permissions 
FOR DELETE 
TO authenticated 
USING (public.is_current_user_admin());
