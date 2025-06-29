-- 20250701120000_create_user_role_assignments.sql

CREATE TABLE IF NOT EXISTS public.user_role_assignments (
  id            UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID      NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role_assigned TEXT      NOT NULL,
  assigned_by   UUID      NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  assigned_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_role_assignments
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY policy_assign_roles
  ON public.user_role_assignments
  FOR INSERT, SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
        FROM public.users u
       WHERE u.id = auth.uid()
         AND u.active_role ILIKE 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
        FROM public.users u
       WHERE u.id = auth.uid()
         AND u.active_role ILIKE 'admin'
    )
  );
