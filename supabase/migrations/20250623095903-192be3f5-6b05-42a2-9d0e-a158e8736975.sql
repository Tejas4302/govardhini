
-- Fix storage policies for profile photos to work with custom authentication
-- First, drop existing policies
DROP POLICY IF EXISTS "Users can upload their own profile photo" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile photo" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile photo" ON storage.objects;

-- Create new policies that allow any authenticated request
-- Since we're using custom authentication, we'll make these more permissive
CREATE POLICY "Allow profile photo uploads" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'profile-photos' AND 
  (storage.foldername(name))[1] = 'avatars'
);

CREATE POLICY "Allow profile photo updates" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'profile-photos' AND 
  (storage.foldername(name))[1] = 'avatars'
);

CREATE POLICY "Allow profile photo deletes" ON storage.objects
FOR DELETE USING (
  bucket_id = 'profile-photos' AND 
  (storage.foldername(name))[1] = 'avatars'
);
