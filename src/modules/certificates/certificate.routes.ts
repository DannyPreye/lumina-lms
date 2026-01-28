import { Router } from 'express';
import { CertificateController } from './certificate.controller';
import { protect, authorize } from '../../common/middlewares/auth.middleware';

const router = Router();

// Public verification
router.get('/verify/:certificateId', CertificateController.verify as any);

// Student: View own certificates
router.get('/my-certificates', protect, CertificateController.getMyCertificates as any);

// Instructor/Admin: Issue & Manage templates
router.post(
    '/templates',
    protect,
    authorize('admin', 'instructor'),
    CertificateController.createTemplate as any
);

router.get(
    '/templates',
    protect,
    authorize('instructor', 'admin'),
    CertificateController.getTemplates as any
);

router.post(
    '/issue',
    protect,
    authorize('instructor', 'admin'),
    CertificateController.issue as any
);

router.patch(
    '/:id/revoke',
    protect,
    authorize('admin', 'instructor'), // Allowing instructors to revoke too if needed
    CertificateController.revoke as any
);

export default router;
