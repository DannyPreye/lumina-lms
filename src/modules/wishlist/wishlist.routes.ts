import { Router } from 'express';
import { WishlistController } from './wishlist.controller';
import { protect } from '../../common/middlewares/auth.middleware';

const router = Router();

router.use(protect);

router.get('/', WishlistController.getWishlist as any);
router.post('/toggle', WishlistController.toggle as any);
router.delete('/:courseId', WishlistController.remove as any);

export default router;
