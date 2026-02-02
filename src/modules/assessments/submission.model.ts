import { Schema, model, Document, Types } from 'mongoose';

export interface ISubmission extends Document
{
    assignmentId: Types.ObjectId;
    userId: Types.ObjectId;
    courseId: Types.ObjectId;
    attemptNumber: number;
    content: {
        text?: string;
        files: {
            filename: string;
            url: string;
            type: string;
            size: number;
            uploadedAt: Date;
        }[];
        links?: string[];
        codeSubmission?: {
            language: string;
            code: string;
            repository?: string;
        };
    };
    status: 'draft' | 'submitted' | 'graded' | 'returned' | 'resubmit_requested';
    grade?: {
        score: number;
        percentage: number;
        rubricScores: {
            criteriaId: Types.ObjectId;
            points: number;
            feedback?: string;
        }[];
        overallFeedback?: string;
        gradedBy: Types.ObjectId;
        gradedAt: Date;
        aiGraded: boolean;
        aiModel?: string;
    };
    plagiarismCheck?: {
        checked: boolean;
        similarity: number;
        report?: string;
        checkedAt: Date;
    };
    peerReviews: {
        reviewerId: Types.ObjectId;
        rubricScores: {
            criteriaId: Types.ObjectId;
            points: number;
            feedback?: string;
        }[];
        overallFeedback?: string;
        submittedAt: Date;
    }[];
    isLate: boolean;
    latePenalty: number;
    submittedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const submissionSchema = new Schema<ISubmission>(
    {
        assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
        attemptNumber: { type: Number, required: true },
        content: {
            text: String,
            files: [
                {
                    filename: String,
                    url: String,
                    type: String,
                    size: Number,
                    uploadedAt: { type: Date, default: Date.now },
                },
            ],
            links: [ String ],
            codeSubmission: {
                language: String,
                code: String,
                repository: String,
            },
        },
        status: {
            type: String,
            enum: [ 'draft', 'submitted', 'graded', 'returned', 'resubmit_requested' ],
            default: 'draft',
        },
        grade: {
            score: Number,
            percentage: Number,
            rubricScores: [
                {
                    criteriaId: Schema.Types.ObjectId,
                    points: Number,
                    feedback: String,
                },
            ],
            overallFeedback: String,
            gradedBy: { type: Schema.Types.ObjectId, ref: 'User' },
            gradedAt: Date,
            aiGraded: { type: Boolean, default: false },
            aiModel: String,
        },
        plagiarismCheck: {
            checked: { type: Boolean, default: false },
            similarity: { type: Number, default: 0 },
            report: String,
            checkedAt: Date,
        },
        peerReviews: [
            {
                reviewerId: { type: Schema.Types.ObjectId, ref: 'User' },
                rubricScores: [
                    {
                        criteriaId: Schema.Types.ObjectId,
                        points: Number,
                        feedback: String,
                    },
                ],
                overallFeedback: String,
                submittedAt: { type: Date, default: Date.now },
            },
        ],
        isLate: { type: Boolean, default: false },
        latePenalty: { type: Number, default: 0 },
        submittedAt: Date,
    },
    { timestamps: true }
);

submissionSchema.index({ assignmentId: 1, userId: 1, attemptNumber: 1 }, { unique: true });
submissionSchema.index({ userId: 1, courseId: 1 });
submissionSchema.index({ status: 1 });
submissionSchema.index({ submittedAt: -1 });

export const Submission = model<ISubmission>('Submission', submissionSchema);
