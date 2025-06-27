
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Eye, EyeOff } from 'lucide-react';

interface CreateUserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void;
}

const CreateUserForm = ({ isOpen, onClose, onUserCreated }: CreateUserFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    password: '',
    designation: ''
  });

  const availableRoles = ['Field Officer', 'Office Staff', 'Admin'];

  const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!formData.fullName || !formData.phoneNumber || !formData.password || !formData.designation) {
        toast({
          title: "Error",
          description: "Please fill in all fields",
          variant: "destructive"
        });
        return;
      }

      // Validate phone number (10 digits)
      if (formData.phoneNumber.length !== 10 || !/^\d+$/.test(formData.phoneNumber)) {
        toast({
          title: "Error",
          description: "Please enter a valid 10-digit phone number",
          variant: "destructive"
        });
        return;
      }

      // Check if phone number already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('phone_number')
        .eq('phone_number', formData.phoneNumber)
        .single();

      if (existingUser) {
        toast({
          title: "Error",
          description: "A user with this phone number already exists",
          variant: "destructive"
        });
        return;
      }

      // Hash the password
      const hashedPassword = await hashPassword(formData.password);
      
      // Get current admin user
      const currentUser = JSON.parse(localStorage.getItem('govardhini_user') || '{}');

      // Create new user
      const { error } = await supabase
        .from('users')
        .insert({
          full_name: formData.fullName,
          phone_number: formData.phoneNumber,
          password_hash: hashedPassword,
          designation: formData.designation,
          active_role: formData.designation,
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: currentUser.id
        });

      if (error) {
        console.error('Error creating user:', error);
        toast({
          title: "Error",
          description: "Failed to create user account",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: `User account created successfully for ${formData.fullName}`,
      });

      // Reset form and close dialog
      setFormData({
        fullName: '',
        phoneNumber: '',
        password: '',
        designation: ''
      });
      onClose();
      onUserCreated();

    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: "An error occurred while creating the user account",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-green-500/5 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">Create New User Account</DialogTitle>
          <DialogDescription className="text-emerald-300">
            Create a new user account with login credentials
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-emerald-200">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Enter full name"
              value={formData.fullName}
              onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
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
              value={formData.phoneNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
              className="glass-input border-emerald-500/30 text-white placeholder:text-emerald-300"
              disabled={isLoading}
              maxLength={10}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="designation" className="text-emerald-200">Designation</Label>
            <Select
              value={formData.designation}
              onValueChange={(value) => setFormData(prev => ({ ...prev, designation: value }))}
              disabled={isLoading}
            >
              <SelectTrigger className="glass-input border-emerald-500/30 text-white">
                <SelectValue placeholder="Select designation" />
              </SelectTrigger>
              <SelectContent className="glass-card border-emerald-500/20 bg-slate-800">
                {availableRoles.map((role) => (
                  <SelectItem key={role} value={role} className="text-white hover:bg-emerald-500/20">
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-emerald-200">Password</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={generatePassword}
                className="text-emerald-400 hover:text-emerald-300 text-xs"
                disabled={isLoading}
              >
                Generate
              </Button>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="glass-input border-emerald-500/30 text-white placeholder:text-emerald-300 pr-12"
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Eye className="h-4 w-4 text-emerald-400" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 border-emerald-500/30 text-emerald-200 hover:bg-emerald-500/20"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 grass-green hover:bg-emerald-700 text-white"
            >
              {isLoading ? 'Creating...' : 'Create User'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserForm;
