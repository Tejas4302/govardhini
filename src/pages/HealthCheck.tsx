
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
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

const HealthCheck = () => {
  const [formData, setFormData] = useState({
    entryId: `HC${Date.now().toString().slice(-6)}`,
    cattleId: '',
    checkDate: new Date(),
    bodyTemperature: '',
    healthIssue: '',
    issueType: '',
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
    
    if (!formData.cattleId || !formData.bodyTemperature) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const healthCheckData = {
        entry_id: formData.entryId,
        cattle_id: formData.cattleId,
        check_date: format(formData.checkDate, 'yyyy-MM-dd'),
        body_temperature: parseFloat(formData.bodyTemperature),
        health_issue: formData.healthIssue || null,
        issue_type: formData.issueType || null,
        reported_by: user.name || 'Current User',
        alert_sent: parseFloat(formData.bodyTemperature) > 39.5 || formData.healthIssue !== ''
      };

      const { error } = await supabase
        .from('health_checks')
        .insert(healthCheckData);

      if (error) {
        console.error('Error saving health check:', error);
        toast({
          title: "Error",
          description: "Failed to save health check. Please try again.",
          variant: "destructive"
        });
        return;
      }

      // Show alert if health issue detected
      if (healthCheckData.alert_sent) {
        toast({
          title: "Health Alert!",
          description: "Health issue detected - alert has been recorded",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success!",
          description: "Health check recorded successfully",
        });
      }
      
      // Reset form
      setFormData({
        entryId: `HC${Date.now().toString().slice(-6)}`,
        cattleId: '',
        checkDate: new Date(),
        bodyTemperature: '',
        healthIssue: '',
        issueType: '',
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
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-600 to-pink-600 rounded-full flex items-center justify-center mb-4">
                <span className="text-white text-3xl">❤️</span>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800">Health Check</CardTitle>
              <CardDescription>Record cattle health monitoring</CardDescription>
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
                    <Label>Check Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.checkDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.checkDate ? format(formData.checkDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.checkDate}
                          onSelect={(date) => date && setFormData({ ...formData, checkDate: date })}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bodyTemperature">Body Temperature (°C) *</Label>
                    <Input
                      id="bodyTemperature"
                      type="number"
                      step="0.1"
                      placeholder="Enter temperature"
                      value={formData.bodyTemperature}
                      onChange={(e) => setFormData({ ...formData, bodyTemperature: e.target.value })}
                      min="35"
                      max="45"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Issue Type (if any)</Label>
                  <Select 
                    value={formData.issueType} 
                    onValueChange={(value) => setFormData({ ...formData, issueType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select issue type (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No Issues</SelectItem>
                      <SelectItem value="respiratory">Respiratory</SelectItem>
                      <SelectItem value="digestive">Digestive</SelectItem>
                      <SelectItem value="injury">Injury</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="healthIssue">Health Issue Description</Label>
                  <Textarea
                    id="healthIssue"
                    placeholder="Describe any health issues observed (optional)"
                    value={formData.healthIssue}
                    onChange={(e) => setFormData({ ...formData, healthIssue: e.target.value })}
                    className="min-h-20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Reported By</Label>
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
                    className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Record Health Check'}
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

export default HealthCheck;
