import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';

const CattleOnboarding = () => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    cattleId: `CTL${Date.now().toString().slice(-6)}`,
    farmerId: searchParams.get('farmerId') || '',
    farmerName: searchParams.get('farmerName') || '',
    breed: '',
    type: '',
    dob: new Date(),
    lactation: false,
    weightKg: '',
    ownerPhone: searchParams.get('farmerPhone') || '',
  });
  
  const [farmers, setFarmers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem('govardhini_user') || '{}');

  const cattleTypes = [
    { value: 'Cow', label: 'Cow' },
    { value: 'Buffalo', label: 'Buffalo' },
  ];

  useEffect(() => {
    fetchFarmers();
  }, []);

  const fetchFarmers = async () => {
    try {
      const { data, error } = await supabase
        .from('farmers')
        .select('id, full_name, phone_number')
        .order('full_name');

      if (error) throw error;
      setFarmers(data || []);
    } catch (error) {
      console.error('Error fetching farmers:', error);
    }
  };

  const handleFarmerSelect = (farmerId: string) => {
    const selectedFarmer = farmers.find(f => f.id === farmerId);
    if (selectedFarmer) {
      setFormData({
        ...formData,
        farmerId: farmerId,
        farmerName: selectedFarmer.full_name,
        ownerPhone: selectedFarmer.phone_number
      });
    }
  };

  const saveOffline = (data: any) => {
    const offlineData = JSON.parse(localStorage.getItem('offline_cattle') || '[]');
    offlineData.push({ ...data, id: Date.now().toString(), synced: false });
    localStorage.setItem('offline_cattle', JSON.stringify(offlineData));
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.farmerId) errors.push("Please select a farmer");
    if (!formData.farmerName.trim()) errors.push("Farmer name is required");
    if (!formData.breed.trim()) errors.push("Breed is required");
    if (!formData.type) errors.push("Cattle type is required");
    if (!formData.weightKg || parseFloat(formData.weightKg) <= 0) errors.push("Weight must be greater than 0");
    if (!formData.ownerPhone.trim()) errors.push("Owner phone is required");
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      toast({
        title: "Validation Error",
        description: validationErrors.join(", "),
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const cleanedData = {
        cattle_id: formData.cattleId.trim(),
        farmer_id: formData.farmerId,
        farmer_name: formData.farmerName.trim(),
        breed: formData.breed.trim(),
        type: formData.type,
        dob: format(formData.dob, 'yyyy-MM-dd'),
        lactation: formData.lactation,
        weight_kg: parseFloat(formData.weightKg),
        owner_phone: formData.ownerPhone.trim(),
        added_by: user.id || 'offline-user'
      };

      const { error } = await supabase.from('cattle_profiles').insert(cleanedData);

      if (error) {
        console.error('Database error:', error);
        
        if (error.message.includes('cattle_profiles_type_check')) {
          toast({
            title: "Invalid Cattle Type",
            description: "Cattle type must be either 'Cow' or 'Buffalo'. Please select from the dropdown.",
            variant: "destructive"
          });
        } else if (error.message.includes('duplicate key')) {
          toast({
            title: "Duplicate Entry",
            description: "A cattle with this ID already exists. Please use a different ID.",
            variant: "destructive"
          });
        } else if (error.message.includes('Failed to fetch') || error.message.includes('network') || error.code === 'PGRST301') {
          saveOffline(formData);
          toast({
            title: "Saved Offline 📱",
            description: "No internet connection. Data saved locally and will sync when online.",
            variant: "default"
          });
        } else {
          toast({
            title: "Database Error",
            description: error.message || "Failed to save cattle data. Please check your inputs and try again.",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Success! ✅",
          description: `Cattle ${formData.cattleId} has been registered successfully under ${formData.farmerName}`,
        });
        
        // Navigate back to farmer profile if we came from there
        if (formData.farmerId) {
          navigate(`/farmer/${formData.farmerId}`);
        } else {
          // Reset form
          setFormData({
            cattleId: `CTL${Date.now().toString().slice(-6)}`,
            farmerId: '',
            farmerName: '',
            breed: '',
            type: '',
            dob: new Date(),
            lactation: false,
            weightKg: '',
            ownerPhone: '',
          });
        }
      }

    } catch (error) {
      console.error('Network error:', error);
      saveOffline(formData);
      toast({
        title: "Saved Offline 📱",
        description: "Connection failed. Data saved locally and will sync when online.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-emerald-900">
      <Navigation user={user} />
      
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-10 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-green-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        </div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="glass-card border-0 animate-fade-in">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <span className="text-white text-3xl">🐄</span>
              </div>
              <CardTitle className="text-2xl font-bold text-white">Cattle Registration</CardTitle>
              <CardDescription className="text-gray-300">Add new cattle to the system</CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cattleId" className="text-white">Cattle ID</Label>
                    <Input
                      id="cattleId"
                      value={formData.cattleId}
                      onChange={(e) => setFormData({ ...formData, cattleId: e.target.value })}
                      className="glass-input text-white placeholder:text-gray-400 border-white/20"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="farmerId" className="text-white">Select Farmer *</Label>
                    <Select 
                      value={formData.farmerId} 
                      onValueChange={handleFarmerSelect}
                    >
                      <SelectTrigger className="glass-input text-white border-white/20 bg-white/10 backdrop-blur-lg">
                        <SelectValue placeholder="Select farmer" />
                      </SelectTrigger>
                      <SelectContent className="bg-white/90 backdrop-blur-lg border-white/20">
                        {farmers.map((farmer) => (
                          <SelectItem key={farmer.id} value={farmer.id}>
                            {farmer.full_name} - {farmer.phone_number}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-white">Cattle Type *</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger className="glass-input text-white border-white/20 bg-white/10 backdrop-blur-lg">
                        <SelectValue placeholder="Select cattle type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white/90 backdrop-blur-lg border-white/20">
                        {cattleTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="breed" className="text-white">Breed *</Label>
                    <Input
                      id="breed"
                      placeholder="e.g., Jersey, Holstein, Murrah"
                      value={formData.breed}
                      onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                      className="glass-input text-white placeholder:text-gray-400 border-white/20"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">Date of Birth</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal glass-input text-white border-white/20 hover:bg-white/20",
                            !formData.dob && "text-gray-400"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.dob ? format(formData.dob, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-white/10 backdrop-blur-lg border-white/20" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.dob}
                          onSelect={(date) => date && setFormData({ ...formData, dob: date })}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="weightKg" className="text-white">Weight (kg) *</Label>
                    <Input
                      id="weightKg"
                      type="number"
                      placeholder="Enter weight in kg"
                      value={formData.weightKg}
                      onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
                      min="1"
                      max="1000"
                      step="0.1"
                      className="glass-input text-white placeholder:text-gray-400 border-white/20"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ownerPhone" className="text-white">Owner Phone</Label>
                    <Input
                      id="ownerPhone"
                      value={formData.ownerPhone}
                      readOnly
                      className="glass-input text-white placeholder:text-gray-400 border-white/20 opacity-70"
                    />
                  </div>
                  
                  <div className="space-y-2 flex items-center space-x-2 pt-6">
                    <Checkbox 
                      id="lactation"
                      checked={formData.lactation}
                      onCheckedChange={(checked) => setFormData({ ...formData, lactation: !!checked })}
                      className="border-white/40"
                    />
                    <Label htmlFor="lactation" className="text-white">Currently Lactating</Label>
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
                    Back to Dashboard
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 glass-button text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Registering...' : 'Register Cattle 🐄'}
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

export default CattleOnboarding;
