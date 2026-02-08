import { Schema, model, Document, Types } from 'mongoose';
import { tenantPlugin, ITenantAware } from '../../common/plugins/tenant.plugin';

export interface IBlogPost extends Document, ITenantAware
{
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    authorId: Types.ObjectId;
    categoryId: Types.ObjectId;
    tags: string[];
    featuredImage: string;
    status: 'draft' | 'published' | 'archived';
    views: number;
    readingTime: number; // in minutes
    seo: {
        title?: string;
        description?: string;
        keywords?: string[];
    };
    publishedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const blogPostSchema = new Schema<IBlogPost>(
    {
        title: { type: String, required: true, trim: true },
        slug: { type: String, required: true, unique: true, lowercase: true },
        content: { type: String, required: true },
        excerpt: { type: String, required: true },
        authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
        tags: [ String ],
        featuredImage: String,
        status: {
            type: String,
            enum: [ 'draft', 'published', 'archived' ],
            default: 'draft'
        },
        views: { type: Number, default: 0 },
        readingTime: { type: Number, default: 0 },
        seo: {
            title: String,
            description: String,
            keywords: [ String ]
        },
        publishedAt: Date
    },
    { timestamps: true }
);

// Indexes for search and performance
blogPostSchema.index({ title: 'text', content: 'text', excerpt: 'text' });
blogPostSchema.index({ slug: 1 });
blogPostSchema.index({ status: 1, publishedAt: -1 });

blogPostSchema.plugin(tenantPlugin);

export const BlogPost = model<IBlogPost>('BlogPost', blogPostSchema);
