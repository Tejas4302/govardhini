
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
import { ArrowLeft, Calendar } from 'lucide-react';

interface Cattle {
  cattle_id: string;
  farmer_name: string;
  breed: string;
  lactation: boolean;
}

const MilkLogging = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [cattle, setCattle] = useState<Cattle[]>([]);
  const [milkData, setMilkData] = useState({
    cattleId: '',
    date: new Date().toISOString().split('T')[0],
    quantityLitres: '',
    shift: ''
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem('govardhini_user') || '{}');

  useEffect(() => {
    fetchLactatingCattle();
  }, []);

  const fetchLactatingCattle = async () => {
    try {
      const { data, error } = await supabase
        .from('cattle_profiles')
        .select('cattle_id, farmer_name, breed, lactation')
        .eq('lactation', true)
        .order('farmer_name');

      if (error) throw error;
      setCattle(data || []);
    } catch (error) {
      console.error('Error fetching cattle:', error);
      toast({
        title: "Error",
        description: "Failed to fetch lactating cattle",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!milkData.cattleId || !milkData.quantityLitres || !milkData.date) {
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
        .from('milk_production')
        .insert({
          cattle_id: milkData.cattleId,
          date: milkData.date,
          quantity_litres: parseFloat(milkData.quantityLitres),
          shift: milkData.shift || null,
          recorded_by: user.id
        });

      if (error) throw error;

      toast({
        title: "Milk Production Recorded",
        description: `${milkData.quantityLitres}L milk production has been logged.`,
      });

      // Reset form
      setMilkData({
        cattleId: '',
        date: new Date().toISOString().split('T')[0],
        quantityLitres: '',
        shift: ''
      });

    } catch (error) {
      console.error('Error recording milk production:', error);
      toast({
        title: "Error",
        description: "Failed to record milk production",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
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
            <h1 className="text-4xl font-bold text-white animate-fade-in">Milk Logging</h1>
          </div>
          
          <Card className="glass-card border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-green-500/5 animate-fade-in">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white flex items-center">
                <span className="text-3xl mr-3">🥛</span>
                Record Milk Production
              </CardTitle>
              <CardDescription className="text-emerald-300">Log daily milk production for lactating cattle</CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="cattle" className="text-emerald-200 flex items-center gap-2">
                    <span className="text-2xl">🐄</span>
                    Select Lactating Cattle *
                  </Label>
                  <Select value={milkData.cattleId} onValueChange={(value) => setMilkData(prev => ({ ...prev, cattleId: value }))}>
                    <SelectTrigger className="glass-input border-emerald-500/30 text-white">
                      <SelectValue placeholder="Choose lactating cattle" />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-emerald-500/30 bg-slate-800/90 backdrop-blur-xl">
                      {cattle.map((animal) => (
                        <SelectItem key={animal.cattle_id} value={animal.cattle_id} className="text-white hover:bg-emerald-500/20">
                          {animal.cattle_id} - {animal.farmer_name} ({animal.breed})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {cattle.length === 0 && (
                    <p className="text-emerald-400 text-sm">No lactating cattle found. Please ensure cattle are marked as lactating in their profile.</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-emerald-200 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Production Date *
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={milkData.date}
                      onChange={(e) => setMilkData(prev => ({ ...prev, date: e.target.value }))}
                      className="glass-input border-emerald-500/30 text-white"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity" className="text-emerald-200 flex items-center gap-2">
                      <span className="text-xl">🥛</span>
                      Quantity (Litres) *
                    </Label>
                    <Input
                      id="quantity"
                      type="number"
                      step="0.1"
                      placeholder="Enter milk quantity"
                      value={milkData.quantityLitres}
                      onChange={(e) => setMilkData(prev => ({ ...prev, quantityLitres: e.target.value }))}
                      className="glass-input border-emerald-500/30 text-white placeholder:text-emerald-300"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shift" className="text-emerald-200">Milking Shift (Optional)</Label>
                  <Select value={milkData.shift} onValueChange={(value) => setMilkData(prev => ({ ...prev, shift: value }))}>
                    <SelectTrigger className="glass-input border-emerald-500/30 text-white">
                      <SelectValue placeholder="Select milking shift (optional)" />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-emerald-500/30 bg-slate-800/90 backdrop-blur-xl">
                      <SelectItem value="Morning" className="text-white hover:bg-emerald-500/20">Morning</SelectItem>
                      <SelectItem value="Evening" className="text-white hover:bg-emerald-500/20">Evening</SelectItem>
                      <SelectItem value="Night" className="text-white hover:bg-emerald-500/20">Night</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || cattle.length === 0}
                  className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold py-3"
                >
                  {isLoading ? 'Recording...' : 'Record Milk Production'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MilkLogging;
