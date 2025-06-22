
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { CheckCircle, XCircle, AlertTriangle, Trash2, UserCog } from 'lucide-react';
import { User, RoleChangeData } from '@/types/userManagement';

interface UserActionsProps {
  user: User;
  currentUserId: string;
  availableRoles: string[];
  processingUserId: string | null;
  roleChangeData: RoleChangeData | null;
  setRoleChangeData: (data: RoleChangeData | null) => void;
  onStatusUpdate: (userId: string, status: string, userName: string) => void;
  onRoleChange: () => void;
  onDelete: (userId: string, userName: string) => void;
}

const UserActions: React.FC<UserActionsProps> = ({
  user,
  currentUserId,
  availableRoles,
  processingUserId,
  roleChangeData,
  setRoleChangeData,
  onStatusUpdate,
  onRoleChange,
  onDelete
}) => {
  const [approveSheetOpen, setApproveSheetOpen] = useState(false);
  const [rejectSheetOpen, setRejectSheetOpen] = useState(false);
  const [roleSheetOpen, setRoleSheetOpen] = useState(false);
  const [deleteSheetOpen, setDeleteSheetOpen] = useState(false);

  const handleApprove = () => {
    onStatusUpdate(user.id, 'approved', user.full_name);
    setApproveSheetOpen(false);
  };

  const handleReject = () => {
    onStatusUpdate(user.id, 'rejected', user.full_name);
    setRejectSheetOpen(false);
  };

  const handleRoleChange = () => {
    onRoleChange();
    setRoleSheetOpen(false);
  };

  const handleDelete = () => {
    onDelete(user.id, user.full_name);
    setDeleteSheetOpen(false);
  };

  return (
    <div className="flex gap-2 items-center" style={{ minHeight: '36px', minWidth: '200px' }}>
      {user.status === 'pending' && (
        <>
          <Sheet open={approveSheetOpen} onOpenChange={setApproveSheetOpen}>
            <SheetTrigger asChild>
              <Button
                size="sm"
                disabled={processingUserId === user.id}
                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white"
                style={{ minWidth: '80px', minHeight: '32px' }}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Approve
              </Button>
            </SheetTrigger>
            <SheetContent className="glass-card border-emerald-500/30 bg-slate-800/90 backdrop-blur-xl text-white">
              <SheetHeader>
                <SheetTitle className="text-emerald-300">Approve User</SheetTitle>
                <SheetDescription className="text-emerald-200">
                  Are you sure you want to approve <strong>{user.full_name}</strong> ({user.designation})? 
                  They will be able to access the system immediately.
                </SheetDescription>
              </SheetHeader>
              <SheetFooter className="mt-6">
                <Button
                  variant="outline"
                  onClick={() => setApproveSheetOpen(false)}
                  className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleApprove}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  Approve User
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>

          <Sheet open={rejectSheetOpen} onOpenChange={setRejectSheetOpen}>
            <SheetTrigger asChild>
              <Button
                size="sm"
                variant="destructive"
                disabled={processingUserId === user.id}
                className="bg-red-600 hover:bg-red-700"
                style={{ minWidth: '70px', minHeight: '32px' }}
              >
                <XCircle className="w-4 h-4 mr-1" />
                Reject
              </Button>
            </SheetTrigger>
            <SheetContent className="glass-card border-red-500/30 bg-slate-800/90 backdrop-blur-xl text-white">
              <SheetHeader>
                <SheetTitle className="text-red-300 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Reject User
                </SheetTitle>
                <SheetDescription className="text-red-200">
                  Are you sure you want to reject <strong>{user.full_name}</strong>? 
                  They will not be able to access the system and will need to contact admin.
                </SheetDescription>
              </SheetHeader>
              <SheetFooter className="mt-6">
                <Button
                  variant="outline"
                  onClick={() => setRejectSheetOpen(false)}
                  className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReject}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Reject User
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </>
      )}
      
      {user.status === 'approved' && (
        <>
          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30" style={{ minWidth: '90px', minHeight: '24px' }}>
            Active User
          </Badge>
          
          {user.id !== currentUserId && (
            <div className="flex gap-1" style={{ minWidth: '72px' }}>
              <Sheet open={roleSheetOpen} onOpenChange={setRoleSheetOpen}>
                <SheetTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={processingUserId === user.id}
                    className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 border-0 bg-transparent"
                    style={{ 
                      width: '32px', 
                      height: '32px', 
                      minWidth: '32px', 
                      minHeight: '32px',
                      padding: '0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <UserCog className="w-4 h-4" style={{ flexShrink: 0 }} />
                  </Button>
                </SheetTrigger>
                <SheetContent className="glass-card border-blue-500/30 bg-slate-800/90 backdrop-blur-xl text-white">
                  <SheetHeader>
                    <SheetTitle className="text-blue-300">Change User Role</SheetTitle>
                    <SheetDescription className="text-blue-200">
                      Change the role for <strong>{user.full_name}</strong>. This will not affect their past contributions.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <label className="text-emerald-300">Current Role: {user.active_role}</label>
                    </div>
                    <div>
                      <label htmlFor="new-role" className="text-emerald-300">New Role</label>
                      <select 
                        className="w-full mt-1 bg-slate-700 border border-emerald-500/30 rounded px-3 py-2 text-white"
                        onChange={(e) => setRoleChangeData({
                          userId: user.id,
                          userName: user.full_name,
                          currentRole: user.active_role,
                          newRole: e.target.value,
                          reason: roleChangeData?.reason || ''
                        })}
                      >
                        <option value="">Select new role</option>
                        {availableRoles.filter(role => role !== user.active_role).map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="reason" className="text-emerald-300">Reason (Optional)</label>
                      <input
                        id="reason"
                        type="text"
                        placeholder="Reason for role change"
                        className="w-full mt-1 bg-slate-700 border border-emerald-500/30 rounded px-3 py-2 text-white"
                        value={roleChangeData?.reason || ''}
                        onChange={(e) => setRoleChangeData(roleChangeData ? {
                          ...roleChangeData, 
                          reason: e.target.value
                        } : null)}
                      />
                    </div>
                  </div>
                  <SheetFooter className="mt-6">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setRoleChangeData(null);
                        setRoleSheetOpen(false);
                      }}
                      className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleRoleChange}
                      disabled={!roleChangeData?.newRole}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Change Role
                    </Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>

              <Sheet open={deleteSheetOpen} onOpenChange={setDeleteSheetOpen}>
                <SheetTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={processingUserId === user.id}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 border-0 bg-transparent"
                    style={{ 
                      width: '32px', 
                      height: '32px', 
                      minWidth: '32px', 
                      minHeight: '32px',
                      padding: '0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Trash2 className="w-4 h-4" style={{ flexShrink: 0 }} />
                  </Button>
                </SheetTrigger>
                <SheetContent className="glass-card border-red-500/30 bg-slate-800/90 backdrop-blur-xl text-white">
                  <SheetHeader>
                    <SheetTitle className="text-red-300 flex items-center">
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      Delete User Account
                    </SheetTitle>
                    <SheetDescription className="text-red-200">
                      Are you sure you want to permanently delete <strong>{user.full_name}</strong>'s account? 
                      This action cannot be undone and will remove all their data from the system.
                    </SheetDescription>
                  </SheetHeader>
                  <SheetFooter className="mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setDeleteSheetOpen(false)}
                      className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleDelete}
                      className="bg-red-700 hover:bg-red-800"
                    >
                      Delete Account
                    </Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          )}
        </>
      )}
      
      {user.status === 'rejected' && (
        <Badge className="bg-red-500/20 text-red-300 border-red-500/30" style={{ minWidth: '110px', minHeight: '24px' }}>
          Access Denied
        </Badge>
      )}
    </div>
  );
};

export default UserActions;
