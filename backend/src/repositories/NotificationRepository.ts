import { Types } from 'mongoose';
import { BaseRepository } from './BaseRepository';
import { NotificationModel, NotificationDoc } from '../config/schema';
import { NotificationRow } from '../types/domain';

class NotificationRepository extends BaseRepository<NotificationDoc, NotificationRow, NotificationRow> {
  constructor() { super(NotificationModel); }

  protected mapRow(row: NotificationRow | null | undefined): NotificationRow | null {
    return row ?? null;
  }

  async create(userId: string, message: string): Promise<NotificationRow> {
    const doc = await this.collection.create({
      userId: new Types.ObjectId(userId),
      message
    });
    return this.mapRow(this.toRow(doc.toObject()))!;
  }

  async findByUser(userId: string): Promise<NotificationRow[]> {
    if (!Types.ObjectId.isValid(userId)) return [];
    const docs = await this.collection
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()
      .exec();
    return docs
      .map((d) => this.mapRow(this.toRow(d)))
      .filter((m): m is NotificationRow => m !== null);
  }

  async markRead(id: string, userId: string): Promise<void> {
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(userId)) return;
    await this.collection.updateOne(
      { _id: new Types.ObjectId(id), userId: new Types.ObjectId(userId) },
      { $set: { isRead: true } }
    );
  }
}

export default new NotificationRepository();
