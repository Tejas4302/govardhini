import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Eye, EyeOff } from 'lucide-react';

interface CreateUserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void;
}

const CreateUserForm = ({
  isOpen,
  onClose,
  onUserCreated,
}: CreateUserFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    password: '',
    designation: '',
  });

  const availableRoles = ['Field Officer', 'Office Staff', 'Admin'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1) Validate inputs
      if (
        !formData.fullName ||
        !formData.phoneNumber ||
        !formData.password ||
        !formData.designation
      ) {
        toast({
          title: 'Error',
          description: 'Please fill in all fields',
          variant: 'destructive',
        });
        return;
      }
      if (!/^\d{10}$/.test(formData.phoneNumber)) {
        toast({
          title: 'Error',
          description: 'Please enter a valid 10-digit phone number',
          variant: 'destructive',
        });
        return;
      }

      // 2) Sign up with Supabase Auth
      const { user, error: signUpError } = await supabase.auth.signUp({
        phone: formData.phoneNumber,
        password: formData.password,
      });
      if (signUpError) throw signUpError;
      if (!user) throw new Error('No user returned from auth.signUp');

      // 3) Insert into your public.users table
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: user.id,                // link to auth.users.id
          full_name: formData.fullName,
          phone_number: formData.phoneNumber,
          // you can add other columns here...
        });
      if (profileError) throw profileError;

      // 4) Record the role assignment
      //    Assume you store the current admin’s ID in localStorage:
      const currentAdmin = JSON.parse(
        localStorage.getItem('govardhini_user') || '{}'
      );
      const { error: roleError } = await supabase
        .from('user_role_assignments')
        .insert({
          user_id: user.id,
          assigned_by: currentAdmin.id,
          role_assigned: formData.designation,
        });
      if (roleError) throw roleError;

      toast({
        title: 'Success',
        description: `Created user ${formData.fullName} as ${formData.designation}`,
      });

      // reset + close
      setFormData({
        fullName: '',
        phoneNumber: '',
        password: '',
        designation: '',
      });
      onClose();
      onUserCreated();
    } catch (err: any) {
      console.error(err);
      toast({
        title: 'Error',
        description: err.message || 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generatePassword = () => {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let pwd = '';
    for (let i = 0; i < 8; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((f) => ({ ...f, password: pwd }));
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="glass-card border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-green-500/5 text-white w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Create New User Account</SheetTitle>
          <SheetDescription>
            Fill details to register a new user
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              value={formData.fullName}
              onChange={(e) =>
                setFormData((f) => ({ ...f, fullName: e.target.value }))
              }
              disabled={isLoading}
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) =>
                setFormData((f) => ({ ...f, phoneNumber: e.target.value }))
              }
              maxLength={10}
              disabled={isLoading}
            />
          </div>

          {/* Designation */}
          <div className="space-y-2">
            <Label htmlFor="designation">Designation</Label>
            <Select
              value={formData.designation}
              onValueChange={(val) =>
                setFormData((f) => ({ ...f, designation: val }))
              }
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="password">Password</Label>
              <Button
                size="sm"
                variant="ghost"
                onClick={generatePassword}
                disabled={isLoading}
              >
                Generate
              </Button>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, password: e.target.value }))
                }
                disabled={isLoading}
                className="pr-10"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-2"
                onClick={() => setShowPassword((s) => !s)}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating…' : 'Create User'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default CreateUserForm;
