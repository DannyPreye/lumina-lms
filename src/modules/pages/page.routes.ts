
import { Router } from 'express';
import * as PageController from './page.controller';
import { protect, authorize } from '../../common/middlewares/auth.middleware';

const router = Router();

// Publicly accessible pages by slug
// e.g., GET /api/v1/pages/public/about
router.get('/public/:slug', PageController.getPageBySlug);

// Information for public navigation (only published pages)
// router.get('/public', PageController.getPublishedPages); // Not implemented yet

// Admin Management Routes
router.use(protect);
router.use(authorize('admin', 'system_admin'));

router.post('/', PageController.createPage);
router.get('/', PageController.getPages); // List all pages for management
router.get('/:id', PageController.getPageById);
router.patch('/:id', PageController.updatePage);
router.delete('/:id', PageController.deletePage);

export default router;
