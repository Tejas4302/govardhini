
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface UserStatusBadgeProps {
  status: string;
}

const UserStatusBadge: React.FC<UserStatusBadgeProps> = ({ status }) => {
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

export default UserStatusBadge;
