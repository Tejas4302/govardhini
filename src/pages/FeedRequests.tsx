import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const FeedRequests = () => {
  const [formData, setFormData] = useState({
    cattleId: '',
    feedType: '',
    quantityKg: '',
    farmerPhone: '',
    date: new Date().toISOString().split('T')[0]
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [cattleList, setCattleList] = useState([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem('govardhini_user') || '{}');

  useEffect(() => {
    fetchCattleList();
  }, []);

  const fetchCattleList = async () => {
    try {
      const { data, error } = await supabase
        .from('cattle_profiles')
        .select('cattle_id, farmer_name, owner_phone');
      
      if (error) throw error;
      setCattleList(data || []);
    } catch (error) {
      console.error('Error fetching cattle:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.cattleId || !formData.feedType || !formData.quantityKg || !formData.farmerPhone) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.from('feed_requests').insert({
        cattle_id: formData.cattleId,
        feed_type: formData.feedType,
        quantity_kg: parseInt(formData.quantityKg),
        farmer_phone: formData.farmerPhone,
        date: formData.date,
        requested_by: user.id || 'offline-user'
      });

      if (error) throw error;

      toast({
        title: "Success! ✅",
        description: "Feed request submitted successfully.",
      });

      setFormData({
        cattleId: '',
        feedType: '',
        quantityKg: '',
        farmerPhone: '',
        date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to submit feed request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
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
          <div className="absolute top-1/4 left-1/4 w-48 h-48 md:w-96 md:h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-48 h-48 md:w-96 md:h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-48 h-48 md:w-96 md:h-96 bg-green-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
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
            <h1 className="text-4xl font-bold text-white animate-fade-in">Feed Requests</h1>
          </div>

          <Card className="agricultural-glass border-emerald-500/20 backdrop-blur-md animate-fade-in">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-white">Submit Feed Request</CardTitle>
              <CardDescription className="text-emerald-300">Request feed for cattle</CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="cattleId" className="text-emerald-200">Cattle ID *</Label>
                  <Select value={formData.cattleId} onValueChange={(value) => handleInputChange('cattleId', value)}>
                    <SelectTrigger className="glass-input border-emerald-500/30 text-white">
                      <SelectValue placeholder="Select cattle ID" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-emerald-500/30">
                      {cattleList.map(cattle => (
                        <SelectItem key={cattle.cattle_id} value={cattle.cattle_id} className="text-white hover:bg-emerald-600/20">
                          {cattle.cattle_id} - {cattle.farmer_name} ({cattle.owner_phone})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="feedType" className="text-emerald-200">Feed Type *</Label>
                  <Input
                    id="feedType"
                    placeholder="Enter feed type"
                    value={formData.feedType}
                    onChange={(e) => handleInputChange('feedType', e.target.value)}
                    className="glass-input border-emerald-500/30 text-white placeholder:text-emerald-300/70"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantityKg" className="text-emerald-200">Quantity (KG) *</Label>
                  <Input
                    id="quantityKg"
                    type="number"
                    placeholder="Enter quantity in kilograms"
                    value={formData.quantityKg}
                    onChange={(e) => handleInputChange('quantityKg', e.target.value)}
                    className="glass-input border-emerald-500/30 text-white placeholder:text-emerald-300/70"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="farmerPhone" className="text-emerald-200">Farmer Phone *</Label>
                  <Input
                    id="farmerPhone"
                    type="tel"
                    placeholder="Enter farmer's phone number"
                    value={formData.farmerPhone}
                    onChange={(e) => handleInputChange('farmerPhone', e.target.value)}
                    className="glass-input border-emerald-500/30 text-white placeholder:text-emerald-300/70"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date" className="text-emerald-200">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="glass-input border-emerald-500/30 text-white placeholder:text-emerald-300/70"
                  />
                </div>
                
                <div className="flex gap-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 border-emerald-400/30 text-emerald-200 hover:bg-emerald-500/20 hover:border-emerald-400"
                    onClick={() => navigate('/dashboard')}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Submitting...' : 'Submit Request 🌾'}
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

export default FeedRequests;
