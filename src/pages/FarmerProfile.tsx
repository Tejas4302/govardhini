
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, ArrowLeft } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

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
  const [isDeleting, setIsDeleting] = useState(false);
  const [updatingCattleId, setUpdatingCattleId] = useState<string | null>(null);
  const { toast } = useToast();
  
  const user = JSON.parse(localStorage.getItem('govardhini_user') || '{}');
  
  // Debug logging for user designation
  console.log('User object:', user);
  console.log('User designation:', user.designation);
  console.log('User designation type:', typeof user.designation);
  console.log('User designation value:', user.designation?.value);
  console.log('User role:', user.role);
  
  // Fixed admin check to handle object structure and also check user.role
  const isAdmin = user.designation?.value?.toLowerCase() === 'admin' || 
                  user.designation?.value?.toLowerCase() === 'office_staff' ||
                  user.role?.toLowerCase() === 'admin' ||
                  user.designation?.toLowerCase() === 'admin' ||
                  user.designation?.toLowerCase() === 'office_staff';
  
  console.log('Is Admin:', isAdmin);

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

      // Fetch farmer's cattle using both farmer_id and owner_phone for better coverage
      const { data: cattleData, error: cattleError } = await supabase
        .from('cattle_profiles')
        .select('*')
        .or(`farmer_id.eq.${farmerId},owner_phone.eq.${farmerData.phone_number}`);

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

  const handleDeleteFarmer = async () => {
    if (!farmerId || !farmer) return;
    
    setIsDeleting(true);
    try {
      console.log('Starting farmer deletion process...');
      console.log('Farmer ID:', farmerId);
      console.log('Farmer Phone:', farmer.phone_number);
      console.log('Cattle to delete:', cattle.length);

      // Get all cattle IDs using both farmer_id and owner_phone
      const { data: allCattleData, error: cattleError } = await supabase
        .from('cattle_profiles')
        .select('cattle_id, id')
        .or(`farmer_id.eq.${farmerId},owner_phone.eq.${farmer.phone_number}`);

      if (cattleError) {
        console.error('Error fetching cattle for deletion:', cattleError);
        throw cattleError;
      }

      const cattleIds = allCattleData?.map(c => c.cattle_id) || [];
      console.log('All cattle IDs to delete:', cattleIds);

      if (cattleIds.length > 0) {
        // Delete related records first (cascade deletion)
        console.log('Deleting milk production records...');
        const { error: milkError } = await supabase
          .from('milk_production')
          .delete()
          .in('cattle_id', cattleIds);
        if (milkError) console.error('Milk deletion error:', milkError);

        console.log('Deleting health checkup records...');
        const { error: healthError } = await supabase
          .from('health_checkups')
          .delete()
          .in('cattle_id', cattleIds);
        if (healthError) console.error('Health deletion error:', healthError);

        console.log('Deleting feed request records...');
        const { error: feedError } = await supabase
          .from('feed_requests')
          .delete()
          .in('cattle_id', cattleIds);
        if (feedError) console.error('Feed deletion error:', feedError);

        // Delete cattle profiles using both conditions to ensure complete cleanup
        console.log('Deleting cattle profiles...');
        const { error: cattleDeleteError } = await supabase
          .from('cattle_profiles')
          .delete()
          .or(`farmer_id.eq.${farmerId},owner_phone.eq.${farmer.phone_number}`);
        
        if (cattleDeleteError) {
          console.error('Cattle deletion error:', cattleDeleteError);
          throw cattleDeleteError;
        }
      }

      // Delete SMS notifications
      console.log('Deleting SMS notifications...');
      const { error: smsError } = await supabase
        .from('sms_notifications')
        .delete()
        .eq('farmer_id', farmerId);
      if (smsError) console.error('SMS deletion error:', smsError);

      // Finally delete the farmer
      console.log('Deleting farmer record...');
      const { error: farmerError } = await supabase
        .from('farmers')
        .delete()
        .eq('id', farmerId);

      if (farmerError) {
        console.error('Farmer deletion error:', farmerError);
        throw farmerError;
      }

      console.log('Farmer deletion completed successfully');
      toast({
        title: "Success",
        description: `${farmer.full_name} and all ${cattleIds.length} associated cattle records have been deleted successfully`,
      });

      navigate('/farmers');
    } catch (error) {
      console.error('Error during farmer deletion:', error);
      toast({
        title: "Error",
        description: "Failed to delete farmer and associated records",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLactationToggle = async (cattleId: string, currentStatus: boolean) => {
    setUpdatingCattleId(cattleId);
    try {
      const { error } = await supabase
        .from('cattle_profiles')
        .update({ lactation: !currentStatus })
        .eq('cattle_id', cattleId);

      if (error) throw error;

      // Update local state
      setCattle(prevCattle => 
        prevCattle.map(animal => 
          animal.cattle_id === cattleId 
            ? { ...animal, lactation: !currentStatus }
            : animal
        )
      );

      toast({
        title: "Success",
        description: `Cattle lactation status updated to ${!currentStatus ? 'Lactating' : 'Dry'}`,
      });

    } catch (error) {
      console.error('Error updating lactation status:', error);
      toast({
        title: "Error",
        description: "Failed to update lactation status",
        variant: "destructive"
      });
    } finally {
      setUpdatingCattleId(null);
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
          {/* Back Button */}
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="mb-4 glass-input text-white border-white/20 hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

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
                  {isAdmin && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Farmer
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="glass-card border-red-500/20">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-white">Delete Farmer</AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-300">
                            This will permanently delete {farmer.full_name} and all associated records including:
                            <br />• {cattle.length} cattle profiles
                            <br />• All milk production records
                            <br />• All health checkup records
                            <br />• All feed requests
                            <br />• All SMS notifications
                            <br /><br />
                            This action cannot be undone. Are you sure you want to proceed?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="glass-button">Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteFarmer}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {isDeleting ? 'Deleting...' : 'Delete Permanently'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
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
                        <div className="flex items-center gap-2">
                          <Badge className={animal.lactation ? "bg-blue-500" : "bg-gray-500"}>
                            {animal.lactation ? "Lactating" : "Dry"}
                          </Badge>
                        </div>
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
                      
                      {/* Lactation Status Toggle */}
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-gray-300">Lactation Status:</span>
                        <Switch
                          checked={animal.lactation}
                          onCheckedChange={() => handleLactationToggle(animal.cattle_id, animal.lactation)}
                          disabled={updatingCattleId === animal.cattle_id}
                        />
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
