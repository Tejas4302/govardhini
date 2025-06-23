
-- Create profile-photos storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true);

-- Add profile_image_url column to users table
ALTER TABLE public.users 
ADD COLUMN profile_image_url TEXT;

-- Create storage policies for profile photos
CREATE POLICY "Users can view all profile photos" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-photos');

CREATE POLICY "Users can upload their own profile photo" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'profile-photos' AND 
  (storage.foldername(name))[1] = 'avatars' AND
  auth.uid()::text = (storage.filename(name))
);

CREATE POLICY "Users can update their own profile photo" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'profile-photos' AND 
  (storage.foldername(name))[1] = 'avatars' AND
  auth.uid()::text = (storage.filename(name))
);

CREATE POLICY "Users can delete their own profile photo" ON storage.objects
FOR DELETE USING (
  bucket_id = 'profile-photos' AND 
  (storage.foldername(name))[1] = 'avatars' AND
  auth.uid()::text = (storage.filename(name))
);

-- Create admin_notifications table for signup notifications
CREATE TABLE public.admin_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('new_signup', 'user_action', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on admin_notifications
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Create policy for admin notifications (only admins can view)
CREATE POLICY "Only admins can view notifications" ON public.admin_notifications
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND designation = 'Admin' 
    AND status = 'approved'
  )
);

-- Create function to notify admins of new signups
CREATE OR REPLACE FUNCTION notify_admin_new_signup()
RETURNS TRIGGER AS $$
BEGIN
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
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new signup notifications
CREATE TRIGGER admin_notification_new_signup
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION notify_admin_new_signup();
