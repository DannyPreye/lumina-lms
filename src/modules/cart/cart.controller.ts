import { Response, NextFunction } from 'express';
import { CartService } from './cart.service';
import { AuthRequest } from '../../common/middlewares/auth.middleware';

export class CartController
{
    static async getCart(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const cart = await CartService.getCart(req.user.id);
            res.json({ success: true, data: cart });
        } catch (error) {
            next(error);
        }
    }

    static async addItem(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const { courseId } = req.body;
            const cart = await CartService.addToCart(req.user.id, courseId);
            res.json({ success: true, data: cart });
        } catch (error) {
            next(error);
        }
    }

    static async removeItem(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const courseId = req.params.courseId as string;
            const cart = await CartService.removeFromCart(req.user.id, courseId);
            res.json({ success: true, data: cart });
        } catch (error) {
            next(error);
        }
    }

    static async clear(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const cart = await CartService.clearCart(req.user.id);
            res.json({ success: true, data: cart });
        } catch (error) {
            next(error);
        }
    }
}
