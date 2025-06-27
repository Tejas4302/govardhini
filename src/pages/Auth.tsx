
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { validateUserStatus } from '@/utils/authValidation';
import { Eye, EyeOff } from 'lucide-react';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Login form state
  const [loginData, setLoginData] = useState({
    phone: '',
    password: ''
  });

  useEffect(() => {
    // Check if user is already logged in
    const userData = localStorage.getItem('govardhini_user');
    if (userData) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!loginData.phone || !loginData.password) {
        toast({
          title: "Error",
          description: "Please fill in all fields",
          variant: "destructive"
        });
        return;
      }

      // First validate user status
      const validation = await validateUserStatus(loginData.phone);
      
      if (!validation.isValid) {
        toast({
          title: "Login Failed",
          description: validation.message || "Account not approved",
          variant: "destructive"
        });
        return;
      }

      // Then verify password
      const hashedPassword = await hashPassword(loginData.password);

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('phone_number', loginData.phone)
        .eq('password_hash', hashedPassword)
        .eq('status', 'approved') // Additional security check
        .single();

      if (error || !data) {
        toast({
          title: "Login Failed",
          description: "Invalid phone number or password",
          variant: "destructive"
        });
        return;
      }

      // Store user data in localStorage with enhanced security info
      const userData = {
        id: data.id,
        name: data.full_name,
        phone: data.phone_number,
        role: data.designation.toLowerCase().replace(' ', '_'),
        designation: data.designation,
        active_role: data.active_role,
        status: data.status,
        email: data.phone_number,
        loginTime: new Date().toISOString()
      };
      
      localStorage.setItem('govardhini_user', JSON.stringify(userData));
      
      toast({
        title: "Welcome to Govardhini!",
        description: `Logged in successfully as ${data.active_role}`,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-teal-900 flex items-center justify-center p-4">
      {/* Enhanced animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-10 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-green-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
        </div>
      </div>

      <Card className="w-full max-w-md glass-card border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-green-500/5 text-white relative z-10 animate-fade-in">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-32 h-20 mb-4 flex items-center justify-center">
            <img 
              src="/lovable-uploads/90826b5b-bdf3-4b8c-be34-883255175d64.png" 
              alt="Govardhini Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <CardTitle className="text-3xl font-bold text-white">Govardhini</CardTitle>
          <CardDescription className="text-emerald-300 text-lg">
            GAU SUPOSHANA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-emerald-200">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={loginData.phone}
                onChange={(e) => setLoginData(prev => ({ ...prev, phone: e.target.value }))}
                className="glass-input border-emerald-500/30 text-white placeholder:text-emerald-300"
                disabled={isLoading}
                maxLength={10}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-emerald-200">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={loginData.password}
                  onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                  className="glass-input border-emerald-500/30 text-white placeholder:text-emerald-300 pr-12"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-emerald-400" />
                  )}
                </Button>
              </div>
            </div>
            
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full grass-green hover:bg-emerald-700 text-white font-semibold py-3 border-0 shadow-lg"
            >
              {isLoading ? 'Logging in...' : 'Login to Govardhini'}
            </Button>

            <p className="text-xs text-emerald-300 text-center mt-4">
              Need an account? Contact your administrator
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
