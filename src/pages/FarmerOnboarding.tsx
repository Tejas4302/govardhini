
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';

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
      const { error } = await supabase.from('farmers').insert({
        full_name: formData.fullName,
        phone_number: formData.phoneNumber,
        aadhaar_number: formData.aadhaarNumber || null,
        state: formData.state,
        district: formData.district,
        taluk: formData.taluk,
        town_or_village: formData.townOrVillage,
        pincode: formData.pincode,
        added_by: user.id || 'offline-user'
      });

      if (error) {
        // Save offline if network error
        saveOffline(formData);
        toast({
          title: "Saved Offline",
          description: "No internet connection. Data saved locally and will sync when online.",
          variant: "default"
        });
      } else {
        toast({
          title: "Success! ✅",
          description: `Farmer ${formData.fullName} has been registered successfully`,
        });
        
        // Try to sync any offline data
        await syncOfflineData();
      }
      
      // Reset form
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-amber-50 to-orange-50">
      <Navigation user={user} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white/90 backdrop-blur shadow-xl border-0">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-600 to-amber-600 rounded-full flex items-center justify-center mb-4">
                <span className="text-white text-3xl">👨‍🌾</span>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800">Farmer Registration</CardTitle>
              <CardDescription>Add a new farmer to the system</CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">👤 Personal Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        placeholder="Enter farmer's full name"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number *</Label>
                      <Input
                        id="phoneNumber"
                        placeholder="Enter 10-digit phone number"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="aadhaarNumber">Aadhaar Number (Optional)</Label>
                    <Input
                      id="aadhaarNumber"
                      placeholder="Enter 12-digit Aadhaar number"
                      value={formData.aadhaarNumber}
                      onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                    />
                  </div>
                </div>

                {/* Address Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">📍 Address Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        placeholder="Enter state"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="district">District *</Label>
                      <Input
                        id="district"
                        placeholder="Enter district"
                        value={formData.district}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="taluk">Taluk *</Label>
                      <Input
                        id="taluk"
                        placeholder="Enter taluk"
                        value={formData.taluk}
                        onChange={(e) => setFormData({ ...formData, taluk: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="townOrVillage">Town/Village *</Label>
                      <Input
                        id="townOrVillage"
                        placeholder="Enter town or village"
                        value={formData.townOrVillage}
                        onChange={(e) => setFormData({ ...formData, townOrVillage: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input
                      id="pincode"
                      placeholder="Enter 6-digit pincode"
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Added By</Label>
                  <Input value={user.name || 'Current User'} readOnly className="bg-gray-50" />
                </div>
                
                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate('/dashboard')}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-green-600 to-amber-600 hover:from-green-700 hover:to-amber-700"
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
