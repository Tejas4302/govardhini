import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import { ArrowLeft } from 'lucide-react';
import { LocationCombobox } from '@/components/LocationCombobox';
import { 
  getAllStates, 
  getDistrictsByState, 
  getTaluksByDistrict, 
  getVillagesByTaluk,
  getPincodesByLocation,
  getPincodeByVillage,
  searchTaluks,
  searchVillages,
  searchPincodes
} from '@/utils/comprehensiveLocationData';

const FarmerOnboarding = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    aadhaarNumber: '',
    state: '',
    district: '',
    taluk: '',
    townOrVillage: '',
    pincode: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem('govardhini_user') || '{}');

  // Auto-populate pincode when village is selected
  useEffect(() => {
    if (formData.state && formData.district && formData.taluk && formData.townOrVillage) {
      const autoPincode = getPincodeByVillage(formData.state, formData.district, formData.taluk, formData.townOrVillage);
      if (autoPincode && autoPincode !== formData.pincode) {
        setFormData(prev => ({ ...prev, pincode: autoPincode }));
      }
    }
  }, [formData.state, formData.district, formData.taluk, formData.townOrVillage]);

  const saveOffline = (data: any) => {
    const offlineData = JSON.parse(localStorage.getItem('offline_farmers') || '[]');
    offlineData.push({ ...data, id: Date.now().toString(), synced: false });
    localStorage.setItem('offline_farmers', JSON.stringify(offlineData));
  };

  const syncOfflineData = async () => {
    const offlineData = JSON.parse(localStorage.getItem('offline_farmers') || '[]');
    const unsynced = offlineData.filter((item: any) => !item.synced);
    
    for (const item of unsynced) {
      try {
        const { error } = await supabase.from('farmers').insert({
          full_name: item.fullName,
          phone_number: item.phoneNumber,
          aadhaar_number: item.aadhaarNumber || null,
          state: item.state,
          district: item.district,
          taluk: item.taluk,
          town_or_village: item.townOrVillage,
          pincode: item.pincode,
          added_by: user.id || 'offline-user'
        });

        if (!error) {
          item.synced = true;
        }
      } catch (error) {
        console.error('Sync error:', error);
      }
    }
    
    localStorage.setItem('offline_farmers', JSON.stringify(offlineData));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.phoneNumber || !formData.state || !formData.district || !formData.taluk || !formData.townOrVillage || !formData.pincode) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.from('farmers').insert({
        full_name: formData.fullName,
        phone_number: formData.phoneNumber,
        aadhaar_number: formData.aadhaarNumber || null,
        state: formData.state,
        district: formData.district,
        taluk: formData.taluk,
        town_or_village: formData.townOrVillage,
        pincode: formData.pincode,
        added_by: user.id || 'offline-user'
      }).select().single();

      if (error) {
        saveOffline(formData);
        toast({
          title: "Saved Offline",
          description: "No internet connection. Data saved locally and will sync when online.",
          variant: "default"
        });
      } else {
        toast({
          title: "Success! ✅",
          description: `Farmer ${formData.fullName} has been registered successfully. SMS notification sent!`,
        });
        
        await syncOfflineData();
        
        if (data?.id) {
          navigate(`/farmer/${data.id}`);
        } else {
          setFormData({
            fullName: '',
            phoneNumber: '',
            aadhaarNumber: '',
            state: '',
            district: '',
            taluk: '',
            townOrVillage: '',
            pincode: '',
          });
        }
      }

    } catch (error) {
      console.error('Error:', error);
      saveOffline(formData);
      toast({
        title: "Saved Offline 📱",
        description: "Data saved locally. Will sync when connection is restored.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStateChange = (state: string) => {
    setFormData({ 
      ...formData, 
      state, 
      district: '', 
      taluk: '', 
      townOrVillage: '', 
      pincode: '' 
    });
  };

  const handleDistrictChange = (district: string) => {
    setFormData({ 
      ...formData, 
      district, 
      taluk: '', 
      townOrVillage: '', 
      pincode: '' 
    });
  };

  const handleTalukChange = (taluk: string) => {
    setFormData({ 
      ...formData, 
      taluk, 
      townOrVillage: '', 
      pincode: '' 
    });
  };

  const handleVillageChange = (village: string) => {
    setFormData({ 
      ...formData, 
      townOrVillage: village 
    });
  };

  const availableStates = getAllStates();
  const availableDistricts = getDistrictsByState(formData.state);
  const availableTaluks = getTaluksByDistrict(formData.state, formData.district);
  const availableVillages = getVillagesByTaluk(formData.state, formData.district, formData.taluk);
  const availablePincodes = getPincodesByLocation(formData.state, formData.district, formData.taluk);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation user={user} />
      
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-10 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        </div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="mb-4 glass-input text-white border-white/20 hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <Card className="glass-card border-0 animate-fade-in">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <span className="text-white text-3xl">👨‍🌾</span>
              </div>
              <CardTitle className="text-2xl font-bold text-white">Farmer Registration</CardTitle>
              <CardDescription className="text-gray-300">Add a new farmer to the system</CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white border-b border-white/20 pb-2">👤 Personal Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-white">Full Name *</Label>
                      <Input
                        id="fullName"
                        placeholder="Enter farmer's full name"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="glass-input text-white placeholder:text-gray-400 border-white/20"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber" className="text-white">Phone Number *</Label>
                      <Input
                        id="phoneNumber"
                        placeholder="Enter 10-digit phone number"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        className="glass-input text-white placeholder:text-gray-400 border-white/20"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="aadhaarNumber" className="text-white">Aadhaar Number (Optional)</Label>
                    <Input
                      id="aadhaarNumber"
                      placeholder="Enter 12-digit Aadhaar number"
                      value={formData.aadhaarNumber}
                      onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                      className="glass-input text-white placeholder:text-gray-400 border-white/20"
                    />
                  </div>
                </div>

                {/* Address Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white border-b border-white/20 pb-2">📍 Address Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="state" className="text-white">State *</Label>
                      <Select value={formData.state} onValueChange={handleStateChange}>
                        <SelectTrigger className="glass-input text-white border-white/20">
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-white/20 z-50">
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
                      <Select 
                        value={formData.district} 
                        onValueChange={handleDistrictChange}
                        disabled={!formData.state}
                      >
                        <SelectTrigger className="glass-input text-white border-white/20">
                          <SelectValue placeholder="Select district" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-white/20 z-50">
                          {availableDistricts.map((district) => (
                            <SelectItem key={district} value={district} className="text-white hover:bg-slate-700">
                              {district}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="taluk" className="text-white">Taluk *</Label>
                      <LocationCombobox
                        value={formData.taluk}
                        onValueChange={handleTalukChange}
                        options={availableTaluks}
                        placeholder="Search and select taluk"
                        searchPlaceholder="Type to search taluks..."
                        disabled={!formData.district}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="townOrVillage" className="text-white">Town/Village *</Label>
                      <LocationCombobox
                        value={formData.townOrVillage}
                        onValueChange={handleVillageChange}
                        options={availableVillages}
                        placeholder="Search and select village"
                        searchPlaceholder="Type to search villages..."
                        disabled={!formData.taluk}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="pincode" className="text-white">
                      Pincode * {formData.pincode && <span className="text-green-400">(Auto-filled)</span>}
                    </Label>
                    <LocationCombobox
                      value={formData.pincode}
                      onValueChange={(pincode) => setFormData({ ...formData, pincode })}
                      options={availablePincodes}
                      placeholder="Pincode will be auto-filled"
                      searchPlaceholder="Type to search pincodes..."
                      disabled={!formData.taluk}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-white">Added By</Label>
                  <Input 
                    value={user.name || 'Current User'} 
                    readOnly 
                    className="glass-input text-white placeholder:text-gray-400 border-white/20 opacity-70" 
                  />
                </div>
                
                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 glass-input text-white border-white/20 hover:bg-white/20"
                    onClick={() => navigate('/dashboard')}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 glass-button text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Registering...' : 'Register Farmer 👨‍🌾'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FarmerOnboarding;
