import { Cart } from './cart.model';
import createError from 'http-errors';
import { Types } from 'mongoose';

export class CartService
{
    static async getCart(userId: string)
    {
        let cart = await Cart.findOne({ userId }).populate('items.courseId', 'title thumbnail pricing slug shortDescription');
        if (!cart) {
            cart = await Cart.create({ userId, items: [] });
        }
        return cart;
    }

    static async addToCart(userId: string, courseId: string)
    {
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = await Cart.create({ userId, items: [] });
        }

        const itemExists = cart.items.find(item => item.courseId.toString() === courseId);
        if (itemExists) {
            throw createError(400, 'Course already in cart');
        }

        cart.items.push({ courseId: new Types.ObjectId(courseId), addedAt: new Date() });
        return await cart.save();
    }

    static async removeFromCart(userId: string, courseId: string)
    {
        const cart = await Cart.findOne({ userId });
        if (!cart) throw createError(404, 'Cart not found');

        cart.items = cart.items.filter(item => item.courseId.toString() !== courseId);
        return await cart.save();
    }

    static async clearCart(userId: string)
    {
        return await Cart.findOneAndUpdate(
            { userId },
            { $set: { items: [] } },
            { new: true }
        );
    }
}
