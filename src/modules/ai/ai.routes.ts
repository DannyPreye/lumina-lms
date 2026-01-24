import { Router } from 'express';
import { AIController } from './ai.controller';
import { protect, authorize } from '../../common/middlewares/auth.middleware';

const router = Router();

// Student AI Tutoring
router.post('/sessions', protect, AIController.startSession as any);
router.get('/sessions/:id', protect, AIController.getSession as any);
router.post('/sessions/:id/messages', protect, AIController.sendMessage as any);

// Instructor: Review generated content
router.patch(
    '/content/:contentId/review',
    protect,
    authorize('instructor', 'admin'),
    AIController.reviewContent as any
);

export default router;
