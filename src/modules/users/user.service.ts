import { User, IUser } from './user.model';
import { InstructorProfile } from './instructor-profile.model';
import { StudentProfile } from './student-profile.model';
import createError from 'http-errors';

export class UserService
{
    static async createUser(userData: any)
    {
        const { firstName, lastName, displayName, roles, ...userCoreData } = userData;

        const userExists = await User.findOne({ email: userCoreData.email });
        if (userExists) {
            throw createError(400, 'User already exists');
        }

        const user = await User.create({ ...userCoreData, roles });

        // Create profiles based on roles
        if (roles.includes('instructor')) {
            await InstructorProfile.create({
                user: user._id,
                firstName,
                lastName,
                displayName
            });
        }

        if (roles.includes('student')) {
            await StudentProfile.create({
                user: user._id,
                firstName,
                lastName,
                displayName
            });
        }

        return user;
    }

    static async findByEmail(email: string)
    {
        return await User.findOne({ email })
            .select('+passwordHash')
            .populate('instructorProfile')
            .populate('studentProfile');
    }

    static async findById(id: string)
    {
        const user = await User.findById(id)
            .populate('instructorProfile')
            .populate('studentProfile');
        if (!user) {
            throw createError(404, 'User not found');
        }
        return user;
    }

    static async updateProfile(userId: string, updateData: any)
    {
        const { firstName, lastName, displayName, bio, title, avatar, preferences, ...rest } = updateData;

        // Update core user data if any
        if (Object.keys(rest).length > 0 || preferences) {
            const user = await User.findById(userId);
            if (!user) throw createError(404, 'User not found');

            const updatePayload: any = { ...rest };
            if (preferences) {
                updatePayload.preferences = {
                    ...user.preferences,
                    ...preferences
                };
            }
            await User.findByIdAndUpdate(userId, { $set: updatePayload }, { new: true, runValidators: true });
        }

        // Build profile update object from provided fields
        const profileUpdate: any = {};
        if (firstName !== undefined) profileUpdate.firstName = firstName;
        if (lastName !== undefined) profileUpdate.lastName = lastName;
        if (displayName !== undefined) profileUpdate.displayName = displayName;
        if (bio !== undefined) profileUpdate.bio = bio;
        if (title !== undefined) profileUpdate.title = title;
        if (avatar !== undefined) profileUpdate.avatar = avatar;

        if (Object.keys(profileUpdate).length > 0) {
            const user = await User.findById(userId);
            if (!user) throw createError(404, 'User not found');

            if (user.roles.includes('instructor')) {
                await InstructorProfile.findOneAndUpdate({ user: userId }, { $set: profileUpdate }, { upsert: true });
            }
            if (user.roles.includes('student')) {
                await StudentProfile.findOneAndUpdate({ user: userId }, { $set: profileUpdate }, { upsert: true });
            }
        }

        return await this.findById(userId);
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

    static async changePassword(userId: string, currentPassword: string, newPassword: string)
    {
        const user = await User.findById(userId).select('+passwordHash');
        if (!user) {
            throw createError(404, 'User not found');
        }

        // Only allow password change if the user has an existing password (not just Google Auth)
        if (!user.passwordHash && user.signInMethod === 'google') {
            throw createError(400, 'Social login users cannot change password this way. Set a password via forgot password first.');
        }

        // Check if current password is correct
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            throw createError(401, 'Invalid current password');
        }

        // Update password (pre-save hook will hash it)
        user.passwordHash = newPassword;
        await user.save();
    }
}
