import { Request, Response, NextFunction } from 'express';
import { DiscussionService } from './discussion.service';
import { AuthRequest } from '../../common/middlewares/auth.middleware';

export class DiscussionController
{
    static async create(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const discussion = await DiscussionService.createDiscussion(req.user.id, req.body);
            res.status(201).json({ success: true, data: discussion });
        } catch (error) {
            next(error);
        }
    }

    static async getCourseDiscussions(req: Request, res: Response, next: NextFunction)
    {
        try {
            const result = await DiscussionService.getCourseDiscussions(
                req.params.courseId as string,
                req.query
            );
            res.json({ success: true, ...result });
        } catch (error) {
            next(error);
        }
    }

    static async getById(req: Request, res: Response, next: NextFunction)
    {
        try {
            const discussion = await DiscussionService.getDiscussionById(req.params.id as string);
            res.json({ success: true, data: discussion });
        } catch (error) {
            next(error);
        }
    }

    static async addReply(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const discussion = await DiscussionService.addReply(
                req.params.id as string,
                req.user.id,
                req.body
            );
            res.status(201).json({ success: true, data: discussion });
        } catch (error) {
            next(error);
        }
    }

    static async upvote(req: Request, res: Response, next: NextFunction)
    {
        try {
            const discussion = await DiscussionService.upvoteDiscussion(req.params.id as string);
            res.json({ success: true, data: discussion });
        } catch (error) {
            next(error);
        }
    }

    static async acceptAnswer(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const { replyId } = req.body;
            const discussion = await DiscussionService.acceptAnswer(
                req.params.id as string,
                replyId,
                req.user.id
            );
            res.json({ success: true, data: discussion });
        } catch (error) {
            next(error);
        }
    }
}
