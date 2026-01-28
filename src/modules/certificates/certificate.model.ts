import { Schema, model, Document, Types } from 'mongoose';

export interface ICertificate extends Document
{
    certificateId: string;
    template: Types.ObjectId;
    student: Types.ObjectId;
    course: Types.ObjectId;
    metadata: {
        studentName?: string;
        courseName?: string;
        instructorName?: string;
        completionDate?: Date;
        grade?: string;
    };
    pdfUrl?: string;
    issueDate: Date;
    isValid: boolean;
}

const CertificateSchema = new Schema<ICertificate>({
    certificateId: { type: String, required: true, unique: true, index: true },

    template: { type: Schema.Types.ObjectId, ref: 'CertificateTemplate', required: true },
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },

    metadata: {
        studentName: String,
        courseName: String,
        instructorName: String,
        completionDate: Date,
        grade: String
    },

    pdfUrl: { type: String },

    issueDate: { type: Date, default: Date.now },
    isValid: { type: Boolean, default: true }
}, { timestamps: true });

export const Certificate = model<ICertificate>('Certificate', CertificateSchema);
