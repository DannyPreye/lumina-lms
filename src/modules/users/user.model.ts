import { Schema, model, Document, Types } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document
{
    email: string;
    passwordHash?: string;
    roles: ('student' | 'instructor' | 'admin' | 'teaching_assistant')[];
    profile: {
        firstName: string;
        lastName: string;
        displayName: string;
        avatar?: string;
        bio?: string;
        title?: string;
        timezone?: string;
        language?: string;
        pronouns?: string;
    };
    contactInfo: {
        phone?: string;
        alternateEmail?: string;
        socialLinks: {
            linkedin?: string;
            twitter?: string;
            github?: string;
        };
    };
    preferences: {
        emailNotifications: boolean;
        pushNotifications: boolean;
        digestFrequency: 'daily' | 'weekly' | 'never';
        theme: 'light' | 'dark' | 'auto';
        accessibility: {
            screenReader: boolean;
            highContrast: boolean;
            fontSize: 'small' | 'medium' | 'large';
        };
    };
    status: 'active' | 'suspended' | 'deactivated';
    emailVerified: boolean;
    verificationToken?: string;
    verificationTokenExpires?: Date;
    passwordResetToken?: string;
    signInMethod: 'email' | 'google';
    passwordResetExpires?: Date;
    lastLogin?: Date;
    comparePassword(password: string): Promise<boolean>;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}

const userSchema = new Schema<IUser>(
    {
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        passwordHash: { type: String, required: false, select: false },
        roles: {
            type: [ String ],
            enum: [ 'student', 'instructor', 'admin', 'teaching_assistant' ],
            default: [ 'student' ],
        },
        profile: {
            firstName: { type: String, required: true },
            lastName: { type: String, required: true },
            displayName: { type: String, required: true },
            avatar: String,
            bio: String,
            title: String,
            timezone: { type: String, default: 'UTC' },
            language: { type: String, default: 'en' },
            pronouns: String,
        },
        contactInfo: {
            phone: String,
            alternateEmail: String,
            socialLinks: {
                linkedin: String,
                twitter: String,
                github: String,
            },
        },
        preferences: {
            emailNotifications: { type: Boolean, default: true },
            pushNotifications: { type: Boolean, default: true },
            digestFrequency: { type: String, enum: [ 'daily', 'weekly', 'never' ], default: 'daily' },
            theme: { type: String, enum: [ 'light', 'dark', 'auto' ], default: 'auto' },
            accessibility: {
                screenReader: { type: Boolean, default: false },
                highContrast: { type: Boolean, default: false },
                fontSize: { type: String, enum: [ 'small', 'medium', 'large' ], default: 'medium' },
            },
        },
        status: {
            type: String,
            enum: [ 'active', 'suspended', 'deactivated' ],
            default: 'active',
        },
        emailVerified: { type: Boolean, default: false },
        signInMethod: { type: String, enum: [ 'email', 'google' ], default: 'email' },
        verificationToken: String,
        verificationTokenExpires: Date,
        passwordResetToken: String,
        passwordResetExpires: Date,
        lastLogin: Date,
        deletedAt: Date,
    },
    {
        timestamps: true,
    }
);

// Pre-save hook for password hashing
userSchema.pre('save', async function ()
{
    if (!this.isModified('passwordHash')) return;
    try {
        const salt = await bcrypt.genSalt(10);
        if (!this.passwordHash) return;
        this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    } catch (error) {
        throw error;
    }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (password: string): Promise<boolean>
{
    return bcrypt.compare(password, this.passwordHash);
};

export const User = model<IUser>('User', userSchema);
