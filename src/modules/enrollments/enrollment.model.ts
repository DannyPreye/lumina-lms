import { Schema, model, Document, Types } from 'mongoose';

export interface IEnrollment extends Document
{
    userId: Types.ObjectId;
    courseId: Types.ObjectId;
    enrollmentType: 'self' | 'admin' | 'invitation' | 'purchase';
    status: 'active' | 'completed' | 'dropped' | 'expired';
    progress: {
        completedLessons: Types.ObjectId[];
        completedModules: Types.ObjectId[];
        currentModuleId?: Types.ObjectId;
        currentLessonId?: Types.ObjectId;
        percentComplete: number;
        lessonsProgress: {
            lessonId: Types.ObjectId;
            status: 'not_started' | 'in_progress' | 'completed';
            timeSpent: number;
            lastAccessedAt: Date;
            completedAt?: Date;
        }[];
        quizzesProgress: {
            quizId: Types.ObjectId;
            attempts: number;
            bestScore: number;
            lastAttemptDate: Date;
        }[];
    };
    totalTimeSpent: number;
    lastAccessedAt: Date;
    enrolledAt: Date;
    completedAt?: Date;
    expiresAt?: Date;
    paymentInfo?: {
        transactionId: Types.ObjectId;
        amount: number;
        currency: string;
        paymentMethod: string;
        paidAt: Date;
    };
    certificate?: {
        issued: boolean;
        certificateId: Types.ObjectId;
        issuedAt: Date;
        credentialUrl: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

const enrollmentSchema = new Schema<IEnrollment>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
        enrollmentType: {
            type: String,
            enum: [ 'self', 'admin', 'invitation', 'purchase' ],
            default: 'self',
        },
        status: {
            type: String,
            enum: [ 'active', 'completed', 'dropped', 'expired' ],
            default: 'active',
        },
        progress: {
            completedLessons: [ { type: Schema.Types.ObjectId, ref: 'Lesson' } ],
            completedModules: [ { type: Schema.Types.ObjectId, ref: 'Module' } ],
            currentModuleId: { type: Schema.Types.ObjectId, ref: 'Module' },
            currentLessonId: { type: Schema.Types.ObjectId, ref: 'Lesson' },
            percentComplete: { type: Number, default: 0 },
            lessonsProgress: [
                {
                    lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson' },
                    status: { type: String, enum: [ 'not_started', 'in_progress', 'completed' ], default: 'not_started' },
                    timeSpent: { type: Number, default: 0 },
                    lastAccessedAt: { type: Date, default: Date.now },
                    completedAt: Date,
                },
            ],
            quizzesProgress: [
                {
                    quizId: { type: Schema.Types.ObjectId, ref: 'Quiz' },
                    attempts: { type: Number, default: 0 },
                    bestScore: { type: Number, default: 0 },
                    lastAttemptDate: Date,
                },
            ],
        },
        totalTimeSpent: { type: Number, default: 0 },
        lastAccessedAt: { type: Date, default: Date.now },
        enrolledAt: { type: Date, default: Date.now },
        completedAt: Date,
        expiresAt: Date,
        paymentInfo: {
            transactionId: { type: Schema.Types.ObjectId, ref: 'Transaction' },
            amount: Number,
            currency: String,
            paymentMethod: String,
            paidAt: Date,
        },
        certificate: {
            issued: { type: Boolean, default: false },
            certificateId: { type: Schema.Types.ObjectId, ref: 'Certificate' },
            issuedAt: Date,
            credentialUrl: String,
        },
    },
    {
        timestamps: true,
    }
);

// Index for quick lookup of user enrollments
enrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });
enrollmentSchema.index({ status: 1 });
enrollmentSchema.index({ enrolledAt: -1 });

export const Enrollment = model<IEnrollment>('Enrollment', enrollmentSchema);
