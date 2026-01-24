import { Router } from 'express';
import { DiscussionController } from './discussion.controller';
import { protect } from '../../common/middlewares/auth.middleware';

const router = Router();

// Publicly viewable course discussions
router.get('/course/:courseId', DiscussionController.getCourseDiscussions as any);
router.get('/:id', DiscussionController.getById as any);

// Protected actions
router.post('/', protect, DiscussionController.create as any);
router.post('/:id/replies', protect, DiscussionController.addReply as any);
router.post('/:id/upvote', protect, DiscussionController.upvote as any);
router.post('/:id/accept-answer', protect, DiscussionController.acceptAnswer as any);

export default router;
