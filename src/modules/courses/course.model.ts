import { Schema, model, Document, Types } from 'mongoose';
import { tenantPlugin } from '../../common/plugins/tenant.plugin';

export interface ICourse extends Document
{
    title: string;
    slug: string;
    shortDescription: string;
    fullDescription: string;
    instructorId: Types.ObjectId;
    coInstructors: Types.ObjectId[];
    category: Types.ObjectId;
    subcategory?: Types.ObjectId;
    tags: string[];
    thumbnail: string;
    coverImage: string;
    previewVideo: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'all_levels';
    language: string;
    pricing: {
        type: 'free' | 'paid' | 'subscription';
        amount: number;
        currency: string;
        discountPrice?: number;
        discountValidUntil?: Date;
    };
    learningObjectives: string[];
    requirements: string[];
    targetAudience: string[];
    certification: {
        provided: boolean;
        certificateTemplateId?: Types.ObjectId;
        passingCriteria: {
            minimumScore: number;
            requiredLessons: number;
            requiredAssignments: number;
        };
    };
    settings: {
        enrollmentType: 'open' | 'approval_required' | 'invitation_only';
        maxStudents?: number;
        allowDiscussions: boolean;
        allowPeerReview: boolean;
        showProgressBar: boolean;
        drip: {
            enabled: boolean;
            interval?: number;
            startDate?: Date;
        };
    };
    metadata: {
        estimatedHours: number;
        totalModules: number;
        totalLessons: number;
        totalQuizzes: number;
        totalAssignments: number;
        totalStudents: number;
        averageRating: number;
        totalReviews: number;
        lastUpdated: Date;
        version: string;
    };
    status: 'draft' | 'published' | 'archived';
    publishedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const courseSchema = new Schema<ICourse>(
    {
        title: { type: String, required: true, trim: true },
        slug: { type: String, required: true, lowercase: true },
        shortDescription: { type: String, required: true },
        fullDescription: { type: String, required: true },
        instructorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        coInstructors: [ { type: Schema.Types.ObjectId, ref: 'User' } ],
        category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
        subcategory: { type: Schema.Types.ObjectId, ref: 'Category' },
        tags: [ String ],
        thumbnail: String,
        coverImage: String,
        previewVideo: String,
        level: {
            type: String,
            enum: [ 'beginner', 'intermediate', 'advanced', 'all_levels' ],
            default: 'all_levels',
        },
        language: { type: String, default: 'English' },
        pricing: {
            type: { type: String, enum: [ 'free', 'paid', 'subscription' ], default: 'free' },
            amount: { type: Number, default: 0 },
            currency: { type: String, default: 'USD' },
            discountPrice: Number,
            discountValidUntil: Date,
        },
        learningObjectives: [ String ],
        requirements: [ String ],
        targetAudience: [ String ],
        certification: {
            provided: { type: Boolean, default: false },
            certificateTemplateId: { type: Schema.Types.ObjectId, ref: 'CertificateTemplate' },
            passingCriteria: {
                minimumScore: { type: Number, default: 70 },
                requiredLessons: { type: Number, default: 100 },
                requiredAssignments: { type: Number, default: 100 },
            },
        },
        settings: {
            enrollmentType: { type: String, enum: [ 'open', 'approval_required', 'invitation_only' ], default: 'open' },
            maxStudents: Number,
            allowDiscussions: { type: Boolean, default: true },
            allowPeerReview: { type: Boolean, default: false },
            showProgressBar: { type: Boolean, default: true },
            drip: {
                enabled: { type: Boolean, default: false },
                interval: Number,
                startDate: Date,
            },
        },
        metadata: {
            estimatedHours: { type: Number, default: 0 },
            totalModules: { type: Number, default: 0 },
            totalLessons: { type: Number, default: 0 },
            totalQuizzes: { type: Number, default: 0 },
            totalAssignments: { type: Number, default: 0 },
            totalStudents: { type: Number, default: 0 },
            averageRating: { type: Number, default: 0 },
            totalReviews: { type: Number, default: 0 },
            lastUpdated: { type: Date, default: Date.now },
            version: { type: String, default: '1.0.0' },
        },
        status: {
            type: String,
            enum: [ 'draft', 'published', 'archived' ],
            default: 'draft',
        },
        publishedAt: Date,
    },
    {
        timestamps: true,
    }
);

// Indexes for optimized searching and filtering
courseSchema.index({ instructorId: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ subcategory: 1 });
courseSchema.index({ status: 1 });
courseSchema.index({ level: 1 });
courseSchema.index({ createdAt: -1 }); // Often used for sorting
courseSchema.index({ title: 'text', shortDescription: 'text' }); // Search optimization
courseSchema.index({ slug: 1, tenantId: 1 }, { unique: true });

// Apply Tenant Plugin
courseSchema.plugin(tenantPlugin);

export const Course = model<ICourse>('Course', courseSchema);
