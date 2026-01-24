import { Request, Response, NextFunction } from 'express';
import { NotificationService } from './notification.service';
import { AuthRequest } from '../../common/middlewares/auth.middleware';

export class NotificationController
{
    static async list(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const result = await NotificationService.getMyNotifications(req.user.id, req.query);
            res.json({ success: true, ...result });
        } catch (error) {
            next(error);
        }
    }

    static async markAsRead(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const { id } = req.params;
            const notification = await NotificationService.markAsRead(id as string, req.user.id);
            res.json({ success: true, data: notification });
        } catch (error) {
            next(error);
        }
    }

    static async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            await NotificationService.markAllAsRead(req.user.id);
            res.json({ success: true, message: 'All notifications marked as read' });
        } catch (error) {
            next(error);
        }
    }

    static async remove(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const { id } = req.params;
            await NotificationService.deleteNotification(id as string, req.user.id);
            res.json({ success: true, message: 'Notification removed' });
        } catch (error) {
            next(error);
        }
    }
}
