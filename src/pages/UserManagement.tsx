
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import AdminGuard from '@/components/AdminGuard';
import CreateUserForm from '@/components/UserManagement/CreateUserForm';
import { Users, ArrowLeft, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { User, RoleChangeData } from '@/types/userManagement';
import UserStatusBadge from '@/components/UserManagement/UserStatusBadge';
import UserRoleBadge from '@/components/UserManagement/UserRoleBadge';
import UserActions from '@/components/UserManagement/UserActions';
import { verifyAdminStatus } from '@/utils/authValidation';

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingUserId, setProcessingUserId] = useState<string | null>(null);
  const [roleChangeData, setRoleChangeData] = useState<RoleChangeData | null>(null);
  const [showCreateUserForm, setShowCreateUserForm] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem('govardhini_user') || '{}');
  const availableRoles = ['Field Officer', 'Office Staff', 'Admin'];

  useEffect(() => {
    console.log('UserManagement component mounted, current user:', user);
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching users...');
      
      // Verify admin status before fetching
      if (!verifyAdminStatus()) {
        toast({
          title: "Access Denied",
          description: "Only approved admins can view user management",
          variant: "destructive"
        });
        navigate('/dashboard');
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        toast({
          title: "Error",
          description: `Failed to fetch users: ${error.message}`,
          variant: "destructive"
        });
        return;
      }
      
      console.log('Fetched users:', data);
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
      console.log('Updating user status:', { userId, status, userName });
      
      // Verify admin status
      if (!verifyAdminStatus()) {
        toast({
          title: "Access Denied",
          description: "Only approved admins can update user status",
          variant: "destructive"
        });
        return;
      }
      
      const updateData: any = { 
        status,
        approved_at: status === 'approved' ? new Date().toISOString() : null,
        approved_by: status === 'approved' ? user.id : null
      };

      console.log('Update data:', updateData);

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId);

      if (error) {
        console.error('Error updating user status:', error);
        toast({
          title: "Error",
          description: `Failed to ${status} user: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      console.log('User status updated successfully');

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
      console.log('Changing user role:', roleChangeData);
      
      // Verify admin status
      if (!verifyAdminStatus()) {
        toast({
          title: "Access Denied",
          description: "Only approved admins can change user roles",
          variant: "destructive"
        });
        return;
      }
      
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

      console.log('User role changed successfully');

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
      console.log('Deleting user:', { userId, userName });
      
      // Verify admin status
      if (!verifyAdminStatus()) {
        toast({
          title: "Access Denied",
          description: "Only approved admins can delete users",
          variant: "destructive"
        });
        return;
      }
      
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) {
        console.error('Error deleting user:', error);
        toast({
          title: "Error",
          description: `Failed to delete user ${userName}: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      console.log('User deleted successfully');

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
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
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
              
              <Button
                onClick={() => setShowCreateUserForm(true)}
                className="grass-green hover:bg-emerald-700 text-white font-semibold"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Create New User
              </Button>
            </div>
            
            <Card className="glass-card border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-green-500/5 animate-fade-in">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-white flex items-center">
                  <Users className="w-8 h-8 mr-3 text-emerald-400" />
                  Manage Users
                </CardTitle>
                <CardDescription className="text-emerald-300">
                  Create new users, approve registrations, delete user accounts, or change user roles. Only approved users can access the system.
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
                          <TableHead className="text-emerald-200 font-semibold">Created</TableHead>
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
                            <TableCell>
                              <UserRoleBadge originalRole={userData.designation} activeRole={userData.active_role} />
                            </TableCell>
                            <TableCell>
                              <UserStatusBadge status={userData.status} />
                            </TableCell>
                            <TableCell className="text-emerald-300 text-sm">{formatDate(userData.created_at)}</TableCell>
                            <TableCell>
                              <UserActions
                                user={userData}
                                currentUserId={user.id}
                                availableRoles={availableRoles}
                                processingUserId={processingUserId}
                                roleChangeData={roleChangeData}
                                setRoleChangeData={setRoleChangeData}
                                onStatusUpdate={updateUserStatus}
                                onRoleChange={changeUserRole}
                                onDelete={deleteUser}
                              />
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

        <CreateUserForm
          isOpen={showCreateUserForm}
          onClose={() => setShowCreateUserForm(false)}
          onUserCreated={fetchUsers}
        />
      </div>
    </AdminGuard>
  );
};

export default UserManagement;
