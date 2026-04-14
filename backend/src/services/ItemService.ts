import itemRepository, { UpdateItemFields } from '../repositories/ItemRepository';
import { ItemFactory } from '../patterns/ItemFactory';
import { buildStrategies, SearchQuery } from '../patterns/SearchStrategy';
import { ApiError } from '../utils/ApiError';
import { requireFields } from '../utils/validators';
import { Item } from '../models/Item';
import { ItemPayload } from '../types/domain';

/**
 * ItemService — business rules around lost and found items.
 *
 * Controllers hand it request-shaped input; this layer is responsible for
 * enforcing invariants (status transitions, ownership checks, reward logic)
 * before persistence.
 */
export class ItemService {
  constructor(private readonly repo = itemRepository) {}

  async createLost(userId: string, payload: Omit<ItemPayload, 'createdBy'>): Promise<Item> {
    requireFields(payload, ['title', 'description', 'location', 'dateLostOrFound']);
    const item = ItemFactory.create('lost', { ...payload, createdBy: userId });
    return this.repo.create(item);
  }

  async createFound(userId: string, payload: Omit<ItemPayload, 'createdBy'>): Promise<Item> {
    requireFields(payload, ['title', 'description', 'location', 'dateLostOrFound']);
    const item = ItemFactory.create('found', { ...payload, createdBy: userId });
    return this.repo.create(item);
  }

  async update(id: string, userId: string, payload: UpdateItemFields): Promise<Item> {
    const item = await this.requireOwned(id, userId);
    if (payload.status && ![...item.allowedNextStatuses(), item.status].includes(payload.status)) {
      throw ApiError.badRequest(`Illegal status transition ${item.status} → ${payload.status}`);
    }
    return (await this.repo.update(id, payload))!;
  }

  async delete(id: string, userId: string, isAdmin = false): Promise<boolean> {
    const item = await this.repo.findById(id);
    if (!item) throw ApiError.notFound('Item not found');
    if (!isAdmin && item.createdBy !== userId) throw ApiError.forbidden('Not your item');
    return this.repo.deleteById(id);
  }

  async getById(id: string): Promise<Item> {
    const item = await this.repo.findById(id);
    if (!item) throw ApiError.notFound('Item not found');
    return item;
  }

  async search(query: SearchQuery): Promise<Item[]> {
    const strategies = buildStrategies(query);
    return this.repo.searchWithStrategies(strategies);
  }

  async listForUser(userId: string): Promise<Item[]> { return this.repo.findByUser(userId); }

  private async requireOwned(id: string, userId: string): Promise<Item> {
    const item = await this.repo.findById(id);
    if (!item) throw ApiError.notFound('Item not found');
    if (item.createdBy !== userId) throw ApiError.forbidden('Not your item');
    return item;
  }
}

export default new ItemService();
