import { Schema, model, Document, Types } from 'mongoose';

export interface ICertificateTemplate extends Document
{
    name: string;
    description?: string;
    instructor: Types.ObjectId;
    layout: {
        width: number;
        height: number;
        background: {
            backgroundColor: string;
            backgroundImage?: string;
            backgroundSize: string;
            backgroundPosition: string;
            backgroundRepeat: string;
        };
        elements: {
            id: string;
            type: 'text' | 'image' | 'signature' | 'variable' | 'shape';
            content?: string;
            variable?: 'student_name' | 'course_name' | 'completion_date' | 'instructor_name' | 'certificate_id';
            shapeType?: 'rectangle' | 'circle' | 'line';
            x: number;
            y: number;
            width?: number;
            height?: number;
            rotation: number;
            style?: Map<string, string>;
        }[];
    };
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const CertificateTemplateSchema = new Schema<ICertificateTemplate>({
    name: { type: String, required: true },
    description: { type: String },
    instructor: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    layout: {
        width: { type: Number, default: 800 },
        height: { type: Number, default: 600 },
        background: {
            backgroundColor: { type: String, default: '#ffffff' },
            backgroundImage: { type: String },
            backgroundSize: { type: String, default: 'contain' },
            backgroundPosition: { type: String, default: 'center' },
            backgroundRepeat: { type: String, default: 'no-repeat' }
        },
        elements: [ {
            id: { type: String, required: true },
            type: {
                type: String,
                enum: [ 'text', 'image', 'signature', 'variable', 'shape' ],
                required: true
            },
            content: { type: String },
            variable: {
                type: String,
                enum: [ 'student_name', 'course_name', 'completion_date', 'instructor_name', 'certificate_id', "student_signature" ]
            },
            shapeType: { type: String, enum: [ 'rectangle', 'circle', 'line' ] },

            x: { type: Number, default: 0 },
            y: { type: Number, default: 0 },
            width: { type: Number },
            height: { type: Number },
            rotation: { type: Number, default: 0 },

            style: { type: Map, of: String }
        } ]
    },

    isPublished: { type: Boolean, default: false },
}, { timestamps: true });

export const CertificateTemplate = model<ICertificateTemplate>('CertificateTemplate', CertificateTemplateSchema);
