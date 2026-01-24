import { Router } from 'express';
import { CourseController } from './course.controller';
import { protect, authorize } from '../../common/middlewares/auth.middleware';

const router = Router();

// Public routes
router.get('/', CourseController.list);
router.get('/category/:categoryId', CourseController.getCoursesByCategory);
router.get('/:slug', CourseController.getCourse);
router.get('/:courseId/structure', CourseController.getStructure);

// Protected instructor routes
router.post(
    '/',
    protect,
    authorize('instructor', 'admin'),
    CourseController.createCourse as any
);

router.post(
    '/:courseId/modules',
    protect,
    authorize('instructor', 'admin'),
    CourseController.addModule as any
);

router.post(
    '/:courseId/modules/:moduleId/lessons',
    protect,
    authorize('instructor', 'admin'),
    CourseController.addLesson as any
);

export default router;
