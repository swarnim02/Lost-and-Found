import { Request, Response, NextFunction } from 'express';
import authService from '../services/AuthService';
import userRepository from '../repositories/UserRepository';
import { ApiError } from '../utils/ApiError';

export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return next(ApiError.unauthorized('Missing bearer token'));

  try {
    const payload = authService.verifyToken(token);
    const user = await userRepository.findById(payload.id);
    if (!user) return next(ApiError.unauthorized('User no longer exists'));
    if (user.isSuspended) return next(ApiError.forbidden('Account suspended'));
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user?.isAdmin()) return next(ApiError.forbidden('Admin only'));
  next();
}
