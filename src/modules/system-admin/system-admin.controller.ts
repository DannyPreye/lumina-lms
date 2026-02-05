import { Request, Response, NextFunction } from 'express';
import { SystemAdminService } from './system-admin.service';
import { AuthRequest } from '../../common/middlewares/auth.middleware';

export class SystemAdminController
{
    // Taxonomy
    static async createCategory(req: Request, res: Response, next: NextFunction)
    {
        try {
            const category = await SystemAdminService.createCategory(req.body);
            res.status(201).json({ success: true, data: category });
        } catch (error) {
            next(error);
        }
    }

    static async listCategories(req: Request, res: Response, next: NextFunction)
    {
        try {
            const options = req.query;

            const convertedOptions: { parentId?: string; subOnly?: boolean; parentOnly?: boolean; } = {
                parentId: options.parentId as string | undefined,
                subOnly: options.subOnly === 'true' ? true : options.subOnly === 'false' ? false : undefined,
                parentOnly: options.parentOnly === 'true' ? true : options.parentOnly === 'false' ? false : undefined,
            };


            const categories = await SystemAdminService.getCategories(convertedOptions);
            res.json({ success: true, data: categories });
        } catch (error) {
            next(error);
        }
    }

    // Reviews
    static async postReview(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const review = await SystemAdminService.addReview(req.user.id, req.body);
            res.status(201).json({ success: true, data: review });
        } catch (error) {
            next(error);
        }
    }

    static async listCourseReviews(req: Request, res: Response, next: NextFunction)
    {
        try {
            const { courseId } = req.params;
            const result = await SystemAdminService.getCourseReviews(courseId as string, req.query);
            res.json({ success: true, ...result });
        } catch (error) {
            next(error);
        }
    }

    // Announcements
    static async postAnnouncement(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const announcement = await SystemAdminService.createAnnouncement(req.user.id, req.body);
            res.status(201).json({ success: true, data: announcement });
        } catch (error) {
            next(error);
        }
    }

    static async getAnnouncements(req: Request, res: Response, next: NextFunction)
    {
        try {
            const announcements = await SystemAdminService.getGlobalAnnouncements();
            res.json({ success: true, data: announcements });
        } catch (error) {
            next(error);
        }
    }

    // Settings
    static async updateSetting(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const { key, value } = req.body;
            const setting = await SystemAdminService.updateSetting(key, value, req.user.id);
            res.json({ success: true, data: setting });
        } catch (error) {
            next(error);
        }
    }

    static async getSetting(req: Request, res: Response, next: NextFunction)
    {
        try {
            const { key } = req.params;
            const value = await SystemAdminService.getSetting(key as string);
            res.json({ success: true, data: value });
        } catch (error) {
            next(error);
        }
    }
}
