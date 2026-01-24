import { User, IUser } from '../users/user.model';
import createError from 'http-errors';

export class UserService
{
    static async createUser(userData: Partial<IUser>)
    {
        const userExists = await User.findOne({ email: userData.email });
        if (userExists) {
            throw createError(400, 'User already exists');
        }
        return await User.create(userData);
    }

    static async findByEmail(email: string)
    {
        return await User.findOne({ email }).select('+passwordHash');
    }

    static async findById(id: string)
    {
        const user = await User.findById(id);
        if (!user) {
            throw createError(404, 'User not found');
        }
        return user;
    }

    static async updateProfile(userId: string, updateData: any)
    {
        const user = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        );
        if (!user) {
            throw createError(404, 'User not found');
        }
        return user;
    }

    static async findAll(query: any = {}, options: { page?: number; limit?: number; } = {})
    {
        const { page = 1, limit = 10 } = options;
        const skip = (page - 1) * limit;

        const users = await User.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await User.countDocuments(query);

        return {
            users,
            total,
            page,
            pages: Math.ceil(total / limit),
        };
    }

    static async deleteUser(userId: string)
    {
        const user = await User.findByIdAndUpdate(
            userId,
            { $set: { deletedAt: new Date(), status: 'deactivated' } },
            { new: true }
        );
        if (!user) {
            throw createError(404, 'User not found');
        }
        return user;
    }

    static async updateRoles(userId: string, roles: string[])
    {
        const user = await User.findByIdAndUpdate(
            userId,
            { $set: { roles } },
            { new: true, runValidators: true }
        );
        if (!user) {
            throw createError(404, 'User not found');
        }
        return user;
    }

    static async updateStatus(userId: string, status: string)
    {
        const user = await User.findByIdAndUpdate(
            userId,
            { $set: { status } },
            { new: true, runValidators: true }
        );
        if (!user) {
            throw createError(404, 'User not found');
        }
        return user;
    }

    static async findByVerificationToken(token: string)
    {
        return await User.findOne({
            verificationToken: token,
            verificationTokenExpires: { $gt: new Date() }
        });
    }

    static async findByResetToken(token: string)
    {
        return await User.findOne({
            passwordResetToken: token,
            passwordResetExpires: { $gt: new Date() }
        }).select('+passwordHash');
    }
}
