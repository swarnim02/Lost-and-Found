import { api } from './client';
import type { AdminStats, Category, Claim, Item, Notification, User } from '../types/models';

export interface AuthResponse {
  user: User;
  token: string;
}

export const authApi = {
  register: (body: { name: string; email: string; password: string; phone?: string }) =>
    api.post<AuthResponse>('/api/auth/register', body),
  login: (body: { email: string; password: string }) =>
    api.post<AuthResponse>('/api/auth/login', body),
  me: () => api.get<{ user: User }>('/api/auth/me')
};

export interface ItemPayload {
  title: string;
  description: string;
  categoryId?: number | null;
  location: string;
  dateLostOrFound: string;
  imageUrl?: string | null;
  rewardAmount?: number;
}

export interface ItemSearchQuery {
  keyword?: string;
  categoryId?: number;
  location?: string;
  status?: string;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const itemApi = {
  categories: () => api.get<Category[]>('/api/items/categories'),
  search: (q: ItemSearchQuery) => {
    const qs = new URLSearchParams();
    Object.entries(q).forEach(([k, v]) => { if (v !== undefined && v !== '') qs.set(k, String(v)); });
    return api.get<Item[]>(`/api/items/search?${qs.toString()}`);
  },
  byId: (id: number) => api.get<Item>(`/api/items/${id}`),
  mine: () => api.get<Item[]>('/api/items/mine'),
  createLost: (payload: ItemPayload) => api.post<Item>('/api/items/lost', payload),
  createFound: (payload: ItemPayload) => api.post<Item>('/api/items/found', payload),
  update: (id: number, payload: Partial<ItemPayload> & { status?: string }) =>
    api.put<Item>(`/api/items/${id}`, payload),
  remove: (id: number) => api.del<void>(`/api/items/${id}`),
  declareReward: (id: number, rewardAmount: number) =>
    api.post<Item>(`/api/items/${id}/reward`, { rewardAmount }),
  completeReward: (id: number) => api.post<Item>(`/api/items/${id}/reward/complete`)
};

export const claimApi = {
  submit: (itemId: number, message: string) => api.post<Claim>('/api/claims', { itemId, message }),
  accept: (id: number) => api.put<Claim>(`/api/claims/${id}/accept`),
  reject: (id: number) => api.put<Claim>(`/api/claims/${id}/reject`),
  byItem: (itemId: number) => api.get<Claim[]>(`/api/claims/item/${itemId}`),
  mine: () => api.get<Claim[]>('/api/claims/my-claims'),
  inbox: () => api.get<Claim[]>('/api/claims/my-inbox'),
  notifications: () => api.get<Notification[]>('/api/claims/notifications')
};

export const adminApi = {
  stats: () => api.get<AdminStats>('/api/admin/stats'),
  users: () => api.get<User[]>('/api/admin/users'),
  items: () => api.get<Item[]>('/api/admin/items'),
  claims: () => api.get<Claim[]>('/api/admin/claims'),
  deleteItem: (id: number) => api.del<void>(`/api/admin/items/${id}`),
  suspend: (id: number) => api.put<User>(`/api/admin/users/${id}/suspend`),
  reinstate: (id: number) => api.put<User>(`/api/admin/users/${id}/reinstate`),
  resolveClaim: (id: number, resolution: 'accepted' | 'rejected') =>
    api.put<Claim>(`/api/admin/claims/${id}/resolve`, { resolution })
};
