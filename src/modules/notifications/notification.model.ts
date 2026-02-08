import { Schema, model, Document, Types } from 'mongoose';
import { tenantPlugin, ITenantAware } from '../../common/plugins/tenant.plugin';

export interface INotification extends Document, ITenantAware
{
    userId: Types.ObjectId;
    type: 'course_update' | 'assignment_due' | 'quiz_graded' | 'discussion_reply' | 'live_session' | 'achievement' | 'announcement' | 'certificate_issued';
    title: string;
    message: string;
    data: {
        courseId?: Types.ObjectId;
        lessonId?: Types.ObjectId;
        assignmentId?: Types.ObjectId;
        discussionId?: Types.ObjectId;
        [ key: string ]: any;
    };
    actionUrl?: string;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    channels: {
        inApp: boolean;
        email: boolean;
        push: boolean;
        sms: boolean;
    };
    status: 'unread' | 'read' | 'archived';
    readAt?: Date;
    scheduledFor?: Date;
    sentAt?: Date;
    createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        type: {
            type: String,
            enum: [ 'course_update', 'assignment_due', 'quiz_graded', 'discussion_reply', 'live_session', 'achievement', 'announcement', 'certificate_issued' ],
            required: true,
        },
        title: { type: String, required: true },
        message: { type: String, required: true },
        data: {
            courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
            lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson' },
            assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment' },
            discussionId: { type: Schema.Types.ObjectId, ref: 'Discussion' },
        },
        actionUrl: String,
        priority: { type: String, enum: [ 'low', 'normal', 'high', 'urgent' ], default: 'normal' },
        channels: {
            inApp: { type: Boolean, default: true },
            email: { type: Boolean, default: false },
            push: { type: Boolean, default: false },
            sms: { type: Boolean, default: false },
        },
        status: { type: String, enum: [ 'unread', 'read', 'archived' ], default: 'unread' },
        readAt: Date,
        scheduledFor: Date,
        sentAt: Date,
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

notificationSchema.index({ userId: 1, status: 1, createdAt: -1 });

notificationSchema.plugin(tenantPlugin);

export const Notification = model<INotification>('Notification', notificationSchema);
