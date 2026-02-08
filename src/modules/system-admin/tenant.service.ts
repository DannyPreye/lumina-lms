import { Tenant, ITenantConfig } from './tenant.model';
import createError from 'http-errors';
import { Types } from 'mongoose';
import slugify from 'slugify';

export class TenantService
{
    static async createTenant(data: { name: string; slug?: string; domain?: string; ownerId: string; email: string; })
    {
        // 1. Check if slug exists
        const slug = data.slug || slugify(data.name, { lower: true });
        const existingSlug = await Tenant.findOne({ slug });
        if (existingSlug) {
            throw createError(409, 'Tenant with this slug already exists');
        }

        // 2. Check if domain exists (if provided)
        if (data.domain) {
            const existingDomain = await Tenant.findOne({ domain: data.domain });
            if (existingDomain) {
                throw createError(409, 'Tenant with this domain already exists');
            }
        }

        // 3. Create Tenant
        const tenant = await Tenant.create({
            name: data.name,
            slug,
            domain: data.domain,
            ownerId: new Types.ObjectId(data.ownerId),
            status: 'active',
            config: {
                // Default config
                modules: {
                    gamification: true,
                    payments: true,
                    certificates: true,
                    blog: true,
                    discussions: true
                },
                branding: {
                    primaryColor: '#007bff',
                    secondaryColor: '#6c757d',
                    fontFamily: 'Inter, sans-serif'
                },
                pages: {
                    landingPage: {
                        heroTitle: `Welcome to ${data.name}`,
                        heroSubtitle: 'Learn from the best'
                    }
                }
            }
        });

        return tenant;
    }

    static async updateTenantConfig(tenantId: string, config: Partial<ITenantConfig>)
    {
        const tenant = await Tenant.findById(tenantId);
        if (!tenant) {
            throw createError(404, 'Tenant not found');
        }

        // Deep merge logic or simple top-level merge depending on requirements
        // Mongoose generic update for nested fields is a bit tricky with partials
        // Simplest is to use $set with dot notation or let Mongoose handle object updates if schema is strict

        // precise updates for nested objects to avoid overwriting entire objects if not intended
        // But for now, we assume the frontend sends the structure that matches the schema

        const updatedTenant = await Tenant.findByIdAndUpdate(
            tenantId,
            { $set: { config: { ...tenant.config, ...config } } }, // Simple merge, might need deeper merge if partial config provided
            { new: true, runValidators: true }
        );

        return updatedTenant;
    }

    static async getTenant(tenantId: string)
    {
        const tenant = await Tenant.findById(tenantId).populate('ownerId', 'email name');
        if (!tenant) {
            throw createError(404, 'Tenant not found');
        }
        return tenant;
    }

    static async getAllTenants()
    {
        return await Tenant.find().sort('-createdAt').populate('ownerId', 'email name');
    }
}
