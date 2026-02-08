import { Schema, model, Document, Types } from 'mongoose';
import { tenantPlugin, ITenantAware } from '../../common/plugins/tenant.plugin';

export interface IWishlist extends Document, ITenantAware
{
    userId: Types.ObjectId;
    courses: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const wishlistSchema = new Schema<IWishlist>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        courses: [ { type: Schema.Types.ObjectId, ref: 'Course' } ]
    },
    { timestamps: true }
);

wishlistSchema.index({ userId: 1, tenantId: 1 }, { unique: true });
wishlistSchema.plugin(tenantPlugin);

export const Wishlist = model<IWishlist>('Wishlist', wishlistSchema);
