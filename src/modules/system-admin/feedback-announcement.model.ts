import { Schema, model, Document, Types } from 'mongoose';

export interface IReview extends Document
{
    courseId: Types.ObjectId;
    userId: Types.ObjectId;
    rating: number;
    title?: string;
    review: string;
    helpful: {
        count: number;
        users: Types.ObjectId[];
    };
    instructorResponse?: {
        response: string;
        respondedAt: Date;
    };
    isVerifiedPurchase: boolean;
    status: 'pending' | 'approved' | 'flagged' | 'removed';
    createdAt: Date;
    updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
    {
        courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        title: String,
        review: { type: String, required: true },
        helpful: {
            count: { type: Number, default: 0 },
            users: [ { type: Schema.Types.ObjectId, ref: 'User' } ],
        },
        instructorResponse: {
            response: String,
            respondedAt: Date,
        },
        isVerifiedPurchase: { type: Boolean, default: false },
        status: {
            type: String,
            enum: [ 'pending', 'approved', 'flagged', 'removed' ],
            default: 'pending',
        },
    },
    { timestamps: true }
);

export const Review = model<IReview>('Review', reviewSchema);

export interface IAnnouncement extends Document
{
    courseId?: Types.ObjectId; // null for global
    authorId: Types.ObjectId;
    title: string;
    content: string;
    type: 'info' | 'warning' | 'urgent' | 'success';
    targetAudience: 'all' | 'students' | 'instructors';
    attachments?: {
        filename: string;
        url: string;
        type: string;
    }[];
    scheduledFor?: Date;
    expiresAt?: Date;
    isPinned: boolean;
    readBy: {
        userId: Types.ObjectId;
        readAt: Date;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

const announcementSchema = new Schema<IAnnouncement>(
    {
        courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
        authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        title: { type: String, required: true },
        content: { type: String, required: true },
        type: { type: String, enum: [ 'info', 'warning', 'urgent', 'success' ], default: 'info' },
        targetAudience: { type: String, enum: [ 'all', 'students', 'instructors' ], default: 'all' },
        attachments: [
            {
                filename: String,
                url: String,
                type: String,
            },
        ],
        scheduledFor: Date,
        expiresAt: Date,
        isPinned: { type: Boolean, default: false },
        readBy: [
            {
                userId: { type: Schema.Types.ObjectId, ref: 'User' },
                readAt: { type: Date, default: Date.now },
            },
        ],
    },
    { timestamps: true }
);

export const Announcement = model<IAnnouncement>('Announcement', announcementSchema);
