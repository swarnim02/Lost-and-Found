import { Types } from 'mongoose';
import { BaseRepository } from './BaseRepository';
import { ClaimModel, ClaimDoc } from '../config/schema';
import { Claim } from '../models/Claim';
import { ClaimRow, ClaimStatus } from '../types/domain';

export interface ClaimWithJoins extends Claim {
  claimerName?: string;
  claimerEmail?: string;
  itemTitle?: string;
  itemType?: string;
  itemStatus?: string;
}

type PopulatedClaim = ClaimRow & {
  claimer?: { name: string; email: string };
  item?: { title: string; type: string; status: string };
};

class ClaimRepository extends BaseRepository<ClaimDoc, ClaimRow, Claim> {
  constructor() { super(ClaimModel); }

  protected mapRow(row: ClaimRow | null | undefined): Claim | null {
    return row ? new Claim(row) : null;
  }

  async create({ itemId, claimerId, message }: { itemId: string; claimerId: string; message: string }): Promise<Claim> {
    const doc = await this.collection.create({
      itemId: new Types.ObjectId(itemId),
      claimerId: new Types.ObjectId(claimerId),
      message
    });
    return this.mapRow(this.toRow(doc.toObject()))!;
  }

  async updateStatus(id: string, status: ClaimStatus): Promise<Claim | null> {
    const doc = await this.collection
      .findByIdAndUpdate(id, { $set: { claimStatus: status } }, { new: true })
      .lean()
      .exec();
    return this.mapRow(this.toRow(doc));
  }

  async findByItem(itemId: string): Promise<ClaimWithJoins[]> {
    if (!Types.ObjectId.isValid(itemId)) return [];
    const docs = await this.collection
      .find({ itemId: new Types.ObjectId(itemId) })
      .sort({ createdAt: -1 })
      .populate({ path: 'claimerId', select: 'name email' })
      .lean()
      .exec();
    return docs.map((d) => this.decorate(d, 'claim'));
  }

  async findByClaimer(claimerId: string): Promise<ClaimWithJoins[]> {
    if (!Types.ObjectId.isValid(claimerId)) return [];
    const docs = await this.collection
      .find({ claimerId: new Types.ObjectId(claimerId) })
      .sort({ createdAt: -1 })
      .populate({ path: 'itemId', select: 'title type status' })
      .lean()
      .exec();
    return docs.map((d) => this.decorate(d, 'item'));
  }

  /** All claims on items a given owner posted — owner's inbox. */
  async findForOwner(ownerId: string): Promise<ClaimWithJoins[]> {
    if (!Types.ObjectId.isValid(ownerId)) return [];
    const ownerObjectId = new Types.ObjectId(ownerId);
    const docs = await this.collection.aggregate([
      {
        $lookup: {
          from: 'items',
          localField: 'itemId',
          foreignField: '_id',
          as: 'item'
        }
      },
      { $unwind: '$item' },
      { $match: { 'item.createdBy': ownerObjectId } },
      {
        $lookup: {
          from: 'users',
          localField: 'claimerId',
          foreignField: '_id',
          as: 'claimer'
        }
      },
      { $unwind: '$claimer' },
      { $sort: { createdAt: -1 } }
    ]).exec();

    return docs.map((d) => {
      const row = this.toRow(d)!;
      const claim = new Claim(row) as ClaimWithJoins;
      claim.itemTitle = d.item?.title;
      claim.claimerName = d.claimer?.name;
      claim.claimerEmail = d.claimer?.email;
      return claim;
    });
  }

  async existsForUser(itemId: string, claimerId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(itemId) || !Types.ObjectId.isValid(claimerId)) return false;
    const exists = await this.collection.exists({
      itemId: new Types.ObjectId(itemId),
      claimerId: new Types.ObjectId(claimerId)
    });
    return Boolean(exists);
  }

  private decorate(raw: unknown, joinType: 'claim' | 'item'): ClaimWithJoins {
    const doc = raw as Record<string, unknown> & {
      claimerId?: unknown;
      itemId?: unknown;
    };

    const populatedClaimer = joinType === 'claim' && doc.claimerId && typeof doc.claimerId === 'object'
      ? doc.claimerId as { _id: Types.ObjectId; name: string; email: string }
      : null;
    const populatedItem = joinType === 'item' && doc.itemId && typeof doc.itemId === 'object'
      ? doc.itemId as { _id: Types.ObjectId; title: string; type: string; status: string }
      : null;

    const flat: Record<string, unknown> = { ...doc };
    flat.claimerId = populatedClaimer ? String(populatedClaimer._id) : String(doc.claimerId);
    flat.itemId = populatedItem ? String(populatedItem._id) : String(doc.itemId);
    const row = this.toRow(flat)!;
    const claim = new Claim(row) as ClaimWithJoins;
    if (populatedClaimer) {
      claim.claimerName = populatedClaimer.name;
      claim.claimerEmail = populatedClaimer.email;
    }
    if (populatedItem) {
      claim.itemTitle = populatedItem.title;
      claim.itemType = populatedItem.type;
      claim.itemStatus = populatedItem.status;
    }
    return claim;
  }
}

export default new ClaimRepository();
