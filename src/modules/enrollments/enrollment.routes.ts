import { Router } from 'express';
import { EnrollmentController } from './enrollment.controller';
import { protect } from '../../common/middlewares/auth.middleware';

const router = Router();

router.use(protect); // All enrollment routes require authentication

router.post('/enroll', EnrollmentController.enroll as any);
router.get('/my-courses', EnrollmentController.getMyCourses as any);
router.get('/:courseId/progress', EnrollmentController.getProgress as any);
router.post('/:courseId/complete-lesson', EnrollmentController.markComplete as any);

export default router;
