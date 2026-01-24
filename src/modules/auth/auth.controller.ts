import { Request, Response, NextFunction } from 'express';
import { UserService } from '../users/user.service';
import createError from 'http-errors';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../common/utils/jwt.util';
import { generateRandomToken, hashToken } from '../../common/utils/crypto.util';
import { IUser } from '../users/user.model';

export class AuthController
{
    static async register(req: Request, res: Response, next: NextFunction)
    {
        try {
            const { email, password, firstName, lastName, displayName } = req.body;

            const verificationToken = generateRandomToken();
            const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

            const user = await UserService.createUser({
                email,
                passwordHash: password,
                profile: { firstName, lastName, displayName },
                verificationToken: hashToken(verificationToken),
                verificationTokenExpires
            });

            // In a real app, send verification email here
            console.log(`Verification Token for ${email}: ${verificationToken}`);

            res.status(201).json({
                success: true,
                message: 'User registered successfully. Please verify your email.',
                data: {
                    id: user._id,
                    email: user.email,
                    roles: user.roles,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    static async verifyEmail(req: Request, res: Response, next: NextFunction)
    {
        try {
            const { token } = req.body;
            if (!token) throw createError(400, 'Verification token is required');

            const hashedToken = hashToken(token);
            const user = await UserService.findByVerificationToken(hashedToken);

            if (!user) {
                throw createError(400, 'Invalid or expired verification token');
            }

            user.emailVerified = true;
            user.verificationToken = undefined;
            user.verificationTokenExpires = undefined;
            await user.save();

            res.json({ success: true, message: 'Email verified successfully' });
        } catch (error) {
            next(error);
        }
    }

    static async forgotPassword(req: Request, res: Response, next: NextFunction)
    {
        try {
            const { email } = req.body;
            const user = await UserService.findByEmail(email);

            if (!user) {
                // Return success anyway to prevent email enumeration
                return res.json({ success: true, message: 'If a user with that email exists, a reset link has been sent.' });
            }

            const resetToken = generateRandomToken();
            const hashedToken = hashToken(resetToken);

            user.passwordResetToken = hashedToken;
            user.passwordResetExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour
            await user.save();

            // In a real app, send reset email here
            console.log(`Password Reset Token for ${email}: ${resetToken}`);

            res.json({ success: true, message: 'Password reset link sent' });
        } catch (error) {
            next(error);
        }
    }

    static async resetPassword(req: Request, res: Response, next: NextFunction)
    {
        try {
            const { token, newPassword } = req.body;
            if (!token || !newPassword) throw createError(400, 'Token and new password are required');

            const hashedToken = hashToken(token);
            const user = await UserService.findByResetToken(hashedToken);

            if (!user) {
                throw createError(400, 'Invalid or expired reset token');
            }

            user.passwordHash = newPassword;
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save();

            res.json({ success: true, message: 'Password reset successful' });
        } catch (error) {
            next(error);
        }
    }

    static async login(req: Request, res: Response, next: NextFunction)
    {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                throw createError(400, 'Please provide email and password');
            }

            const user = await UserService.findByEmail(email);
            if (!user || !(await user.comparePassword(password))) {
                throw createError(401, 'Invalid credentials');
            }

            const accessToken = generateAccessToken(user._id.toString(), user.roles);
            const refreshToken = generateRefreshToken(user._id.toString());

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            res.json({
                success: true,
                accessToken,
                user: { id: user._id, email: user.email, roles: user.roles },
            });
        } catch (error) {
            next(error);
        }
    }

    static async googleCallback(req: Request, res: Response, next: NextFunction)
    {
        try {
            const user = req.user as IUser;
            if (!user) {
                throw createError(401, 'Authentication failed');
            }

            const accessToken = generateAccessToken(user._id.toString(), user.roles);
            const refreshToken = generateRefreshToken(user._id.toString());

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            res.json({
                success: true,
                accessToken,
                user: { id: user._id, email: user.email, roles: user.roles },
            });
        } catch (error) {
            next(error);
        }
    }

    static async refreshAccessToken(req: Request, res: Response, next: NextFunction)
    {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) throw createError(401, 'Refresh token not found');

            const decoded = verifyRefreshToken(refreshToken) as any;
            const user = await UserService.findById(decoded.id);

            if (!user) throw createError(401, 'User not found');

            const accessToken = generateAccessToken(user._id.toString(), user.roles);

            res.json({
                success: true,
                accessToken,
            });
        } catch (error) {
            next(createError(401, 'Invalid refresh token'));
        }
    }

    static logout(req: Request, res: Response)
    {
        res.cookie('refreshToken', '', { maxAge: 1 });
        res.json({ success: true, message: 'Logged out' });
    }
}
