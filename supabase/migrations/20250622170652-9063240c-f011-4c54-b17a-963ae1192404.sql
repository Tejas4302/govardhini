
-- Add missing columns to users table for the current codebase requirements
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.users(id);

-- Update user_role_assignments table structure if needed
-- Ensure the table exists with proper structure
CREATE TABLE IF NOT EXISTS public.user_role_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES public.users(id),
  role_assigned TEXT NOT NULL CHECK (role_assigned IN ('Field Officer', 'Office Staff', 'Admin')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role_assigned)
);

-- Ensure RLS is enabled on user_role_assignments
ALTER TABLE public.user_role_assignments ENABLE ROW LEVEL SECURITY;

-- Create or update RLS policy for user_role_assignments
DROP POLICY IF EXISTS "Enable all operations for user_role_assignments" ON public.user_role_assignments;
CREATE POLICY "Enable all operations for user_role_assignments" ON public.user_role_assignments FOR ALL USING (true);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_user_role_assignments_user_id ON public.user_role_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);
