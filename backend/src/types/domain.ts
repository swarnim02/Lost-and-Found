export type UserRole = 'user' | 'admin';
export type ItemType = 'lost' | 'found';
export type ItemStatus = 'open' | 'claimed' | 'returned' | 'closed';
export type RewardStatus = 'not_declared' | 'pending' | 'completed';
export type ClaimStatus = 'pending' | 'accepted' | 'rejected';

export interface UserRow {
  id: number;
  name: string;
  email: string;
  password: string;
  phone: string | null;
  role: UserRole;
  is_suspended: number;
  created_at: string;
  updated_at: string;
}

export interface CategoryRow {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
}

export interface ItemRow {
  id: number;
  title: string;
  description: string;
  category_id: number | null;
  location: string;
  date_lost_or_found: string;
  image_url: string | null;
  type: ItemType;
  status: ItemStatus;
  reward_amount: number;
  reward_status: RewardStatus;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface ClaimRow {
  id: number;
  item_id: number;
  claimer_id: number;
  message: string;
  claim_status: ClaimStatus;
  created_at: string;
  updated_at: string;
}

export interface NotificationRow {
  id: number;
  user_id: number;
  message: string;
  is_read: number;
  created_at: string;
}

export interface ItemPayload {
  title: string;
  description: string;
  categoryId?: number | null;
  location: string;
  dateLostOrFound: string;
  imageUrl?: string | null;
  rewardAmount?: number;
  createdBy: number;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface JwtPayload {
  id: number;
  role: UserRole;
  email: string;
}
