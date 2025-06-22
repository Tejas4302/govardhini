
import React from 'react';
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
import { Button } from '@/components/ui/button';
import { UserCog } from 'lucide-react';
import { RoleChangeData } from '@/types/userManagement';

interface RoleChangeDialogProps {
  userName: string;
  userId: string;
  currentRole: string;
  availableRoles: string[];
  roleChangeData: RoleChangeData | null;
  setRoleChangeData: (data: RoleChangeData | null) => void;
  onRoleChange: () => void;
  processingUserId: string | null;
}

const RoleChangeDialog: React.FC<RoleChangeDialogProps> = ({
  userName,
  userId,
  currentRole,
  availableRoles,
  roleChangeData,
  setRoleChangeData,
  onRoleChange,
  processingUserId
}) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          size="sm"
          disabled={processingUserId === userId}
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
            Change the role for <strong>{userName}</strong>. This will not affect their past contributions.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label className="text-emerald-300">Current Role: {currentRole}</Label>
          </div>
          <div>
            <Label htmlFor="new-role" className="text-emerald-300">New Role</Label>
            <Select 
              onValueChange={(value) => setRoleChangeData({
                userId,
                userName,
                currentRole,
                newRole: value,
                reason: roleChangeData?.reason || ''
              })}
            >
              <SelectTrigger className="bg-slate-700 border-emerald-500/30">
                <SelectValue placeholder="Select new role" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-emerald-500/30">
                {availableRoles.filter(role => role !== currentRole).map((role) => (
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
              onChange={(e) => setRoleChangeData(roleChangeData ? {
                ...roleChangeData, 
                reason: e.target.value
              } : null)}
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
            onClick={onRoleChange}
            disabled={!roleChangeData?.newRole}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Change Role
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RoleChangeDialog;
