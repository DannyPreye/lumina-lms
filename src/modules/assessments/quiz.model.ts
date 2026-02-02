import { Schema, model, Document, Types } from 'mongoose';

export interface IQuiz extends Document
{
    courseId: Types.ObjectId;
    lessonId?: Types.ObjectId;
    title: string;
    description: string;
    instructions: string;
    type: 'practice' | 'graded' | 'survey' | 'self_assessment' | 'final_exam';
    settings: {
        timeLimit?: number;
        passingScore: number;
        maxAttempts?: number;
        shuffleQuestions: boolean;
        shuffleAnswers: boolean;
        showCorrectAnswers: 'never' | 'after_submission' | 'after_deadline' | 'after_passing';
        allowReview: boolean;
        proctored: boolean;
        availableFrom?: Date;
        availableUntil?: Date;
    };
    totalPoints: number;
    questionCount: number;
    aiGenerated?: {
        isGenerated: boolean;
        generatedFrom: 'lesson_content' | 'learning_objectives' | 'manual';
        generatedAt: Date;
        reviewedBy?: Types.ObjectId;
        approved: boolean;
    };
    status: 'draft' | 'published' | 'archived';
    createdAt: Date;
    updatedAt: Date;
}

const quizSchema = new Schema<IQuiz>(
    {
        courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
        lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson' },
        title: { type: String, required: true },
        description: String,
        instructions: String,
        type: {
            type: String,
            enum: [ 'practice', 'graded', 'survey', 'self_assessment', 'final_exam' ],
            default: 'practice',
        },
        settings: {
            timeLimit: { type: Number, default: null },
            passingScore: { type: Number, default: 70 },
            maxAttempts: { type: Number, default: null },
            shuffleQuestions: { type: Boolean, default: true },
            shuffleAnswers: { type: Boolean, default: true },
            showCorrectAnswers: {
                type: String,
                enum: [ 'never', 'after_submission', 'after_deadline', 'after_passing' ],
                default: 'after_submission',
            },
            allowReview: { type: Boolean, default: true },
            proctored: { type: Boolean, default: false },
            availableFrom: Date,
            availableUntil: Date,
        },
        totalPoints: { type: Number, default: 0 },
        questionCount: { type: Number, default: 0 },
        aiGenerated: {
            isGenerated: { type: Boolean, default: false },
            generatedFrom: { type: String, enum: [ 'lesson_content', 'learning_objectives', 'manual' ] },
            generatedAt: Date,
            reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
            approved: { type: Boolean, default: false },
        },
        status: {
            type: String,
            enum: [ 'draft', 'published', 'archived' ],
            default: 'draft',
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for assessment management
quizSchema.index({ courseId: 1, status: 1 });
quizSchema.index({ lessonId: 1 });
quizSchema.index({ type: 1 });

export const Quiz = model<IQuiz>('Quiz', quizSchema);
