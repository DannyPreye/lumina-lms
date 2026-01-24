import { Schema, model, Document, Types } from 'mongoose';

export interface IAsset extends Document
{
    userId: Types.ObjectId;
    fileName: string;
    fileUrl: string;
    publicId: string; // Cloudinary public ID
    fileType: string;
    fileSize: number;
    folder: string;
    mimeType: string;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

const assetSchema = new Schema<IAsset>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        fileName: { type: String, required: true },
        fileUrl: { type: String, required: true },
        publicId: { type: String, required: true },
        fileType: { type: String, required: true }, // image, video, raw
        fileSize: { type: Number, required: true },
        folder: { type: String, default: 'general' },
        mimeType: { type: String, required: true },
        metadata: { type: Map, of: Schema.Types.Mixed }
    },
    { timestamps: true }
);

// Search and filter indexes
assetSchema.index({ userId: 1, folder: 1 });
assetSchema.index({ fileName: 'text' });

export const Asset = model<IAsset>('Asset', assetSchema);
