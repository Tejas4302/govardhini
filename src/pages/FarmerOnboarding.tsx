
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';

const FarmerOnboarding = () => {
  const [formData, setFormData] = useState({
    farmerId: `FRM${Date.now().toString().slice(-6)}`,
    farmerName: '',
    phoneNumber: '',
    village: '',
    dateOfOnboarding: new Date(),
  });
  
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem('govardhini_user') || '{}');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.farmerName || !formData.phoneNumber || !formData.village) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Here you would typically save to your backend/Google Sheets
    console.log('Farmer data:', { ...formData, addedBy: user.name });
    
    toast({
      title: "Success!",
      description: `Farmer ${formData.farmerName} has been registered successfully`,
    });
    
    // Reset form
    setFormData({
      farmerId: `FRM${Date.now().toString().slice(-6)}`,
      farmerName: '',
      phoneNumber: '',
      village: '',
      dateOfOnboarding: new Date(),
    });
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="farmerId">Farmer ID</Label>
                    <Input
                      id="farmerId"
                      value={formData.farmerId}
                      onChange={(e) => setFormData({ ...formData, farmerId: e.target.value })}
                      className="bg-gray-50"
                      readOnly
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="farmerName">Farmer Name *</Label>
                    <Input
                      id="farmerName"
                      placeholder="Enter farmer's full name"
                      value={formData.farmerName}
                      onChange={(e) => setFormData({ ...formData, farmerName: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number *</Label>
                    <Input
                      id="phoneNumber"
                      placeholder="Enter 10-digit phone number"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Village *</Label>
                    <Select value={formData.village} onValueChange={(value) => setFormData({ ...formData, village: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select village" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="village_a">Village A</SelectItem>
                        <SelectItem value="village_b">Village B</SelectItem>
                        <SelectItem value="village_c">Village C</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date of Onboarding</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.dateOfOnboarding && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.dateOfOnboarding ? format(formData.dateOfOnboarding, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.dateOfOnboarding}
                          onSelect={(date) => date && setFormData({ ...formData, dateOfOnboarding: date })}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Added By</Label>
                    <Input value={user.name || 'Current User'} readOnly className="bg-gray-50" />
                  </div>
                </div>
                
                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate('/dashboard')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-green-600 to-amber-600 hover:from-green-700 hover:to-amber-700"
                  >
                    Register Farmer
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
