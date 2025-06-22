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
import { validateUserStatus } from '@/utils/authValidation';
import { Eye, EyeOff } from 'lucide-react';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
        status: data.status,
        email: data.phone_number,
        loginTime: new Date().toISOString()
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

  const validatePhoneNumber = (phone: string): boolean => {
    // Indian phone number validation (10 digits)
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const validatePassword = (password: string): { isValid: boolean; message?: string } => {
    if (password.length < 6) {
      return { isValid: false, message: "Password must be at least 6 characters long" };
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return { isValid: false, message: "Password must contain at least one lowercase letter" };
    }
    if (!/(?=.*\d)/.test(password)) {
      return { isValid: false, message: "Password must contain at least one number" };
    }
    return { isValid: true };
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

      // Validate phone number format
      if (!validatePhoneNumber(signupData.phoneNumber)) {
        toast({
          title: "Error",
          description: "Please enter a valid 10-digit Indian phone number",
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

      // Validate password strength
      const passwordValidation = validatePassword(signupData.password);
      if (!passwordValidation.isValid) {
        toast({
          title: "Error",
          description: passwordValidation.message,
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

      // Check if phone exists in farmers table to prevent conflicts
      const { data: existingFarmer } = await supabase
        .from('farmers')
        .select('phone_number')
        .eq('phone_number', signupData.phoneNumber)
        .single();

      if (existingFarmer) {
        toast({
          title: "Error",
          description: "This phone number is already registered as a farmer. Please use a different number.",
          variant: "destructive"
        });
        return;
      }

      const hashedPassword = await hashPassword(signupData.password);

      const { data, error } = await supabase
        .from('users')
        .insert({
          full_name: signupData.fullName.trim(),
          phone_number: signupData.phoneNumber,
          password_hash: hashedPassword,
          designation: signupData.designation,
          status: 'pending' // Explicitly set to pending
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
        description: "Your account has been created and is pending admin approval. You will be notified once approved.",
        duration: 5000
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
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-700 rounded-full flex items-center justify-center mb-4 shadow-xl">
            <span className="text-white text-2xl font-bold">🐄</span>
          </div>
          <CardTitle className="text-3xl font-bold text-white">Govardhini</CardTitle>
          <CardDescription className="text-emerald-300 text-lg">
            GOVARDHINI GAU SUPOSHANA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 glass-card border-emerald-500/30 bg-emerald-500/10">
              <TabsTrigger 
                value="login" 
                className="data-[state=active]:bg-emerald-600/80 data-[state=active]:text-white text-emerald-300 transition-all duration-200"
              >
                Login
              </TabsTrigger>
              <TabsTrigger 
                value="signup" 
                className="data-[state=active]:bg-emerald-600/80 data-[state=active]:text-white text-emerald-300 transition-all duration-200"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="animate-slide-up">
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
                      type={showLoginPassword ? "text" : "password"}
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
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                    >
                      {showLoginPassword ? (
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
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="animate-slide-up">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-emerald-200">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={signupData.fullName}
                    onChange={(e) => setSignupData(prev => ({ ...prev, fullName: e.target.value }))}
                    className="glass-input border-emerald-500/30 text-white placeholder:text-emerald-300"
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-emerald-200">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="Enter 10-digit phone number"
                    value={signupData.phoneNumber}
                    onChange={(e) => setSignupData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    className="glass-input border-emerald-500/30 text-white placeholder:text-emerald-300"
                    disabled={isLoading}
                    maxLength={10}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="designation" className="text-emerald-200">Designation</Label>
                  <Select 
                    value={signupData.designation} 
                    onValueChange={(value) => setSignupData(prev => ({ ...prev, designation: value }))}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="glass-input border-emerald-500/30 text-white">
                      <SelectValue placeholder="Choose your designation" />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-emerald-500/30 bg-slate-800/90 backdrop-blur-xl">
                      <SelectItem value="Field Officer" className="text-white hover:bg-emerald-500/20">Field Officer</SelectItem>
                      <SelectItem value="Office Staff" className="text-white hover:bg-emerald-500/20">Office Staff</SelectItem>
                      <SelectItem value="Admin" className="text-white hover:bg-emerald-500/20">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signupPassword" className="text-emerald-200">Password</Label>
                  <div className="relative">
                    <Input
                      id="signupPassword"
                      type={showSignupPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={signupData.password}
                      onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                      className="glass-input border-emerald-500/30 text-white placeholder:text-emerald-300 pr-12"
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                    >
                      {showSignupPassword ? (
                        <EyeOff className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-emerald-400" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-emerald-300">Must contain at least 6 characters, one letter and one number</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-emerald-200">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={signupData.confirmPassword}
                      onChange={(e) => setSignupData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="glass-input border-emerald-500/30 text-white placeholder:text-emerald-300 pr-12"
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
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
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
                
                <p className="text-xs text-emerald-300 text-center">
                  Account requires admin approval before login
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
