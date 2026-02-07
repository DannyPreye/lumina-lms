import { Enrollment, IEnrollment } from './enrollment.model';
import { Course } from '../courses/course.model';
import { InstructorProfile } from '../users/instructor-profile.model';
import { StudentProfile } from '../users/student-profile.model';
import createError from 'http-errors';
import { Types } from 'mongoose';
import { GamificationService } from '../gamification/gamification.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { CertificateService } from '../certificates/certificate.service';

export class EnrollmentService
{
    static async enrollUser(userId: string, courseId: string, enrollmentType: string = 'self')
    {
        const course = await Course.findById(courseId);
        if (!course) throw createError(404, 'Course not found');
        if (course.status !== 'published') throw createError(400, 'Course is not available for enrollment');

        const existingEnrollment = await Enrollment.findOne({ userId, courseId });
        if (existingEnrollment) throw createError(400, 'User is already enrolled in this course');

        const enrollment = await Enrollment.create({
            userId,
            courseId,
            enrollmentType,
            status: 'active',
            progress: {
                completedLessons: [],
                completedModules: [],
                percentComplete: 0,
                lessonsProgress: [],
                quizzesProgress: []
            }
        });

        // Increment total students count in course metadata
        course.metadata.totalStudents += 1;
        await course.save();

        // Update InstructorProfile: totalStudents
        await InstructorProfile.findOneAndUpdate(
            { user: course.instructorId },
            { $inc: { totalStudents: 1 } },
            { upsert: true }
        );

        // Update StudentProfile: enrolledCoursesCount
        await StudentProfile.findOneAndUpdate(
            { user: userId },
            { $inc: { enrolledCoursesCount: 1 } },
            { upsert: true }
        );

        // --- INTER-MODULE CONNECTION: Analytics ---
        await AnalyticsService.trackCourseMetric(courseId, 'enrollment', 'new', 1);

        return enrollment;
    }

    static async getUserEnrollments(userId: string, query: any)
    {
        const {
            page = 1,
            limit = 10,
            status,
            type,
            sort = '-enrolledAt'
        } = query;

        const filter: any = { userId };

        if (status) {
            filter.status = status;
        }

        if (type) {
            filter.enrollmentType = type;
        }

        const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

        const enrollments = await Enrollment.find(filter)
            .populate({
                path: 'courseId',
                select: 'title thumbnail shortDescription slug category subcategory',
                populate: {
                    path: 'instructorId',
                    select: 'email',
                    populate: { path: 'instructorProfile' }
                }
            })
            .sort(sort as string)
            .skip(skip)
            .limit(parseInt(limit as string));

        const total = await Enrollment.countDocuments(filter);

        return {
            enrollments,
            total,
            page: parseInt(page as string),
            pages: Math.ceil(total / parseInt(limit as string))
        };
    }

    static async getEnrollmentProgress(userId: string, courseId: string)
    {
        const enrollment = await Enrollment.findOne({ userId, courseId })
            .populate('courseId', 'title metadata');
        if (!enrollment) throw createError(404, 'Enrollment not found');
        return enrollment;
    }

    static async markLessonAsComplete(userId: string, courseId: string, lessonId: string)
    {
        return await this.updateProgress(userId, courseId, lessonId, { status: 'completed' });
    }

    static async updateProgress(
        userId: string,
        courseId: string,
        lessonId: string,
        data: { status?: 'not_started' | 'in_progress' | 'completed'; timeSpent?: number; totalDuration?: number; }
    )
    {
        const enrollment = await Enrollment.findOne({ userId, courseId });
        if (!enrollment) throw createError(404, 'Enrollment not found');

        const lessonObjectId = new Types.ObjectId(lessonId);

        // Find existing progress entry for this lesson
        let lessonProgress = enrollment.progress.lessonsProgress.find(lp => lp.lessonId.toString() === lessonId);

        if (!lessonProgress) {
            // Create new entry
            enrollment.progress.lessonsProgress.push({
                lessonId: lessonObjectId,
                status: data.status || 'in_progress',
                timeSpent: data.timeSpent || 0,
                lastAccessedAt: new Date(),
                completedAt: data.status === 'completed' ? new Date() : undefined
            });
            lessonProgress = enrollment.progress.lessonsProgress[ enrollment.progress.lessonsProgress.length - 1 ];
        } else {
            // Update existing entry
            if (data.status) lessonProgress.status = data.status;
            if (data.timeSpent) {
                // Accumulate time spent
                lessonProgress.timeSpent += data.timeSpent;
                enrollment.totalTimeSpent += data.timeSpent;
            }
            lessonProgress.lastAccessedAt = new Date();
            if (data.status === 'completed' && !lessonProgress.completedAt) {
                lessonProgress.completedAt = new Date();
            }
        }

        // --- Recalculate Course Completion ---
        if (data.status === 'completed') {
            // Add to completedLessons if not already there
            const alreadyCompleted = enrollment.progress.completedLessons.some(id => id.toString() === lessonId);
            if (!alreadyCompleted) {
                enrollment.progress.completedLessons.push(lessonObjectId);

                // --- INTER-MODULE CONNECTION: Gamification ---
                await GamificationService.addPoints(userId, 10, 'lesson_complete', lessonId); // Reduced points for granular updates

                // --- INTER-MODULE CONNECTION: Analytics ---
                await AnalyticsService.trackActivity(userId, courseId, 'lessonsViewed', 1);
            }
        }

        const course = await Course.findById(courseId);
        if (course) {
            // Update percentComplete
            const totalLessons = course.metadata.totalLessons || 1; // Avoid division by zero
            enrollment.progress.percentComplete = Math.round(
                (enrollment.progress.completedLessons.length / totalLessons) * 100
            );

            // Check for Course Completion
            if (enrollment.progress.percentComplete >= 100 && enrollment.status !== 'completed') {
                enrollment.status = 'completed';
                enrollment.completedAt = new Date();

                // --- INTER-MODULE CONNECTION: Certificates ---
                if (course.certification.provided && course.certification.certificateTemplateId) {
                    await CertificateService.generateCertificate(userId, courseId, course.certification.certificateTemplateId.toString());
                }

                // --- INTER-MODULE CONNECTION: Gamification ---
                await GamificationService.awardAchievement(userId, 'course_complete_placeholder', courseId);

                // --- INTER-MODULE CONNECTION: Analytics ---
                await AnalyticsService.trackCourseMetric(courseId, 'enrollment', 'completed', 1);
            }
        }

        // Update user's total active minutes in LearningAnalytics
        if (data.timeSpent) {
            // We can fire-and-forget this or await it
            AnalyticsService.trackActivity(userId, courseId, 'timeSpent', data.timeSpent);
        }

        enrollment.lastAccessedAt = new Date();
        return await enrollment.save();
    }
}
