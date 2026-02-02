import { Request, Response, NextFunction } from 'express';
import { DiscussionService } from './discussion.service';
import { AuthRequest } from '../../common/middlewares/auth.middleware';
import createError from 'http-errors';

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

    static async update(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const isAdmin = req.user.roles?.includes('admin');
            const discussion = await DiscussionService.updateDiscussion(
                req.params.id as string,
                req.user.id,
                req.body,
                isAdmin
            );
            res.json({ success: true, data: discussion });
        } catch (error) {
            next(error);
        }
    }

    static async delete(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const isAdmin = req.user.roles?.includes('admin');
            const result = await DiscussionService.deleteDiscussion(
                req.params.id as string,
                req.user.id,
                isAdmin
            );
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    static async toggleLock(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const isAdmin = req.user.roles?.includes('admin');
            const discussion = await DiscussionService.toggleLock(
                req.params.id as string,
                req.user.id,
                isAdmin
            );
            res.json({ success: true, data: discussion });
        } catch (error) {
            next(error);
        }
    }

    static async togglePin(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const isAdmin = req.user.roles?.includes('admin');
            const discussion = await DiscussionService.togglePin(
                req.params.id as string,
                req.user.id,
                isAdmin
            );
            res.json({ success: true, data: discussion });
        } catch (error) {
            next(error);
        }
    }

    static async vote(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const { type } = req.body;
            if (![ 'up', 'down' ].includes(type)) throw createError(400, 'Invalid vote type');
            const discussion = await DiscussionService.vote(req.params.id as string, req.user.id, type as 'up' | 'down');
            res.json({ success: true, data: discussion });
        } catch (error) {
            next(error);
        }
    }

    static async voteReply(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const { type } = req.body;
            if (![ 'up', 'down' ].includes(type)) throw createError(400, 'Invalid vote type');
            const discussion = await DiscussionService.voteReply(
                req.params.id as string,
                req.params.replyId as string,
                req.user.id,
                type as 'up' | 'down'
            );
            res.json({ success: true, data: discussion });
        } catch (error) {
            next(error);
        }
    }

    static async updateReply(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const discussion = await DiscussionService.updateReply(
                req.params.id as string,
                req.params.replyId as string,
                req.user.id,
                req.body
            );
            res.json({ success: true, data: discussion });
        } catch (error) {
            next(error);
        }
    }

    static async deleteReply(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const isAdmin = req.user.roles?.includes('admin');
            const discussion = await DiscussionService.deleteReply(
                req.params.id as string,
                req.params.replyId as string,
                req.user.id,
                isAdmin
            );
            res.json({ success: true, data: discussion });
        } catch (error) {
            next(error);
        }
    }

    static async acceptAnswer(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const { replyId } = req.body;
            const isAdmin = req.user.roles?.includes('admin');
            const discussion = await DiscussionService.acceptAnswer(
                req.params.id as string,
                replyId,
                req.user.id,
                isAdmin
            );
            res.json({ success: true, data: discussion });
        } catch (error) {
            next(error);
        }
    }
}
