import { Schema, model, Document, Types } from 'mongoose';
import { tenantPlugin, ITenantAware } from '../../common/plugins/tenant.plugin';

export interface ICartItem
{
    courseId: Types.ObjectId;
    addedAt: Date;
}

export interface ICart extends Document, ITenantAware
{
    userId: Types.ObjectId;
    items: ICartItem[];
    createdAt: Date;
    updatedAt: Date;
}

const cartSchema = new Schema<ICart>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
        items: [
            {
                courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
                addedAt: { type: Date, default: Date.now }
            }
        ]
    },
    { timestamps: true }
);

export const Cart = model<ICart>('Cart', cartSchema);

cartSchema.plugin(tenantPlugin);
