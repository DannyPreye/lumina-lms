import { Router } from 'express';
import DashboardController from './dashboard.controller';
import { authorize, protect } from '../../common/middlewares/auth.middleware';

const router = Router();

router.get('/student', protect, authorize("student"), DashboardController.getStudentDashboard);
router.get('/admin', protect, authorize("admin"), DashboardController.getAdminDashboard);
router.get('/instructor', protect, authorize("instructor"), DashboardController.getInstructorDashboard);

export default router;
