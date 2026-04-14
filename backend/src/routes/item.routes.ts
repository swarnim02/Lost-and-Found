import { Router } from 'express';
import ItemController from '../controllers/ItemController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.get('/categories', (req, res, next) => ItemController.listCategories(req, res, next));
router.get('/search', (req, res, next) => ItemController.search(req, res, next));
router.get('/mine', authenticate, (req, res, next) => ItemController.myItems(req, res, next));
router.get('/:id', (req, res, next) => ItemController.getById(req, res, next));

router.post('/lost', authenticate, (req, res, next) => ItemController.createLost(req, res, next));
router.post('/found', authenticate, (req, res, next) => ItemController.createFound(req, res, next));
router.put('/:id', authenticate, (req, res, next) => ItemController.update(req, res, next));
router.delete('/:id', authenticate, (req, res, next) => ItemController.remove(req, res, next));

router.post('/:id/reward', authenticate, (req, res, next) => ItemController.declareReward(req, res, next));
router.post('/:id/reward/complete', authenticate, (req, res, next) => ItemController.completeReward(req, res, next));

export default router;
