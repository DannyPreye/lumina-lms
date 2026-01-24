import { Category, ITag, Tag } from './taxonomy.model';
import { Review, Announcement } from './feedback-announcement.model';
import { Transaction, SystemSetting, AuditLog } from './system-core.model';
import createError from 'http-errors';
import { Types } from 'mongoose';
import slugify from 'slugify';
import { NotificationService } from '../notifications/notification.service';
import { User } from '../users/user.model';

export class SystemAdminService
{
    // Taxonomy
    static async createCategory(data: any)
    {
        const slug = slugify(data.name, { lower: true });
        return await Category.create({ ...data, slug });
    }

    static async getCategories()
    {
        return await Category.find({ isActive: true }).sort('order');
    }

    // Reviews
    static async addReview(userId: string, data: any)
    {
        const review = await Review.create({ ...data, userId });
        // In a real app, update course average rating here
        return review;
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
