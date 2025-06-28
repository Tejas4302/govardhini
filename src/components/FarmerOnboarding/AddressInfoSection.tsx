
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin } from 'lucide-react';
import { getAllStates } from '@/utils/comprehensiveLocationData';

interface AddressInfoSectionProps {
  formData: {
    state: string;
    district: string;
    taluk: string;
    townOrVillage: string;
    pincode: string;
  };
  onStateChange: (state: string) => void;
  onInputChange: (field: string, value: string) => void;
}

const AddressInfoSection = ({ formData, onStateChange, onInputChange }: AddressInfoSectionProps) => {
  const availableStates = getAllStates();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white border-b border-emerald-500/20 pb-2 flex items-center">
        <MapPin className="w-5 h-5 mr-2 text-emerald-400" />
        Address Information
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="state" className="text-white">State *</Label>
          <Select value={formData.state} onValueChange={onStateChange}>
            <SelectTrigger className="glass-input text-white border-emerald-500/30">
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-emerald-500/30 z-50">
              {availableStates.map((state) => (
                <SelectItem key={state} value={state} className="text-white hover:bg-slate-700">
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="district" className="text-white">District *</Label>
          <Input
            id="district"
            placeholder="Enter district name"
            value={formData.district}
            onChange={(e) => onInputChange('district', e.target.value)}
            className="glass-input text-white placeholder:text-gray-400 border-emerald-500/30"
            disabled={!formData.state}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="taluk" className="text-white">Taluk *</Label>
          <Input
            id="taluk"
            placeholder="Enter taluk/tehsil name"
            value={formData.taluk}
            onChange={(e) => onInputChange('taluk', e.target.value)}
            className="glass-input text-white placeholder:text-gray-400 border-emerald-500/30"
            disabled={!formData.state}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="townOrVillage" className="text-white">Town/Village *</Label>
          <Input
            id="townOrVillage"
            placeholder="Enter town or village name"
            value={formData.townOrVillage}
            onChange={(e) => onInputChange('townOrVillage', e.target.value)}
            className="glass-input text-white placeholder:text-gray-400 border-emerald-500/30"
            disabled={!formData.state}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="pincode" className="text-white">
          Pincode * {formData.pincode && <span className="text-green-400">(Auto-filled)</span>}
        </Label>
        <Input
          id="pincode"
          placeholder="Pincode will be auto-filled or enter manually"
          value={formData.pincode}
          onChange={(e) => onInputChange('pincode', e.target.value)}
          className="glass-input text-white placeholder:text-gray-400 border-emerald-500/30"
        />
      </div>
    </div>
  );
};

export default AddressInfoSection;
