export type UserRole = 'user' | 'admin';
export type ItemType = 'lost' | 'found';
export type ItemStatus = 'open' | 'claimed' | 'returned' | 'closed';
export type RewardStatus = 'not_declared' | 'pending' | 'completed';
export type ClaimStatus = 'pending' | 'accepted' | 'rejected';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  isSuspended: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
}

export interface Item {
  id: string;
  title: string;
  description: string;
  categoryId: string | null;
  location: string;
  dateLostOrFound: string;
  imageUrl: string | null;
  type: ItemType;
  status: ItemStatus;
  rewardAmount: number;
  rewardStatus: RewardStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Claim {
  id: string;
  itemId: string;
  claimerId: string;
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
  id: string;
  userId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface AdminStats {
  users: number;
  items: number;
  openItems: number;
  returnedItems: number;
  claims: number;
  pendingClaims: number;
}
