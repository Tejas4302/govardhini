
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuthentication = () => {
      try {
        const userData = localStorage.getItem('govardhini_user');
        
        if (!userData) {
          console.log('No user data, redirecting to auth');
          navigate('/auth', { replace: true });
          return;
        }

        const user = JSON.parse(userData);
        
        if (user.status !== 'approved') {
          console.log('User not approved, redirecting to auth');
          navigate('/auth', { replace: true });
          return;
        }

        console.log('User authenticated successfully');
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Authentication check failed:', error);
        localStorage.removeItem('govardhini_user');
        navigate('/auth', { replace: true });
      }
    };

    checkAuthentication();
  }, [navigate]);

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-teal-900 flex items-center justify-center">
        <div className="text-white text-lg">Verifying access...</div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
