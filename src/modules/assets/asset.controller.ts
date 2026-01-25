import { Response, NextFunction } from 'express';
import { AssetService } from './asset.service';
import { AuthRequest } from '../../common/middlewares/auth.middleware';
import createError from 'http-errors';

export class AssetController
{
    static async upload(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            if (!req.file) throw createError(400, 'No file uploaded');
            const folder = req.body.folder || 'lumina/general';

            const asset = await AssetService.uploadAsset(req.user.id, req.file, folder);
            res.status(201).json({ success: true, data: asset });
        } catch (error) {
            next(error);
        }
    }

    static async list(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const isAdmin = req.user.roles?.includes('admin');
            const result = await AssetService.listAssets(req.user.id, req.query, isAdmin);
            res.json({ success: true, ...result });
        } catch (error) {
            next(error);
        }
    }

    static async delete(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const isAdmin = req.user.roles?.includes('admin');
            await AssetService.deleteAsset(req.user.id, req.params.id as string, isAdmin);
            res.json({ success: true, message: 'Asset deleted successfully' });
        } catch (error) {
            next(error);
        }
    }

    static async getFolders(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const isAdmin = req.user.roles?.includes('admin');
            const folders = await AssetService.getUserFolders(req.user.id, isAdmin);
            res.json({ success: true, data: folders });
        } catch (error) {
            next(error);
        }
    }
}
