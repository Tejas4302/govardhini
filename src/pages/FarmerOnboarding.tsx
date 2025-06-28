import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import { ArrowLeft, User, MapPin } from 'lucide-react';
import { getAllStates } from '@/utils/comprehensiveLocationData';
import { searchPincodeByLocation, debounce } from '@/utils/pincodeSearch';

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

  // Debounced pincode search function
  const debouncedPincodeSearch = useCallback(
    debounce((state: string, district: string, taluk: string, village: string) => {
      if (state && (district || taluk || village)) {
        const foundPincode = searchPincodeByLocation(state, district, taluk, village);
        if (foundPincode && foundPincode !== formData.pincode) {
          setFormData(prev => ({ ...prev, pincode: foundPincode }));
        }
      }
    }, 500),
    [formData.pincode]
  );

  // Auto-populate pincode when location fields change
  useEffect(() => {
    debouncedPincodeSearch(formData.state, formData.district, formData.taluk, formData.townOrVillage);
  }, [formData.state, formData.district, formData.taluk, formData.townOrVillage, debouncedPincodeSearch]);

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

  const checkPhoneNumberConflict = async (phoneNumber: string): Promise<boolean> => {
    try {
      // Check if phone number exists in users table
      const { data: existingUser, error } = await supabase
        .from('users')
        .select('id, full_name')
        .eq('phone_number', phoneNumber)
        .maybeSingle();

      if (error) {
        console.error('Error checking phone number:', error);
        return false;
      }

      if (existingUser) {
        toast({
          title: "Invalid Phone Number",
          description: `This phone number is already registered to user: ${existingUser.full_name}. Please use a different phone number.`,
          variant: "destructive"
        });
        return true; // Conflict found
      }

      return false; // No conflict
    } catch (error) {
      console.error('Error checking phone number conflict:', error);
      return false;
    }
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

    // Check for phone number conflict with existing users
    const hasConflict = await checkPhoneNumberConflict(formData.phoneNumber);
    if (hasConflict) {
      return; // Stop submission if conflict found
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
          description: `Farmer ${formData.fullName} has been registered successfully.`,
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

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const availableStates = getAllStates();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-teal-900">
      <Navigation user={user} />
      
      {/* Enhanced animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-10 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-green-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
        </div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Updated Back Button to match SearchFarmers page */}
          <div className="flex items-center mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="mr-4 text-emerald-300 hover:text-emerald-100 hover:bg-emerald-500/20"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-4xl font-bold text-white animate-fade-in">Farmer Registration</h1>
          </div>

          <Card className="glass-card border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-green-500/5 animate-fade-in">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <span className="text-white text-3xl">👨‍🌾</span>
              </div>
              <CardTitle className="text-2xl font-bold text-white">Farmer Registration</CardTitle>
              <CardDescription className="text-emerald-300">Add a new farmer to the system</CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
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
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="glass-input text-white placeholder:text-emerald-400 border-emerald-500/30"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber" className="text-white">Phone Number *</Label>
                      <Input
                        id="phoneNumber"
                        placeholder="Enter 10-digit phone number (must be unique)"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
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
                      onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                      className="glass-input text-white placeholder:text-emerald-400 border-emerald-500/30"
                    />
                  </div>
                </div>

                {/* Address Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white border-b border-emerald-500/20 pb-2 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-emerald-400" />
                    Address Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="state" className="text-white">State *</Label>
                      <Select value={formData.state} onValueChange={handleStateChange}>
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
                        onChange={(e) => handleInputChange('district', e.target.value)}
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
                        onChange={(e) => handleInputChange('taluk', e.target.value)}
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
                        onChange={(e) => handleInputChange('townOrVillage', e.target.value)}
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
                      onChange={(e) => handleInputChange('pincode', e.target.value)}
                      className="glass-input text-white placeholder:text-gray-400 border-emerald-500/30"
                    />
                  </div>
                </div>
                
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
                    onClick={() => navigate('/dashboard')}
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
        </div>
      </div>
    </div>
  );
};

export default FarmerOnboarding;
