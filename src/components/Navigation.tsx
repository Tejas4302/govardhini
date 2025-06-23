
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Bell } from 'lucide-react';
import { profilePhotoService } from '@/services/profilePhotoService';
import { adminNotificationService, AdminNotification } from '@/services/adminNotificationService';

interface NavigationProps {
  user: {
    id?: string;
    email?: string;
    phone?: string;
    role: string;
    name: string;
    profileImage?: string;
    designation?: string;
    status?: string;
  };
}

const Navigation = ({ user }: NavigationProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profileImageUrl, setProfileImageUrl] = useState<string>('');
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user.id) {
      loadProfilePhoto(user.id);
    }
    
    // Load admin notifications if user is admin
    if (isAdmin) {
      loadAdminNotifications();
    }
  }, [user.id]);

  const loadProfilePhoto = async (userId: string) => {
    try {
      const photoUrl = await profilePhotoService.getProfilePhotoUrl(userId);
      if (photoUrl) {
        setProfileImageUrl(photoUrl);
      } else {
        setProfileImageUrl(user.profileImage || '');
      }
    } catch (error) {
      console.error('Error loading profile photo:', error);
      setProfileImageUrl(user.profileImage || '');
    }
  };

  const loadAdminNotifications = async () => {
    try {
      const adminNotifications = await adminNotificationService.getNotifications();
      setNotifications(adminNotifications);
      setUnreadCount(adminNotifications.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Error loading admin notifications:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('govardhini_user');
    
    toast({
      title: "Logged out successfully",
      description: "Thank you for using Govardhini",
    });
    navigate('/auth');
  };

  // Check if user is admin for conditional rendering
  const isAdmin = user.designation === 'Admin' && user.status === 'approved';

  return (
    <nav className="agricultural-glass border-b border-green-300/30 sticky top-0 z-50 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 hover:bg-green-600/20 text-green-50"
            >
              <span className="text-2xl">🐄</span>
              <span className="font-bold text-xl">Govardhini</span>
            </Button>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/profile')}
              className="flex items-center space-x-2 hover:bg-green-600/20 text-green-50"
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src={profileImageUrl} alt="Profile" />
                <AvatarFallback className="grass-green text-white text-sm">
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <span className="text-sm text-green-200 block">
                  {user.name}
                </span>
                <span className="text-xs text-green-300">
                  {user.designation || user.role}
                </span>
              </div>
            </Button>
            
            {/* Admin notification bell */}
            {isAdmin && (
              <div className="relative">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/user-management')}
                  className="text-emerald-200 hover:bg-emerald-600/20 hover:text-emerald-100"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>
              </div>
            )}
            
            {/* Only show admin features if user is actually an admin */}
            {isAdmin && (
              <Button
                variant="ghost"
                onClick={() => navigate('/user-management')}
                className="text-emerald-200 hover:bg-emerald-600/20 hover:text-emerald-100 hidden sm:flex items-center"
              >
                <Users className="w-4 h-4 mr-1" />
                Manage Users
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-green-300/30 text-green-200 hover:bg-red-700/20 hover:border-red-500/50 hover:text-red-300 transition-all duration-200"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
