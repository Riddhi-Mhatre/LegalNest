export type Role = 'buyer' | 'seller';
export type MembershipStatus = 'none' | 'active' | 'expired';

export interface User {
  userId: string;
  email: string;
  phone?: string;
  name: string;
  role: Role;
  membershipStatus: MembershipStatus;
  membershipPlan?: string;
  membershipExpiry?: string;
  isVerified: boolean;
  profileImage?: string;
  createdAt: string;
}
