import { Request, Response, NextFunction } from 'express';
import itemService from '../services/ItemService';
import rewardService from '../services/RewardService';
import categoryRepository from '../repositories/CategoryRepository';

export class ItemController {
  createLost(req: Request, res: Response, next: NextFunction): void {
    try { res.status(201).json(itemService.createLost(req.user!.id, req.body)); }
    catch (err) { next(err); }
  }

  createFound(req: Request, res: Response, next: NextFunction): void {
    try { res.status(201).json(itemService.createFound(req.user!.id, req.body)); }
    catch (err) { next(err); }
  }

  update(req: Request, res: Response, next: NextFunction): void {
    try { res.json(itemService.update(Number(req.params.id), req.user!.id, req.body)); }
    catch (err) { next(err); }
  }

  remove(req: Request, res: Response, next: NextFunction): void {
    try {
      itemService.delete(Number(req.params.id), req.user!.id, req.user!.isAdmin());
      res.status(204).end();
    } catch (err) { next(err); }
  }

  getById(req: Request, res: Response, next: NextFunction): void {
    try { res.json(itemService.getById(Number(req.params.id))); }
    catch (err) { next(err); }
  }

  search(req: Request, res: Response, next: NextFunction): void {
    try { res.json(itemService.search(req.query as Record<string, string>)); }
    catch (err) { next(err); }
  }

  myItems(req: Request, res: Response, next: NextFunction): void {
    try { res.json(itemService.listForUser(req.user!.id)); }
    catch (err) { next(err); }
  }

  declareReward(req: Request, res: Response, next: NextFunction): void {
    try {
      const amount = Number(req.body.rewardAmount);
      res.json(rewardService.declare(Number(req.params.id), req.user!.id, amount));
    } catch (err) { next(err); }
  }

  completeReward(req: Request, res: Response, next: NextFunction): void {
    try { res.json(rewardService.complete(Number(req.params.id), req.user!.id)); }
    catch (err) { next(err); }
  }

  listCategories(_req: Request, res: Response): void {
    res.json(categoryRepository.findAll('name ASC'));
  }
}

export default new ItemController();
