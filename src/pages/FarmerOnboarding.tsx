
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import { ArrowLeft } from 'lucide-react';
import { searchPincodeByLocation, debounce } from '@/utils/pincodeSearch';
import FarmerRegistrationForm from '@/components/FarmerOnboarding/FarmerRegistrationForm';

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
        return true;
      }

      return false;
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

    const hasConflict = await checkPhoneNumberConflict(formData.phoneNumber);
    if (hasConflict) {
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

          <FarmerRegistrationForm
            formData={formData}
            isLoading={isLoading}
            user={user}
            onSubmit={handleSubmit}
            onStateChange={handleStateChange}
            onInputChange={handleInputChange}
            onCancel={() => navigate('/dashboard')}
          />
        </div>
      </div>
    </div>
  );
};

export default FarmerOnboarding;
