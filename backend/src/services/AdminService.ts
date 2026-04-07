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

  listAllUsers(): Omit<User, 'password'>[] {
    return this.userRepo.findAll().map((u) => u.toPublic());
  }
  listAllItems(): Item[] { return this.itemRepo.findAll(); }
  listAllClaims(): Claim[] { return this.claimRepo.findAll(); }

  deleteItem(itemId: number): boolean {
    const item = this.itemRepo.findById(itemId);
    if (!item) throw ApiError.notFound('Item not found');
    return this.itemRepo.deleteById(itemId);
  }

  suspendUser(userId: number): Omit<User, 'password'> {
    const user = this.userRepo.findById(userId);
    if (!user) throw ApiError.notFound('User not found');
    if (user.isAdmin()) throw ApiError.forbidden('Cannot suspend an admin');
    const updated = this.userRepo.suspend(userId, true);
    bus.publish('user.suspended', { userId });
    return updated.toPublic();
  }

  reinstateUser(userId: number): Omit<User, 'password'> {
    const user = this.userRepo.findById(userId);
    if (!user) throw ApiError.notFound('User not found');
    return this.userRepo.suspend(userId, false).toPublic();
  }

  resolveDispute(claimId: number, resolution: ClaimStatus): Claim {
    if (!['accepted', 'rejected'].includes(resolution)) {
      throw ApiError.badRequest('Resolution must be accepted or rejected');
    }
    const claim = this.claimRepo.findById(claimId);
    if (!claim) throw ApiError.notFound('Claim not found');
    return this.claimRepo.updateStatus(claimId, resolution)!;
  }

  stats(): AdminStats {
    return {
      users: this.userRepo.count(),
      items: this.itemRepo.count(),
      openItems: this.itemRepo.count("status = 'open'"),
      returnedItems: this.itemRepo.count("status = 'returned'"),
      claims: this.claimRepo.count(),
      pendingClaims: this.claimRepo.count("claim_status = 'pending'")
    };
  }
}

export default new AdminService();
