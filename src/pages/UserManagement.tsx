
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Plus, Search } from 'lucide-react';
import CreateUserForm from '@/components/UserManagement/CreateUserForm';
import UserActions from '@/components/UserManagement/UserActions';
import UserRoleBadge from '@/components/UserManagement/UserRoleBadge';
import UserStatusBadge from '@/components/UserManagement/UserStatusBadge';
import type { User, RoleChangeData } from '@/types/userManagement';

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [processingUserId, setProcessingUserId] = useState<string | null>(null);
  const [roleChangeData, setRoleChangeData] = useState<RoleChangeData | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const currentUser = JSON.parse(localStorage.getItem('govardhini_user') || '{}');
  const availableRoles = ['Field Officer', 'Office Staff', 'Admin'];

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter(user => 
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone_number.includes(searchTerm) ||
      user.designation.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [users, searchTerm]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
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
        description: "Failed to fetch users. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserCreated = () => {
    setShowCreateForm(false);
    fetchUsers();
  };

  const handleUserUpdated = () => {
    fetchUsers();
  };

  const handleStatusUpdate = async (userId: string, status: string, userName: string) => {
    setProcessingUserId(userId);
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          status,
          approved_at: status === 'approved' ? new Date().toISOString() : null,
          approved_by: status === 'approved' ? currentUser.id : null
        })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `User ${userName} has been ${status}.`,
      });

      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: "Error",
        description: "Failed to update user status. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessingUserId(null);
    }
  };

  const handleRoleChange = async () => {
    if (!roleChangeData) return;
    
    setProcessingUserId(roleChangeData.userId);
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          active_role: roleChangeData.newRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', roleChangeData.userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${roleChangeData.userName}'s role has been changed to ${roleChangeData.newRole}.`,
      });

      setRoleChangeData(null);
      fetchUsers();
    } catch (error) {
      console.error('Error changing user role:', error);
      toast({
        title: "Error",
        description: "Failed to change user role. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessingUserId(null);
    }
  };

  const handleDelete = async (userId: string, userName: string) => {
    setProcessingUserId(userId);
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `User ${userName} has been deleted.`,
      });

      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessingUserId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-teal-900">
      <Navigation user={currentUser} />
      
      {/* Enhanced animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-10 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-48 h-48 md:w-96 md:h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-48 h-48 md:w-96 md:h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-48 h-48 md:w-96 md:h-96 bg-green-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
        </div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
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
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New User
          </Button>
        </div>

        <CreateUserForm
          isOpen={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          onUserCreated={handleUserCreated}
        />

        <Card className="agricultural-glass border-emerald-500/20 backdrop-blur-md animate-fade-in">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="w-6 h-6 text-emerald-400 mr-2" />
                <CardTitle className="text-2xl font-bold text-white">System Users</CardTitle>
              </div>
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-emerald-400" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 glass-input border-emerald-500/30 text-white placeholder:text-emerald-300/70"
                />
              </div>
            </div>
            <CardDescription className="text-emerald-300">
              Manage user accounts and permissions
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400 mx-auto"></div>
                <p className="text-emerald-300 mt-2">Loading users...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="grid gap-4">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="p-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-white">{user.full_name}</h3>
                            <UserRoleBadge originalRole={user.designation} activeRole={user.active_role} />
                            <UserStatusBadge status={user.status} />
                          </div>
                          <div className="text-sm text-emerald-300 space-y-1">
                            <p>📱 {user.phone_number}</p>
                            <p>💼 {user.designation}</p>
                            <p>📅 Joined: {new Date(user.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        
                        <UserActions
                          user={user}
                          currentUserId={currentUser.id}
                          availableRoles={availableRoles}
                          processingUserId={processingUserId}
                          roleChangeData={roleChangeData}
                          setRoleChangeData={setRoleChangeData}
                          onStatusUpdate={handleStatusUpdate}
                          onRoleChange={handleRoleChange}
                          onDelete={handleDelete}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                
                {filteredUsers.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-emerald-400/50 mx-auto mb-4" />
                    <p className="text-emerald-300">No users found matching your search.</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserManagement;
