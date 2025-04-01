
export interface Coupon {
  id: string;
  code: string;
  description: string;
  isActive: boolean;
  isUsed: boolean;
  createdAt: string;
  usedAt?: string;
  usedBy?: UserClaim;
}

export interface UserClaim {
  id: string;
  ip: string;
  sessionId: string;
  timestamp: string;
  couponId: string;
}

export interface AdminUser {
  username: string;
  password: string; // In a real app, this would be hashed
}
