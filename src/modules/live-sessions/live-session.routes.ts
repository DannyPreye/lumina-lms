import { Router } from 'express';
import { LiveSessionController } from './live-session.controller';
import { protect, authorize } from '../../common/middlewares/auth.middleware';

const router = Router();

// General routes
router.get('/course/:courseId', protect, LiveSessionController.getCourseSessions as any);
router.get('/:id', protect, LiveSessionController.getById as any);

// Student actions
router.post('/:id/register', protect, LiveSessionController.register as any);
router.post('/:id/join', protect, LiveSessionController.join as any);

// Instructor actions
router.post(
    '/',
    protect,
    authorize('instructor', 'admin'),
    LiveSessionController.create as any
);

router.patch(
    '/:id/status',
    protect,
    authorize('instructor', 'admin'),
    LiveSessionController.updateStatus as any
);

export default router;
