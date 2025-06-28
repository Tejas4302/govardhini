
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuthAndRedirect = () => {
      try {
        // Check if user is logged in
        const userData = localStorage.getItem('govardhini_user');
        
        if (userData) {
          const user = JSON.parse(userData);
          // If user exists and is approved, redirect to dashboard
          if (user.status === 'approved') {
            console.log('User is authenticated, redirecting to dashboard');
            navigate('/dashboard', { replace: true });
          } else {
            console.log('User exists but not approved, redirecting to auth');
            navigate('/auth', { replace: true });
          }
        } else {
          console.log('No user data found, redirecting to auth');
          navigate('/auth', { replace: true });
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        // If there's an error, clear any corrupted data and redirect to auth
        localStorage.removeItem('govardhini_user');
        navigate('/auth', { replace: true });
      } finally {
        setIsChecking(false);
      }
    };

    // Small delay to prevent flash
    const timer = setTimeout(() => {
      checkAuthAndRedirect();
    }, 100);

    return () => clearTimeout(timer);
  }, [navigate]);

  // Show nothing while checking auth status
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-teal-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return null;
};

export default Index;
