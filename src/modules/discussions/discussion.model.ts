import { Schema, model, Document, Types } from 'mongoose';

export interface IReply
{
    _id: Types.ObjectId;
    authorId: Types.ObjectId;
    body: string;
    parentReplyId?: Types.ObjectId;
    attachments?: {
        filename: string;
        url: string;
        type: string;
    }[];
    upvotes: number;
    downvotes: number;
    upvotedBy: Types.ObjectId[];
    downvotedBy: Types.ObjectId[];
    isAcceptedAnswer: boolean;
    aiGenerated: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}

export interface IDiscussion extends Document
{
    courseId: Types.ObjectId;
    lessonId?: Types.ObjectId;
    type: 'forum' | 'q_and_a' | 'announcement';
    title: string;
    body: string;
    authorId: Types.ObjectId;
    isPinned: boolean;
    isLocked: boolean;
    tags: string[];
    attachments?: {
        filename: string;
        url: string;
        type: string;
        size: number;
    }[];
    views: number;
    upvotes: number;
    downvotes: number;
    upvotedBy: Types.ObjectId[];
    downvotedBy: Types.ObjectId[];
    hasAcceptedAnswer: boolean;
    acceptedAnswerId?: Types.ObjectId;
    replies: IReply[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}

const replySchema = new Schema<IReply>(
    {
        authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        body: { type: String, required: true },
        parentReplyId: { type: Schema.Types.ObjectId },
        attachments: [
            {
                filename: String,
                url: String,
                type: String,
            },
        ],
        upvotes: { type: Number, default: 0 },
        downvotes: { type: Number, default: 0 },
        upvotedBy: [ { type: Schema.Types.ObjectId, ref: 'User' } ],
        downvotedBy: [ { type: Schema.Types.ObjectId, ref: 'User' } ],
        isAcceptedAnswer: { type: Boolean, default: false },
        aiGenerated: { type: Boolean, default: false },
        deletedAt: Date,
    },
    { timestamps: true }
);

const discussionSchema = new Schema<IDiscussion>(
    {
        courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
        lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson' },
        type: { type: String, enum: [ 'forum', 'q_and_a', 'announcement' ], default: 'forum' },
        title: { type: String, required: true },
        body: { type: String, required: true },
        authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        isPinned: { type: Boolean, default: false },
        isLocked: { type: Boolean, default: false },
        tags: [ String ],
        attachments: [
            {
                filename: String,
                url: String,
                type: String,
                size: Number,
            },
        ],
        views: { type: Number, default: 0 },
        upvotes: { type: Number, default: 0 },
        downvotes: { type: Number, default: 0 },
        upvotedBy: [ { type: Schema.Types.ObjectId, ref: 'User' } ],
        downvotedBy: [ { type: Schema.Types.ObjectId, ref: 'User' } ],
        hasAcceptedAnswer: { type: Boolean, default: false },
        acceptedAnswerId: { type: Schema.Types.ObjectId },
        replies: [ replySchema ],
        deletedAt: Date,
    },
    { timestamps: true }
);

discussionSchema.index({ courseId: 1, createdAt: -1 });
discussionSchema.index({ lessonId: 1, createdAt: -1 });
discussionSchema.index({ authorId: 1 });
discussionSchema.index({ type: 1 });
discussionSchema.index({ tags: 1 });

export const Discussion = model<IDiscussion>('Discussion', discussionSchema);
