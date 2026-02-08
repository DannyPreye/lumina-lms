import { Notification, INotification } from './notification.model';
import { getTenant } from '../../common/contexts/tenant.context';
import createError from 'http-errors';

export class NotificationService
{
    /**
     * Internal method to create and "send" a notification.
     * In a real system, this would trigger Email/Push/SMS providers.
     */
    static async send(notificationData: any)
    {
        const tenant = getTenant();

        // Prepare branding data for email/template
        const branding = tenant ? {
            name: tenant.name,
            logo: tenant.config.branding.logoUrl,
            color: tenant.config.branding.primaryColor,
            font: tenant.config.branding.fontFamily
        } : {
            name: 'Lumina LMS',
            color: '#007bff'
        };

        const notification = await Notification.create({
            ...notificationData,
            tenantId: tenant?._id, // Explicitly set if not handled by plugin (though plugin should handle it)
            metadata: {
                ...notificationData.metadata,
                branding // Store branding snapshot if needed
            },
            sentAt: new Date(),
        });

        // TODO: Integrate with SendGrid (Email), Firebase (Push), or Twilio (SMS) based on channels
        if (notification.channels.email) {
            // await EmailProvider.send({
            //    to: notification.userId, // resolve email
            //    subject: notification.title,
            //    templateId: '...', // dynamic based on tenant?
            //    dynamicTemplateData: {
            //       ...notification.metadata,
            //       tenant_name: branding.name,
            //       tenant_logo: branding.logo,
            //       primary_color: branding.color
            //    }
            // })
            console.log(`[Email] Sending to user ${notification.userId} from ${branding.name}`);
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
