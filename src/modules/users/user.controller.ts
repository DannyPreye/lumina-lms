import { Request, Response, NextFunction } from 'express';
import { UserService } from './user.service';
import createError from 'http-errors';

export class UserController
{
    static async getProfile(req: Request, res: Response, next: NextFunction)
    {
        try {
            const userId = (req as any).user.id;
            const user = await UserService.findById(userId);
            res.json({
                success: true,
                data: user,
            });
        } catch (error) {
            next(error);
        }
    }

    static async updateProfile(req: Request, res: Response, next: NextFunction)
    {
        try {
            const userId = (req as any).user.id;
            const user = await UserService.updateProfile(userId, req.body);
            res.json({
                success: true,
                message: 'Profile updated successfully',
                data: user,
            });
        } catch (error) {
            console.log(error);
            next(error);
        }
    }

    static async getAllUsers(req: Request, res: Response, next: NextFunction)
    {
        try {
            const { page, limit, status, role } = req.query;
            const query: any = {};
            if (status) query.status = status;
            if (role) query.roles = role;

            const result = await UserService.findAll(query, {
                page: Number(page) || 1,
                limit: Number(limit) || 10,
            });

            res.json({
                success: true,
                ...result,
            });
        } catch (error) {
            next(error);
        }
    }

    static async getUserById(req: Request, res: Response, next: NextFunction)
    {
        try {
            const user = await UserService.findById(req.params.id as string);
            res.json({
                success: true,
                data: user,
            });
        } catch (error) {
            next(error);
        }
    }

    static async updateRoles(req: Request, res: Response, next: NextFunction)
    {
        try {
            const { roles } = req.body;
            if (!roles || !Array.isArray(roles)) {
                throw createError(400, 'Roles must be an array');
            }
            const user = await UserService.updateRoles(req.params.id as string, roles);
            res.json({
                success: true,
                message: 'User roles updated successfully',
                data: user,
            });
        } catch (error) {
            next(error);
        }
    }

    static async updateStatus(req: Request, res: Response, next: NextFunction)
    {
        try {
            const { status } = req.body;
            if (!status) {
                throw createError(400, 'Status is required');
            }
            const user = await UserService.updateStatus(req.params.id as string, status);
            res.json({
                success: true,
                message: 'User status updated successfully',
                data: user,
            });
        } catch (error) {
            next(error);
        }
    }

    static async deleteUser(req: Request, res: Response, next: NextFunction)
    {
        try {
            await UserService.deleteUser(req.params.id as string);
            res.json({
                success: true,
                message: 'User deleted successfully',
            });
        } catch (error) {
            next(error);
        }
    }
}
