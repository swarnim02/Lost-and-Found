import claimRepository, { ClaimWithJoins } from '../repositories/ClaimRepository';
import itemRepository from '../repositories/ItemRepository';
import userRepository from '../repositories/UserRepository';
import bus from '../patterns/EventBus';
import { ApiError } from '../utils/ApiError';
import { requireFields } from '../utils/validators';
import { Claim } from '../models/Claim';

export interface SubmitClaimInput {
  itemId: string;
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

  async submit(claimerId: string, input: SubmitClaimInput): Promise<Claim> {
    requireFields(input, ['itemId', 'message']);

    const item = await this.itemRepo.findById(input.itemId);
    if (!item) throw ApiError.notFound('Item not found');
    if (item.createdBy === claimerId) throw ApiError.badRequest('Cannot claim your own item');
    if (!item.isOpen()) throw ApiError.conflict(`Item is not open (status: ${item.status})`);
    if (await this.claimRepo.existsForUser(input.itemId, claimerId)) throw ApiError.conflict('You already claimed this item');

    const claim = await this.claimRepo.create({ itemId: input.itemId, claimerId, message: input.message });
    const claimer = await this.userRepo.findById(claimerId);

    bus.publish('claim.submitted', {
      ownerId: item.createdBy,
      itemTitle: item.title,
      claimerName: claimer?.name || 'Someone'
    });

    return claim;
  }

  async accept(claimId: string, ownerId: string): Promise<Claim> {
    const claim = await this.requireOwnerOfClaim(claimId, ownerId);
    if (!claim.isPending()) throw ApiError.conflict(`Claim already ${claim.claimStatus}`);

    const item = (await this.itemRepo.findById(claim.itemId))!;
    await this.claimRepo.updateStatus(claim.id, 'accepted');
    await this.itemRepo.updateStatus(item.id, 'returned');
    if (item.rewardAmount > 0) {
      await this.itemRepo.updateRewardStatus(item.id, 'completed');
      bus.publish('reward.completed', {
        claimerId: claim.claimerId,
        itemTitle: item.title,
        amount: item.rewardAmount
      });
    }

    bus.publish('claim.accepted', { claimerId: claim.claimerId, itemTitle: item.title });
    return (await this.claimRepo.findById(claimId))!;
  }

  async reject(claimId: string, ownerId: string): Promise<Claim> {
    const claim = await this.requireOwnerOfClaim(claimId, ownerId);
    if (!claim.isPending()) throw ApiError.conflict(`Claim already ${claim.claimStatus}`);
    const item = (await this.itemRepo.findById(claim.itemId))!;
    await this.claimRepo.updateStatus(claim.id, 'rejected');
    bus.publish('claim.rejected', { claimerId: claim.claimerId, itemTitle: item.title });
    return (await this.claimRepo.findById(claimId))!;
  }

  async listByItem(itemId: string, requesterId: string): Promise<ClaimWithJoins[]> {
    const item = await this.itemRepo.findById(itemId);
    if (!item) throw ApiError.notFound('Item not found');
    if (item.createdBy !== requesterId) throw ApiError.forbidden('Only the owner can view claims');
    return this.claimRepo.findByItem(itemId);
  }

  async listByClaimer(userId: string): Promise<ClaimWithJoins[]> { return this.claimRepo.findByClaimer(userId); }
  async listForOwner(userId: string): Promise<ClaimWithJoins[]> { return this.claimRepo.findForOwner(userId); }

  private async requireOwnerOfClaim(claimId: string, ownerId: string): Promise<Claim> {
    const claim = await this.claimRepo.findById(claimId);
    if (!claim) throw ApiError.notFound('Claim not found');
    const item = await this.itemRepo.findById(claim.itemId);
    if (!item || item.createdBy !== ownerId) throw ApiError.forbidden('Only the item owner can act on this claim');
    return claim;
  }
}

export default new ClaimService();
