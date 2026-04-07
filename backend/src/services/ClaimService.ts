import claimRepository, { ClaimWithJoins } from '../repositories/ClaimRepository';
import itemRepository from '../repositories/ItemRepository';
import userRepository from '../repositories/UserRepository';
import bus from '../patterns/EventBus';
import { ApiError } from '../utils/ApiError';
import { requireFields } from '../utils/validators';
import { Claim } from '../models/Claim';

export interface SubmitClaimInput {
  itemId: number;
  message: string;
}

/**
 * ClaimService — orchestrates the claim workflow, including the side effects
 * of accepting a claim (update item status, update reward status, notify
 * both parties via the event bus).
 */
export class ClaimService {
  constructor(
    private readonly claimRepo = claimRepository,
    private readonly itemRepo = itemRepository,
    private readonly userRepo = userRepository
  ) {}

  submit(claimerId: number, input: SubmitClaimInput): Claim {
    requireFields(input, ['itemId', 'message']);

    const item = this.itemRepo.findById(input.itemId);
    if (!item) throw ApiError.notFound('Item not found');
    if (item.createdBy === claimerId) throw ApiError.badRequest('Cannot claim your own item');
    if (!item.isOpen()) throw ApiError.conflict(`Item is not open (status: ${item.status})`);
    if (this.claimRepo.existsForUser(input.itemId, claimerId)) throw ApiError.conflict('You already claimed this item');

    const claim = this.claimRepo.create({ itemId: input.itemId, claimerId, message: input.message });
    const claimer = this.userRepo.findById(claimerId);

    bus.publish('claim.submitted', {
      ownerId: item.createdBy,
      itemTitle: item.title,
      claimerName: claimer?.name || 'Someone'
    });

    return claim;
  }

  accept(claimId: number, ownerId: number): Claim {
    const claim = this.requireOwnerOfClaim(claimId, ownerId);
    if (!claim.isPending()) throw ApiError.conflict(`Claim already ${claim.claimStatus}`);

    const item = this.itemRepo.findById(claim.itemId)!;
    this.claimRepo.updateStatus(claim.id, 'accepted');
    this.itemRepo.updateStatus(item.id, 'returned');
    if (item.rewardAmount > 0) {
      this.itemRepo.updateRewardStatus(item.id, 'completed');
      bus.publish('reward.completed', {
        claimerId: claim.claimerId,
        itemTitle: item.title,
        amount: item.rewardAmount
      });
    }

    bus.publish('claim.accepted', { claimerId: claim.claimerId, itemTitle: item.title });
    return this.claimRepo.findById(claimId)!;
  }

  reject(claimId: number, ownerId: number): Claim {
    const claim = this.requireOwnerOfClaim(claimId, ownerId);
    if (!claim.isPending()) throw ApiError.conflict(`Claim already ${claim.claimStatus}`);
    const item = this.itemRepo.findById(claim.itemId)!;
    this.claimRepo.updateStatus(claim.id, 'rejected');
    bus.publish('claim.rejected', { claimerId: claim.claimerId, itemTitle: item.title });
    return this.claimRepo.findById(claimId)!;
  }

  listByItem(itemId: number, requesterId: number): ClaimWithJoins[] {
    const item = this.itemRepo.findById(itemId);
    if (!item) throw ApiError.notFound('Item not found');
    if (item.createdBy !== requesterId) throw ApiError.forbidden('Only the owner can view claims');
    return this.claimRepo.findByItem(itemId);
  }

  listByClaimer(userId: number): ClaimWithJoins[] { return this.claimRepo.findByClaimer(userId); }
  listForOwner(userId: number): ClaimWithJoins[] { return this.claimRepo.findForOwner(userId); }

  private requireOwnerOfClaim(claimId: number, ownerId: number): Claim {
    const claim = this.claimRepo.findById(claimId);
    if (!claim) throw ApiError.notFound('Claim not found');
    const item = this.itemRepo.findById(claim.itemId);
    if (!item || item.createdBy !== ownerId) throw ApiError.forbidden('Only the item owner can act on this claim');
    return claim;
  }
}

export default new ClaimService();
