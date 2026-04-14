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

  async declare(itemId: string, userId: string, amount: number): Promise<Item> {
    const item = await this.repo.findById(itemId);
    if (!item) throw ApiError.notFound('Item not found');
    if (item.createdBy !== userId) throw ApiError.forbidden('Not your item');
    if (item.type !== 'lost') throw ApiError.badRequest('Rewards apply only to lost items');
    if (!(amount > 0)) throw ApiError.badRequest('Reward amount must be positive');
    return (await this.repo.updateRewardStatus(itemId, 'pending', amount))!;
  }

  async complete(itemId: string, userId: string): Promise<Item> {
    const item = await this.repo.findById(itemId);
    if (!item) throw ApiError.notFound('Item not found');
    if (item.createdBy !== userId) throw ApiError.forbidden('Not your item');
    if (item.rewardStatus !== 'pending') throw ApiError.conflict(`Reward is ${item.rewardStatus}`);
    return (await this.repo.updateRewardStatus(itemId, 'completed'))!;
  }

  async info(itemId: string): Promise<{ amount: number; status: RewardStatus }> {
    const item = await this.repo.findById(itemId);
    if (!item) throw ApiError.notFound('Item not found');
    return { amount: item.rewardAmount, status: item.rewardStatus };
  }
}

export default new RewardService();
