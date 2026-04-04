import { BaseRepository } from './BaseRepository';
import { User } from '../models/User';
import { UserRole, UserRow } from '../types/domain';

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: UserRole;
}

class UserRepository extends BaseRepository<UserRow, User> {
  constructor() { super('users'); }

  protected mapRow(row: UserRow | undefined): User | null {
    return row ? new User(row) : null;
  }

  findByEmail(email: string): User | null {
    const row = this.db.prepare('SELECT * FROM users WHERE email = ?').get(email) as UserRow | undefined;
    return this.mapRow(row);
  }

  create({ name, email, password, phone, role = 'user' }: CreateUserInput): User {
    const info = this.db.prepare(
      `INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)`
    ).run(name, email, password, phone ?? null, role);
    return this.findById(Number(info.lastInsertRowid))!;
  }

  updateProfile(id: number, fields: { name?: string; phone?: string }): User {
    this.db.prepare(
      `UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone),
       updated_at = CURRENT_TIMESTAMP WHERE id = ?`
    ).run(fields.name ?? null, fields.phone ?? null, id);
    return this.findById(id)!;
  }

  suspend(id: number, suspended = true): User {
    this.db.prepare(
      `UPDATE users SET is_suspended = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
    ).run(suspended ? 1 : 0, id);
    return this.findById(id)!;
  }
}

export default new UserRepository();
