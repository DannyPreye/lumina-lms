import { Schema, model, Document, Types } from 'mongoose';

export interface ICertificateTemplate extends Document
{
    name: string;
    description: string;
    design: {
        backgroundColor: string;
        borderStyle: string;
        logoUrl: string;
        signatureUrls: string[];
        layout: 'portrait' | 'landscape';
        templateUrl: string;
        fonts: {
            family: string;
            size: number;
            color: string;
        }[];
    };
    fields: {
        name: string;
        position: { x: number; y: number; };
        fontSize: number;
        fontFamily: string;
        color: string;
    }[];
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const certificateTemplateSchema = new Schema<ICertificateTemplate>(
    {
        name: { type: String, required: true },
        description: String,
        design: {
            backgroundColor: String,
            borderStyle: String,
            logoUrl: String,
            signatureUrls: [ String ],
            layout: { type: String, enum: [ 'portrait', 'landscape' ], default: 'landscape' },
            templateUrl: String,
            fonts: [
                {
                    family: String,
                    size: Number,
                    color: String,
                },
            ],
        },
        fields: [
            {
                name: String,
                position: { x: Number, y: Number },
                fontSize: Number,
                fontFamily: String,
                color: String,
            },
        ],
        isDefault: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export const CertificateTemplate = model<ICertificateTemplate>('CertificateTemplate', certificateTemplateSchema);
