import { Router } from 'express';
import { UserController } from './user.controller';
import { protect, authorize } from '../../common/middlewares/auth.middleware';

const router = Router();

// Profile Routes (Protected)
router.get('/profile', protect, UserController.getProfile);
router.patch('/profile', protect, UserController.updateProfile);
router.patch('/avatar', protect, UserController.updateAvatar);
router.post('/change-password', protect, UserController.changePassword);


// Admin Routes (Protected & Restricted to Admin)
router.get('/', protect, authorize('admin'), UserController.getAllUsers);
router.get('/:id', protect, authorize('admin'), UserController.getUserById);
router.patch('/:id/roles', protect, authorize('admin'), UserController.updateRoles);
router.patch('/:id/status', protect, authorize('admin'), UserController.updateStatus);
router.delete('/:id', protect, authorize('admin'), UserController.deleteUser);

export default router;
