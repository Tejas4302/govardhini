
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
    <div className="min-h-screen bg-gradient-to-br from-wheat-beige via-clay-white to-wheat-beige flex items-center justify-center p-4 relative overflow-hidden">
      {/* Enhanced background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-10 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-leafy-green rounded-full mix-blend-multiply filter blur-3xl animate-pulse glass-float"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-deep-green rounded-full mix-blend-multiply filter blur-3xl animate-pulse glass-float-delayed"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-forest-green rounded-full mix-blend-multiply filter blur-3xl animate-pulse glass-float"></div>
        </div>
      </div>

      <Card className="w-full max-w-md glass-card border-0 animate-scale-in relative z-10">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-leafy-green to-deep-green rounded-full flex items-center justify-center mb-4 shadow-lg backdrop-blur-sm border border-white/20 glass-float">
            <span className="text-wheat-beige text-2xl font-bold">🐄</span>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-forest-green to-deep-green bg-clip-text text-transparent">
            Govardhini
          </CardTitle>
          <CardDescription className="text-muted-brown">
            Digital Cattle Management System
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-charcoal font-medium">Email or Phone</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-input border-0 text-charcoal placeholder:text-muted-brown/70"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-charcoal font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input border-0 text-charcoal placeholder:text-muted-brown/70"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role" className="text-charcoal font-medium">Select Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="glass-input border-0 text-charcoal">
                  <SelectValue placeholder="Choose your role" />
                </SelectTrigger>
                <SelectContent className="glass-card border-0">
                  <SelectItem value="field_officer">Field Officer</SelectItem>
                  <SelectItem value="office_staff">Office Staff</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              type="submit" 
              className="w-full glass-button border-0 text-wheat-beige font-semibold py-3 mt-6"
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
