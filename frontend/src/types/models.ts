export type UserRole = 'user' | 'admin';
export type ItemType = 'lost' | 'found';
export type ItemStatus = 'open' | 'claimed' | 'returned' | 'closed';
export type RewardStatus = 'not_declared' | 'pending' | 'completed';
export type ClaimStatus = 'pending' | 'accepted' | 'rejected';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  isSuspended: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
}

export interface Item {
  id: number;
  title: string;
  description: string;
  categoryId: number | null;
  location: string;
  dateLostOrFound: string;
  imageUrl: string | null;
  type: ItemType;
  status: ItemStatus;
  rewardAmount: number;
  rewardStatus: RewardStatus;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface Claim {
  id: number;
  itemId: number;
  claimerId: number;
  message: string;
  claimStatus: ClaimStatus;
  createdAt: string;
  updatedAt: string;
  claimerName?: string;
  claimerEmail?: string;
  itemTitle?: string;
  itemType?: ItemType;
  itemStatus?: ItemStatus;
}

export interface Notification {
  id: number;
  user_id: number;
  message: string;
  is_read: number;
  created_at: string;
}

export interface AdminStats {
  users: number;
  items: number;
  openItems: number;
  returnedItems: number;
  claims: number;
  pendingClaims: number;
}
