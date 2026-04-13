import { FilterQuery, Model, Types } from 'mongoose';

/**
 * BaseRepository — abstract parent for all collection-specific repositories.
 *
 * Responsibility: generic CRUD so concrete repositories only write
 * collection-specific queries. Subclasses override `mapRow` to return domain
 * objects instead of raw Mongoose lean results.
 */
export abstract class BaseRepository<TDoc, TRow extends { id: string }, TModel> {
  protected readonly collection: Model<TDoc>;

  constructor(collection: Model<TDoc>) {
    this.collection = collection;
  }

  protected abstract mapRow(row: TRow | null | undefined): TModel | null;

  protected toRow(doc: unknown): TRow | null {
    if (!doc) return null;
    const raw = doc as Record<string, unknown>;
    const out: Record<string, unknown> = { ...raw };
    if (raw._id) {
      out.id = String(raw._id);
      delete out._id;
    }
    if ('__v' in out) delete out.__v;
    if (raw.createdAt instanceof Date) out.createdAt = raw.createdAt.toISOString();
    if (raw.updatedAt instanceof Date) out.updatedAt = raw.updatedAt.toISOString();
    for (const key of Object.keys(out)) {
      if (out[key] instanceof Types.ObjectId) out[key] = String(out[key]);
    }
    return out as unknown as TRow;
  }

  async findById(id: string): Promise<TModel | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.collection.findById(id).lean().exec();
    return this.mapRow(this.toRow(doc));
  }

  async findAll(sort: Record<string, 1 | -1> = { createdAt: -1 }): Promise<TModel[]> {
    const docs = await this.collection.find().sort(sort).lean().exec();
    return docs
      .map((d) => this.mapRow(this.toRow(d)))
      .filter((m): m is TModel => m !== null);
  }

  async deleteById(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const res = await this.collection.deleteOne({ _id: new Types.ObjectId(id) }).exec();
    return (res.deletedCount ?? 0) > 0;
  }

  async count(filter: FilterQuery<TDoc> = {}): Promise<number> {
    return this.collection.countDocuments(filter).exec();
  }
}
