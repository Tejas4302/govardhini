
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { checkAdminPermission } from '@/utils/authValidation';

interface AdminGuardProps {
  children: React.ReactNode;
}

const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { toast } = useToast();
  
  const user = JSON.parse(localStorage.getItem('govardhini_user') || '{}');
  
  if (!user.id) {
    return <Navigate to="/auth" replace />;
  }
  
  if (!checkAdminPermission(user.designation, user.status)) {
    toast({
      title: "Access Denied",
      description: "This page requires admin privileges",
      variant: "destructive"
    });
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

export default AdminGuard;
