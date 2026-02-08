import { Schema, model, Document, Types } from 'mongoose';
import { tenantPlugin, ITenantAware } from '../../common/plugins/tenant.plugin';

export interface IAsset extends Document, ITenantAware
{
    userId: Types.ObjectId;
    fileName: string;
    fileUrl: string;
    publicId: string; // Cloudinary public ID
    fileType: string;
    fileSize: number;
    folder: string; // This references the name or path in Folder model
    mimeType: string;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

export interface IFolder extends Document
{
    userId: Types.ObjectId;
    name: string;
    path: string;
    createdAt: Date;
    updatedAt: Date;
}

const folderSchema = new Schema<IFolder>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        name: { type: String, required: true },
        path: { type: String, required: true }
    },
    { timestamps: true }
);

folderSchema.index({ userId: 1, name: 1 }, { unique: true });
folderSchema.index({ userId: 1, path: 1 }, { unique: true });

export const Folder = model<IFolder>('Folder', folderSchema);

const assetSchema = new Schema<IAsset>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        fileName: { type: String, required: true },
        fileUrl: { type: String, required: true },
        publicId: { type: String, required: true },
        fileType: { type: String, required: true }, // image, video, raw
        fileSize: { type: Number, required: true },
        folder: { type: String, default: 'lumina/general' },
        mimeType: { type: String, required: true },
        metadata: { type: Map, of: Schema.Types.Mixed }
    },
    { timestamps: true }
);

// Search and filter indexes
assetSchema.index({ userId: 1, folder: 1 });
assetSchema.index({ fileName: 'text' });

assetSchema.plugin(tenantPlugin);
folderSchema.plugin(tenantPlugin);

export const Asset = model<IAsset>('Asset', assetSchema);

