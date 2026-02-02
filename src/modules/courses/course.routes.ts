import { Router } from 'express';
import { CourseController } from './course.controller';
import { protect, authorize } from '../../common/middlewares/auth.middleware';

const router = Router();

// Public routes
router.get('/', CourseController.list);
router.get('/instructor/my-courses', protect, authorize('instructor', 'admin'), CourseController.listInstructorCourses);
router.get('/instructor/my-courses/:courseId', protect, authorize('instructor', 'admin'), CourseController.getInstructorCourse as any);
router.get('/category/:categoryId', CourseController.getCoursesByCategory);
router.get('/:courseId/structure', CourseController.getStructure);
router.get('/:courseId/enrolled', protect, CourseController.getEnrolledCourseDetail as any);
router.get('/:slug', CourseController.getCourse);

// Protected instructor routes
router.post(
    '/',
    protect,
    authorize('instructor', 'admin'),
    CourseController.createCourse as any
);

router.patch(
    '/:courseId/status',
    protect,
    authorize('instructor', 'admin'),
    CourseController.updateStatus as any
);

router.patch(
    '/:courseId',
    protect,
    authorize('instructor', 'admin'),
    CourseController.updateCourse as any
);

router.delete(
    '/:courseId',
    protect,
    authorize('instructor', 'admin'),
    CourseController.deleteCourse as any
);

router.post(
    '/:courseId/modules',
    protect,
    authorize('instructor', 'admin'),
    CourseController.addModule as any
);

router.patch(
    '/:courseId/modules/:moduleId',
    protect,
    authorize('instructor', 'admin'),
    CourseController.updateModule as any
);

router.delete(
    '/:courseId/modules/:moduleId',
    protect,
    authorize('instructor', 'admin'),
    CourseController.deleteModule as any
);

router.post(
    '/:courseId/modules/:moduleId/lessons',
    protect,
    authorize('instructor', 'admin'),
    CourseController.addLesson as any
);

router.patch(
    '/:courseId/modules/:moduleId/lessons/:lessonId',
    protect,
    authorize('instructor', 'admin'),
    CourseController.updateLesson as any
);

router.delete(
    '/:courseId/modules/:moduleId/lessons/:lessonId',
    protect,
    authorize('instructor', 'admin'),
    CourseController.deleteLesson as any
);

export default router;
