import { UserRow, UserRole } from '../types/domain';

/**
 * User — domain object mirroring the `users` table.
 *
 * Encapsulation: the password hash is filtered out by toPublic() before the
 * object is ever sent to a client. Polymorphism: Admin extends User and
 * exposes moderation capabilities via isAdmin()/canModerate().
 */
export class User {
  readonly id: number;
  name: string;
  email: string;
  password: string;
  phone: string | null;
  role: UserRole;
  isSuspended: boolean;
  createdAt: string;
  updatedAt: string;

  constructor(row: UserRow) {
    this.id = row.id;
    this.name = row.name;
    this.email = row.email;
    this.password = row.password;
    this.phone = row.phone;
    this.role = row.role;
    this.isSuspended = Boolean(row.is_suspended);
    this.createdAt = row.created_at;
    this.updatedAt = row.updated_at;
  }

  isAdmin(): boolean { return this.role === 'admin'; }
  canModerate(): boolean { return this.isAdmin() && !this.isSuspended; }

  toPublic(): Omit<User, 'password'> {
    const { password, ...safe } = this;
    return safe as Omit<User, 'password'>;
  }
}
