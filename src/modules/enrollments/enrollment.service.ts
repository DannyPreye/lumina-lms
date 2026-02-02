import { Enrollment, IEnrollment } from './enrollment.model';
import { Course } from '../courses/course.model';
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
                populate: { path: 'instructorId', select: 'profile' }
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
        const enrollment = await Enrollment.findOne({ userId, courseId });
        if (!enrollment) throw createError(404, 'Enrollment not found');

        const lessonObjectId = new Types.ObjectId(lessonId);

        if (enrollment.progress.completedLessons.includes(lessonObjectId)) {
            return enrollment;
        }

        enrollment.progress.completedLessons.push(lessonObjectId);

        // --- INTER-MODULE CONNECTION: Gamification ---
        // Award 50 points for every lesson completed
        await GamificationService.addPoints(userId, 50, 'lesson_complete', lessonId);

        // --- INTER-MODULE CONNECTION: Analytics ---
        // Track the lesson view metric
        await AnalyticsService.trackActivity(userId, courseId, 'lessonsViewed', 1);

        // Simple calculation for percentage
        const course = await Course.findById(courseId);
        if (course && course.metadata.totalLessons > 0) {
            enrollment.progress.percentComplete = Math.round(
                (enrollment.progress.completedLessons.length / course.metadata.totalLessons) * 100
            );
        }

        if (enrollment.progress.percentComplete === 100) {
            enrollment.status = 'completed';
            enrollment.completedAt = new Date();

            // --- INTER-MODULE CONNECTION: Certificates ---
            // Automatically issue a certificate upon passing
            if (course && course.certification.provided && course.certification.certificateTemplateId) {
                await CertificateService.generateCertificate(
                    userId,
                    courseId,
                    course.certification.certificateTemplateId.toString()
                );
            }

            // --- INTER-MODULE CONNECTION: Gamification ---
            // Award trophy for course completion
            await GamificationService.awardAchievement(userId, 'course_complete_placeholder', courseId);
        }

        enrollment.lastAccessedAt = new Date();
        return await enrollment.save();
    }
}
