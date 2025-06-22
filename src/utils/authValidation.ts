
import { supabase } from '@/integrations/supabase/client';

export const validateUserStatus = async (phoneNumber: string): Promise<{ isValid: boolean; user: any; message?: string }> => {
  try {
    // First check if user exists and get their status
    const { data: userData, error } = await supabase
      .from('users')
      .select('id, full_name, phone_number, designation, status')
      .eq('phone_number', phoneNumber)
      .single();

    if (error || !userData) {
      return {
        isValid: false,
        user: null,
        message: 'User not found'
      };
    }

    // Check if user is approved
    if (userData.status !== 'approved') {
      let statusMessage = 'Account not yet approved by administrator';
      if (userData.status === 'rejected') {
        statusMessage = 'Account has been rejected. Please contact administrator';
      }
      return {
        isValid: false,
        user: userData,
        message: statusMessage
      };
    }

    return {
      isValid: true,
      user: userData
    };
  } catch (error) {
    console.error('Error validating user status:', error);
    return {
      isValid: false,
      user: null,
      message: 'Error validating user status'
    };
  }
};

export const checkAdminPermission = (userRole: string, userStatus: string): boolean => {
  return userRole === 'Admin' && userStatus === 'approved';
};

export const hasPermission = (userRole: string, requiredRole: string): boolean => {
  const roleHierarchy = {
    'Admin': 3,
    'Office Staff': 2,
    'Field Officer': 1
  };

  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
  const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;

  return userLevel >= requiredLevel;
};
