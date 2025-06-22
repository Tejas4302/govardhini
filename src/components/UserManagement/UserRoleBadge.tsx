
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface UserRoleBadgeProps {
  originalRole: string;
  activeRole: string;
}

const UserRoleBadge: React.FC<UserRoleBadgeProps> = ({ originalRole, activeRole }) => {
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

export default UserRoleBadge;
