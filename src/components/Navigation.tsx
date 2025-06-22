
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface NavigationProps {
  user: {
    id?: string;
    email?: string;
    phone?: string;
    role: string;
    name: string;
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
    <nav className="bg-white/90 backdrop-blur border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 hover:bg-green-50"
            >
              <span className="text-2xl">🐄</span>
              <span className="font-bold text-xl text-gray-800">Govardhini</span>
            </Button>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {user.name} • {user.role.replace('_', ' ')}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="hover:bg-red-50 hover:border-red-300 hover:text-red-700"
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
