
import { supabase } from '@/integrations/supabase/client';

export interface ProfilePhotoService {
  uploadProfilePhoto: (file: File, userId: string) => Promise<{ success: boolean; url?: string; error?: string }>;
  getProfilePhotoUrl: (userId: string) => Promise<string | null>;
  deleteProfilePhoto: (userId: string) => Promise<{ success: boolean; error?: string }>;
}

export const profilePhotoService: ProfilePhotoService = {
  async uploadProfilePhoto(file: File, userId: string) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `avatars/${userId}.${fileExt}`;
      
      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return { success: false, error: uploadError.message };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;

      // Update user's profile_image_url in database
      const { error: updateError } = await supabase
        .from('users')
        .update({ profile_image_url: publicUrl })
        .eq('id', userId);

      if (updateError) {
        console.error('Database update error:', updateError);
        return { success: false, error: updateError.message };
      }

      return { success: true, url: publicUrl };
    } catch (error) {
      console.error('Unexpected error:', error);
      return { success: false, error: 'Failed to upload profile photo' };
    }
  },

  async getProfilePhotoUrl(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('profile_image_url')
        .eq('id', userId)
        .single();

      if (error || !data?.profile_image_url) {
        return null;
      }

      return data.profile_image_url;
    } catch (error) {
      console.error('Error fetching profile photo URL:', error);
      return null;
    }
  },

  async deleteProfilePhoto(userId: string) {
    try {
      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from('profile-photos')
        .remove([`avatars/${userId}.jpg`, `avatars/${userId}.png`, `avatars/${userId}.jpeg`]);

      // Update database to remove URL
      const { error: updateError } = await supabase
        .from('users')
        .update({ profile_image_url: null })
        .eq('id', userId);

      if (updateError) {
        console.error('Database update error:', updateError);
        return { success: false, error: updateError.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting profile photo:', error);
      return { success: false, error: 'Failed to delete profile photo' };
    }
  }
};
