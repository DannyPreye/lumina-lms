import { Request, Response, NextFunction } from 'express';
import { TenantService } from './tenant.service';
import { AuthRequest } from '../../common/middlewares/auth.middleware';

export class TenantController
{
    static async onboardTenant(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            // New logic: expect tenant details + admin user details
            const { name, slug, domain, adminEmail, adminName } = req.body;

            if (!name || !adminEmail || !adminName) {
                // Basic validation, though controller usually delegates or validation middleware handles schema
                // But good to be explicit for now
                // throw createError(400, "Missing required fields");
                // We will let service or schema validation handle it if possible, but let's assume they are passed
            }

            // We ignore ownerId from body as we create a new admin user
            const result = await TenantService.createTenant({
                name,
                slug,
                domain,
                adminEmail,
                adminName
            });

            // Return the full result including admin credentials
            res.status(201).json({ success: true, data: result });
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
