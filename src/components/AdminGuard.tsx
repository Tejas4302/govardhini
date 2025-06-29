
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { verifyAdminStatus } from '@/utils/authValidation';

interface AdminGuardProps {
  children: React.ReactNode;
}

const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { toast } = useToast();
  
  const user = JSON.parse(localStorage.getItem('govardhini_user') || '{}');
  
  if (!user.id) {
    console.log('No user ID found, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }
  
  if (!verifyAdminStatus()) {
    console.log('User is not admin, showing access denied');
    toast({
      title: "Access Denied",
      description: "This page requires admin privileges",
      variant: "destructive"
    });
    return <Navigate to="/dashboard" replace />;
  }
  
  console.log('Admin access granted for user:', user);
  return <>{children}</>;
};

export default AdminGuard;
