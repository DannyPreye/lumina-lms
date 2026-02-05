import { Category, ITag, Tag } from './taxonomy.model';
import { Review, Announcement } from './feedback-announcement.model';
import { Transaction, SystemSetting, AuditLog } from './system-core.model';
import createError from 'http-errors';
import { Types } from 'mongoose';
import slugify from 'slugify';
import { NotificationService } from '../notifications/notification.service';
import { User } from '../users/user.model';
import { Course } from '../courses/course.model';
import { InstructorProfile } from '../users/instructor-profile.model';

export class SystemAdminService
{
    // Taxonomy
    static async createCategory(data: any)
    {
        const slug = slugify(data.name, { lower: true });
        return await Category.create({ ...data, slug });
    }

    /**
     * Fetch categories with flexible options:
     * - If no params: returns all parent categories with their subcategories populated.
     * - If parentId is provided: returns subcategories of the given parent.
     * - If subOnly is true: returns only subcategories (categories with a parent).
     * - If parentOnly is true: returns only parent categories (categories with no parent).
     *
     * @param options Optional filter options:
     *   - parentId: string (fetch subcategories of this parent)
     *   - subOnly: boolean (fetch only subcategories)
     *   - parentOnly: boolean (fetch only parent categories)
     */
    static async getCategories(options: { parentId?: string, subOnly?: boolean, parentOnly?: boolean; } = {})
    {
        const { parentId, subOnly, parentOnly } = options;
        const filter: any = { isActive: true };

        console.log(subOnly, parentOnly);

        if (parentId) {
            filter.parentId = parentId;
        } else if (subOnly) {
            filter.parentId = { $exists: true, $ne: null };
        } else if (parentOnly) {
            filter.parentId = { $exists: false };
        }

        console.log(filter);
        // If fetching parent categories (default), populate subcategories
        if (!parentId && !subOnly) {
            return await Category.find(filter)
                .sort('order')
                .populate({ path: 'subcategories', match: { isActive: true }, options: { sort: { order: 1 } } });
        }
        // Otherwise, just return the filtered categories
        return await Category.find(filter).sort('order');
    }

    // Reviews
    static async addReview(userId: string, data: any)
    {
        const { courseId, rating } = data;
        const review = await Review.create({ ...data, userId, status: 'approved' });

        // Update Course Average Rating
        const courseReviews = await Review.find({ courseId, status: 'approved' });
        const totalReviews = courseReviews.length;
        const avgRating = courseReviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews;

        const course = await Course.findByIdAndUpdate(courseId, {
            $set: {
                'metadata.averageRating': Math.round(avgRating * 10) / 10,
                'metadata.totalReviews': totalReviews
            }
        }, { new: true });

        if (course) {
            // Update Instructor Average Rating
            // Get all courses by this instructor
            const instructorCourses = await Course.find({ instructorId: course.instructorId });
            const instructorCourseIds = instructorCourses.map(c => c._id);

            const allInstructorReviews = await Review.find({
                courseId: { $in: instructorCourseIds },
                status: 'approved'
            });

            if (allInstructorReviews.length > 0) {
                const instructorAvgRating = allInstructorReviews.reduce((acc, curr) => acc + curr.rating, 0) / allInstructorReviews.length;
                await InstructorProfile.findOneAndUpdate(
                    { user: course.instructorId },
                    { $set: { averageRating: Math.round(instructorAvgRating * 10) / 10 } },
                    { upsert: true }
                );
            }
        }

        return review;
    }

    static async getCourseReviews(courseId: string, query: any = {})
    {
        const { page = 1, limit = 10, rating } = query;
        const filter: any = { courseId, status: 'approved' };
        if (rating) filter.rating = Number(rating);

        const skip = (Number(page) - 1) * Number(limit);

        const reviews = await Review.find(filter)
            .populate({
                path: 'userId',
                select: 'email',
                populate: [ { path: 'studentProfile' }, { path: 'instructorProfile' } ]
            })
            .sort('-createdAt')
            .skip(skip)
            .limit(Number(limit));

        const total = await Review.countDocuments(filter);

        return {
            reviews,
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit))
        };
    }

    // Transactions
    static async logTransaction(data: any)
    {
        return await Transaction.create(data);
    }

    // Announcements
    static async createAnnouncement(authorId: string, data: any)
    {
        const announcement = await Announcement.create({ ...data, authorId });

        // --- INTER-MODULE CONNECTION: Notification ---
        // Basic broadcast logic (In a large app, this would be a background job)
        const targetQuery: any = {};
        if (data.targetAudience === 'students') targetQuery.roles = 'student';
        if (data.targetAudience === 'instructors') targetQuery.roles = 'instructor';

        const users = await User.find(targetQuery).select('_id');

        // Parallel notification dispatch
        await Promise.all(users.map(user =>
            NotificationService.send({
                userId: user._id,
                type: 'announcement',
                title: announcement.title,
                message: announcement.content.substring(0, 100) + '...',
                data: { courseId: announcement.courseId },
                priority: announcement.type === 'urgent' ? 'high' : 'normal',
                actionUrl: announcement.courseId ? `/courses/${announcement.courseId}/announcements` : '/announcements'
            })
        ));

        return announcement;
    }

    static async getGlobalAnnouncements()
    {
        const today = new Date();
        return await Announcement.find({
            courseId: { $exists: false },
            scheduledFor: { $lte: today },
            $or: [ { expiresAt: { $exists: false } }, { expiresAt: { $gt: today } } ]
        }).sort('-isPinned -createdAt');
    }

    // Settings
    static async updateSetting(key: string, value: any, userId: string)
    {
        return await SystemSetting.findOneAndUpdate(
            { key },
            { value, updatedBy: new Types.ObjectId(userId) },
            { upsert: true, new: true }
        );
    }

    static async getSetting(key: string)
    {
        const setting = await SystemSetting.findOne({ key });
        return setting?.value;
    }

    // Audit Logs
    static async logAction(userId: string, action: string, entity: string, entityId: string, changes?: any, req?: any)
    {
        return await AuditLog.create({
            userId: new Types.ObjectId(userId),
            action,
            entity,
            entityId: new Types.ObjectId(entityId),
            changes,
            ipAddress: req?.ip,
            userAgent: req?.headers[ 'user-agent' ]
        });
    }
}
