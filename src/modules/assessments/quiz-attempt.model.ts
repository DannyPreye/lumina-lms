import { Schema, model, Document, Types } from 'mongoose';

export interface IQuizAttempt extends Document
{
    quizId: Types.ObjectId;
    userId: Types.ObjectId;
    courseId: Types.ObjectId;
    attemptNumber: number;
    answers: {
        questionId: Types.ObjectId;
        answer: any;
        isCorrect: boolean;
        pointsAwarded: number;
        aiGraded: boolean;
        feedback?: string;
    }[];
    score: number;
    totalPoints: number;
    earnedPoints: number;
    passed: boolean;
    timeSpent: number; // seconds
    startedAt: Date;
    submittedAt?: Date;
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
}

const quizAttemptSchema = new Schema<IQuizAttempt>(
    {
        quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
        attemptNumber: { type: Number, required: true },
        answers: [
            {
                questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
                answer: Schema.Types.Mixed,
                isCorrect: { type: Boolean, default: false },
                pointsAwarded: { type: Number, default: 0 },
                aiGraded: { type: Boolean, default: false },
                feedback: String,
            },
        ],
        score: { type: Number, default: 0 },
        totalPoints: { type: Number, default: 0 },
        earnedPoints: { type: Number, default: 0 },
        passed: { type: Boolean, default: false },
        timeSpent: { type: Number, default: 0 },
        startedAt: { type: Date, default: Date.now },
        submittedAt: Date,
        ipAddress: String,
        userAgent: String,
    },
    { timestamps: true }
);

quizAttemptSchema.index({ quizId: 1, userId: 1, attemptNumber: 1 }, { unique: true });
quizAttemptSchema.index({ userId: 1, courseId: 1 });
quizAttemptSchema.index({ submittedAt: -1 });

export const QuizAttempt = model<IQuizAttempt>('QuizAttempt', quizAttemptSchema);
