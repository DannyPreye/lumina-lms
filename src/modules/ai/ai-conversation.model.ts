import { Schema, model, Document, Types } from 'mongoose';

export interface IAIConversation extends Document
{
    userId: Types.ObjectId;
    courseId: Types.ObjectId;
    lessonId?: Types.ObjectId;
    type: 'tutor' | 'study_assistant' | 'quiz_help' | 'general';
    messages: {
        _id: Types.ObjectId;
        role: 'user' | 'assistant' | 'system';
        content: string;
        timestamp: Date;
        metadata?: {
            model: string;
            tokens: number;
            context: Types.ObjectId[];
        };
    }[];
    context: {
        lessonContent?: string;
        relevantResources: Types.ObjectId[];
        userProgress: Record<string, any>;
    };
    rating?: number;
    helpful?: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const aiConversationSchema = new Schema<IAIConversation>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
        lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson' },
        type: {
            type: String,
            enum: [ 'tutor', 'study_assistant', 'quiz_help', 'general' ],
            default: 'tutor',
        },
        messages: [
            {
                role: { type: String, enum: [ 'user', 'assistant', 'system' ], required: true },
                content: { type: String, required: true },
                timestamp: { type: Date, default: Date.now },
                metadata: {
                    model: String,
                    tokens: Number,
                    context: [ { type: Schema.Types.ObjectId } ],
                },
            },
        ],
        context: {
            lessonContent: String,
            relevantResources: [ { type: Schema.Types.ObjectId } ],
            userProgress: { type: Schema.Types.Mixed, default: {} },
        },
        rating: { type: Number, min: 1, max: 5 },
        helpful: Boolean,
    },
    { timestamps: true }
);

export const AIConversation = model<IAIConversation>('AIConversation', aiConversationSchema);
