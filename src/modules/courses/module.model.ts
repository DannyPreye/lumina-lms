import { Schema, model, Document, Types } from 'mongoose';

export interface IModule extends Document
{
    courseId: Types.ObjectId;
    title: string;
    description: string;
    order: number;
    isLocked: boolean;
    prerequisiteModuleIds: Types.ObjectId[];
    estimatedDuration: number;
    createdAt: Date;
    updatedAt: Date;
}

const moduleSchema = new Schema<IModule>(
    {
        courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
        title: { type: String, required: true },
        description: String,
        order: { type: Number, required: true },
        isLocked: { type: Boolean, default: false },
        prerequisiteModuleIds: [ { type: Schema.Types.ObjectId, ref: 'Module' } ],
        estimatedDuration: { type: Number, default: 0 },
    },
    {
        timestamps: true,
    }
);

// Indexes for curriculum structure retrieval
moduleSchema.index({ courseId: 1, order: 1 });

export const Module = model<IModule>('Module', moduleSchema);
