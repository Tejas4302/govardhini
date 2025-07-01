
// src/components/Navigation.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, UserPlus } from 'lucide-react';
import CreateUserForm from '@/components/UserManagement/CreateUserForm';
import { profilePhotoService } from '@/services/profilePhotoService';

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

const Navigation: React.FC<NavigationProps> = ({
  user
}) => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [profileImageUrl, setProfileImageUrl] = useState<string>('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Only admins should see the Create User button
  const isAdmin = user.designation?.toLowerCase() === 'admin';

  useEffect(() => {
    if (user.id) {
      profilePhotoService.getProfilePhotoUrl(user.id).then(url => setProfileImageUrl(url || user.profileImage || '')).catch(() => setProfileImageUrl(user.profileImage || ''));
    }
  }, [user.id, user.profileImage]);

  return <nav className="agricultural-glass border-b border-green-300/30 sticky top-0 z-50 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Home */}
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="flex items-center space-x-2 hover:bg-green-600/20 text-green-50">
            <img src="/lovable-uploads/70165f06-942c-4ed7-977c-5db20865feb3.jpg" alt="Govardhini Logo" className="w-8 h-6 object-contain" />
          </Button>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Profile */}
            <Button variant="ghost" onClick={() => navigate('/profile')} className="flex items-center space-x-2 hover:bg-green-600/20 text-green-50">
              <Avatar className="w-8 h-8">
                <AvatarImage src={profileImageUrl} alt="Profile" />
                <AvatarFallback className="grass-green text-white text-sm">
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <div className="text-sm text-green-200">{user.name}</div>
                <div className="text-xs text-green-300">
                  {user.designation || user.role}
                </div>
              </div>
            </Button>

            {/* Create User sheet trigger - only icon */}
            {isAdmin && <>
                <Button variant="ghost" onClick={() => setIsCreateOpen(true)} className="text-emerald-200 hover:bg-emerald-600/20 hover:text-emerald-100 p-2">
                  <UserPlus className="w-5 h-5" />
                </Button>

                <CreateUserForm isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onUserCreated={() => {
              toast({
                title: 'User created!'
              });
              setIsCreateOpen(false);
            }} />
              </>}

            {/* Manage Users nav */}
            {isAdmin && <Button variant="ghost" onClick={() => navigate('/user-management')} className="hidden lg:flex items-center space-x-1 text-emerald-200 hover:bg-emerald-600/20 hover:text-emerald-100">
                <Users className="w-4 h-4" />
                <span>Manage Users</span>
              </Button>}
          </div>
        </div>
      </div>
    </nav>;
};

export default Navigation;
