import { Request, Response, NextFunction } from 'express';
import claimService from '../services/ClaimService';
import notificationService from '../services/NotificationService';

export class ClaimController {
  async submit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payload = { itemId: String(req.body.itemId ?? ''), message: String(req.body.message ?? '') };
      res.status(201).json(await claimService.submit(req.user!.id, payload));
    } catch (err) { next(err); }
  }

  async accept(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json(await claimService.accept(req.params.id, req.user!.id)); }
    catch (err) { next(err); }
  }

  async reject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json(await claimService.reject(req.params.id, req.user!.id)); }
    catch (err) { next(err); }
  }

  async byItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json(await claimService.listByItem(req.params.itemId, req.user!.id)); }
    catch (err) { next(err); }
  }

  async mySubmitted(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json(await claimService.listByClaimer(req.user!.id)); }
    catch (err) { next(err); }
  }

  async myInbox(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json(await claimService.listForOwner(req.user!.id)); }
    catch (err) { next(err); }
  }

  async notifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json(await notificationService.listForUser(req.user!.id)); }
    catch (err) { next(err); }
  }
}

export default new ClaimController();
