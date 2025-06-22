
-- Enable RLS on the user_permissions table
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_permissions table
-- Allow all authenticated users to read permissions (needed for role checking)
CREATE POLICY "Allow authenticated users to read permissions" 
ON public.user_permissions 
FOR SELECT 
TO authenticated 
USING (true);

-- Only allow admins to insert new permissions
CREATE POLICY "Allow admins to insert permissions" 
ON public.user_permissions 
FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND designation = 'Admin' 
    AND status = 'approved'
  )
);

-- Only allow admins to update permissions
CREATE POLICY "Allow admins to update permissions" 
ON public.user_permissions 
FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND designation = 'Admin' 
    AND status = 'approved'
  )
);

-- Only allow admins to delete permissions
CREATE POLICY "Allow admins to delete permissions" 
ON public.user_permissions 
FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND designation = 'Admin' 
    AND status = 'approved'
  )
);
