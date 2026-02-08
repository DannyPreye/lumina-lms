import { Schema, model, Document } from 'mongoose';
import { tenantPlugin, ITenantAware } from '../../common/plugins/tenant.plugin';

export interface IPage extends Document, ITenantAware
{
    title: string;
    slug: string;
    content: string; // HTML or JSON from builder
    type: 'landing' | 'about' | 'contact' | 'custom';
    isPublished: boolean;
    meta: {
        title?: string;
        description?: string;
        keywords?: string[];
    };
    createdAt: Date;
    updatedAt: Date;
}

const pageSchema = new Schema<IPage>({
    title: { type: String, required: true },
    slug: { type: String, required: true, trim: true }, // unique per tenant handled by compound index
    content: { type: String, default: '' },
    type: {
        type: String,
        enum: [ 'landing', 'about', 'contact', 'custom' ],
        default: 'custom'
    },
    isPublished: { type: Boolean, default: false },
    meta: {
        title: String,
        description: String,
        keywords: [ String ]
    }
}, { timestamps: true });

// Ensure slug is unique per tenant
pageSchema.index({ slug: 1, tenantId: 1 }, { unique: true });

pageSchema.plugin(tenantPlugin);

export const Page = model<IPage>('Page', pageSchema);
