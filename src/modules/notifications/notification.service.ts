import { Notification, INotification } from './notification.model';
import createError from 'http-errors';

export class NotificationService
{
    /**
     * Internal method to create and "send" a notification.
     * In a real system, this would trigger Email/Push/SMS providers.
     */
    static async send(notificationData: any)
    {
        const notification = await Notification.create({
            ...notificationData,
            sentAt: new Date(),
        });

        // TODO: Integrate with SendGrid (Email), Firebase (Push), or Twilio (SMS) based on channels
        if (notification.channels.email) {
            // await EmailProvider.send(...)
        }

        return notification;
    }

    static async getMyNotifications(userId: string, query: any)
    {
        const {
            page = 1,
            limit = 20,
            status,
            type,
            priority
        } = query;

        const filter: any = { userId };

        if (status) filter.status = status;
        if (type) filter.type = type;
        if (priority) filter.priority = priority;

        const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

        const notifications = await Notification.find(filter)
            .sort('-createdAt')
            .skip(skip)
            .limit(parseInt(limit as string));

        const total = await Notification.countDocuments(filter);

        return {
            notifications,
            total,
            page: parseInt(page as string),
            pages: Math.ceil(total / parseInt(limit as string))
        };
    }

    static async markAsRead(notificationId: string, userId: string)
    {
        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, userId },
            { $set: { status: 'read', readAt: new Date() } },
            { new: true }
        );

        if (!notification) throw createError(404, 'Notification not found');
        return notification;
    }

    static async markAllAsRead(userId: string)
    {
        return await Notification.updateMany(
            { userId, status: 'unread' },
            { $set: { status: 'read', readAt: new Date() } }
        );
    }

    static async deleteNotification(notificationId: string, userId: string)
    {
        const result = await Notification.deleteOne({ _id: notificationId, userId });
        if (result.deletedCount === 0) throw createError(404, 'Notification not found');
        return true;
    }
}
