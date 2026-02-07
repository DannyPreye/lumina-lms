import { Schema, model, Document, Types } from 'mongoose';

export interface ICourseAnalytics extends Document
{
    courseId: Types.ObjectId;
    period: 'daily' | 'weekly' | 'monthly';
    startDate: Date;
    endDate: Date;
    enrollment: {
        total: number;
        new: number;
        active: number;
        completed: number;
        dropped: number;
    };
    engagement: {
        averageTimeSpent: number;
        completionRate: number;
        averageProgress: number;
        dailyActiveUsers: number;
        courseViews: number;
    };
    performance: {
        averageQuizScore: number;
        averageAssignmentScore: number;
        passRate: number;
    };
    reviews: {
        total: number;
        new: number;
        averageRating: number;
    };
    content: {
        mostViewedLessons: {
            lessonId: Types.ObjectId;
            views: number;
        }[];
        dropOffPoints: {
            lessonId: Types.ObjectId;
            dropOffRate: number;
        }[];
    };
    revenue: {
        totalRevenue: number;
        averageRevenuePerStudent: number;
    };
    createdAt: Date;
}

const courseAnalyticsSchema = new Schema<ICourseAnalytics>(
    {
        courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
        period: { type: String, enum: [ 'daily', 'weekly', 'monthly' ], required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        enrollment: {
            total: { type: Number, default: 0 },
            new: { type: Number, default: 0 },
            active: { type: Number, default: 0 },
            completed: { type: Number, default: 0 },
            dropped: { type: Number, default: 0 },
        },
        engagement: {
            averageTimeSpent: { type: Number, default: 0 },
            completionRate: { type: Number, default: 0 },
            averageProgress: { type: Number, default: 0 },
            dailyActiveUsers: { type: Number, default: 0 },
            courseViews: { type: Number, default: 0 },
        },
        performance: {
            averageQuizScore: { type: Number, default: 0 },
            averageAssignmentScore: { type: Number, default: 0 },
            passRate: { type: Number, default: 0 },
        },
        reviews: {
            total: { type: Number, default: 0 },
            new: { type: Number, default: 0 },
            averageRating: { type: Number, default: 0 },
        },
        content: {
            mostViewedLessons: [
                {
                    lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson' },
                    views: Number,
                },
            ],
            dropOffPoints: [
                {
                    lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson' },
                    dropOffRate: Number,
                },
            ],
        },
        revenue: {
            totalRevenue: { type: Number, default: 0 },
            averageRevenuePerStudent: { type: Number, default: 0 },
        },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

courseAnalyticsSchema.index({ courseId: 1, period: 1, startDate: 1 });

export const CourseAnalytics = model<ICourseAnalytics>('CourseAnalytics', courseAnalyticsSchema);
