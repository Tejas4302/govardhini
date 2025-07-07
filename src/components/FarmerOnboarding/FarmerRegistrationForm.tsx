
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users } from 'lucide-react';
import { getAllStates, getDistrictsByState, getTaluksByDistrict, getVillagesByTaluk } from '@/utils/comprehensiveLocationData';

interface FarmerRegistrationFormProps {
  formData: {
    fullName: string;
    phoneNumber: string;
    aadhaarNumber: string;
    state: string;
    district: string;
    taluk: string;
    townOrVillage: string;
    pincode: string;
  };
  isLoading: boolean;
  user: any;
  onSubmit: (e: React.FormEvent) => void;
  onStateChange: (state: string) => void;
  onInputChange: (field: string, value: string) => void;
  onCancel: () => void;
}

const FarmerRegistrationForm: React.FC<FarmerRegistrationFormProps> = ({
  formData,
  isLoading,
  user,
  onSubmit,
  onStateChange,
  onInputChange,
  onCancel
}) => {
  return (
    <Card className="agricultural-glass border-emerald-500/20 backdrop-blur-md animate-fade-in">
      <CardHeader className="text-center pb-4 sm:pb-6">
        <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mb-3 sm:mb-4 shadow-lg">
          <Users className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
        </div>
        <CardTitle className="text-xl sm:text-2xl font-bold text-white">Farmer Registration</CardTitle>
        <CardDescription className="text-emerald-300 text-sm sm:text-base">Add a new farmer to the system</CardDescription>
      </CardHeader>
      
      <CardContent className="px-4 sm:px-6">
        <form onSubmit={onSubmit} className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-emerald-200 text-sm sm:text-base">Full Name *</Label>
              <Input
                id="fullName"
                placeholder="Enter full name"
                value={formData.fullName}
                onChange={(e) => onInputChange('fullName', e.target.value)}
                className="glass-input border-emerald-500/30 text-white placeholder:text-emerald-300/70 h-10 sm:h-12 text-sm sm:text-base"
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-emerald-200 text-sm sm:text-base">Phone Number *</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="10-digit phone number"
                value={formData.phoneNumber}
                onChange={(e) => onInputChange('phoneNumber', e.target.value)}
                className="glass-input border-emerald-500/30 text-white placeholder:text-emerald-300/70 h-10 sm:h-12 text-sm sm:text-base"
                disabled={isLoading}
                maxLength={10}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="aadhaarNumber" className="text-emerald-200 text-sm sm:text-base">Aadhaar Number (Optional)</Label>
            <Input
              id="aadhaarNumber"
              placeholder="12-digit Aadhaar number"
              value={formData.aadhaarNumber}
              onChange={(e) => onInputChange('aadhaarNumber', e.target.value)}
              className="glass-input border-emerald-500/30 text-white placeholder:text-emerald-300/70 h-10 sm:h-12 text-sm sm:text-base"
              disabled={isLoading}
              maxLength={12}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label className="text-emerald-200 text-sm sm:text-base">State *</Label>
              <Select value={formData.state} onValueChange={onStateChange} disabled={isLoading}>
                <SelectTrigger className="glass-input border-emerald-500/30 text-white h-10 sm:h-12 text-sm sm:text-base">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-emerald-500/30">
                  {getAllStates().map(state => (
                    <SelectItem key={state} value={state} className="text-white hover:bg-emerald-600/20">
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-emerald-200 text-sm sm:text-base">District *</Label>
              <Select 
                value={formData.district} 
                onValueChange={(value) => onInputChange('district', value)}
                disabled={isLoading || !formData.state}
              >
                <SelectTrigger className="glass-input border-emerald-500/30 text-white h-10 sm:h-12 text-sm sm:text-base">
                  <SelectValue placeholder="Select district" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-emerald-500/30">
                  {formData.state && getDistrictsByState(formData.state).map(district => (
                    <SelectItem key={district} value={district} className="text-white hover:bg-emerald-600/20">
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label className="text-emerald-200 text-sm sm:text-base">Taluk *</Label>
              <Select 
                value={formData.taluk} 
                onValueChange={(value) => onInputChange('taluk', value)}
                disabled={isLoading || !formData.district}
              >
                <SelectTrigger className="glass-input border-emerald-500/30 text-white h-10 sm:h-12 text-sm sm:text-base">
                  <SelectValue placeholder="Select taluk" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-emerald-500/30">
                  {formData.district && getTaluksByDistrict(formData.state, formData.district).map(taluk => (
                    <SelectItem key={taluk} value={taluk} className="text-white hover:bg-emerald-600/20">
                      {taluk}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-emerald-200 text-sm sm:text-base">Town/Village *</Label>
              <Select 
                value={formData.townOrVillage} 
                onValueChange={(value) => onInputChange('townOrVillage', value)}
                disabled={isLoading || !formData.taluk}
              >
                <SelectTrigger className="glass-input border-emerald-500/30 text-white h-10 sm:h-12 text-sm sm:text-base">
                  <SelectValue placeholder="Select village" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-emerald-500/30">
                  {formData.taluk && getVillagesByTaluk(formData.state, formData.district, formData.taluk).map(village => (
                    <SelectItem key={village} value={village} className="text-white hover:bg-emerald-600/20">
                      {village}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pincode" className="text-emerald-200 text-sm sm:text-base">Pincode *</Label>
            <Input
              id="pincode"
              placeholder="6-digit pincode"
              value={formData.pincode}
              onChange={(e) => onInputChange('pincode', e.target.value)}
              className="glass-input border-emerald-500/30 text-white placeholder:text-emerald-300/70 h-10 sm:h-12 text-sm sm:text-base"
              disabled={isLoading}
              maxLength={6}
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-emerald-200 text-sm sm:text-base">Added By</Label>
            <Input 
              value={user.name || 'Current User'} 
              readOnly 
              className="glass-input border-emerald-500/30 text-white placeholder:text-emerald-300/70 opacity-70 h-10 sm:h-12 text-sm sm:text-base" 
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-emerald-400/30 text-emerald-200 hover:bg-emerald-500/20 hover:border-emerald-400 h-10 sm:h-12 text-sm sm:text-base"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold h-10 sm:h-12 text-sm sm:text-base"
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
