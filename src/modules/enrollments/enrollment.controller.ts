import { Response, NextFunction } from 'express';
import { EnrollmentService } from './enrollment.service';
import { AuthRequest } from '../../common/middlewares/auth.middleware';

export class EnrollmentController
{
    static async enroll(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const { courseId } = req.body;
            const enrollment = await EnrollmentService.enrollUser(req.user.id, courseId);
            res.status(201).json({ success: true, data: enrollment });
        } catch (error) {
            next(error);
        }
    }

    static async getMyCourses(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const result = await EnrollmentService.getUserEnrollments(req.user.id, req.query);
            res.json({ success: true, ...result });
        } catch (error) {
            next(error);
        }
    }

    static async getProgress(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const progress = await EnrollmentService.getEnrollmentProgress(req.user.id, req.params.courseId as string);
            res.json({ success: true, data: progress });
        } catch (error) {
            next(error);
        }
    }

    static async markComplete(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const { lessonId } = req.body;
            const progress = await EnrollmentService.markLessonAsComplete(
                req.user.id,
                req.params.courseId as string,
                lessonId
            );
            res.json({ success: true, data: progress });
        } catch (error) {
            next(error);
        }
    }

    static async updateProgress(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const { lessonId, status, timeSpent } = req.body;
            const progress = await EnrollmentService.updateProgress(
                req.user.id,
                req.params.courseId as string,
                lessonId,
                { status, timeSpent }
            );
            res.json({ success: true, data: progress });
        } catch (error) {
            next(error);
        }
    }
}
