import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { getProfilePhoto, clearProfilePhoto } from '@/utils/profilePhotoStorage';

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

  // Get persistent profile photo
  const persistentProfilePhoto = user.id ? getProfilePhoto(user.id) : null;
  const profileImageUrl = persistentProfilePhoto || user.profileImage;

  const handleLogout = () => {
    // Clear user session data
    localStorage.removeItem('govardhini_user');
    // Don't clear the profile photo on logout - keep it for next login
    
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
