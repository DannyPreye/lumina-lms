

import { UserService } from '../users/user.service';
import { EnrollmentService } from '../enrollments/enrollment.service';
import { GamificationService } from '../gamification/gamification.service';
import { Course } from '../courses/course.model';
import { AnalyticsService } from '../analytics/analytics.service';
import { Certificate } from '../certificates/certificate.model';
import { Category } from '../system-admin/taxonomy.model';
import { Announcement } from '../system-admin/feedback-announcement.model';
import { ActivityService } from '../activity/activity.service';

class DashboardService
{
    static async getStudentDashboard(user: any)
    {
        // user: { id, ... }
        const userId = user.id || user._id;
        // 1. Get user profile
        const profile = await UserService.findById(userId);

        // 2. Get enrollments (limit 6, sorted by lastAccessedAt)
        const enrollmentsResult = await EnrollmentService.getUserEnrollments(userId, { page: 1, limit: 6, sort: '-lastAccessedAt' });
        const enrollments = enrollmentsResult.enrollments || [];

        // 3. Get gamification stats (points, streak, level)
        const stats = await GamificationService.getUserStats(userId);
        const points = stats.points || null;

        return {
            profile,
            enrollments,
            points,
        };
    }

    static async getAdminDashboard(user: any)
    {
        // 1. Total users
        const totalUsers = await UserService.findAll({}, { page: 1, limit: 1 }).then(r => r.total || 0);

        // 2. Certificates issued
        const certificatesIssued = await Certificate.countDocuments({ status: 'active' });

        // 3. Active categories
        const activeCategories = await Category.countDocuments({ isActive: true });

        // 4. Announcements
        const announcements = await Announcement.countDocuments({});

        // 5. Recent activity (from ActivityService)
        const recentActivityDocs = await ActivityService.getRecent(5);
        const recentActivity = recentActivityDocs.map((a: any) => ({
            action: a.type,
            user: a.user?.email || a.user?.profile?.displayName || 'Unknown',
            time: a.createdAt,
            meta: a.meta,
        }));

        return {
            totalUsers,
            certificatesIssued,
            activeCategories,
            announcements,
            recentActivity,
        };
    }

    static async getInstructorDashboard(user: any)
    {
        // user: { id, ... }
        const userId = user.id || user._id;
        // 1. Get all courses where instructorId == userId
        const courses = await Course.find({ instructorId: userId });

        // 2. For each course, get analytics (weekly)
        const courseStats = await Promise.all(
            courses.map(async (course) =>
            {
                // Get analytics (weekly)
                const analytics = await AnalyticsService.getCourseReport(course._id.toString(), 'weekly');

                // Fallbacks and more accurate data sources
                // Use course metadata for totals if available, otherwise analytics
                const students = course.metadata?.totalStudents || analytics?.enrollment?.total || 0;
                const avgRating = course.metadata?.averageRating || analytics?.reviews?.averageRating || 0;

                // For views, courseViews is a better metric than dailyActiveUsers
                const views = analytics?.engagement?.courseViews || analytics?.engagement?.dailyActiveUsers || 0;
                const completionRate = analytics?.engagement?.completionRate || 0;

                return {
                    courseId: course._id.toString(),
                    courseName: course.title,
                    students,
                    completionRate: Math.round(completionRate),
                    avgRating: Number(avgRating.toFixed ? avgRating.toFixed(1) : avgRating),
                    views,
                };
            })
        );

        return {
            courseStats,
        };
    }
}

export default DashboardService;
