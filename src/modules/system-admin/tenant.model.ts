import { Schema, model, Document, Types } from 'mongoose';

export interface ITenantConfig
{
    modules: {
        gamification: boolean;
        payments: boolean;
        certificates: boolean;
        blog: boolean;
        discussions: boolean;
    };
    branding: {
        logoUrl?: string;
        primaryColor?: string;
        secondaryColor?: string;
        fontFamily?: string;
    };
    pages: {
        landingPage: {
            heroTitle: string;
            heroSubtitle: string;
            heroImage?: string;
        };
        aboutPage?: string;
        contactPage?: string;
    };
    auth: {
        googleClientId?: string;
        googleClientSecret?: string;
        allowedDomains?: string[]; // potentially restrict email domains
    };
    payments?: { // Encrypted keys
        paystackSecretKey?: string;
        paystackPublicKey?: string;
        stripeSecretKey?: string;
        stripePublishableKey?: string;
        currency: 'NGN' | 'USD' | 'GBP' | 'EUR';
    };
}

export interface ITenant extends Document
{
    name: string;
    slug: string; // unique identifier, e.g., 'school-a'
    domain?: string; // custom domain, e.g., 'school-a.com'
    ownerId: Types.ObjectId; // User who owns this tenant
    status: 'active' | 'suspended' | 'pending';
    config: ITenantConfig;
    createdAt: Date;
    updatedAt: Date;
}

const tenantConfigSchema = new Schema<ITenantConfig>({
    modules: {
        gamification: { type: Boolean, default: true },
        payments: { type: Boolean, default: true },
        certificates: { type: Boolean, default: true },
        blog: { type: Boolean, default: true },
        discussions: { type: Boolean, default: true },
    },
    branding: {
        logoUrl: String,
        primaryColor: { type: String, default: '#007bff' },
        secondaryColor: { type: String, default: '#6c757d' },
        fontFamily: { type: String, default: 'Inter, sans-serif' },
    },
    pages: {
        landingPage: {
            heroTitle: { type: String, default: 'Welcome to our platform' },
            heroSubtitle: { type: String, default: 'Learn from the best' },
            heroImage: String,
        },
        aboutPage: String,
        contactPage: String,
    },
    auth: {
        googleClientId: String,
        googleClientSecret: String,
        allowedDomains: [ String ],
    },
    payments: {
        paystackSecretKey: String, // TODO: Encrypt these in pre-save hook
        paystackPublicKey: String,
        stripeSecretKey: String,
        stripePublishableKey: String,
        currency: { type: String, enum: [ 'NGN', 'USD', 'GBP', 'EUR' ], default: 'USD' },
    },
}, { _id: false });

const tenantSchema = new Schema<ITenant>({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    domain: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: [ 'active', 'suspended', 'pending' ], default: 'active' },
    config: { type: tenantConfigSchema, default: () => ({}) },
}, { timestamps: true });

// Index for lookup performance
tenantSchema.index({ slug: 1 });
tenantSchema.index({ domain: 1 });

export const Tenant = model<ITenant>('Tenant', tenantSchema);
