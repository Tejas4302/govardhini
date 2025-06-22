
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';

const CattleOnboarding = () => {
  const [formData, setFormData] = useState({
    cattleId: `CTL${Date.now().toString().slice(-6)}`,
    farmerName: '',
    breed: '',
    type: '',
    dob: new Date(),
    lactation: false,
    weightKg: '',
    ownerPhone: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem('govardhini_user') || '{}');

  const saveOffline = (data: any) => {
    const offlineData = JSON.parse(localStorage.getItem('offline_cattle') || '[]');
    offlineData.push({ ...data, id: Date.now().toString(), synced: false });
    localStorage.setItem('offline_cattle', JSON.stringify(offlineData));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.farmerName || !formData.breed || !formData.type || !formData.weightKg || !formData.ownerPhone) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.from('cattle_profiles').insert({
        cattle_id: formData.cattleId,
        farmer_name: formData.farmerName,
        breed: formData.breed,
        type: formData.type,
        dob: format(formData.dob, 'yyyy-MM-dd'),
        lactation: formData.lactation,
        weight_kg: parseFloat(formData.weightKg),
        owner_phone: formData.ownerPhone,
        added_by: user.id || 'offline-user'
      });

      if (error) {
        saveOffline(formData);
        toast({
          title: "Saved Offline 📱",
          description: "No internet connection. Data saved locally and will sync when online.",
          variant: "default"
        });
      } else {
        toast({
          title: "Success! ✅",
          description: `Cattle ${formData.cattleId} has been registered successfully`,
        });
      }
      
      // Reset form
      setFormData({
        cattleId: `CTL${Date.now().toString().slice(-6)}`,
        farmerName: '',
        breed: '',
        type: '',
        dob: new Date(),
        lactation: false,
        weightKg: '',
        ownerPhone: '',
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
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-600 to-orange-600 rounded-full flex items-center justify-center mb-4">
                <span className="text-white text-3xl">🐄</span>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800">Cattle Registration</CardTitle>
              <CardDescription>Add new cattle to the system</CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cattleId">Cattle ID</Label>
                    <Input
                      id="cattleId"
                      value={formData.cattleId}
                      onChange={(e) => setFormData({ ...formData, cattleId: e.target.value })}
                      className="bg-gray-50"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="farmerName">Farmer Name *</Label>
                    <Input
                      id="farmerName"
                      placeholder="Enter farmer's name"
                      value={formData.farmerName}
                      onChange={(e) => setFormData({ ...formData, farmerName: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Cattle Type *</Label>
                    <Input
                      id="type"
                      placeholder="e.g., Cow, Buffalo"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="breed">Breed *</Label>
                    <Input
                      id="breed"
                      placeholder="e.g., Jersey, Holstein, Murrah"
                      value={formData.breed}
                      onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date of Birth</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.dob && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.dob ? format(formData.dob, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
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
                    <Label htmlFor="weightKg">Weight (kg) *</Label>
                    <Input
                      id="weightKg"
                      type="number"
                      placeholder="Enter weight in kg"
                      value={formData.weightKg}
                      onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
                      min="50"
                      max="1000"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ownerPhone">Owner Phone *</Label>
                    <Input
                      id="ownerPhone"
                      placeholder="Enter owner's phone number"
                      value={formData.ownerPhone}
                      onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2 flex items-center space-x-2 pt-6">
                    <Checkbox 
                      id="lactation"
                      checked={formData.lactation}
                      onCheckedChange={(checked) => setFormData({ ...formData, lactation: !!checked })}
                    />
                    <Label htmlFor="lactation">Currently Lactating</Label>
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
                    className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
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
