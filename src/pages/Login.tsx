
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
    <div className="min-h-screen bg-gradient-to-br from-wheat-beige via-clay-white to-wheat-beige flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-clay-white/95 backdrop-blur">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-leafy-green to-deep-green rounded-full flex items-center justify-center mb-4">
            <span className="text-wheat-beige text-2xl font-bold">🐄</span>
          </div>
          <CardTitle className="text-2xl font-bold text-forest-green">Govardhini</CardTitle>
          <CardDescription className="text-muted-brown">
            Digital Cattle Management System
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-charcoal">Email or Phone</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-muted-brown/30 focus:border-leafy-green"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-charcoal">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-muted-brown/30 focus:border-leafy-green"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role" className="text-charcoal">Select Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="border-muted-brown/30 focus:border-leafy-green">
                  <SelectValue placeholder="Choose your role" />
                </SelectTrigger>
                <SelectContent className="bg-clay-white border-muted-brown/30">
                  <SelectItem value="field_officer">Field Officer</SelectItem>
                  <SelectItem value="office_staff">Office Staff</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-leafy-green to-deep-green hover:from-leafy-green/90 hover:to-deep-green/90 text-wheat-beige font-semibold py-3 transition-all duration-200"
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
