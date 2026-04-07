import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import userRepository from '../repositories/UserRepository';
import { ApiError } from '../utils/ApiError';
import { requireFields, validEmail, strongPassword } from '../utils/validators';
import { User } from '../models/User';
import { JwtPayload, LoginPayload, RegisterPayload } from '../types/domain';

export interface AuthResult {
  user: Omit<User, 'password'>;
  token: string;
}

/**
 * AuthService — authentication and user identity management.
 *
 * Separates credential hashing and token minting from controller-level
 * request parsing. Controllers call into this service rather than importing
 * bcrypt/jwt directly, so the auth story can be swapped (e.g. to sessions,
 * or OAuth) without touching routes.
 */
export class AuthService {
  private readonly rounds: number;
  private readonly secret: string;
  private readonly expiresIn: string;

  constructor(private readonly repo = userRepository) {
    this.rounds = Number(process.env.BCRYPT_ROUNDS || 10);
    this.secret = process.env.JWT_SECRET || 'dev_secret_change_me';
    this.expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  }

  async register(payload: RegisterPayload): Promise<AuthResult> {
    requireFields(payload, ['name', 'email', 'password']);
    validEmail(payload.email);
    strongPassword(payload.password);

    if (this.repo.findByEmail(payload.email)) throw ApiError.conflict('Email already registered');

    const hash = await bcrypt.hash(payload.password, this.rounds);
    const user = this.repo.create({
      name: payload.name,
      email: payload.email,
      password: hash,
      phone: payload.phone,
      role: 'user'
    });
    return { user: user.toPublic(), token: this.sign(user) };
  }

  async login(payload: LoginPayload): Promise<AuthResult> {
    requireFields(payload, ['email', 'password']);
    const user = this.repo.findByEmail(payload.email);
    if (!user) throw ApiError.unauthorized('Invalid credentials');
    if (user.isSuspended) throw ApiError.forbidden('Account suspended');

    const ok = await bcrypt.compare(payload.password, user.password);
    if (!ok) throw ApiError.unauthorized('Invalid credentials');
    return { user: user.toPublic(), token: this.sign(user) };
  }

  verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.secret) as JwtPayload;
    } catch {
      throw ApiError.unauthorized('Invalid or expired token');
    }
  }

  private sign(user: User): string {
    const options: SignOptions = { expiresIn: this.expiresIn as SignOptions['expiresIn'] };
    return jwt.sign({ id: user.id, role: user.role, email: user.email }, this.secret, options);
  }
}

export default new AuthService();
