import { Schema, model, Document, Types } from 'mongoose';

export interface ICertificate extends Document
{
    userId: Types.ObjectId;
    courseId: Types.ObjectId;
    templateId: Types.ObjectId;
    certificateNumber: string;
    credentialId: string;
    recipientName: string;
    courseName: string;
    instructorName: string;
    issueDate: Date;
    grade?: number;
    completionDate: Date;
    certificateUrl: string;
    verificationUrl: string;
    metadata: {
        hoursCompleted: number;
        skillsAcquired: string[];
        finalScore: number;
    };
    blockchain?: {
        enabled: boolean;
        transactionHash?: string;
        network?: string;
    };
    status: 'active' | 'revoked';
    revokedAt?: Date;
    revokeReason?: string;
    createdAt: Date;
    updatedAt: Date;
}

const certificateSchema = new Schema<ICertificate>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
        templateId: { type: Schema.Types.ObjectId, ref: 'CertificateTemplate', required: true },
        certificateNumber: { type: String, required: true, unique: true },
        credentialId: { type: String, required: true, unique: true },
        recipientName: { type: String, required: true },
        courseName: { type: String, required: true },
        instructorName: { type: String, required: true },
        issueDate: { type: Date, default: Date.now },
        grade: Number,
        completionDate: { type: Date, required: true },
        certificateUrl: { type: String, required: true },
        verificationUrl: { type: String, required: true },
        metadata: {
            hoursCompleted: { type: Number, default: 0 },
            skillsAcquired: [ String ],
            finalScore: { type: Number, default: 0 },
        },
        blockchain: {
            enabled: { type: Boolean, default: false },
            transactionHash: String,
            network: String,
        },
        status: { type: String, enum: [ 'active', 'revoked' ], default: 'active' },
        revokedAt: Date,
        revokeReason: String,
    },
    { timestamps: true }
);

certificateSchema.index({ userId: 1, courseId: 1 });

export const Certificate = model<ICertificate>('Certificate', certificateSchema);
