
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User, Lock, LogIn } from 'lucide-react';

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const existingUser = localStorage.getItem('govardhini_user');
    if (existingUser) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Query the users table for authentication
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('phone_number', phoneNumber)
        .eq('status', 'approved')
        .single();

      if (error || !users) {
        toast({
          title: "Login Failed",
          description: "Invalid credentials or account not approved",
          variant: "destructive"
        });
        return;
      }

      // Simple password check (in production, use proper hashing)
      if (users.password_hash !== password) {
        toast({
          title: "Login Failed",
          description: "Invalid credentials",
          variant: "destructive"
        });
        return;
      }

      // Store user data in localStorage
      const userData = {
        id: users.id,
        name: users.full_name,
        phone: users.phone_number,
        role: users.designation,
        email: '' // No email field in users table
      };

      localStorage.setItem('govardhini_user', JSON.stringify(userData));

      toast({
        title: "Login Successful",
        description: `Welcome back, ${users.full_name}!`
      });

      navigate('/dashboard');

    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: "An error occurred during login",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-emerald-900 flex items-center justify-center p-4">
      {/* Enhanced animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-10 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-green-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center mb-4">
            <span className="text-6xl">🐄</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Govardhini</h1>
          <p className="text-emerald-300 text-lg">Agricultural Cattle Management</p>
        </div>

        {/* Login Card */}
        <Card className="glass-card border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-green-500/5 animate-slide-up">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white flex items-center justify-center">
              <LogIn className="w-8 h-8 mr-3 text-emerald-400" />
              Welcome Back
            </CardTitle>
            <CardDescription className="text-emerald-300">
              Sign in to access your dashboard
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-emerald-200 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="glass-input border-emerald-500/30 text-white placeholder:text-emerald-300"
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-emerald-200 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="glass-input border-emerald-500/30 text-white placeholder:text-emerald-300"
                  disabled={isLoading}
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full grass-green hover:bg-emerald-700 text-white font-semibold py-3 text-lg"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-emerald-300 text-sm">
                Don't have an account?{' '}
                <Button
                  variant="link"
                  onClick={() => navigate('/auth')}
                  className="text-emerald-400 hover:text-emerald-300 p-0 h-auto"
                >
                  Register here
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="text-center mt-8 animate-fade-in" style={{animationDelay: '0.3s'}}>
          <p className="text-emerald-400 text-sm">
            Secure access to your agricultural management system
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
