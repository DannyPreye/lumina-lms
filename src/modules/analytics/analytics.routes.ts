import { Router } from 'express';
import { AnalyticsController } from './analytics.controller';
import { protect, authorize } from '../../common/middlewares/auth.middleware';

const router = Router();

// Student routes
router.get('/my-performance/:courseId', protect, AnalyticsController.getMyPerformance as any);
router.post('/track', protect, AnalyticsController.trackPing as any);

// Instructor / Admin routes
router.get(
    '/course-stats/:courseId',
    protect,
    authorize('instructor', 'admin'),
    AnalyticsController.getCourseStats as any
);

router.post(
    '/course-stats/:courseId/refresh',
    protect,
    authorize('instructor', 'admin'),
    AnalyticsController.refreshCourseStats as any
);

export default router;
