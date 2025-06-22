
export interface User {
  id: string;
  full_name: string;
  phone_number: string;
  designation: string;
  active_role: string;
  status: string;
  created_at: string;
}

export interface RoleChangeData {
  userId: string;
  userName: string;
  currentRole: string;
  newRole: string;
  reason: string;
}
