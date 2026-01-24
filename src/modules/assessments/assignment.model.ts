import { Schema, model, Document, Types } from 'mongoose';

export interface IAssignment extends Document
{
    courseId: Types.ObjectId;
    moduleId: Types.ObjectId;
    lessonId?: Types.ObjectId;
    title: string;
    instructions: string;
    type: 'essay' | 'project' | 'presentation' | 'code' | 'peer_review' | 'file_upload';
    requirements: {
        fileTypes?: string[];
        maxFileSize?: number;
        maxFiles?: number;
        wordCount?: { min: number; max: number; };
        codeLanguage?: string;
    };
    rubric: {
        criteria: string;
        description: string;
        maxPoints: number;
        levels: {
            level: string;
            points: number;
            description: string;
        }[];
    }[];
    totalPoints: number;
    passingScore: number;
    dueDate: Date;
    lateSubmission: {
        allowed: boolean;
        penaltyPerDay: number;
        cutoffDate?: Date;
    };
    peerReview: {
        enabled: boolean;
        reviewsRequired: number;
        reviewDueDate?: Date;
        anonymousReview: boolean;
    };
    aiAssistance: {
        plagiarismCheck: boolean;
        autoGrading: boolean;
        feedbackGeneration: boolean;
    };
    status: 'draft' | 'published' | 'archived';
    createdAt: Date;
    updatedAt: Date;
}

const assignmentSchema = new Schema<IAssignment>(
    {
        courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
        moduleId: { type: Schema.Types.ObjectId, ref: 'Module', required: true },
        lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson' },
        title: { type: String, required: true },
        instructions: { type: String, required: true },
        type: {
            type: String,
            enum: [ 'essay', 'project', 'presentation', 'code', 'peer_review', 'file_upload' ],
            required: true,
        },
        requirements: {
            fileTypes: [ String ],
            maxFileSize: Number,
            maxFiles: Number,
            wordCount: { min: Number, max: Number },
            codeLanguage: String,
        },
        rubric: [
            {
                criteria: { type: String, required: true },
                description: String,
                maxPoints: { type: Number, required: true },
                levels: [
                    {
                        level: String,
                        points: Number,
                        description: String,
                    },
                ],
            },
        ],
        totalPoints: { type: Number, default: 0 },
        passingScore: { type: Number, default: 0 },
        dueDate: { type: Date, required: true },
        lateSubmission: {
            allowed: { type: Boolean, default: false },
            penaltyPerDay: { type: Number, default: 0 },
            cutoffDate: Date,
        },
        peerReview: {
            enabled: { type: Boolean, default: false },
            reviewsRequired: { type: Number, default: 0 },
            reviewDueDate: Date,
            anonymousReview: { type: Boolean, default: true },
        },
        aiAssistance: {
            plagiarismCheck: { type: Boolean, default: false },
            autoGrading: { type: Boolean, default: false },
            feedbackGeneration: { type: Boolean, default: false },
        },
        status: {
            type: String,
            enum: [ 'draft', 'published', 'archived' ],
            default: 'draft',
        },
    },
    { timestamps: true }
);

export const Assignment = model<IAssignment>('Assignment', assignmentSchema);
