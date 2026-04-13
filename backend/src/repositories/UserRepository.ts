import { BaseRepository } from './BaseRepository';
import { UserModel, UserDoc } from '../config/schema';
import { User } from '../models/User';
import { UserRole, UserRow } from '../types/domain';

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: UserRole;
}

class UserRepository extends BaseRepository<UserDoc, UserRow, User> {
  constructor() { super(UserModel); }

  protected mapRow(row: UserRow | null | undefined): User | null {
    return row ? new User(row) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const doc = await this.collection.findOne({ email: email.toLowerCase() }).lean().exec();
    return this.mapRow(this.toRow(doc));
  }

  async create({ name, email, password, phone, role = 'user' }: CreateUserInput): Promise<User> {
    const doc = await this.collection.create({
      name, email, password, phone: phone ?? null, role
    });
    return this.mapRow(this.toRow(doc.toObject()))!;
  }

  async updateProfile(id: string, fields: { name?: string; phone?: string }): Promise<User> {
    const update: Record<string, unknown> = {};
    if (fields.name !== undefined) update.name = fields.name;
    if (fields.phone !== undefined) update.phone = fields.phone;
    const doc = await this.collection
      .findByIdAndUpdate(id, { $set: update }, { new: true })
      .lean()
      .exec();
    return this.mapRow(this.toRow(doc))!;
  }

  async suspend(id: string, suspended = true): Promise<User> {
    const doc = await this.collection
      .findByIdAndUpdate(id, { $set: { isSuspended: suspended } }, { new: true })
      .lean()
      .exec();
    return this.mapRow(this.toRow(doc))!;
  }
}

export default new UserRepository();
