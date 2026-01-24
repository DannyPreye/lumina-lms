import { Request, Response, NextFunction } from 'express';
import { AIService } from './ai.service';
import { AuthRequest } from '../../common/middlewares/auth.middleware';

export class AIController
{
    static async startSession(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const session = await AIService.startConversation(req.user.id, req.body);
            res.status(201).json({ success: true, data: session });
        } catch (error) {
            next(error);
        }
    }

    static async sendMessage(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const { id } = req.params;
            const session = await AIService.addMessage(id as string, req.user.id, req.body);
            res.json({ success: true, data: session });
        } catch (error) {
            next(error);
        }
    }

    static async getSession(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const { id } = req.params;
            const session = await AIService.getConversation(id as string, req.user.id);
            res.json({ success: true, data: session });
        } catch (error) {
            next(error);
        }
    }

    // Instructor/Admin: Review AI generated content
    static async reviewContent(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const { contentId } = req.params;
            const { status } = req.body;
            const content = await AIService.reviewContent(contentId as string, req.user.id, status);
            res.json({ success: true, data: content });
        } catch (error) {
            next(error);
        }
    }
}
