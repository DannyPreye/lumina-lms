import { Schema, model, Document, Types } from 'mongoose';
import { tenantPlugin, ITenantAware } from '../../common/plugins/tenant.plugin';

export interface ILearningAnalytics extends Document, ITenantAware
{
    userId: Types.ObjectId;
    courseId: Types.ObjectId;
    date: Date;
    metrics: {
        timeSpent: number; // seconds
        lessonsViewed: number;
        quizzesTaken: number;
        assignmentsSubmitted: number;
        discussionPosts: number;
        videosWatched: number;
        resourcesDownloaded: number;
        reviewsWritten: number;
    };
    engagement: {
        loginCount: number;
        activeMinutes: number;
        lastSeen: Date;
    };
    performance: {
        averageQuizScore: number;
        averageAssignmentScore: number;
        completionRate: number;
    };
    predictions?: {
        riskOfDropout: number; // 0-1 probability
        estimatedCompletion?: Date;
        recommendedPace?: string;
    };
    createdAt: Date;
}

const learningAnalyticsSchema = new Schema<ILearningAnalytics>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
        date: { type: Date, required: true },
        metrics: {
            timeSpent: { type: Number, default: 0 },
            lessonsViewed: { type: Number, default: 0 },
            quizzesTaken: { type: Number, default: 0 },
            assignmentsSubmitted: { type: Number, default: 0 },
            discussionPosts: { type: Number, default: 0 },
            videosWatched: { type: Number, default: 0 },
            resourcesDownloaded: { type: Number, default: 0 },
            reviewsWritten: { type: Number, default: 0 },
        },
        engagement: {
            loginCount: { type: Number, default: 0 },
            activeMinutes: { type: Number, default: 0 },
            lastSeen: { type: Date, default: Date.now },
        },
        performance: {
            averageQuizScore: { type: Number, default: 0 },
            averageAssignmentScore: { type: Number, default: 0 },
            completionRate: { type: Number, default: 0 },
        },
        predictions: {
            riskOfDropout: { type: Number, default: 0 },
            estimatedCompletion: Date,
            recommendedPace: String,
        },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

// Index for daily tracking per user/course
learningAnalyticsSchema.index({ userId: 1, courseId: 1, date: 1 }, { unique: true });

learningAnalyticsSchema.plugin(tenantPlugin);

export const LearningAnalytics = model<ILearningAnalytics>('LearningAnalytics', learningAnalyticsSchema);
