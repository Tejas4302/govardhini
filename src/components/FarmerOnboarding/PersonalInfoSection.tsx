
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { User } from 'lucide-react';

interface PersonalInfoSectionProps {
  formData: {
    fullName: string;
    phoneNumber: string;
    aadhaarNumber: string;
  };
  onInputChange: (field: string, value: string) => void;
}

const PersonalInfoSection = ({ formData, onInputChange }: PersonalInfoSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white border-b border-emerald-500/20 pb-2 flex items-center">
        <User className="w-5 h-5 mr-2 text-emerald-400" />
        Personal Information
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-white">Full Name *</Label>
          <Input
            id="fullName"
            placeholder="Enter farmer's full name"
            value={formData.fullName}
            onChange={(e) => onInputChange('fullName', e.target.value)}
            className="glass-input text-white placeholder:text-emerald-400 border-emerald-500/30"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phoneNumber" className="text-white">Phone Number *</Label>
          <Input
            id="phoneNumber"
            placeholder="Enter 10-digit phone number (must be unique)"
            value={formData.phoneNumber}
            onChange={(e) => onInputChange('phoneNumber', e.target.value)}
            className="glass-input text-white placeholder:text-emerald-400 border-emerald-500/30"
          />
          <p className="text-xs text-emerald-300">
            Note: Phone number cannot be the same as any registered user's phone number
          </p>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="aadhaarNumber" className="text-white">Aadhaar Number (Optional)</Label>
        <Input
          id="aadhaarNumber"
          placeholder="Enter 12-digit Aadhaar number"
          value={formData.aadhaarNumber}
          onChange={(e) => onInputChange('aadhaarNumber', e.target.value)}
          className="glass-input text-white placeholder:text-emerald-400 border-emerald-500/30"
        />
      </div>
    </div>
  );
};

export default PersonalInfoSection;
