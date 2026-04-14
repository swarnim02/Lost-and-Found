import { Request, Response, NextFunction } from 'express';
import adminService from '../services/AdminService';
import { ClaimStatus } from '../types/domain';

export class AdminController {
  async users(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json(await adminService.listAllUsers()); } catch (err) { next(err); }
  }
  async items(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json(await adminService.listAllItems()); } catch (err) { next(err); }
  }
  async claims(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json(await adminService.listAllClaims()); } catch (err) { next(err); }
  }
  async deleteItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await adminService.deleteItem(req.params.id);
      res.status(204).end();
    } catch (err) { next(err); }
  }
  async suspend(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json(await adminService.suspendUser(req.params.id)); } catch (err) { next(err); }
  }
  async reinstate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json(await adminService.reinstateUser(req.params.id)); } catch (err) { next(err); }
  }
  async resolve(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json(await adminService.resolveDispute(req.params.id, req.body.resolution as ClaimStatus)); }
    catch (err) { next(err); }
  }
  async stats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json(await adminService.stats()); } catch (err) { next(err); }
  }
}

export default new AdminController();
