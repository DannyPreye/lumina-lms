import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import { Tenant } from '../../modules/system-admin/tenant.model';
import { tenantContext } from '../contexts/tenant.context';

// Extend Express Request to include tenant
declare global
{
    namespace Express
    {
        interface Request
        {
            tenant?: any;
        }
    }
}

export const tenantMiddleware = async (req: Request, res: Response, next: NextFunction) =>
{
    try {
        let tenantSlug: string | undefined;

        // 1. Try to get tenant from 'x-tenant-id' header (useful for API testing/dev)
        const headerTenant = req.headers[ 'x-tenant-id' ] as string;
        if (headerTenant) {
            tenantSlug = headerTenant;
        } else {
            // 2. Try to derive from subdomain
            // Host format: tenant-slug.domain.com or localhost:3000
            const host = req.get('host') || '';
            const parts = host.split('.');

            // naive check: if we have more than 2 parts (sub.domain.com), assume first part is tenant
            // Adjust this logic based on actual deployment domain structure
            // e.g. if domain is 'lms-platform.com', then 'school.lms-platform.com' -> 'school'
            // For localhost, we might look for 'school.localhost'
            if (parts.length > 2) {
                tenantSlug = parts[ 0 ];
            } else if (host.includes('localhost') && parts.length > 1) {
                // handle subdomain.localhost
                if (parts[ 0 ] !== 'localhost') {
                    tenantSlug = parts[ 0 ];
                }
            }
        }

        if (!tenantSlug) {
            // If no tenant identified, we might be hitting the main platform landing page
            // Or we could default to a 'default' tenant if applicable
            // For now, let's just proceed without tenant context (public routes)
            // But if it's a protected route, it might fail later.
            return next();
        }

        // 3. Look up Tenant
        // We look up by slug OR domain
        const tenant = await Tenant.findOne({
            $or: [
                { slug: tenantSlug },
                { domain: tenantSlug } // In case the whole host is a custom domain
            ]
        });

        if (!tenant) {
            return next(createError(404, `Tenant '${tenantSlug}' not found`));
        }

        if (tenant.status !== 'active') {
            return next(createError(403, `Tenant '${tenantSlug}' is ${tenant.status}`));
        }

        // 4. Attach to Request and Context
        req.tenant = tenant;

        // Run next() inside the AsyncLocalStorage context
        tenantContext.run(tenant, () =>
        {
            next();
        });

    } catch (error) {
        next(error);
    }
};
