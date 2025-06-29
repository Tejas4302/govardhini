
-- Add policy to allow admins to insert new users
CREATE POLICY "Admins can insert new users" ON public.users
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() 
    AND (u.designation = 'Admin' OR u.active_role = 'Admin')
    AND u.status = 'approved'
  )
);
