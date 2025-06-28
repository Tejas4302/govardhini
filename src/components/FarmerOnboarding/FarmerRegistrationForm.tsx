
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PersonalInfoSection from './PersonalInfoSection';
import AddressInfoSection from './AddressInfoSection';

interface FormData {
  fullName: string;
  phoneNumber: string;
  aadhaarNumber: string;
  state: string;
  district: string;
  taluk: string;
  townOrVillage: string;
  pincode: string;
}

interface FarmerRegistrationFormProps {
  formData: FormData;
  isLoading: boolean;
  user: any;
  onSubmit: (e: React.FormEvent) => void;
  onStateChange: (state: string) => void;
  onInputChange: (field: string, value: string) => void;
  onCancel: () => void;
}

const FarmerRegistrationForm = ({
  formData,
  isLoading,
  user,
  onSubmit,
  onStateChange,
  onInputChange,
  onCancel
}: FarmerRegistrationFormProps) => {
  return (
    <Card className="glass-card border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-green-500/5 animate-fade-in">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
          <span className="text-white text-3xl">👨‍🌾</span>
        </div>
        <CardTitle className="text-2xl font-bold text-white">Farmer Registration</CardTitle>
        <CardDescription className="text-emerald-300">Add a new farmer to the system</CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <PersonalInfoSection 
            formData={{
              fullName: formData.fullName,
              phoneNumber: formData.phoneNumber,
              aadhaarNumber: formData.aadhaarNumber
            }}
            onInputChange={onInputChange}
          />

          <AddressInfoSection
            formData={{
              state: formData.state,
              district: formData.district,
              taluk: formData.taluk,
              townOrVillage: formData.townOrVillage,
              pincode: formData.pincode
            }}
            onStateChange={onStateChange}
            onInputChange={onInputChange}
          />
          
          <div className="space-y-2">
            <Label className="text-white">Added By</Label>
            <Input 
              value={user.name || 'Current User'} 
              readOnly 
              className="glass-input text-white placeholder:text-emerald-400 border-emerald-500/30 opacity-70" 
            />
          </div>
          
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1 glass-input text-white border-emerald-500/30 hover:bg-emerald-500/20"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 grass-green hover:bg-emerald-700 text-white font-semibold"
              disabled={isLoading}
            >
              {isLoading ? 'Registering...' : 'Register Farmer 👨‍🌾'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default FarmerRegistrationForm;
