
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const navigate = useNavigate();
  const { toast } = useToast();

  // Login form state
  const [loginData, setLoginData] = useState({
    phone: '',
    password: ''
  });

  // Signup form state
  const [signupData, setSignupData] = useState({
    fullName: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    designation: ''
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

      const hashedPassword = await hashPassword(loginData.password);

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('phone_number', loginData.phone)
        .eq('password_hash', hashedPassword)
        .single();

      if (error || !data) {
        toast({
          title: "Login Failed",
          description: "Invalid phone number or password",
          variant: "destructive"
        });
        return;
      }

      // Store user data in localStorage
      const userData = {
        id: data.id,
        name: data.full_name,
        phone: data.phone_number,
        role: data.designation.toLowerCase().replace(' ', '_'),
        email: data.phone_number // Using phone as fallback for email field
      };
      
      localStorage.setItem('govardhini_user', JSON.stringify(userData));
      
      toast({
        title: "Welcome to Govardhini!",
        description: `Logged in successfully as ${data.designation}`,
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!signupData.fullName || !signupData.phoneNumber || !signupData.password || !signupData.designation) {
        toast({
          title: "Error",
          description: "Please fill in all fields",
          variant: "destructive"
        });
        return;
      }

      if (signupData.password !== signupData.confirmPassword) {
        toast({
          title: "Error",
          description: "Passwords do not match",
          variant: "destructive"
        });
        return;
      }

      if (signupData.password.length < 6) {
        toast({
          title: "Error",
          description: "Password must be at least 6 characters long",
          variant: "destructive"
        });
        return;
      }

      // Check if phone number already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('phone_number')
        .eq('phone_number', signupData.phoneNumber)
        .single();

      if (existingUser) {
        toast({
          title: "Error",
          description: "Phone number already registered",
          variant: "destructive"
        });
        return;
      }

      const hashedPassword = await hashPassword(signupData.password);

      const { data, error } = await supabase
        .from('users')
        .insert({
          full_name: signupData.fullName,
          phone_number: signupData.phoneNumber,
          password_hash: hashedPassword,
          designation: signupData.designation
        })
        .select()
        .single();

      if (error) {
        console.error('Signup error:', error);
        toast({
          title: "Signup Failed",
          description: error.message || "Failed to create account",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Account Created!",
        description: "Please login with your credentials",
      });

      // Clear signup form and switch to login tab
      setSignupData({
        fullName: '',
        phoneNumber: '',
        password: '',
        confirmPassword: '',
        designation: ''
      });

      // Switch to login tab
      setActiveTab('login');

    } catch (error) {
      console.error('Signup error:', error);
      toast({
        title: "Error",
        description: "An error occurred during signup",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-gray-800 text-white">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center mb-4">
            <span className="text-white text-2xl font-bold">🐄</span>
          </div>
          <CardTitle className="text-2xl font-bold text-white">Govardhini</CardTitle>
          <CardDescription className="text-gray-300">
            Digital Cattle Management System
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 bg-gray-700">
              <TabsTrigger value="login" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">Login</TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-200">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={loginData.phone}
                    onChange={(e) => setLoginData(prev => ({ ...prev, phone: e.target.value }))}
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-green-500"
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-200">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-green-500"
                    disabled={isLoading}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 transition-all duration-200"
                >
                  {isLoading ? 'Logging in...' : 'Login to Govardhini'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-gray-200">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={signupData.fullName}
                    onChange={(e) => setSignupData(prev => ({ ...prev, fullName: e.target.value }))}
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-green-500"
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-gray-200">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={signupData.phoneNumber}
                    onChange={(e) => setSignupData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-green-500"
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="designation" className="text-gray-200">Designation</Label>
                  <Select 
                    value={signupData.designation} 
                    onValueChange={(value) => setSignupData(prev => ({ ...prev, designation: value }))}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Choose your designation" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="Field Officer">Field Officer</SelectItem>
                      <SelectItem value="Office Staff">Office Staff</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signupPassword" className="text-gray-200">Password</Label>
                  <Input
                    id="signupPassword"
                    type="password"
                    placeholder="Create a password (min 6 characters)"
                    value={signupData.password}
                    onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-green-500"
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-200">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-green-500"
                    disabled={isLoading}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 transition-all duration-200"
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
