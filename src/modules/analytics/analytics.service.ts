import { LearningAnalytics } from './learning-analytics.model';
import { CourseAnalytics } from './course-analytics.model';
import { Enrollment } from '../enrollments/enrollment.model';
import { Review } from '../system-admin/feedback-announcement.model';
import { QuizAttempt } from '../assessments/quiz-attempt.model';
import { Submission } from '../assessments/submission.model';
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

    /**
     * Tracks course-level metrics (enrollments, views, reviews, etc.)
     */
    static async trackCourseMetric(courseId: string, section: string, metric: string, value: number = 1)
    {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        const update: any = { $inc: {} };
        update.$inc[ `${section}.${metric}` ] = value;

        return await CourseAnalytics.findOneAndUpdate(
            { courseId: new Types.ObjectId(courseId), period: 'weekly', startDate: startOfWeek },
            {
                ...update,
                $set: { endDate: endOfWeek }
            },
            { upsert: true, new: true }
        );
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
        const reviews = await Review.find({ courseId, status: 'approved' });
        const quizAttempts = await QuizAttempt.find({ courseId });
        const projectSubmissions = await Submission.find({ courseId });

        const enrollmentStats = {
            total: enrollments.length,
            active: enrollments.filter(e => e.status === 'active').length,
            completed: enrollments.filter(e => e.status === 'completed').length,
            dropped: enrollments.filter(e => e.status === 'dropped').length,
            averageProgress: enrollments.reduce((acc, e) => acc + e.progress.percentComplete, 0) / (enrollments.length || 1)
        };

        const reviewStats = {
            total: reviews.length,
            averageRating: reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1),
            new: 0 // Reset new in sync, it's tracked by trackCourseMetric
        };

        const performanceStats = {
            averageQuizScore: quizAttempts.reduce((acc, a) => acc + a.score, 0) / (quizAttempts.length || 1),
            averageAssignmentScore: projectSubmissions.filter(s => s.grade).reduce((acc, s) => acc + (s.grade?.percentage || 0), 0) / (projectSubmissions.filter(s => s.grade).length || 1),
            passRate: (quizAttempts.filter(a => a.passed).length / (quizAttempts.length || 1)) * 100
        };

        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        const completionRate = (enrollmentStats.completed / (enrollments.length || 1)) * 100;

        return await CourseAnalytics.findOneAndUpdate(
            { courseId: new Types.ObjectId(courseId), period: 'weekly', startDate: startOfWeek },
            {
                $set: {
                    enrollment: { ...enrollmentStats, new: 0 }, // 'new' is normally tracked incrementally
                    reviews: reviewStats,
                    performance: performanceStats,
                    endDate: endOfWeek,
                    'engagement.completionRate': completionRate,
                    'engagement.averageProgress': enrollmentStats.averageProgress,
                    lastUpdated: new Date()
                }
            },
            { upsert: true, new: true }
        );
    }
}
