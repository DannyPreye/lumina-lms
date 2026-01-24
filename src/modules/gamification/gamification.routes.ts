import { Router } from 'express';
import { GamificationController } from './gamification.controller';
import { protect, authorize } from '../../common/middlewares/auth.middleware';

const router = Router();

// Student stats
router.get('/my-stats', protect, GamificationController.getMyStats as any);

// Publicly viewable leaderboards
router.get('/leaderboard/:type', protect, GamificationController.getLeaderboard as any);

// Protected admin actions
router.post(
    '/award-points',
    protect,
    authorize('admin'),
    GamificationController.awardPoints as any
);

export default router;
