import { LearningAnalytics } from './learning-analytics.model';
import { CourseAnalytics } from './course-analytics.model';
import { Enrollment } from '../enrollments/enrollment.model';
import { Types } from 'mongoose';

export class AnalyticsService
{
    /**
     * Tracks daily metrics for a student.
     * Increments existing metrics or creates a new daily record.
     */
    static async trackActivity(userId: string, courseId: string, metric: string, value: number = 1)
    {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const update: any = { $inc: {} };
        update.$inc[ `metrics.${metric}` ] = value;

        if (metric === 'timeSpent') {
            update.$inc[ 'engagement.activeMinutes' ] = Math.round(value / 60);
        }

        return await LearningAnalytics.findOneAndUpdate(
            { userId: new Types.ObjectId(userId), courseId: new Types.ObjectId(courseId), date: today },
            {
                ...update,
                $set: { 'engagement.lastSeen': new Date() }
            },
            { upsert: true, new: true }
        );
    }

    static async getStudentAnalytics(userId: string, courseId: string)
    {
        return await LearningAnalytics.find({ userId, courseId }).sort('-date').limit(30);
    }

    static async getCourseReport(courseId: string, period: string = 'weekly')
    {
        return await CourseAnalytics.findOne({ courseId, period }).sort('-startDate');
    }

    /**
     * Admin method to generate aggregated course analytics.
     * Normally this would run as a background cron job.
     */
    static async syncCourseAnalytics(courseId: string)
    {
        const enrollments = await Enrollment.find({ courseId });

        const stats = {
            total: enrollments.length,
            active: enrollments.filter(e => e.status === 'active').length,
            completed: enrollments.filter(e => e.status === 'completed').length,
            dropped: enrollments.filter(e => e.status === 'dropped').length,
            averageProgress: enrollments.reduce((acc, e) => acc + e.progress.percentComplete, 0) / (enrollments.length || 1)
        };

        const today = new Date();
        const startDate = new Date();
        startDate.setDate(today.getDate() - 7);

        return await CourseAnalytics.findOneAndUpdate(
            { courseId: new Types.ObjectId(courseId), period: 'weekly', startDate: { $lte: today }, endDate: { $gte: today } },
            {
                $set: {
                    enrollment: { ...stats, new: 0 }, // Simplified
                    endDate: today,
                    'engagement.averageProgress': stats.averageProgress,
                    lastUpdated: new Date()
                }
            },
            { upsert: true, new: true }
        );
    }
}
