
import React from 'react';
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
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    localStorage.removeItem('govardhini_user');
    toast({
      title: "Logged out successfully",
      description: "Thank you for using Govardhini",
    });
    navigate('/auth');
  };

  return (
    <nav className="glass-navigation sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 hover:bg-leafy-green/10 text-wheat-beige transition-all duration-300"
            >
              <span className="text-2xl animate-pulse">🐄</span>
              <span className="font-bold text-xl bg-gradient-to-r from-leafy-green to-mustard-yellow bg-clip-text text-transparent">
                Govardhini
              </span>
            </Button>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/profile')}
              className="flex items-center space-x-2 hover:bg-leafy-green/10 text-wheat-beige transition-all duration-300 glass-float"
            >
              <Avatar className="w-8 h-8 border-2 border-leafy-green/30 shadow-lg">
                <AvatarImage src={user.profileImage} alt="Profile" />
                <AvatarFallback className="bg-gradient-to-br from-leafy-green to-deep-green text-wheat-beige text-sm font-semibold">
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-wheat-beige/90 hidden md:block">
                {user.name}
              </span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="glass-button border-none text-wheat-beige font-medium"
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
