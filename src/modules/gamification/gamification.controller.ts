import { Request, Response, NextFunction } from 'express';
import { GamificationService } from './gamification.service';
import { AuthRequest } from '../../common/middlewares/auth.middleware';

export class GamificationController
{
    static async getMyStats(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const stats = await GamificationService.getUserStats(req.user.id);
            res.json({ success: true, data: stats });
        } catch (error) {
            next(error);
        }
    }

    static async getLeaderboard(req: Request, res: Response, next: NextFunction)
    {
        try {
            const type = req.params.type as string;
            const courseId = req.query.courseId as string | undefined;
            const leaderboard = await GamificationService.getLeaderboard(type, courseId);
            res.json({ success: true, data: leaderboard });
        } catch (error) {
            next(error);
        }
    }

    // Admin: Manually award points (for testing or customer support)
    static async awardPoints(req: Request, res: Response, next: NextFunction)
    {
        try {
            const { userId, points, action, referenceId } = req.body;
            const result = await GamificationService.addPoints(userId, points, action, referenceId);
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
}
