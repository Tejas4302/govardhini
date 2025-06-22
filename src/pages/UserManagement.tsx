
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import { Users, CheckCircle, XCircle, Clock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface User {
  id: string;
  full_name: string;
  phone_number: string;
  designation: string;
  status: string;
  created_at: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem('govardhini_user') || '{}');

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserStatus = async (userId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ status })
        .eq('id', userId);

      if (error) throw error;

      // Create role assignment for approved users
      if (status === 'approved') {
        const userToApprove = users.find(u => u.id === userId);
        if (userToApprove) {
          await supabase
            .from('user_role_assignments')
            .insert({
              user_id: userId,
              assigned_by: user.id,
              role_assigned: userToApprove.designation
            });
        }
      }

      toast({
        title: "Success",
        description: `User ${status} successfully`,
      });

      fetchPendingUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { className: 'bg-amber-500/20 text-amber-300 border-amber-500/30', icon: Clock },
      approved: { className: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', icon: CheckCircle },
      rejected: { className: 'bg-red-500/20 text-red-300 border-red-500/30', icon: XCircle }
    };
    
    const variant = variants[status as keyof typeof variants] || variants.pending;
    const IconComponent = variant.icon;
    
    return (
      <Badge className={variant.className}>
        <IconComponent className="w-3 h-3 mr-1" />
        {status.toUpperCase()}
      </Badge>
    );
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
        <div className="max-w-6xl mx-auto">
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
            <h1 className="text-4xl font-bold text-white animate-fade-in">User Management</h1>
          </div>
          
          <Card className="glass-card border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-green-500/5 animate-fade-in">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white flex items-center">
                <Users className="w-8 h-8 mr-3 text-emerald-400" />
                Manage Users
              </CardTitle>
              <CardDescription className="text-emerald-300">Approve or reject user registrations</CardDescription>
            </CardHeader>
            
            <CardContent>
              {isLoading ? (
                <div className="text-center text-white py-8">
                  <div className="animate-pulse">Loading users...</div>
                </div>
              ) : (
                <div className="glass-card border-emerald-500/20 bg-emerald-500/5 rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-emerald-500/20">
                        <TableHead className="text-emerald-200 font-semibold">Name</TableHead>
                        <TableHead className="text-emerald-200 font-semibold">Phone</TableHead>
                        <TableHead className="text-emerald-200 font-semibold">Designation</TableHead>
                        <TableHead className="text-emerald-200 font-semibold">Status</TableHead>
                        <TableHead className="text-emerald-200 font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user, index) => (
                        <TableRow key={user.id} className="border-emerald-500/10 hover:bg-emerald-500/10 transition-colors animate-slide-up" style={{animationDelay: `${index * 0.1}s`}}>
                          <TableCell className="text-white font-medium">{user.full_name}</TableCell>
                          <TableCell className="text-emerald-300">{user.phone_number}</TableCell>
                          <TableCell className="text-emerald-300">{user.designation}</TableCell>
                          <TableCell>{getStatusBadge(user.status)}</TableCell>
                          <TableCell>
                            {user.status === 'pending' && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => updateUserStatus(user.id, 'approved')}
                                  className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white"
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => updateUserStatus(user.id, 'rejected')}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
