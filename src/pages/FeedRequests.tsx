
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { CalendarIcon, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';

interface Farmer {
  farmer_id: string;
  farmer_name: string;
}

interface FeedRequest {
  id: string;
  request_id: string;
  farmer_id: string;
  request_date: string;
  feed_type: string;
  quantity: number;
  status: string;
  requested_by: string;
  farmers: {
    farmer_name: string;
  };
}

const FeedRequests = () => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    requestId: `FR${Date.now().toString().slice(-6)}`,
    farmerId: '',
    requestDate: new Date(),
    feedType: '',
    quantity: '',
  });
  
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [requests, setRequests] = useState<FeedRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem('govardhini_user') || '{}');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch farmers
      const { data: farmersData, error: farmersError } = await supabase
        .from('farmers')
        .select('farmer_id, farmer_name')
        .order('farmer_name');

      if (farmersError) {
        console.error('Error fetching farmers:', farmersError);
        toast({
          title: "Error",
          description: "Failed to load farmers list",
          variant: "destructive"
        });
      } else {
        setFarmers(farmersData || []);
      }

      // Fetch feed requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('feed_requests')
        .select(`
          *,
          farmers (
            farmer_name
          )
        `)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.farmerId || !formData.feedType || !formData.quantity) {
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
        .from('feed_requests')
        .insert({
          request_id: formData.requestId,
          farmer_id: formData.farmerId,
          request_date: format(formData.requestDate, 'yyyy-MM-dd'),
          feed_type: formData.feedType,
          quantity: parseFloat(formData.quantity),
          requested_by: user.name || 'Current User'
        });

      if (error) {
        console.error('Error saving feed request:', error);
        toast({
          title: "Error",
          description: "Failed to create feed request. Please try again.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success!",
        description: "Feed request created successfully",
      });
      
      // Reset form and refresh data
      setFormData({
        requestId: `FR${Date.now().toString().slice(-6)}`,
        farmerId: '',
        requestDate: new Date(),
        feedType: '',
        quantity: '',
      });
      setShowForm(false);
      fetchData();

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
      
      fetchData();

    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFeedTypeLabel = (feedType: string) => {
    switch (feedType) {
      case 'green_fodder': return 'Green Fodder';
      case 'dry_fodder': return 'Dry Fodder';
      case 'mineral_mix': return 'Mineral Mix';
      default: return feedType;
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
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Feed Requests</h1>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-gradient-to-r from-green-600 to-amber-600 hover:from-green-700 hover:to-amber-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Request
            </Button>
          </div>

          {showForm && (
            <Card className="bg-white/90 backdrop-blur shadow-xl border-0 mb-6">
              <CardHeader>
                <CardTitle>Create Feed Request</CardTitle>
                <CardDescription>Submit a new feed request for a farmer</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="requestId">Request ID</Label>
                      <Input
                        id="requestId"
                        value={formData.requestId}
                        className="bg-gray-50"
                        readOnly
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Farmer *</Label>
                      <Select 
                        value={formData.farmerId} 
                        onValueChange={(value) => setFormData({ ...formData, farmerId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select farmer" />
                        </SelectTrigger>
                        <SelectContent>
                          {farmers.map((farmer) => (
                            <SelectItem key={farmer.farmer_id} value={farmer.farmer_id}>
                              {farmer.farmer_id} - {farmer.farmer_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Request Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Feed Type *</Label>
                      <Select 
                        value={formData.feedType} 
                        onValueChange={(value) => setFormData({ ...formData, feedType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select feed type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="green_fodder">Green Fodder</SelectItem>
                          <SelectItem value="dry_fodder">Dry Fodder</SelectItem>
                          <SelectItem value="mineral_mix">Mineral Mix</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity (kg) *</Label>
                      <Input
                        id="quantity"
                        type="number"
                        step="0.1"
                        placeholder="Enter quantity"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        min="0.1"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowForm(false)}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-green-600 to-amber-600 hover:from-green-700 hover:to-amber-700"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Creating...' : 'Create Request'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <Card className="bg-white/90 backdrop-blur shadow-xl border-0">
            <CardHeader>
              <CardTitle>Feed Requests List</CardTitle>
              <CardDescription>Manage and track feed requests</CardDescription>
            </CardHeader>
            <CardContent>
              {requests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No feed requests found. Create the first one!
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((request) => (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{request.request_id}</h3>
                          <p className="text-gray-600">{request.farmers?.farmer_name} ({request.farmer_id})</p>
                        </div>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Feed Type:</span>
                          <p>{getFeedTypeLabel(request.feed_type)}</p>
                        </div>
                        <div>
                          <span className="font-medium">Quantity:</span>
                          <p>{request.quantity} kg</p>
                        </div>
                        <div>
                          <span className="font-medium">Request Date:</span>
                          <p>{format(new Date(request.request_date), 'PPP')}</p>
                        </div>
                        <div>
                          <span className="font-medium">Requested By:</span>
                          <p>{request.requested_by}</p>
                        </div>
                      </div>
                      
                      {(user.role === 'admin' || user.role === 'office_staff') && request.status !== 'delivered' && (
                        <div className="flex gap-2 mt-4">
                          {request.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => updateRequestStatus(request.id, 'approved')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Approve
                            </Button>
                          )}
                          {request.status === 'approved' && (
                            <Button
                              size="sm"
                              onClick={() => updateRequestStatus(request.id, 'delivered')}
                              className="bg-blue-600 hover:bg-blue-700"
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
