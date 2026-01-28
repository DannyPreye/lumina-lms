import { Request, Response, NextFunction } from 'express';
import { LiveSessionService } from './live-session.service';
import { AuthRequest } from '../../common/middlewares/auth.middleware';

export class LiveSessionController
{
    static async create(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const session = await LiveSessionService.createSession(req.user.id, req.body);
            res.status(201).json({ success: true, data: session });
        } catch (error) {
            next(error);
        }
    }

    static async getCourseSessions(req: Request, res: Response, next: NextFunction)
    {
        try {
            const sessions = await LiveSessionService.getCourseSessions(req.params.courseId as string);
            res.json({ success: true, data: sessions });
        } catch (error) {
            next(error);
        }
    }

    static async getById(req: Request, res: Response, next: NextFunction)
    {
        try {
            const session = await LiveSessionService.getSessionById(req.params.id as string);
            res.json({ success: true, data: session });
        } catch (error) {
            next(error);
        }
    }

    static async register(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const session = await LiveSessionService.registerStudent(req.params.id as string, req.user.id);
            res.json({ success: true, data: session });
        } catch (error) {
            next(error);
        }
    }

    static async updateStatus(req: Request, res: Response, next: NextFunction)
    {
        try {
            const { status } = req.body;
            const session = await LiveSessionService.updateStatus(req.params.id as string, status);
            res.json({ success: true, data: session });
        } catch (error) {
            next(error);
        }
    }

    static async join(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            // Logic for joining a session could involve updating attendance status to 'attended'
            const session = await LiveSessionService.recordAttendance(req.params.id as string, req.user.id, {
                joinedAt: new Date(),
                status: 'attended',
            });
            res.json({ success: true, data: session });
        } catch (error) {
            next(error);
        }
    }

    static async getInstructorSessions(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const sessions = await LiveSessionService.getInstructorSessions(req.user.id);
            res.json({ success: true, data: sessions });
        } catch (error) {
            next(error);
        }
    }

    static async update(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const isAdmin = req.user.roles.includes('admin');
            const session = await LiveSessionService.updateSession(req.params.id as string, req.user.id, req.body, isAdmin);
            res.json({ success: true, data: session });
        } catch (error) {
            next(error);
        }
    }

    static async delete(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const isAdmin = req.user.roles.includes('admin');
            await LiveSessionService.deleteSession(req.params.id as string, req.user.id, isAdmin);
            res.json({ success: true, message: 'Live session deleted successfully' });
        } catch (error) {
            next(error);
        }
    }
}
