import { Router } from 'express';
import { NotificationController } from './notification.controller';
import { protect } from '../../common/middlewares/auth.middleware';

const router = Router();

router.use(protect); // All notification routes require authentication

router.get('/', NotificationController.list as any);
router.patch('/mark-all-read', NotificationController.markAllAsRead as any);
router.patch('/:id/read', NotificationController.markAsRead as any);
router.delete('/:id', NotificationController.remove as any);

export default router;
