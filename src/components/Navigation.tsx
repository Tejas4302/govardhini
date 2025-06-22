import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';

interface NavigationProps {
  user: {
    id?: string;
    email?: string;
    phone?: string;
    role: string;
    name: string;
    profileImage?: string;
  };
}

const Navigation = ({ user }: NavigationProps) => {
  const [currentUser, setCurrentUser] = useState(user);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Listen for changes in localStorage to update profile image
  useEffect(() => {
    const handleStorageChange = () => {
      const updatedUser = JSON.parse(localStorage.getItem('govardhini_user') || '{}');
      setCurrentUser(updatedUser);
    };

    // Listen for custom storage events
    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically for updates (in case of same-tab updates)
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    // Don't clear profile image, keep it for next login
    const userWithImage = JSON.parse(localStorage.getItem('govardhini_user') || '{}');
    const profileImage = userWithImage.profileImage;
    
    // Clear user data but keep profile image for next login
    localStorage.removeItem('govardhini_user');
    
    // Store profile image separately for next login
    if (profileImage) {
      localStorage.setItem('govardhini_profile_image', profileImage);
    }
    
    toast({
      title: "Logged out successfully",
      description: "Thank you for using Govardhini",
    });
    navigate('/auth');
  };

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
                <AvatarImage src={currentUser.profileImage} alt="Profile" />
                <AvatarFallback className="grass-green text-white text-sm">
                  {currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-green-200 hidden md:block">
                {currentUser.name}
              </span>
            </Button>
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
