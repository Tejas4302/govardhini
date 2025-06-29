
import { supabase } from '@/integrations/supabase/client';

export const validateUserStatus = async (phoneNumber: string): Promise<{ isValid: boolean; user: any; message?: string }> => {
  try {
    // First check if user exists and get their status
    const { data: userData, error } = await supabase
      .from('users')
      .select('id, full_name, phone_number, designation, active_role, status')
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
  console.log('Checking admin permission:', { userRole, userStatus });
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

// New function to verify admin status from localStorage
export const verifyAdminStatus = (): boolean => {
  try {
    const userData = localStorage.getItem('govardhini_user');
    if (!userData) return false;
    
    const user = JSON.parse(userData);
    console.log('Verifying admin status for user:', user);
    
    // Check both active_role and designation for backwards compatibility
    const isAdmin = (user.active_role === 'Admin' || user.designation === 'Admin') && user.status === 'approved';
    console.log('Admin verification result:', isAdmin);
    
    return isAdmin;
  } catch (error) {
    console.error('Error verifying admin status:', error);
    return false;
  }
};
