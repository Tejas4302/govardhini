
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, Users, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { verifyAdminStatus } from '@/utils/authValidation';
import CreateUserForm from '@/components/UserManagement/CreateUserForm';

interface NavigationProps {
  user: any;
}

const Navigation = ({ user }: NavigationProps) => {
  const navigate = useNavigate();
  const [showCreateUserForm, setShowCreateUserForm] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('govardhini_user');
    navigate('/auth');
  };

  const refreshUsers = () => {
    // This will be called after user creation to refresh the user list if we're on user management page
    window.dispatchEvent(new CustomEvent('refreshUsers'));
  };

  return (
    <>
      <nav className="bg-slate-800/90 backdrop-blur-xl border-b border-emerald-500/20 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <span className="text-white font-semibold text-lg">
                Govardhini
              </span>
            </div>

            {/* Navigation Items */}
            <div className="flex items-center space-x-4">
              {/* Admin-only Create User Button */}
              {verifyAdminStatus() && (
                <Button
                  onClick={() => setShowCreateUserForm(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create User
                </Button>
              )}

              {/* Admin-only User Management Button */}
              {verifyAdminStatus() && (
                <Button
                  variant="ghost"
                  onClick={() => navigate('/user-management')}
                  className="text-emerald-300 hover:text-emerald-100 hover:bg-emerald-500/20"
                  size="sm"
                >
                  <Users className="w-4 h-4 mr-2" />
                  User Management
                </Button>
              )}

              {/* User Info */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-white font-medium">{user.full_name}</div>
                  <div className="text-emerald-300 text-sm">{user.active_role}</div>
                </div>
                
                {/* Logout Button */}
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                  size="sm"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Create User Form */}
      <CreateUserForm
        isOpen={showCreateUserForm}
        onClose={() => setShowCreateUserForm(false)}
        onUserCreated={refreshUsers}
      />
    </>
  );
};

export default Navigation;
