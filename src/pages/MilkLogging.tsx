
import React, { useState, useEffect } from 'react';
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
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';

interface Cattle {
  cattle_id: string;
  farmer_id: string;
  cattle_type: string;
  breed: string;
  farmers: {
    farmer_name: string;
  };
}

const MilkLogging = () => {
  const [formData, setFormData] = useState({
    entryId: `MP${Date.now().toString().slice(-6)}`,
    cattleId: '',
    productionDate: new Date(),
    milkProduced: '',
  });
  
  const [cattle, setCattle] = useState<Cattle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingCattle, setLoadingCattle] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem('govardhini_user') || '{}');

  useEffect(() => {
    fetchCattle();
  }, []);

  const fetchCattle = async () => {
    try {
      const { data, error } = await supabase
        .from('cattle')
        .select(`
          cattle_id,
          farmer_id,
          cattle_type,
          breed,
          farmers (
            farmer_name
          )
        `)
        .order('cattle_id');

      if (error) {
        console.error('Error fetching cattle:', error);
        toast({
          title: "Error",
          description: "Failed to load cattle list",
          variant: "destructive"
        });
        return;
      }

      setCattle(data || []);
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoadingCattle(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.cattleId || !formData.milkProduced) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (parseFloat(formData.milkProduced) < 0) {
      toast({
        title: "Error",
        description: "Milk production cannot be negative",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('milk_production')
        .insert({
          entry_id: formData.entryId,
          cattle_id: formData.cattleId,
          production_date: format(formData.productionDate, 'yyyy-MM-dd'),
          milk_produced: parseFloat(formData.milkProduced),
          recorded_by: user.name || 'Current User'
        });

      if (error) {
        console.error('Error saving milk production:', error);
        toast({
          title: "Error",
          description: "Failed to log milk production. Please try again.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success!",
        description: `Milk production of ${formData.milkProduced}L recorded successfully`,
      });
      
      // Reset form
      setFormData({
        entryId: `MP${Date.now().toString().slice(-6)}`,
        cattleId: '',
        productionDate: new Date(),
        milkProduced: '',
      });

    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
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
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center mb-4">
                <span className="text-white text-3xl">🥛</span>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800">Milk Production Logging</CardTitle>
              <CardDescription>Record daily milk production</CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="entryId">Entry ID</Label>
                    <Input
                      id="entryId"
                      value={formData.entryId}
                      className="bg-gray-50"
                      readOnly
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Cattle *</Label>
                    <Select 
                      value={formData.cattleId} 
                      onValueChange={(value) => setFormData({ ...formData, cattleId: value })}
                      disabled={loadingCattle}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={loadingCattle ? "Loading cattle..." : "Select cattle"} />
                      </SelectTrigger>
                      <SelectContent>
                        {cattle.map((animal) => (
                          <SelectItem key={animal.cattle_id} value={animal.cattle_id}>
                            {animal.cattle_id} - {animal.farmers?.farmer_name} ({animal.cattle_type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Production Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.productionDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.productionDate ? format(formData.productionDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.productionDate}
                          onSelect={(date) => date && setFormData({ ...formData, productionDate: date })}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="milkProduced">Milk Produced (Liters) *</Label>
                    <Input
                      id="milkProduced"
                      type="number"
                      step="0.1"
                      placeholder="Enter milk production"
                      value={formData.milkProduced}
                      onChange={(e) => setFormData({ ...formData, milkProduced: e.target.value })}
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Recorded By</Label>
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
                    className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Logging...' : 'Log Milk Production'}
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

export default MilkLogging;
