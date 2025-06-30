// src/components/Navigation.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Bell, UserPlus } from 'lucide-react';
import CreateUserForm from '@/components/UserManagement/CreateUserForm';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';  // or wherever your sheet primitives live
import { profilePhotoService } from '@/services/profilePhotoService';
import {
  adminNotificationService,
  AdminNotification,
} from '@/services/adminNotificationService';

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

  // sheet open state
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const isAdmin = user.designation?.toLowerCase() === 'admin';

  useEffect(() => {
    if (user.id) loadProfilePhoto(user.id);
    if (isAdmin) loadAdminNotifications();
  }, [user.id, isAdmin]);

  const loadProfilePhoto = async (userId: string) => {
    try {
      const photoUrl = await profilePhotoService.getProfilePhotoUrl(userId);
      setProfileImageUrl(photoUrl || user.profileImage || '');
    } catch {
      setProfileImageUrl(user.profileImage || '');
    }
  };

  const loadAdminNotifications = async () => {
    try {
      const notifs = await adminNotificationService.getNotifications();
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.is_read).length);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('govardhini_user');
    toast({ title: 'Logged out successfully', description: 'See you soon!' });
    navigate('/auth');
  };

  return (
    <nav className="agricultural-glass border-b border-green-300/30 sticky top-0 z-50 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* left: logo */}
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 hover:bg-green-600/20 text-green-50"
          >
            <img
              alt="Govardhini Logo"
              className="w-8 h-6 object-contain"
              src="/lovable-uploads/70165f06-942c-4ed7-977c-5db20865feb3.jpg"
            />
            <span className="font-bold text-xl">Govardhini</span>
          </Button>

          {/* right: user, notifications, create sheet, logout */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/profile')}
              className="flex items-center space-x-2 hover:bg-green-600/20 text-green-50"
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src={profileImageUrl} alt="Profile" />
                <AvatarFallback className="grass-green text-white text-sm">
                  {user.name
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <span className="text-sm text-green-200 block">{user.name}</span>
                <span className="text-xs text-green-300">
                  {user.designation || user.role}
                </span>
              </div>
            </Button>

            {isAdmin && (
              <div className="relative">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/notifications')}
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

            {isAdmin && (
              <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-emerald-200 hover:bg-emerald-600/20 hover:text-emerald-100 flex items-center space-x-1"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Create User</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="max-w-md">
                  <SheetHeader>
                    <SheetTitle>Create New User</SheetTitle>
                  </SheetHeader>

                  <CreateUserForm
                    onSuccess={() => {
                      toast({ title: 'User created successfully!' });
                      setIsCreateOpen(false);
                    }}
                    onCancel={() => setIsCreateOpen(false)}
                  />
                </SheetContent>
              </Sheet>
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
