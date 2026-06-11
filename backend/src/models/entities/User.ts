export interface User {
  userId: string;
  email: string;
  phone?: string;
  name: string;
  role: 'buyer' | 'seller' | 'admin';
  cognitoSub: string;
  membershipStatus: 'none' | 'active' | 'expired';
  membershipPlan?: string;
  membershipExpiry?: string;
  isVerified: boolean;
  verifiedAt?: string;
  profileImage?: string;
  createdAt: string;
  updatedAt?: string;
}
