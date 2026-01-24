import { Wishlist } from './wishlist.model';
import createError from 'http-errors';
import { Types } from 'mongoose';

export class WishlistService
{
    static async getWishlist(userId: string)
    {
        let wishlist = await Wishlist.findOne({ userId }).populate('courses', 'title thumbnail pricing slug shortDescription');
        if (!wishlist) {
            wishlist = await Wishlist.create({ userId, courses: [] });
        }
        return wishlist;
    }

    static async toggleWishlist(userId: string, courseId: string)
    {
        let wishlist = await Wishlist.findOne({ userId });
        if (!wishlist) {
            wishlist = await Wishlist.create({ userId, courses: [] });
        }

        const courseObjectId = new Types.ObjectId(courseId);
        const index = wishlist.courses.findIndex(id => id.toString() === courseId);

        if (index > -1) {
            // Remove if exists
            wishlist.courses.splice(index, 1);
        } else {
            // Add if not exists
            wishlist.courses.push(courseObjectId);
        }

        return await wishlist.save();
    }

    static async removeFromWishlist(userId: string, courseId: string)
    {
        return await Wishlist.findOneAndUpdate(
            { userId },
            { $pull: { courses: new Types.ObjectId(courseId) } },
            { new: true }
        );
    }
}
