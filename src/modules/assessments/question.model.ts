import { Schema, model, Document, Types } from 'mongoose';
import { tenantPlugin, ITenantAware } from '../../common/plugins/tenant.plugin';

export interface IQuestion extends Document, ITenantAware
{
    quizId: Types.ObjectId;
    type: 'multiple_choice' | 'multiple_select' | 'true_false' | 'short_answer' | 'essay' | 'fill_blank' | 'matching' | 'ordering' | 'code';
    question: string;
    explanation?: string;
    points: number;
    order: number;
    difficulty: 'easy' | 'medium' | 'hard';
    options?: {
        _id?: Types.ObjectId;
        text: string;
        isCorrect: boolean;
        order: number;
    }[];
    sampleAnswer?: string;
    wordLimit?: { min: number; max: number; };
    caseSensitive?: boolean;
    blanks?: {
        position: number;
        acceptedAnswers: string[];
        caseSensitive: boolean;
    }[];
    pairs?: {
        left: string;
        right: string;
    }[];
    correctOrder?: string[];
    codeSetup?: {
        language: string;
        starterCode: string;
        testCases: {
            input: string;
            expectedOutput: string;
            isHidden: boolean;
        }[];
    };
    aiGrading?: {
        enabled: boolean;
        rubric: string;
        model: string;
        keyPoints: string[];
    };
    media?: {
        imageUrl?: string;
        videoUrl?: string;
        audioUrl?: string;
    };
    statistics?: {
        timesAnswered: number;
        correctAnswers: number;
        averageTimeSpent: number;
    };
    tags?: string[];
    createdAt: Date;
    updatedAt: Date;
}

const questionSchema = new Schema<IQuestion>(
    {
        quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
        type: {
            type: String,
            enum: [ 'multiple_choice', 'multiple_select', 'true_false', 'short_answer', 'essay', 'fill_blank', 'matching', 'ordering', 'code' ],
            required: true,
        },
        question: { type: String, required: true },
        explanation: String,
        points: { type: Number, default: 1 },
        order: { type: Number, required: true },
        difficulty: { type: String, enum: [ 'easy', 'medium', 'hard' ], default: 'medium' },
        options: [
            {
                text: String,
                isCorrect: Boolean,
                order: Number,
            },
        ],
        sampleAnswer: String,
        wordLimit: {
            min: Number,
            max: Number,
        },
        caseSensitive: { type: Boolean, default: false },
        blanks: [
            {
                position: Number,
                acceptedAnswers: [ String ],
                caseSensitive: Boolean,
            },
        ],
        pairs: [
            {
                left: String,
                right: String,
            },
        ],
        correctOrder: [ String ],
        codeSetup: {
            language: String,
            starterCode: String,
            testCases: [
                {
                    input: String,
                    expectedOutput: String,
                    isHidden: Boolean,
                },
            ],
        },
        aiGrading: {
            enabled: { type: Boolean, default: false },
            rubric: String,
            model: String,
            keyPoints: [ String ],
        },
        media: {
            imageUrl: String,
            videoUrl: String,
            audioUrl: String,
        },
        statistics: {
            timesAnswered: { type: Number, default: 0 },
            correctAnswers: { type: Number, default: 0 },
            averageTimeSpent: { type: Number, default: 0 },
        },
        tags: [ String ],
    },
    { timestamps: true }
);

// Indexes for quiz delivery and stats
questionSchema.index({ quizId: 1, order: 1 });
questionSchema.index({ difficulty: 1 });
questionSchema.index({ type: 1 });

questionSchema.plugin(tenantPlugin);

export const Question = model<IQuestion>('Question', questionSchema);
