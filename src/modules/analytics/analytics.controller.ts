import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from './analytics.service';
import { AuthRequest } from '../../common/middlewares/auth.middleware';

export class AnalyticsController
{
    static async getMyPerformance(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const { courseId } = req.params;
            const data = await AnalyticsService.getStudentAnalytics(req.user.id, courseId as string);
            res.json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }

    static async getCourseStats(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const { courseId } = req.params;
            const { period } = req.query;
            const data = await AnalyticsService.getCourseReport(courseId as string, period as string);
            res.json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }

    // Instructor usage: trigger a fresh sync for course data
    static async refreshCourseStats(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const { courseId } = req.params;
            const report = await AnalyticsService.syncCourseAnalytics(courseId as string);
            res.json({ success: true, data: report });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Endpoint for the frontend to ping active time.
     */
    static async trackPing(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const { courseId } = req.body;
            const { metric, value } = req.body; // e.g., metric='timeSpent', value=30
            await AnalyticsService.trackActivity(req.user.id, courseId, metric, value);
            res.json({ success: true });
        } catch (error) {
            next(error);
        }
    }
}
