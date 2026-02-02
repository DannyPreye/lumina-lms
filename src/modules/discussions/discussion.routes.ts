import { Router } from 'express';
import { DiscussionController } from './discussion.controller';
import { protect } from '../../common/middlewares/auth.middleware';

const router = Router();

// Publicly viewable course discussions
router.get('/course/:courseId', DiscussionController.getCourseDiscussions as any);
router.get('/:id', DiscussionController.getById as any);

// Protected actions
router.post('/', protect, DiscussionController.create as any);
router.patch('/:id', protect, DiscussionController.update as any);
router.delete('/:id', protect, DiscussionController.delete as any);

// Thread Status
router.patch('/:id/lock', protect, DiscussionController.toggleLock as any);
router.patch('/:id/pin', protect, DiscussionController.togglePin as any);

// Voting
router.post('/:id/vote', protect, DiscussionController.vote as any);

// Replies
router.post('/:id/replies', protect, DiscussionController.addReply as any);
router.post('/:id/replies/:replyId/vote', protect, DiscussionController.voteReply as any);
router.patch('/:id/replies/:replyId', protect, DiscussionController.updateReply as any);
router.delete('/:id/replies/:replyId', protect, DiscussionController.deleteReply as any);

// Q&A
router.post('/:id/accept-answer', protect, DiscussionController.acceptAnswer as any);

export default router;
