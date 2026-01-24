import { Schema, model, Document, Types } from 'mongoose';

export interface IWishlist extends Document
{
    userId: Types.ObjectId;
    courses: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const wishlistSchema = new Schema<IWishlist>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
        courses: [ { type: Schema.Types.ObjectId, ref: 'Course' } ]
    },
    { timestamps: true }
);

export const Wishlist = model<IWishlist>('Wishlist', wishlistSchema);
