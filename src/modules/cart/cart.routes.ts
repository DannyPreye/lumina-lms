import { Router } from 'express';
import { CartController } from './cart.controller';
import { protect } from '../../common/middlewares/auth.middleware';

const router = Router();

router.use(protect);

router.get('/', CartController.getCart as any);
router.post('/add', CartController.addItem as any);
router.delete('/remove/:courseId', CartController.removeItem as any);
router.delete('/clear', CartController.clear as any);

export default router;
