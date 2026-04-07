import itemRepository from '../repositories/ItemRepository';
import { ApiError } from '../utils/ApiError';
import { Item } from '../models/Item';
import { RewardStatus } from '../types/domain';

/**
 * RewardService — narrow facade over the reward-lifecycle transitions on
 * an item. States: not_declared → pending → completed.
 */
export class RewardService {
  constructor(private readonly repo = itemRepository) {}

  declare(itemId: number, userId: number, amount: number): Item {
    const item = this.repo.findById(itemId);
    if (!item) throw ApiError.notFound('Item not found');
    if (item.createdBy !== userId) throw ApiError.forbidden('Not your item');
    if (item.type !== 'lost') throw ApiError.badRequest('Rewards apply only to lost items');
    if (!(amount > 0)) throw ApiError.badRequest('Reward amount must be positive');
    return this.repo.updateRewardStatus(itemId, 'pending', amount)!;
  }

  complete(itemId: number, userId: number): Item {
    const item = this.repo.findById(itemId);
    if (!item) throw ApiError.notFound('Item not found');
    if (item.createdBy !== userId) throw ApiError.forbidden('Not your item');
    if (item.rewardStatus !== 'pending') throw ApiError.conflict(`Reward is ${item.rewardStatus}`);
    return this.repo.updateRewardStatus(itemId, 'completed')!;
  }

  info(itemId: number): { amount: number; status: RewardStatus } {
    const item = this.repo.findById(itemId);
    if (!item) throw ApiError.notFound('Item not found');
    return { amount: item.rewardAmount, status: item.rewardStatus };
  }
}

export default new RewardService();
