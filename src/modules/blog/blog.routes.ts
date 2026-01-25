import { Router } from 'express';
import { BlogController } from './blog.controller';
import { protect, authorize } from '../../common/middlewares/auth.middleware';

const router = Router();

// Public routes
router.get('/', BlogController.list);

// Protected routes (Instructors and Admins can blog)
router.get('/my', protect, authorize('instructor', 'admin'), BlogController.listUserBlogs as any);
router.post('/', protect, authorize('instructor', 'admin'), BlogController.create as any);

router.get('/:slug', BlogController.getBySlug);


router.patch('/:id', protect, authorize('instructor', 'admin'), BlogController.update as any);
router.delete('/:id', protect, authorize('instructor', 'admin'), BlogController.delete as any);

export default router;
