
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { CheckCircle, XCircle, AlertTriangle, Trash2 } from 'lucide-react';
import { User, RoleChangeData } from '@/types/userManagement';
import RoleChangeDialog from './RoleChangeDialog';

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
  return (
    <div className="flex gap-2 flex-wrap">
      {user.status === 'pending' && (
        <>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                disabled={processingUserId === user.id}
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
                  Are you sure you want to approve <strong>{user.full_name}</strong> ({user.designation})? 
                  They will be able to access the system immediately.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onStatusUpdate(user.id, 'approved', user.full_name)}
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
                disabled={processingUserId === user.id}
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
                  Are you sure you want to reject <strong>{user.full_name}</strong>? 
                  They will not be able to access the system and will need to contact admin.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onStatusUpdate(user.id, 'rejected', user.full_name)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Reject User
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
      
      {user.status === 'approved' && (
        <>
          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
            Active User
          </Badge>
          
          {user.id !== currentUserId && (
            <RoleChangeDialog
              userName={user.full_name}
              userId={user.id}
              currentRole={user.active_role}
              availableRoles={availableRoles}
              roleChangeData={roleChangeData}
              setRoleChangeData={setRoleChangeData}
              onRoleChange={onRoleChange}
              processingUserId={processingUserId}
            />
          )}
        </>
      )}
      
      {user.status === 'rejected' && (
        <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
          Access Denied
        </Badge>
      )}
      
      {user.id !== currentUserId && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="sm"
              variant="destructive"
              disabled={processingUserId === user.id}
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
                Are you sure you want to permanently delete <strong>{user.full_name}</strong>'s account? 
                This action cannot be undone and will remove all their data from the system.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(user.id, user.full_name)}
                className="bg-red-700 hover:bg-red-800"
              >
                Delete Account
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default UserActions;
