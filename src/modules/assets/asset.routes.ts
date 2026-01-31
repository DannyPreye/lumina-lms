import { Router } from 'express';
import { AssetController } from './asset.controller';
import { protect, authorize } from '../../common/middlewares/auth.middleware';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(protect);

// Only instructors and admins can manage assets generally, but students might need it for profile pics etc.
// For now, let's allow all authenticated users to manage their own assets.

router.post('/upload', upload.single('file'), AssetController.upload as any);
router.get('/', AssetController.list as any);
router.get('/folders', AssetController.getFolders as any);
router.post('/folders', AssetController.createFolder as any);
router.delete('/folders/:id', AssetController.deleteFolder as any);
router.delete('/:id', AssetController.delete as any);

export default router;

