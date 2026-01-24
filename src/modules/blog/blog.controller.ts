import { Request, Response, NextFunction } from 'express';
import { BlogService } from './blog.service';
import { AuthRequest } from '../../common/middlewares/auth.middleware';

export class BlogController
{
    static async create(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const post = await BlogService.createPost(req.user.id, req.body);
            res.status(201).json({ success: true, data: post });
        } catch (error) {
            next(error);
        }
    }

    static async list(req: Request, res: Response, next: NextFunction)
    {
        try {
            const result = await BlogService.listPosts(req.query);
            res.json({ success: true, ...result });
        } catch (error) {
            next(error);
        }
    }

    static async getBySlug(req: Request, res: Response, next: NextFunction)
    {
        try {
            const post = await BlogService.getPostBySlug(req.params.slug as string);
            res.json({ success: true, data: post });
        } catch (error) {
            next(error);
        }
    }

    static async update(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const post = await BlogService.updatePost(req.params.id as string, req.user.id, req.body);
            res.json({ success: true, data: post });
        } catch (error) {
            next(error);
        }
    }

    static async delete(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            await BlogService.deletePost(req.params.id as string, req.user.id);
            res.json({ success: true, message: 'Post deleted successfully' });
        } catch (error) {
            next(error);
        }
    }
}
