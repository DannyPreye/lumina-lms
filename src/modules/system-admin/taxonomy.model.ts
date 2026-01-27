import { Schema, model, Document, Types } from 'mongoose';

export interface ICategory extends Document
{
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    parentId?: Types.ObjectId;
    order: number;
    isActive: boolean;
    createdAt: Date;
}

const categorySchema = new Schema<ICategory>(
    {
        name: { type: String, required: true },
        slug: { type: String, required: true, unique: true },
        description: String,
        icon: String,
        parentId: { type: Schema.Types.ObjectId, ref: 'Category' },
        order: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);


// Virtual for subcategories
categorySchema.virtual('subcategories', {
    ref: 'Category',
    localField: '_id',
    foreignField: 'parentId',
    justOne: false
});

// Ensure virtuals are included in JSON and Object outputs
categorySchema.set('toObject', { virtuals: true });
categorySchema.set('toJSON', { virtuals: true });

export const Category = model<ICategory>('Category', categorySchema);

export interface ITag extends Document
{
    name: string;
    slug: string;
    usageCount: number;
    createdAt: Date;
}

const tagSchema = new Schema<ITag>(
    {
        name: { type: String, required: true },
        slug: { type: String, required: true, unique: true },
        usageCount: { type: Number, default: 0 },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

export const Tag = model<ITag>('Tag', tagSchema);
