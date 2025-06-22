import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import AdminGuard from '@/components/AdminGuard';
import { Users, CheckCircle, XCircle, Clock, ArrowLeft, AlertTriangle, Trash2, UserCog } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface User {
  id: string;
  full_name: string;
  phone_number: string;
  designation: string;
  active_role: string;
  status: string;
  created_at: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingUserId, setProcessingUserId] = useState<string | null>(null);
  const [roleChangeData, setRoleChangeData] = useState<{
    userId: string;
    userName: string;
    currentRole: string;
    newRole: string;
    reason: string;
  } | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem('govardhini_user') || '{}');
  const availableRoles = ['Field Officer', 'Office Staff', 'Admin'];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        toast({
          title: "Error",
          description: "Failed to fetch users. Please check your admin permissions.",
          variant: "destructive"
        });
        return;
      }
      
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

  const updateUserStatus = async (userId: string, status: string, userName: string) => {
    try {
      setProcessingUserId(userId);
      
      const updateData: any = { 
        status,
        approved_at: status === 'approved' ? new Date().toISOString() : null,
        approved_by: status === 'approved' ? user.id : null
      };

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId);

      if (error) {
        console.error('Error updating user status:', error);
        toast({
          title: "Error",
          description: `Failed to ${status} user. Please check your admin permissions.`,
          variant: "destructive"
        });
        return;
      }

      // Create role assignment for approved users
      if (status === 'approved') {
        const userToApprove = users.find(u => u.id === userId);
        if (userToApprove) {
          const { error: roleError } = await supabase
            .from('user_role_assignments')
            .insert({
              user_id: userId,
              assigned_by: user.id,
              role_assigned: userToApprove.designation
            });

          if (roleError) {
            console.error('Error creating role assignment:', roleError);
            // Don't show error to user as the main action succeeded
          }
        }
      }

      toast({
        title: "Success",
        description: `User ${userName} has been ${status} successfully`,
      });

      await fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive"
      });
    } finally {
      setProcessingUserId(null);
    }
  };

  const changeUserRole = async () => {
    if (!roleChangeData) return;

    try {
      setProcessingUserId(roleChangeData.userId);
      
      const { error } = await supabase.rpc('change_user_role', {
        target_user_id: roleChangeData.userId,
        new_role: roleChangeData.newRole,
        change_reason: roleChangeData.reason || null
      });

      if (error) {
        console.error('Error changing user role:', error);
        toast({
          title: "Error",
          description: `Failed to change user role: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: `${roleChangeData.userName}'s role has been changed from ${roleChangeData.currentRole} to ${roleChangeData.newRole}`,
      });

      setRoleChangeData(null);
      await fetchUsers();
    } catch (error) {
      console.error('Error changing user role:', error);
      toast({
        title: "Error",
        description: "Failed to change user role",
        variant: "destructive"
      });
    } finally {
      setProcessingUserId(null);
    }
  };

  const deleteUser = async (userId: string, userName: string) => {
    try {
      setProcessingUserId(userId);
      
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) {
        console.error('Error deleting user:', error);
        toast({
          title: "Error",
          description: `Failed to delete user ${userName}. Please check your admin permissions.`,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: `User ${userName} has been deleted successfully`,
      });

      await fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive"
      });
    } finally {
      setProcessingUserId(null);
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

  const getRoleBadge = (originalRole: string, activeRole: string) => {
    const hasRoleChanged = originalRole !== activeRole;
    return (
      <div className="flex flex-col gap-1">
        <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
          {activeRole}
        </Badge>
        {hasRoleChanged && (
          <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/30 text-xs">
            Originally: {originalRole}
          </Badge>
        )}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AdminGuard>
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
                <CardDescription className="text-emerald-300">
                  Approve, reject, delete user registrations, or change user roles. Only approved users can access the system.
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {isLoading ? (
                  <div className="text-center text-white py-8">
                    <div className="animate-pulse">Loading users...</div>
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center text-emerald-300 py-8">
                    <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No users found</p>
                  </div>
                ) : (
                  <div className="glass-card border-emerald-500/20 bg-emerald-500/5 rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-emerald-500/20">
                          <TableHead className="text-emerald-200 font-semibold">Name</TableHead>
                          <TableHead className="text-emerald-200 font-semibold">Phone</TableHead>
                          <TableHead className="text-emerald-200 font-semibold">Role</TableHead>
                          <TableHead className="text-emerald-200 font-semibold">Status</TableHead>
                          <TableHead className="text-emerald-200 font-semibold">Registered</TableHead>
                          <TableHead className="text-emerald-200 font-semibold">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((userData, index) => (
                          <TableRow 
                            key={userData.id} 
                            className="border-emerald-500/10 hover:bg-emerald-500/10 transition-colors animate-slide-up" 
                            style={{animationDelay: `${index * 0.1}s`}}
                          >
                            <TableCell className="text-white font-medium">{userData.full_name}</TableCell>
                            <TableCell className="text-emerald-300">{userData.phone_number}</TableCell>
                            <TableCell>{getRoleBadge(userData.designation, userData.active_role)}</TableCell>
                            <TableCell>{getStatusBadge(userData.status)}</TableCell>
                            <TableCell className="text-emerald-300 text-sm">{formatDate(userData.created_at)}</TableCell>
                            <TableCell>
                              <div className="flex gap-2 flex-wrap">
                                {userData.status === 'pending' && (
                                  <>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          size="sm"
                                          disabled={processingUserId === userData.id}
                                          className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white"
                                        >
                                          <CheckCircle className="w-4 h-4 mr-1" />
                                          Approve
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent className="glass-card border-emerald-500/30 bg-slate-800/90 backdrop-blur-xl text-white">
                                        <AlertDialogHeader>
                                          <AlertDialogTitle className="text-emerald-300">Approve User</AlertDialogTitle>
                                          <AlertDialogDescription className="text-emerald-200">
                                            Are you sure you want to approve <strong>{userData.full_name}</strong> ({userData.designation})? 
                                            They will be able to access the system immediately.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20">
                                            Cancel
                                          </AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => updateUserStatus(userData.id, 'approved', userData.full_name)}
                                            className="bg-emerald-600 hover:bg-emerald-700"
                                          >
                                            Approve User
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>

                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          disabled={processingUserId === userData.id}
                                          className="bg-red-600 hover:bg-red-700"
                                        >
                                          <XCircle className="w-4 h-4 mr-1" />
                                          Reject
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent className="glass-card border-red-500/30 bg-slate-800/90 backdrop-blur-xl text-white">
                                        <AlertDialogHeader>
                                          <AlertDialogTitle className="text-red-300 flex items-center">
                                            <AlertTriangle className="w-5 h-5 mr-2" />
                                            Reject User
                                          </AlertDialogTitle>
                                          <AlertDialogDescription className="text-red-200">
                                            Are you sure you want to reject <strong>{userData.full_name}</strong>? 
                                            They will not be able to access the system and will need to contact admin.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20">
                                            Cancel
                                          </AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => updateUserStatus(userData.id, 'rejected', userData.full_name)}
                                            className="bg-red-600 hover:bg-red-700"
                                          >
                                            Reject User
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </>
                                )}
                                {userData.status === 'approved' && (
                                  <>
                                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                                      Active User
                                    </Badge>
                                    
                                    {/* Role Change Button */}
                                    {userData.id !== user.id && (
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <Button
                                            size="sm"
                                            disabled={processingUserId === userData.id}
                                            className="bg-blue-600 hover:bg-blue-700"
                                          >
                                            <UserCog className="w-4 h-4 mr-1" />
                                            Change Role
                                          </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="glass-card border-blue-500/30 bg-slate-800/90 backdrop-blur-xl text-white max-w-md">
                                          <AlertDialogHeader>
                                            <AlertDialogTitle className="text-blue-300">Change User Role</AlertDialogTitle>
                                            <AlertDialogDescription className="text-blue-200">
                                              Change the role for <strong>{userData.full_name}</strong>. This will not affect their past contributions.
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <div className="space-y-4 py-4">
                                            <div>
                                              <Label className="text-emerald-300">Current Role: {userData.active_role}</Label>
                                            </div>
                                            <div>
                                              <Label htmlFor="new-role" className="text-emerald-300">New Role</Label>
                                              <Select 
                                                onValueChange={(value) => setRoleChangeData({
                                                  userId: userData.id,
                                                  userName: userData.full_name,
                                                  currentRole: userData.active_role,
                                                  newRole: value,
                                                  reason: roleChangeData?.reason || ''
                                                })}
                                              >
                                                <SelectTrigger className="bg-slate-700 border-emerald-500/30">
                                                  <SelectValue placeholder="Select new role" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-slate-700 border-emerald-500/30">
                                                  {availableRoles.filter(role => role !== userData.active_role).map((role) => (
                                                    <SelectItem key={role} value={role} className="text-white hover:bg-emerald-500/20">
                                                      {role}
                                                    </SelectItem>
                                                  ))}
                                                </SelectContent>
                                              </Select>
                                            </div>
                                            <div>
                                              <Label htmlFor="reason" className="text-emerald-300">Reason (Optional)</Label>
                                              <Input
                                                id="reason"
                                                placeholder="Reason for role change"
                                                className="bg-slate-700 border-emerald-500/30 text-white"
                                                value={roleChangeData?.reason || ''}
                                                onChange={(e) => setRoleChangeData(prev => prev ? {...prev, reason: e.target.value} : null)}
                                              />
                                            </div>
                                          </div>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel 
                                              className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
                                              onClick={() => setRoleChangeData(null)}
                                            >
                                              Cancel
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                              onClick={changeUserRole}
                                              disabled={!roleChangeData?.newRole}
                                              className="bg-blue-600 hover:bg-blue-700"
                                            >
                                              Change Role
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    )}
                                  </>
                                )}
                                {userData.status === 'rejected' && (
                                  <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
                                    Access Denied
                                  </Badge>
                                )}
                                
                                {/* Delete Button - Available for all users except current admin */}
                                {userData.id !== user.id && (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        disabled={processingUserId === userData.id}
                                        className="bg-red-700 hover:bg-red-800"
                                      >
                                        <Trash2 className="w-4 h-4 mr-1" />
                                        Delete
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="glass-card border-red-500/30 bg-slate-800/90 backdrop-blur-xl text-white">
                                      <AlertDialogHeader>
                                        <AlertDialogTitle className="text-red-300 flex items-center">
                                          <AlertTriangle className="w-5 h-5 mr-2" />
                                          Delete User Account
                                        </AlertDialogTitle>
                                        <AlertDialogDescription className="text-red-200">
                                          Are you sure you want to permanently delete <strong>{userData.full_name}</strong>'s account? 
                                          This action cannot be undone and will remove all their data from the system.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20">
                                          Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => deleteUser(userData.id, userData.full_name)}
                                          className="bg-red-700 hover:bg-red-800"
                                        >
                                          Delete Account
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                )}
                              </div>
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
    </AdminGuard>
  );
};

export default UserManagement;
