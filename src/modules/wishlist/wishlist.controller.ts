import { Response, NextFunction } from 'express';
import { WishlistService } from './wishlist.service';
import { AuthRequest } from '../../common/middlewares/auth.middleware';

export class WishlistController
{
    static async getWishlist(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const wishlist = await WishlistService.getWishlist(req.user.id);
            res.json({ success: true, data: wishlist });
        } catch (error) {
            next(error);
        }
    }

    static async toggle(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const { courseId } = req.body;
            const wishlist = await WishlistService.toggleWishlist(req.user.id, courseId);
            res.json({ success: true, data: wishlist });
        } catch (error) {
            next(error);
        }
    }

    static async remove(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const courseId = req.params.courseId as string;
            const wishlist = await WishlistService.removeFromWishlist(req.user.id, courseId);
            res.json({ success: true, data: wishlist });
        } catch (error) {
            next(error);
        }
    }
}
