
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface SmsNotification {
  id: string;
  phone_number: string;
  message_type: string;
  message_content: string;
  status: string;
  created_at: string;
  sent_at?: string;
}

const SmsNotifications = () => {
  const [notifications, setNotifications] = useState<SmsNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  const user = JSON.parse(localStorage.getItem('govardhini_user') || '{}');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('sms_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "Error",
        description: "Failed to fetch SMS notifications",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'default',
      sent: 'secondary',
      failed: 'destructive'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation user={user} />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white">SMS Notifications Center</CardTitle>
              <CardDescription className="text-gray-300">Monitor and track all SMS communications</CardDescription>
            </CardHeader>
            
            <CardContent>
              {isLoading ? (
                <div className="text-center text-white">Loading notifications...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-white">Phone Number</TableHead>
                      <TableHead className="text-white">Type</TableHead>
                      <TableHead className="text-white">Message</TableHead>
                      <TableHead className="text-white">Status</TableHead>
                      <TableHead className="text-white">Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notifications.map((notification) => (
                      <TableRow key={notification.id}>
                        <TableCell className="text-white">{notification.phone_number}</TableCell>
                        <TableCell className="text-white">{notification.message_type}</TableCell>
                        <TableCell className="text-white">
                          <div className="max-w-xs truncate">{notification.message_content}</div>
                        </TableCell>
                        <TableCell>{getStatusBadge(notification.status)}</TableCell>
                        <TableCell className="text-white">
                          {new Date(notification.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SmsNotifications;
