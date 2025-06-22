
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';

const MilkLogging = () => {
  const [formData, setFormData] = useState({
    entryId: `MP${Date.now().toString().slice(-6)}`,
    cattleId: '',
    productionDate: new Date(),
    quantityLitres: '',
    shift: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem('govardhini_user') || '{}');

  const saveOffline = (data: any) => {
    const offlineData = JSON.parse(localStorage.getItem('offline_milk') || '[]');
    offlineData.push({ ...data, id: Date.now().toString(), synced: false });
    localStorage.setItem('offline_milk', JSON.stringify(offlineData));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.cattleId || !formData.quantityLitres) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (parseFloat(formData.quantityLitres) < 0) {
      toast({
        title: "Error",
        description: "Milk production cannot be negative",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.from('milk_production').insert({
        cattle_id: formData.cattleId,
        date: format(formData.productionDate, 'yyyy-MM-dd'),
        quantity_litres: parseFloat(formData.quantityLitres),
        shift: formData.shift || null,
        recorded_by: user.id || 'offline-user'
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
          description: `Milk production of ${formData.quantityLitres}L recorded successfully`,
        });
      }
      
      // Reset form
      setFormData({
        entryId: `MP${Date.now().toString().slice(-6)}`,
        cattleId: '',
        productionDate: new Date(),
        quantityLitres: '',
        shift: '',
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
                    <Label htmlFor="cattleId">Cattle ID *</Label>
                    <Input
                      id="cattleId"
                      placeholder="Enter cattle ID"
                      value={formData.cattleId}
                      onChange={(e) => setFormData({ ...formData, cattleId: e.target.value })}
                    />
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
                    <Label htmlFor="quantityLitres">Milk Produced (Liters) *</Label>
                    <Input
                      id="quantityLitres"
                      type="number"
                      step="0.1"
                      placeholder="Enter milk production"
                      value={formData.quantityLitres}
                      onChange={(e) => setFormData({ ...formData, quantityLitres: e.target.value })}
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="shift">Shift (Optional)</Label>
                  <Input
                    id="shift"
                    placeholder="e.g., Morning, Evening"
                    value={formData.shift}
                    onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                  />
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
                    {isLoading ? 'Logging...' : 'Log Milk Production 🥛'}
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
