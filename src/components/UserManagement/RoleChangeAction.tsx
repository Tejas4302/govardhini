
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserCog } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from '@/types/userManagement';

interface RoleChangeActionProps {
  user: User;
  availableRoles: string[];
  processingUserId: string | null;
  onRoleChange: (userId: string, userName: string, newRole: string, reason?: string) => void;
}

const RoleChangeAction: React.FC<RoleChangeActionProps> = ({
  user,
  availableRoles,
  processingUserId,
  onRoleChange
}) => {
  const [roleSheetOpen, setRoleSheetOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [reason, setReason] = useState('');

  const handleRoleChange = () => {
    if (selectedRole) {
      onRoleChange(user.id, user.full_name, selectedRole, reason);
      setRoleSheetOpen(false);
      setSelectedRole('');
      setReason('');
    }
  };

  return (
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
            Change the role for <strong>{user.full_name}</strong>. This will update their access permissions.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label className="text-emerald-300">Current Role: {user.active_role}</Label>
          </div>
          <div>
            <Label htmlFor="new-role" className="text-emerald-300">New Role</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-full mt-1 bg-slate-700 border border-emerald-500/30 text-white">
                <SelectValue placeholder="Select new role" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-emerald-500/30">
                {availableRoles.filter(role => role.toLowerCase() !== user.active_role.toLowerCase()).map((role) => (
                  <SelectItem key={role} value={role} className="text-white hover:bg-slate-600">
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
              type="text"
              placeholder="Reason for role change"
              className="w-full mt-1 bg-slate-700 border border-emerald-500/30 text-white"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>
        <SheetFooter className="mt-6">
          <Button
            variant="outline"
            onClick={() => {
              setRoleSheetOpen(false);
              setSelectedRole('');
              setReason('');
            }}
            className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
          >
            Cancel
          </Button>
          <Button
            onClick={handleRoleChange}
            disabled={!selectedRole}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Change Role
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default RoleChangeAction;
