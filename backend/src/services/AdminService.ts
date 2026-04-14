import userRepository from '../repositories/UserRepository';
import itemRepository from '../repositories/ItemRepository';
import claimRepository from '../repositories/ClaimRepository';
import bus from '../patterns/EventBus';
import { ApiError } from '../utils/ApiError';
import { Item } from '../models/Item';
import { Claim } from '../models/Claim';
import { User } from '../models/User';
import { ClaimStatus } from '../types/domain';

export interface AdminStats {
  users: number;
  items: number;
  openItems: number;
  returnedItems: number;
  claims: number;
  pendingClaims: number;
}

/**
 * AdminService — administrator moderation actions. Pulled out of the item
 * and user services so that elevated operations live behind one surface.
 */
export class AdminService {
  constructor(
    private readonly userRepo = userRepository,
    private readonly itemRepo = itemRepository,
    private readonly claimRepo = claimRepository
  ) {}

  async listAllUsers(): Promise<Omit<User, 'password'>[]> {
    const users = await this.userRepo.findAll();
    return users.map((u) => u.toPublic());
  }
  async listAllItems(): Promise<Item[]> { return this.itemRepo.findAll(); }
  async listAllClaims(): Promise<Claim[]> { return this.claimRepo.findAll(); }

  async deleteItem(itemId: string): Promise<boolean> {
    const item = await this.itemRepo.findById(itemId);
    if (!item) throw ApiError.notFound('Item not found');
    return this.itemRepo.deleteById(itemId);
  }

  async suspendUser(userId: string): Promise<Omit<User, 'password'>> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw ApiError.notFound('User not found');
    if (user.isAdmin()) throw ApiError.forbidden('Cannot suspend an admin');
    const updated = await this.userRepo.suspend(userId, true);
    bus.publish('user.suspended', { userId });
    return updated.toPublic();
  }

  async reinstateUser(userId: string): Promise<Omit<User, 'password'>> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw ApiError.notFound('User not found');
    const updated = await this.userRepo.suspend(userId, false);
    return updated.toPublic();
  }

  async resolveDispute(claimId: string, resolution: ClaimStatus): Promise<Claim> {
    if (!['accepted', 'rejected'].includes(resolution)) {
      throw ApiError.badRequest('Resolution must be accepted or rejected');
    }
    const claim = await this.claimRepo.findById(claimId);
    if (!claim) throw ApiError.notFound('Claim not found');
    return (await this.claimRepo.updateStatus(claimId, resolution))!;
  }

  async stats(): Promise<AdminStats> {
    const [users, items, openItems, returnedItems, claims, pendingClaims] = await Promise.all([
      this.userRepo.count(),
      this.itemRepo.count(),
      this.itemRepo.count({ status: 'open' }),
      this.itemRepo.count({ status: 'returned' }),
      this.claimRepo.count(),
      this.claimRepo.count({ claimStatus: 'pending' })
    ]);
    return { users, items, openItems, returnedItems, claims, pendingClaims };
  }
}

export default new AdminService();
