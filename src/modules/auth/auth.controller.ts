import { Request, Response, NextFunction } from 'express';
import { UserService } from '../users/user.service';
import { CertificateService } from '../certificates/certificate.service';
import createError from 'http-errors';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, decodeToken } from '../../common/utils/jwt.util';
import { generateRandomToken, hashToken } from '../../common/utils/crypto.util';
import { IUser } from '../users/user.model';

const DEFAULT_ELEMENT_STYLES = {
    fontSize: "14",
    fontFamily: "Open Sans",
    fontWeight: "normal",
    color: "#000000",
    textAlign: "left",
};

const INITIAL_ELEMENTS = [
    {
        id: "title",
        type: "text",
        content: "Certificate of Completion",
        x: 100,
        y: 80,
        width: 600,
        height: 80,
        rotation: 0,
        style: {
            ...DEFAULT_ELEMENT_STYLES,
            fontSize: "48",
            fontFamily: "Pinyon Script",
            fontWeight: "bold",
            color: "#1a365d",
            textAlign: "center",
        }
    },
    {
        id: "subtitle-1",
        type: "text",
        content: "This is to certify that",
        x: 200,
        y: 180,
        width: 400,
        height: 30,
        rotation: 0,
        style: {
            ...DEFAULT_ELEMENT_STYLES,
            fontSize: "18",
            fontFamily: "Open Sans",
            color: "#4a5568",
            textAlign: "center",
        }
    },
    {
        id: "student-name",
        type: "variable",
        variable: "student_name",
        content: "{Student Name}",
        x: 150,
        y: 220,
        width: 500,
        height: 60,
        rotation: 0,
        style: {
            ...DEFAULT_ELEMENT_STYLES,
            fontSize: "42",
            fontFamily: "Great Vibes",
            color: "#2b6cb0",
            textAlign: "center",
            borderBottom: "2px solid #e2e8f0",
        }
    },
    {
        id: "subtitle-2",
        type: "text",
        content: "has successfully completed the course",
        x: 200,
        y: 300,
        width: 400,
        height: 30,
        rotation: 0,
        style: {
            ...DEFAULT_ELEMENT_STYLES,
            fontSize: "16",
            fontFamily: "Open Sans",
            color: "#4a5568",
            textAlign: "center",
        }
    },
    {
        id: "course-name",
        type: "variable",
        variable: "course_name",
        content: "{Course Name}",
        x: 100,
        y: 340,
        width: 600,
        height: 50,
        rotation: 0,
        style: {
            ...DEFAULT_ELEMENT_STYLES,
            fontSize: "32",
            fontFamily: "Merriweather",
            fontWeight: "bold",
            color: "#2d3748",
            textAlign: "center",
        }
    },
    {
        id: "instructor-sig",
        type: "signature",
        content: "John Doe",
        x: 150,
        y: 450,
        width: 200,
        height: 40,
        rotation: 0,
        style: {
            ...DEFAULT_ELEMENT_STYLES,
            fontSize: "24",
            fontFamily: "Dancing Script",
            borderTop: "1px solid #718096",
            paddingTop: "10px",
            color: "#000",
            justifyContent: "center",
        }
    },
    {
        id: "date",
        type: "variable",
        variable: "completion_date",
        content: "{Date}",
        x: 450,
        y: 450,
        width: 200,
        height: 40,
        rotation: 0,
        style: {
            ...DEFAULT_ELEMENT_STYLES,
            fontSize: "18",
            fontFamily: "Open Sans",
            borderTop: "1px solid #718096",
            paddingTop: "10px",
            color: "#4a5568",
            justifyContent: "center",
        }
    },
    {
        id: "logo",
        type: "image",
        content: "https://placehold.co/100x100/png?text=Logo",
        x: 350,
        y: 420,
        width: 100,
        height: 100,
        rotation: 0,
        style: {
            ...DEFAULT_ELEMENT_STYLES,
            opacity: "0.8",
        }
    }
];

export class AuthController
{
    static async register(req: Request, res: Response, next: NextFunction)
    {
        try {
            const { email, password, firstName, lastName, displayName, roles } = req.body;

            const verificationToken = generateRandomToken();
            const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

            const user = await UserService.createUser({
                email,
                passwordHash: password,
                profile: { firstName, lastName, displayName },
                verificationToken: hashToken(verificationToken),
                verificationTokenExpires,
                roles,
            });

            // If user is an instructor, create a default certificate template
            if (roles && roles.includes('instructor')) {
                await CertificateService.createTemplate({
                    name: 'Default Certificate Template',
                    description: 'A standard certificate template to get you started.',
                    instructor: user._id,
                    layout: {
                        width: 800,
                        height: 600,
                        background: {
                            backgroundColor: '#ffffff',
                            backgroundSize: 'contain',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat'
                        },
                        elements: INITIAL_ELEMENTS
                    },
                    isPublished: true
                });
            }

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

            const decodedAccessToken = decodeToken(accessToken) as { exp: number; };
            const expiresAt = new Date(decodedAccessToken.exp * 1000);

            res.json({
                success: true,
                accessToken,
                user: { id: user._id, email: user.email, roles: user.roles },
                refreshToken,
                expiresAt,
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

            const decodedAccessToken = decodeToken(accessToken) as { exp: number; };
            const expiresAt = new Date(decodedAccessToken.exp * 1000);

            res.json({
                success: true,
                accessToken,
                user: { id: user._id, email: user.email, roles: user.roles },
                expiresAt,
            });
        } catch (error) {
            next(error);
        }
    }

    static async refreshAccessToken(req: Request, res: Response, next: NextFunction)
    {
        try {
            const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
            if (!refreshToken) throw createError(401, 'Refresh token not found');

            const decoded = verifyRefreshToken(refreshToken) as any;
            const user = await UserService.findById(decoded.id);

            if (!user) throw createError(401, 'User not found');

            const accessToken = generateAccessToken(user._id.toString(), user.roles);

            const decodedAccessToken = decodeToken(accessToken) as { exp: number; };
            const expiresAt = new Date(decodedAccessToken.exp * 1000);

            res.json({
                success: true,
                accessToken,
                expiresAt,
            });
        } catch (error) {
            next(createError(401, 'Invalid refresh token'));
        }
    }

    static async logout(req: Request, res: Response)
    {
        res.cookie('refreshToken', '', { maxAge: 1 });
        res.json({ success: true, message: 'Logged out' });
    }
}
