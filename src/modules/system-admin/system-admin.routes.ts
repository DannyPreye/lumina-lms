import { Router } from 'express';
import { SystemAdminController } from './system-admin.controller';
import { TenantController } from './tenant.controller';
import { protect, authorize } from '../../common/middlewares/auth.middleware';

const router = Router();

// --- PUBLIC / STUDENT ROUTES ---
router.get('/categories', SystemAdminController.listCategories as any);
router.get('/announcements', SystemAdminController.getAnnouncements as any);
router.post('/reviews', protect, SystemAdminController.postReview as any);
router.get('/reviews/:courseId', SystemAdminController.listCourseReviews as any);

// --- ADMIN CONTROL ROUTES ---
router.post(
    '/categories',
    protect,
    authorize('admin'),
    SystemAdminController.createCategory as any
);

router.patch(
    '/settings',
    protect,
    authorize('admin'),
    SystemAdminController.updateSetting as any
);

router.get(
    '/settings/:key',
    protect,
    authorize('admin'),
    SystemAdminController.getSetting as any
);

router.post(
    '/announcements',
    protect,
    authorize('instructor', 'admin'),
    SystemAdminController.postAnnouncement as any
);



// --- TENANT MANAGEMENT ROUTES (Admin only) ---
router.post(
    '/tenants',
    protect,
    authorize('admin'),
    TenantController.onboardTenant as any
);

router.get(
    '/tenants',
    protect,
    authorize('admin'),
    TenantController.listTenants as any
);

router.get(
    '/tenants/:tenantId',
    protect,
    authorize('admin'),
    TenantController.getTenant as any
);

router.patch(
    '/tenants/:tenantId/config',
    protect,
    authorize('admin'),
    TenantController.updateConfig as any
);

export default router;

