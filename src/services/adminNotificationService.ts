
import { supabase } from '@/integrations/supabase/client';

export interface AdminNotification {
  id: string;
  type: 'new_signup' | 'user_action' | 'system';
  title: string;
  message: string;
  user_id: string | null;
  is_read: boolean;
  created_at: string;
}

export interface AdminNotificationService {
  getNotifications: () => Promise<AdminNotification[]>;
  markAsRead: (notificationId: string) => Promise<{ success: boolean; error?: string }>;
  markAllAsRead: () => Promise<{ success: boolean; error?: string }>;
}

export const adminNotificationService: AdminNotificationService = {
  async getNotifications() {
    try {
      const { data, error } = await supabase
        .from('admin_notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Unexpected error fetching notifications:', error);
      return [];
    }
  },

  async markAsRead(notificationId: string) {
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Unexpected error:', error);
      return { success: false, error: 'Failed to mark notification as read' };
    }
  },

  async markAllAsRead() {
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ is_read: true })
        .eq('is_read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Unexpected error:', error);
      return { success: false, error: 'Failed to mark all notifications as read' };
    }
  }
};
