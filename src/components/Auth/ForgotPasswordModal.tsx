
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<'phone' | 'otp' | 'password'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleSendOTP = async () => {
    if (!phone) {
      toast({
        title: "Error",
        description: "Please enter your phone number",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Check if user exists
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('phone_number', phone)
        .single();

      if (userError || !userData) {
        toast({
          title: "Error",
          description: "Phone number not found",
          variant: "destructive"
        });
        return;
      }

      // Generate and store OTP
      const generatedOTP = generateOTP();
      const { error: otpError } = await supabase
        .from('password_reset_tokens')
        .insert({
          phone_number: phone,
          otp: generatedOTP
        });

      if (otpError) {
        toast({
          title: "Error",
          description: "Failed to generate OTP",
          variant: "destructive"
        });
        return;
      }

      // In a real app, you would send the OTP via SMS
      // For now, we'll show it in the toast for testing
      toast({
        title: "OTP Sent",
        description: `Your OTP is: ${generatedOTP} (Valid for 10 minutes)`,
      });

      setStep('otp');
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast({
        title: "Error",
        description: "Failed to send OTP",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      toast({
        title: "Error",
        description: "Please enter the OTP",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: tokenData, error: tokenError } = await supabase
        .from('password_reset_tokens')
        .select('*')
        .eq('phone_number', phone)
        .eq('otp', otp)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (tokenError || !tokenData) {
        toast({
          title: "Error",
          description: "Invalid or expired OTP",
          variant: "destructive"
        });
        return;
      }

      setStep('password');
      toast({
        title: "Success",
        description: "OTP verified successfully",
      });
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast({
        title: "Error",
        description: "Failed to verify OTP",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword) {
      toast({
        title: "Error",
        description: "Please enter a new password",
        variant: "destructive"
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const hashedPassword = await hashPassword(newPassword);

      // Update password
      const { error: updateError } = await supabase
        .from('users')
        .update({ password_hash: hashedPassword })
        .eq('phone_number', phone);

      if (updateError) {
        toast({
          title: "Error",
          description: "Failed to update password",
          variant: "destructive"
        });
        return;
      }

      // Mark OTP as used
      await supabase
        .from('password_reset_tokens')
        .update({ used: true })
        .eq('phone_number', phone)
        .eq('otp', otp);

      toast({
        title: "Success",
        description: "Password reset successfully",
      });

      // Reset form and close modal
      setStep('phone');
      setPhone('');
      setOtp('');
      setNewPassword('');
      onClose();
    } catch (error) {
      console.error('Error resetting password:', error);
      toast({
        title: "Error",
        description: "Failed to reset password",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep('phone');
    setPhone('');
    setOtp('');
    setNewPassword('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="glass-card border-emerald-500/20 bg-slate-800/90 backdrop-blur-xl text-white">
        <DialogHeader>
          <DialogTitle className="text-emerald-300">Reset Password</DialogTitle>
          <DialogDescription className="text-emerald-200">
            {step === 'phone' && 'Enter your phone number to receive an OTP'}
            {step === 'otp' && 'Enter the OTP sent to your phone'}
            {step === 'password' && 'Enter your new password'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {step === 'phone' && (
            <div>
              <Label htmlFor="phone" className="text-emerald-200">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                className="glass-input border-emerald-500/30 text-white placeholder:text-emerald-300"
                maxLength={10}
              />
            </div>
          )}

          {step === 'otp' && (
            <div>
              <Label htmlFor="otp" className="text-emerald-200">Enter OTP</Label>
              <Input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                className="glass-input border-emerald-500/30 text-white placeholder:text-emerald-300"
                maxLength={6}
              />
            </div>
          )}

          {step === 'password' && (
            <div>
              <Label htmlFor="newPassword" className="text-emerald-200">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="glass-input border-emerald-500/30 text-white placeholder:text-emerald-300"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
          >
            Cancel
          </Button>
          <Button
            onClick={
              step === 'phone' ? handleSendOTP :
              step === 'otp' ? handleVerifyOTP :
              handleResetPassword
            }
            disabled={isLoading}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {isLoading ? 'Processing...' : (
              step === 'phone' ? 'Send OTP' :
              step === 'otp' ? 'Verify OTP' :
              'Reset Password'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ForgotPasswordModal;
