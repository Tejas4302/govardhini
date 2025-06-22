
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Farmer {
  id: string;
  full_name: string;
  phone_number: string;
  state: string;
  district: string;
  taluk: string;
  town_or_village: string;
  pincode: string;
}

interface Cattle {
  id: string;
  cattle_id: string;
  breed: string;
  type: string;
  dob: string;
  lactation: boolean;
  weight_kg: number;
}

const FarmerProfile = () => {
  const { farmerId } = useParams();
  const navigate = useNavigate();
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [cattle, setCattle] = useState<Cattle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  const user = JSON.parse(localStorage.getItem('govardhini_user') || '{}');

  useEffect(() => {
    if (farmerId) {
      fetchFarmerData();
    }
  }, [farmerId]);

  const fetchFarmerData = async () => {
    try {
      // Fetch farmer details
      const { data: farmerData, error: farmerError } = await supabase
        .from('farmers')
        .select('*')
        .eq('id', farmerId)
        .single();

      if (farmerError) throw farmerError;
      setFarmer(farmerData);

      // Fetch farmer's cattle
      const { data: cattleData, error: cattleError } = await supabase
        .from('cattle_profiles')
        .select('*')
        .eq('farmer_id', farmerId);

      if (cattleError) throw cattleError;
      setCattle(cattleData || []);

    } catch (error) {
      console.error('Error fetching farmer data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch farmer data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: string, cattleId?: string) => {
    const params = new URLSearchParams({
      farmerId: farmerId!,
      farmerName: farmer?.full_name || '',
      farmerPhone: farmer?.phone_number || ''
    });
    
    if (cattleId) {
      params.append('cattleId', cattleId);
    }

    switch (action) {
      case 'addCattle':
        navigate(`/cattle-onboarding?${params.toString()}`);
        break;
      case 'healthCheck':
        navigate(`/health-check?${params.toString()}`);
        break;
      case 'milkLogging':
        navigate(`/milk-logging?${params.toString()}`);
        break;
      case 'feedRequest':
        navigate(`/feed-requests?${params.toString()}`);
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navigation user={user} />
        <div className="flex items-center justify-center h-96">
          <div className="text-white text-xl">Loading farmer profile...</div>
        </div>
      </div>
    );
  }

  if (!farmer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navigation user={user} />
        <div className="flex items-center justify-center h-96">
          <div className="text-white text-xl">Farmer not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation user={user} />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Farmer Info Header */}
          <Card className="glass-card border-0 mb-6">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl font-bold text-white">{farmer.full_name}</CardTitle>
                  <CardDescription className="text-gray-300">
                    📱 {farmer.phone_number} | 📍 {farmer.town_or_village}, {farmer.taluk}, {farmer.district}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleQuickAction('addCattle')}
                    className="bg-gradient-to-r from-green-500 to-emerald-600"
                  >
                    Add Cattle 🐄
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Tabs defaultValue="cattle" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 glass-card">
              <TabsTrigger value="cattle" className="text-white">Cattle ({cattle.length})</TabsTrigger>
              <TabsTrigger value="health" className="text-white">Health Records</TabsTrigger>
              <TabsTrigger value="milk" className="text-white">Milk Production</TabsTrigger>
              <TabsTrigger value="feed" className="text-white">Feed Requests</TabsTrigger>
            </TabsList>

            <TabsContent value="cattle">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cattle.map((animal) => (
                  <Card key={animal.id} className="glass-card border-0">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg text-white">{animal.cattle_id}</CardTitle>
                        <Badge className={animal.lactation ? "bg-blue-500" : "bg-gray-500"}>
                          {animal.lactation ? "Lactating" : "Dry"}
                        </Badge>
                      </div>
                      <CardDescription className="text-gray-300">
                        {animal.type} • {animal.breed}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-sm text-gray-300">
                        <p>Weight: {animal.weight_kg} kg</p>
                        <p>DOB: {new Date(animal.dob).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleQuickAction('healthCheck', animal.cattle_id)}
                          className="flex-1 bg-red-500 hover:bg-red-600"
                        >
                          ❤️ Health
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleQuickAction('milkLogging', animal.cattle_id)}
                          className="flex-1 bg-blue-500 hover:bg-blue-600"
                        >
                          🥛 Milk
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {cattle.length === 0 && (
                  <Card className="glass-card border-0 col-span-full">
                    <CardContent className="text-center py-8">
                      <p className="text-gray-300 mb-4">No cattle registered for this farmer</p>
                      <Button
                        onClick={() => handleQuickAction('addCattle')}
                        className="bg-gradient-to-r from-green-500 to-emerald-600"
                      >
                        Add First Cattle 🐄
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="health">
              <Card className="glass-card border-0">
                <CardContent className="p-6">
                  <p className="text-gray-300 text-center">Health records will be displayed here</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="milk">
              <Card className="glass-card border-0">
                <CardContent className="p-6">
                  <p className="text-gray-300 text-center">Milk production records will be displayed here</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="feed">
              <Card className="glass-card border-0">
                <CardContent className="p-6">
                  <p className="text-gray-300 text-center">Feed requests will be displayed here</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default FarmerProfile;
