import { Request, Response, NextFunction } from 'express';
import itemService from '../services/ItemService';
import rewardService from '../services/RewardService';
import categoryRepository from '../repositories/CategoryRepository';

export class ItemController {
  async createLost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.status(201).json(await itemService.createLost(req.user!.id, req.body)); }
    catch (err) { next(err); }
  }

  async createFound(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.status(201).json(await itemService.createFound(req.user!.id, req.body)); }
    catch (err) { next(err); }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json(await itemService.update(req.params.id, req.user!.id, req.body)); }
    catch (err) { next(err); }
  }

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await itemService.delete(req.params.id, req.user!.id, req.user!.isAdmin());
      res.status(204).end();
    } catch (err) { next(err); }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json(await itemService.getById(req.params.id)); }
    catch (err) { next(err); }
  }

  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json(await itemService.search(req.query as Record<string, string>)); }
    catch (err) { next(err); }
  }

  async myItems(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json(await itemService.listForUser(req.user!.id)); }
    catch (err) { next(err); }
  }

  async declareReward(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const amount = Number(req.body.rewardAmount);
      res.json(await rewardService.declare(req.params.id, req.user!.id, amount));
    } catch (err) { next(err); }
  }

  async completeReward(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json(await rewardService.complete(req.params.id, req.user!.id)); }
    catch (err) { next(err); }
  }

  async listCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json(await categoryRepository.findAll({ name: 1 })); }
    catch (err) { next(err); }
  }
}

export default new ItemController();
