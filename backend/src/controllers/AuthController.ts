import { Request, Response, NextFunction } from 'express';
import authService from '../services/AuthService';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.register(req.body);
      res.status(201).json(result);
    } catch (err) { next(err); }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.login(req.body);
      res.json(result);
    } catch (err) { next(err); }
  }

  me(req: Request, res: Response): void {
    res.json({ user: req.user!.toPublic() });
  }
}

export default new AuthController();
