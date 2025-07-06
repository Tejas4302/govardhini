import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { CalendarIcon, Plus, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import { useKeyboard } from '@/hooks/useKeyboard';

interface FeedRequest {
  id: string;
  cattle_id: string;
  farmer_phone: string;
  date: string;
  feed_type: string;
  quantity_kg: number;
  status: string;
  requested_by: string;
  created_at: string;
}

const FeedRequests = () => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    requestId: `FR${Date.now().toString().slice(-6)}`,
    cattleId: '',
    farmerPhone: '',
    requestDate: new Date(),
    feedType: '',
    quantityKg: '',
  });
  
  const [requests, setRequests] = useState<FeedRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isKeyboardVisible } = useKeyboard();
  
  const user = JSON.parse(localStorage.getItem('govardhini_user') || '{}');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data: requestsData, error: requestsError } = await supabase
        .from('feed_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (requestsError) {
        console.error('Error fetching requests:', requestsError);
        toast({
          title: "Error",
          description: "Failed to load feed requests",
          variant: "destructive"
        });
      } else {
        setRequests(requestsData || []);
      }

    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const saveOffline = (data: any) => {
    const offlineData = JSON.parse(localStorage.getItem('offline_feed') || '[]');
    offlineData.push({ ...data, id: Date.now().toString(), synced: false });
    localStorage.setItem('offline_feed', JSON.stringify(offlineData));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.cattleId || !formData.farmerPhone || !formData.feedType || !formData.quantityKg) {
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
        farmer_phone: formData.farmerPhone,
        date: format(formData.requestDate, 'yyyy-MM-dd'),
        feed_type: formData.feedType,
        quantity_kg: parseFloat(formData.quantityKg),
        requested_by: user.id || 'offline-user'
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
          description: "Feed request created successfully",
        });
        
        fetchRequests();
      }
      
      // Reset form
      setFormData({
        requestId: `FR${Date.now().toString().slice(-6)}`,
        cattleId: '',
        farmerPhone: '',
        requestDate: new Date(),
        feedType: '',
        quantityKg: '',
      });
      setShowForm(false);

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

  const updateRequestStatus = async (requestId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('feed_requests')
        .update({ status: newStatus })
        .eq('id', requestId);

      if (error) {
        console.error('Error updating status:', error);
        toast({
          title: "Error",
          description: "Failed to update request status",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success!",
        description: `Request status updated to ${newStatus}`,
      });
      
      fetchRequests();

    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-amber-50 to-orange-50">
        <Navigation user={user} />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-amber-50 to-orange-50">
      <Navigation user={user} />
      
      <div className={`container mx-auto px-2 sm:px-4 py-4 sm:py-8 ${isKeyboardVisible ? 'pb-80' : 'pb-24'} transition-all duration-300`}>
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className="mr-2 sm:mr-4 lg:hidden text-gray-600 hover:text-gray-800 p-2"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Feed Requests 🌾</h1>
            </div>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-gradient-to-r from-green-600 to-amber-600 hover:from-green-700 hover:to-amber-700 text-sm sm:text-base p-2 sm:px-4 sm:py-2"
            >
              <Plus className="mr-1 sm:mr-2 h-4 w-4" />
              <span className="hidden sm:inline">New Request</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>

          {showForm && (
            <Card className="bg-white/90 backdrop-blur shadow-xl border-0 mb-4 sm:mb-6 card-responsive">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl">Create Feed Request</CardTitle>
                <CardDescription className="text-sm sm:text-base">Submit a new feed request for cattle</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cattleId" className="text-sm sm:text-base">Cattle ID *</Label>
                      <Input
                        id="cattleId"
                        placeholder="Enter cattle ID"
                        value={formData.cattleId}
                        onChange={(e) => setFormData({ ...formData, cattleId: e.target.value })}
                        className="h-12"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="farmerPhone" className="text-sm sm:text-base">Farmer Phone *</Label>
                      <Input
                        id="farmerPhone"
                        placeholder="Enter farmer's phone"
                        value={formData.farmerPhone}
                        onChange={(e) => setFormData({ ...formData, farmerPhone: e.target.value })}
                        className="h-12"
                      />
                    </div>
                    
                    <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                      <Label className="text-sm sm:text-base">Request Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal h-12",
                              !formData.requestDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.requestDate ? format(formData.requestDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={formData.requestDate}
                            onSelect={(date) => date && setFormData({ ...formData, requestDate: date })}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="feedType" className="text-sm sm:text-base">Feed Type *</Label>
                      <Input
                        id="feedType"
                        placeholder="e.g., Green Fodder, Dry Fodder, Mineral Mix"
                        value={formData.feedType}
                        onChange={(e) => setFormData({ ...formData, feedType: e.target.value })}
                        className="h-12"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="quantityKg" className="text-sm sm:text-base">Quantity (kg) *</Label>
                      <Input
                        id="quantityKg"
                        type="number"
                        step="0.1"
                        placeholder="Enter quantity"
                        value={formData.quantityKg}
                        onChange={(e) => setFormData({ ...formData, quantityKg: e.target.value })}
                        min="0.1"
                        className="h-12"
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowForm(false)}
                      disabled={isLoading}
                      className="h-12 order-2 sm:order-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-green-600 to-amber-600 hover:from-green-700 hover:to-amber-700 h-12 order-1 sm:order-2"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Creating...' : 'Create Request 🌾'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <Card className="bg-white/90 backdrop-blur shadow-xl border-0 card-responsive">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Feed Requests List</CardTitle>
              <CardDescription className="text-sm sm:text-base">Manage and track feed requests</CardDescription>
            </CardHeader>
            <CardContent>
              {requests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No feed requests found. Create the first one!
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((request) => (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 space-y-2 sm:space-y-0">
                        <div>
                          <h3 className="font-semibold text-base sm:text-lg">Cattle: {request.cattle_id}</h3>
                          <p className="text-gray-600 text-sm sm:text-base">Farmer: {request.farmer_phone}</p>
                        </div>
                        <Badge className={`${getStatusColor(request.status)} self-start sm:self-auto`}>
                          {request.status.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 text-sm">
                        <div>
                          <span className="font-medium">Feed Type:</span>
                          <p className="break-words">{request.feed_type}</p>
                        </div>
                        <div>
                          <span className="font-medium">Quantity:</span>
                          <p>{request.quantity_kg} kg</p>
                        </div>
                        <div>
                          <span className="font-medium">Request Date:</span>
                          <p>{format(new Date(request.date), 'PPP')}</p>
                        </div>
                        <div>
                          <span className="font-medium">Requested By:</span>
                          <p className="break-words">{request.requested_by}</p>
                        </div>
                      </div>
                      
                      {(user.role === 'admin' || user.role === 'office_staff') && request.status !== 'Delivered' && (
                        <div className="flex flex-col sm:flex-row gap-2 mt-4">
                          {request.status === 'Pending' && (
                            <Button
                              size="sm"
                              onClick={() => updateRequestStatus(request.id, 'Approved')}
                              className="bg-green-600 hover:bg-green-700 h-10"
                            >
                              Approve
                            </Button>
                          )}
                          {request.status === 'Approved' && (
                            <Button
                              size="sm"
                              onClick={() => updateRequestStatus(request.id, 'Delivered')}
                              className="bg-blue-600 hover:bg-blue-700 h-10"
                            >
                              Mark as Delivered
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FeedRequests;
