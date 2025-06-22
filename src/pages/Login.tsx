
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !role) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    // Store user data in localStorage (in real app, this would be proper authentication)
    const userData = { email, role, name: email.split('@')[0] };
    localStorage.setItem('govardhini_user', JSON.stringify(userData));
    
    toast({
      title: "Welcome to Govardhini!",
      description: `Logged in as ${role}`,
    });
    
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-50 to-lime-50 farm-pattern flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 earth-card backdrop-blur">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-16 h-16 grass-green rounded-full flex items-center justify-center mb-4 shadow-lg">
            <span className="text-white text-2xl font-bold">🐄</span>
          </div>
          <CardTitle className="text-2xl font-bold text-green-900">Govardhini</CardTitle>
          <CardDescription className="text-green-700">
            Digital Cattle Management System
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-green-800">Email or Phone</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-input border-green-300/50 text-green-900 placeholder:text-green-600"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-green-800">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input border-green-300/50 text-green-900 placeholder:text-green-600"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role" className="text-green-800">Select Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="glass-input border-green-300/50 text-green-900">
                  <SelectValue placeholder="Choose your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="field_officer">Field Officer</SelectItem>
                  <SelectItem value="office_staff">Office Staff</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              type="submit" 
              className="w-full grass-green hover:bg-green-700 text-white font-semibold py-3 transition-all duration-200 shadow-lg"
            >
              Login to Govardhini
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
