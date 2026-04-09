import { Request, Response, NextFunction } from 'express';
import claimService from '../services/ClaimService';
import notificationService from '../services/NotificationService';

export class ClaimController {
  submit(req: Request, res: Response, next: NextFunction): void {
    try {
      const payload = { itemId: Number(req.body.itemId), message: String(req.body.message ?? '') };
      res.status(201).json(claimService.submit(req.user!.id, payload));
    } catch (err) { next(err); }
  }

  accept(req: Request, res: Response, next: NextFunction): void {
    try { res.json(claimService.accept(Number(req.params.id), req.user!.id)); }
    catch (err) { next(err); }
  }

  reject(req: Request, res: Response, next: NextFunction): void {
    try { res.json(claimService.reject(Number(req.params.id), req.user!.id)); }
    catch (err) { next(err); }
  }

  byItem(req: Request, res: Response, next: NextFunction): void {
    try { res.json(claimService.listByItem(Number(req.params.itemId), req.user!.id)); }
    catch (err) { next(err); }
  }

  mySubmitted(req: Request, res: Response, next: NextFunction): void {
    try { res.json(claimService.listByClaimer(req.user!.id)); }
    catch (err) { next(err); }
  }

  myInbox(req: Request, res: Response, next: NextFunction): void {
    try { res.json(claimService.listForOwner(req.user!.id)); }
    catch (err) { next(err); }
  }

  notifications(req: Request, res: Response, next: NextFunction): void {
    try { res.json(notificationService.listForUser(req.user!.id)); }
    catch (err) { next(err); }
  }
}

export default new ClaimController();
