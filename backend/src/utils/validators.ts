import { ApiError } from './ApiError';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function requireFields<T extends object>(obj: T, fields: (keyof T)[]): void {
  const missing = fields.filter((f) => {
    const v = obj[f];
    return v === undefined || v === null || v === '';
  });
  if (missing.length) throw ApiError.badRequest(`Missing fields: ${missing.join(', ')}`);
}

export function validEmail(email: string): void {
  if (!EMAIL_RE.test(email)) throw ApiError.badRequest('Invalid email format');
}

export function strongPassword(password: string): void {
  if (!password || password.length < 6) throw ApiError.badRequest('Password must be at least 6 characters');
}
