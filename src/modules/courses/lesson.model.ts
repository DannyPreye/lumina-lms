import { Schema, model, Document, Types } from 'mongoose';
import { tenantPlugin, ITenantAware } from '../../common/plugins/tenant.plugin';

export interface ILesson extends Document, ITenantAware
{
    courseId: Types.ObjectId;
    moduleId: Types.ObjectId;
    title: string;
    description: string;
    order: number;
    contentType: 'video' | 'text';
    videoContent?: {
        videoUrl: string;
        videoDuration: number;
        transcript?: string;
        captions?: { language: string; url: string; }[];
        thumbnailUrl?: string;
    };
    textContent?: {
        body: string;
        readingTime: number;
    };
    attachments: {
        name: string;
        url: string;
        type: string;
        size: number;
    }[];
    resources: {
        title: string;
        type: 'pdf' | 'video' | 'link' | 'file';
        url: string;
        size?: number;
        description?: string;
    }[];
    estimatedDuration: number;
    isFree: boolean;
    allowDownload: boolean;
    quizId?: Types.ObjectId;
    assignmentId?: Types.ObjectId;
    aiGenerated?: {
        isGenerated: boolean;
        generatedAt: Date;
        prompt: string;
        model: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

const lessonSchema = new Schema<ILesson>(
    {
        courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
        moduleId: { type: Schema.Types.ObjectId, ref: 'Module', required: true },
        title: { type: String, required: true },
        description: String,
        order: { type: Number, required: true },
        contentType: {
            type: String,
            enum: [ 'video', 'text', 'quiz', 'assignment', 'discussion', 'live_session', 'interactive', 'document', 'embed' ],
            required: true,
        },
        videoContent: {
            videoUrl: String,
            videoDuration: Number,
            transcript: String,
            captions: [ { language: String, url: String } ],
            thumbnailUrl: String,
        },
        textContent: {
            body: String,
            readingTime: { type: Number, default: 0 },
        },

        attachments: [
            {
                name: String,
                url: String,
                type: String,
                size: Number,
            },
        ],
        resources: [
            {
                title: String,
                type: { type: String, enum: [ 'pdf', 'video', 'link', 'file' ] },
                url: String,
                size: Number,
                description: String,
            },
        ],
        estimatedDuration: { type: Number, default: 0 },
        isFree: { type: Boolean, default: false },
        allowDownload: { type: Boolean, default: true },
        quizId: { type: Schema.Types.ObjectId, ref: 'Quiz' },
        assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment' },
        aiGenerated: {
            isGenerated: { type: Boolean, default: false },
            generatedAt: Date,
            prompt: String,
            model: String,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for curriculum and progress tracking
lessonSchema.index({ courseId: 1 });
lessonSchema.index({ moduleId: 1, order: 1 });
lessonSchema.index({ contentType: 1 });

lessonSchema.plugin(tenantPlugin);

export const Lesson = model<ILesson>('Lesson', lessonSchema);
