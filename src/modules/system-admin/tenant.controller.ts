import { Request, Response, NextFunction } from 'express';
import { TenantService } from './tenant.service';
import { AuthRequest } from '../../common/middlewares/auth.middleware';

export class TenantController
{
    static async onboardTenant(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            // Admin provides ownerId? Or we use the current user if they are admin creating it for themselves?
            // Usually valid admins create tenants for others.
            // Let's assume body contains ownerId or we default to the admin creating it (though unrealistic for SaaS usually separate)

            // For this implementation, we expect ownerId in body or we use specific logic.
            // If strictly SaaS, maybe we create a new user too?
            // Keeping it simple: Expect ownerId in body for now, or use current user if not provided

            const ownerId = req.body.ownerId || req.user.id;

            const tenant = await TenantService.createTenant({ ...req.body, ownerId });
            res.status(201).json({ success: true, data: tenant });
        } catch (error) {
            next(error);
        }
    }

    static async updateConfig(req: Request, res: Response, next: NextFunction)
    {
        try {
            const { tenantId } = req.params;
            const tenant = await TenantService.updateTenantConfig(tenantId as string, req.body);
            res.json({ success: true, data: tenant });
        } catch (error) {
            next(error);
        }
    }

    static async getTenant(req: Request, res: Response, next: NextFunction)
    {
        try {
            const { tenantId } = req.params;
            const tenant = await TenantService.getTenant(tenantId as string);
            res.json({ success: true, data: tenant });
        } catch (error) {
            next(error);
        }
    }

    static async listTenants(req: Request, res: Response, next: NextFunction)
    {
        try {
            const tenants = await TenantService.getAllTenants();
            res.json({ success: true, data: tenants });
        } catch (error) {
            next(error);
        }
    }
}
