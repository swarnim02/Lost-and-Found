import { Types } from 'mongoose';
import { BaseRepository } from './BaseRepository';
import { ItemModel, ItemDoc } from '../config/schema';
import { Item } from '../models/Item';
import { ItemRow, ItemStatus, RewardStatus } from '../types/domain';
import { SearchStrategy } from '../patterns/SearchStrategy';

export interface UpdateItemFields {
  title?: string;
  description?: string;
  categoryId?: string | null;
  location?: string;
  dateLostOrFound?: string;
  imageUrl?: string | null;
  status?: ItemStatus;
}

class ItemRepository extends BaseRepository<ItemDoc, ItemRow, Item> {
  constructor() { super(ItemModel); }

  protected mapRow(row: ItemRow | null | undefined): Item | null {
    return Item.fromRow(row ?? undefined);
  }

  async create(item: Item): Promise<Item> {
    const doc = await this.collection.create({
      title: item.title,
      description: item.description,
      categoryId: item.categoryId ? new Types.ObjectId(item.categoryId) : null,
      location: item.location,
      dateLostOrFound: item.dateLostOrFound,
      imageUrl: item.imageUrl,
      type: item.type,
      status: item.status,
      rewardAmount: item.rewardAmount,
      rewardStatus: item.rewardStatus,
      createdBy: new Types.ObjectId(item.createdBy)
    });
    return this.mapRow(this.toRow(doc.toObject()))!;
  }

  async update(id: string, fields: UpdateItemFields): Promise<Item | null> {
    const update: Record<string, unknown> = {};
    if (fields.title !== undefined) update.title = fields.title;
    if (fields.description !== undefined) update.description = fields.description;
    if (fields.categoryId !== undefined) {
      update.categoryId = fields.categoryId && Types.ObjectId.isValid(fields.categoryId)
        ? new Types.ObjectId(fields.categoryId)
        : null;
    }
    if (fields.location !== undefined) update.location = fields.location;
    if (fields.dateLostOrFound !== undefined) update.dateLostOrFound = fields.dateLostOrFound;
    if (fields.imageUrl !== undefined) update.imageUrl = fields.imageUrl;
    if (fields.status !== undefined) update.status = fields.status;
    if (!Object.keys(update).length) return this.findById(id);

    const doc = await this.collection
      .findByIdAndUpdate(id, { $set: update }, { new: true })
      .lean()
      .exec();
    return this.mapRow(this.toRow(doc));
  }

  async updateStatus(id: string, status: ItemStatus): Promise<Item | null> {
    const doc = await this.collection
      .findByIdAndUpdate(id, { $set: { status } }, { new: true })
      .lean()
      .exec();
    return this.mapRow(this.toRow(doc));
  }

  async updateRewardStatus(id: string, rewardStatus: RewardStatus, rewardAmount?: number): Promise<Item | null> {
    const update: Record<string, unknown> = { rewardStatus };
    if (rewardAmount !== undefined) update.rewardAmount = rewardAmount;
    const doc = await this.collection
      .findByIdAndUpdate(id, { $set: update }, { new: true })
      .lean()
      .exec();
    return this.mapRow(this.toRow(doc));
  }

  async findByUser(userId: string): Promise<Item[]> {
    if (!Types.ObjectId.isValid(userId)) return [];
    const docs = await this.collection
      .find({ createdBy: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    return docs.map((d) => this.mapRow(this.toRow(d))).filter((m): m is Item => m !== null);
  }

  /**
   * Composes a list of SearchStrategy objects into one Mongo filter.
   * Each strategy contributes one AND-merged fragment.
   */
  async searchWithStrategies(strategies: SearchStrategy[] = []): Promise<Item[]> {
    const filter: Record<string, unknown> = {};
    for (const strat of strategies) {
      Object.assign(filter, strat.apply());
    }
    const docs = await this.collection.find(filter).sort({ createdAt: -1 }).lean().exec();
    return docs.map((d) => this.mapRow(this.toRow(d))).filter((m): m is Item => m !== null);
  }
}

export default new ItemRepository();
