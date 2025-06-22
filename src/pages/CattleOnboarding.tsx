
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Scale } from 'lucide-react';

interface Farmer {
  id: string;
  full_name: string;
  phone_number: string;
}

const CattleOnboarding = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [cattleData, setCattleData] = useState({
    cattleId: '',
    type: '',
    breed: '',
    dob: '',
    weightKg: '',
    lactation: false,
    farmerName: '',
    farmerId: '',
    ownerPhone: ''
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem('govardhini_user') || '{}');

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
      toast({
        title: "Error",
        description: "Failed to fetch farmers list",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cattleData.cattleId || !cattleData.type || !cattleData.breed || !cattleData.dob || !cattleData.weightKg || !cattleData.farmerName || !cattleData.ownerPhone) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('cattle_profiles')
        .insert({
          cattle_id: cattleData.cattleId,
          type: cattleData.type,
          breed: cattleData.breed,
          dob: cattleData.dob,
          weight_kg: parseFloat(cattleData.weightKg),
          lactation: cattleData.lactation,
          farmer_name: cattleData.farmerName,
          farmer_id: cattleData.farmerId || null,
          owner_phone: cattleData.ownerPhone,
          added_by: user.id
        });

      if (error) throw error;

      toast({
        title: "Cattle Added Successfully",
        description: `${cattleData.cattleId} has been added to the system.`,
      });

      // Reset form
      setCattleData({
        cattleId: '',
        type: '',
        breed: '',
        dob: '',
        weightKg: '',
        lactation: false,
        farmerName: '',
        farmerId: '',
        ownerPhone: ''
      });

    } catch (error) {
      console.error('Error adding cattle:', error);
      toast({
        title: "Error",
        description: "Failed to add cattle to the system",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFarmerSelect = (farmerId: string) => {
    const selectedFarmer = farmers.find(f => f.id === farmerId);
    if (selectedFarmer) {
      setCattleData(prev => ({
        ...prev,
        farmerId: farmerId,
        farmerName: selectedFarmer.full_name,
        ownerPhone: selectedFarmer.phone_number
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-emerald-900">
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
          {/* Back Button and Header */}
          <div className="flex items-center mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="mr-4 text-emerald-300 hover:text-emerald-100 hover:bg-emerald-500/20"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-4xl font-bold text-white animate-fade-in">Add Cattle</h1>
          </div>
          
          <Card className="glass-card border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-green-500/5 animate-fade-in">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white flex items-center">
                <span className="text-3xl mr-3">🐄</span>
                Register New Cattle
              </CardTitle>
              <CardDescription className="text-emerald-300">Add a new cattle to the management system</CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="cattleId" className="text-emerald-200">Cattle ID *</Label>
                    <Input
                      id="cattleId"
                      placeholder="Enter unique cattle ID"
                      value={cattleData.cattleId}
                      onChange={(e) => setCattleData(prev => ({ ...prev, cattleId: e.target.value }))}
                      className="glass-input border-emerald-500/30 text-white placeholder:text-emerald-300"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-emerald-200">Cattle Type *</Label>
                    <Select value={cattleData.type} onValueChange={(value) => setCattleData(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger className="glass-input border-emerald-500/30 text-white">
                        <SelectValue placeholder="Select cattle type" />
                      </SelectTrigger>
                      <SelectContent className="glass-card border-emerald-500/30 bg-slate-800/90 backdrop-blur-xl">
                        <SelectItem value="Cow" className="text-white hover:bg-emerald-500/20">Cow</SelectItem>
                        <SelectItem value="Bull" className="text-white hover:bg-emerald-500/20">Bull</SelectItem>
                        <SelectItem value="Calf" className="text-white hover:bg-emerald-500/20">Calf</SelectItem>
                        <SelectItem value="Heifer" className="text-white hover:bg-emerald-500/20">Heifer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="breed" className="text-emerald-200">Breed *</Label>
                    <Input
                      id="breed"
                      placeholder="Enter cattle breed"
                      value={cattleData.breed}
                      onChange={(e) => setCattleData(prev => ({ ...prev, breed: e.target.value }))}
                      className="glass-input border-emerald-500/30 text-white placeholder:text-emerald-300"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dob" className="text-emerald-200 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Date of Birth *
                    </Label>
                    <Input
                      id="dob"
                      type="date"
                      value={cattleData.dob}
                      onChange={(e) => setCattleData(prev => ({ ...prev, dob: e.target.value }))}
                      className="glass-input border-emerald-500/30 text-white"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight" className="text-emerald-200 flex items-center gap-2">
                      <Scale className="w-4 h-4" />
                      Weight (kg) *
                    </Label>
                    <Input
                      id="weight"
                      type="number"
                      placeholder="Enter weight in kg"
                      value={cattleData.weightKg}
                      onChange={(e) => setCattleData(prev => ({ ...prev, weightKg: e.target.value }))}
                      className="glass-input border-emerald-500/30 text-white placeholder:text-emerald-300"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="farmer" className="text-emerald-200">Owner/Farmer *</Label>
                    <Select value={cattleData.farmerId} onValueChange={handleFarmerSelect}>
                      <SelectTrigger className="glass-input border-emerald-500/30 text-white">
                        <SelectValue placeholder="Select farmer" />
                      </SelectTrigger>
                      <SelectContent className="glass-card border-emerald-500/30 bg-slate-800/90 backdrop-blur-xl">
                        {farmers.map((farmer) => (
                          <SelectItem key={farmer.id} value={farmer.id} className="text-white hover:bg-emerald-500/20">
                            {farmer.full_name} ({farmer.phone_number})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 glass-card border-emerald-500/20 rounded-lg">
                  <Switch
                    id="lactation"
                    checked={cattleData.lactation}
                    onCheckedChange={(checked) => setCattleData(prev => ({ ...prev, lactation: checked }))}
                    className="data-[state=checked]:bg-emerald-600"
                  />
                  <Label htmlFor="lactation" className="text-emerald-200 flex items-center gap-2">
                    <span className="text-xl">🥛</span>
                    Currently Lactating
                  </Label>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold py-3"
                >
                  {isLoading ? 'Adding Cattle...' : 'Add Cattle to System'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CattleOnboarding;
