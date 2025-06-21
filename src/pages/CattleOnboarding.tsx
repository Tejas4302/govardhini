
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

const CattleOnboarding = () => {
  const [formData, setFormData] = useState({
    cattleId: `CTL${Date.now().toString().slice(-6)}`,
    farmerId: '',
    cattleType: '',
    breed: '',
    age: '',
    dateOfOnboarding: new Date(),
  });
  
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem('govardhini_user') || '{}');

  // Mock farmer data - in real app, this would come from your database
  const farmers = [
    { id: 'FRM001', name: 'Rajesh Kumar' },
    { id: 'FRM002', name: 'Suresh Patel' },
    { id: 'FRM003', name: 'Mahesh Singh' },
    { id: 'FRM004', name: 'Ramesh Yadav' },
  ];

  const getBreedOptions = () => {
    if (formData.cattleType === 'cow') {
      return ['Jersey', 'Holstein', 'Gir', 'Sahiwal'];
    } else if (formData.cattleType === 'buffalo') {
      return ['Murrah', 'Jaffarabadi', 'Mehsana', 'Nili-Ravi'];
    }
    return [];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.farmerId || !formData.cattleType || !formData.breed || !formData.age) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Here you would typically save to your backend/Google Sheets
    console.log('Cattle data:', { ...formData, addedBy: user.name });
    
    toast({
      title: "Success!",
      description: `Cattle ${formData.cattleId} has been registered successfully`,
    });
    
    // Reset form
    setFormData({
      cattleId: `CTL${Date.now().toString().slice(-6)}`,
      farmerId: '',
      cattleType: '',
      breed: '',
      age: '',
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
                      readOnly
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Farmer *</Label>
                    <Select value={formData.farmerId} onValueChange={(value) => setFormData({ ...formData, farmerId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select farmer" />
                      </SelectTrigger>
                      <SelectContent>
                        {farmers.map((farmer) => (
                          <SelectItem key={farmer.id} value={farmer.id}>
                            {farmer.id} - {farmer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Cattle Type *</Label>
                    <Select 
                      value={formData.cattleType} 
                      onValueChange={(value) => setFormData({ ...formData, cattleType: value, breed: '' })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select cattle type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cow">Cow</SelectItem>
                        <SelectItem value="buffalo">Buffalo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Breed *</Label>
                    <Select 
                      value={formData.breed} 
                      onValueChange={(value) => setFormData({ ...formData, breed: value })}
                      disabled={!formData.cattleType}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select breed" />
                      </SelectTrigger>
                      <SelectContent>
                        {getBreedOptions().map((breed) => (
                          <SelectItem key={breed} value={breed.toLowerCase()}>
                            {breed}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Age (years) *</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="Enter age in years"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      min="0"
                      max="20"
                    />
                  </div>
                  
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
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                  >
                    Register Cattle
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
