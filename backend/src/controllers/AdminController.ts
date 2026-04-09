import { Request, Response, NextFunction } from 'express';
import adminService from '../services/AdminService';
import { ClaimStatus } from '../types/domain';

export class AdminController {
  users(_req: Request, res: Response, next: NextFunction): void {
    try { res.json(adminService.listAllUsers()); } catch (err) { next(err); }
  }
  items(_req: Request, res: Response, next: NextFunction): void {
    try { res.json(adminService.listAllItems()); } catch (err) { next(err); }
  }
  claims(_req: Request, res: Response, next: NextFunction): void {
    try { res.json(adminService.listAllClaims()); } catch (err) { next(err); }
  }
  deleteItem(req: Request, res: Response, next: NextFunction): void {
    try {
      adminService.deleteItem(Number(req.params.id));
      res.status(204).end();
    } catch (err) { next(err); }
  }
  suspend(req: Request, res: Response, next: NextFunction): void {
    try { res.json(adminService.suspendUser(Number(req.params.id))); } catch (err) { next(err); }
  }
  reinstate(req: Request, res: Response, next: NextFunction): void {
    try { res.json(adminService.reinstateUser(Number(req.params.id))); } catch (err) { next(err); }
  }
  resolve(req: Request, res: Response, next: NextFunction): void {
    try { res.json(adminService.resolveDispute(Number(req.params.id), req.body.resolution as ClaimStatus)); }
    catch (err) { next(err); }
  }
  stats(_req: Request, res: Response, next: NextFunction): void {
    try { res.json(adminService.stats()); } catch (err) { next(err); }
  }
}

export default new AdminController();
