import { Tenant, ITenantConfig } from './tenant.model';
import createError from 'http-errors';
import { Types } from 'mongoose';
import slugify from 'slugify';
import { User } from '../users/user.model';
import crypto from 'crypto';

export class TenantService
{
    static async createTenant(data: { name: string; slug?: string; domain?: string; adminEmail: string; adminName: string; })
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

        const session = await Tenant.startSession();
        session.startTransaction();

        try {
            const tenantId = new Types.ObjectId();
            const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            const invitationToken = crypto.randomBytes(32).toString('hex');
            const invitationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

            // 3. Create Admin User
            // Note: We're not using UserService because we need specific tenant linking without context
            const adminUser = new User({
                email: data.adminEmail,
                passwordHash: tempPassword, // Will be hashed by pre-save
                roles: [ 'admin' ],
                status: 'active',
                emailVerified: false, // Pending invitation
                verificationToken: invitationToken,
                verificationTokenExpires: invitationExpires,
                tenantId: tenantId
            });

            await adminUser.save({ session });

            // 4. Create Tenant
            const tenant = new Tenant({
                _id: tenantId, // Explicitly set ID
                name: data.name,
                slug,
                domain: data.domain,
                ownerId: adminUser._id,
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

            await tenant.save({ session });

            await session.commitTransaction();
            session.endSession();

            return {
                tenant,
                adminUser: {
                    email: data.adminEmail,
                    name: data.adminName,
                    tempPassword, // Return this so it can be shared
                    invitationToken
                }
            };
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
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
