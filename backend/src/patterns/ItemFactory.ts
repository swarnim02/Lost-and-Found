import { LostItem, FoundItem, Item } from '../models/Item';
import { ItemPayload, ItemType } from '../types/domain';

/**
 * ItemFactory — Factory Method pattern.
 *
 * Callers ask for an item of a given kind and receive a correctly configured
 * subclass. Keeps construction rules (e.g. found items never carry a reward)
 * in one place rather than scattered across controllers.
 */
export class ItemFactory {
  static create(kind: ItemType, payload: ItemPayload): Item {
    const base = {
      title: payload.title,
      description: payload.description,
      category_id: payload.categoryId ?? null,
      location: payload.location,
      date_lost_or_found: payload.dateLostOrFound,
      image_url: payload.imageUrl ?? null,
      created_by: payload.createdBy
    };

    if (kind === 'lost') {
      const amount = payload.rewardAmount ?? 0;
      return new LostItem({
        ...base,
        reward_amount: amount,
        reward_status: amount > 0 ? 'pending' : 'not_declared'
      });
    }
    if (kind === 'found') {
      return new FoundItem({ ...base, reward_amount: 0, reward_status: 'not_declared' });
    }
    throw new Error(`Unknown item kind: ${kind}`);
  }
}
