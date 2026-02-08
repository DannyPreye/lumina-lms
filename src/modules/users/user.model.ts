import { Schema, model, Document, Types } from 'mongoose';
import bcrypt from 'bcrypt';
import { tenantPlugin, ITenantAware } from '../../common/plugins/tenant.plugin';

export interface IUser extends Document, ITenantAware
{
    email: string;
    passwordHash?: string;
    roles: ('student' | 'instructor' | 'admin' | 'teaching_assistant' | 'system_admin')[];
    status: 'active' | 'suspended' | 'deactivated';
    emailVerified: boolean;
    verificationToken?: string;
    verificationTokenExpires?: Date;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    signInMethod: 'email' | 'google';
    lastLogin?: Date;
    preferences: {
        emailNotifications: boolean;
        pushNotifications: boolean;
        theme: 'light' | 'dark' | 'auto';
        language: string;
        timezone: string;
    };
    comparePassword(password: string): Promise<boolean>;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}

const userSchema = new Schema<IUser>(
    {
        email: { type: String, required: true, lowercase: true, trim: true },
        passwordHash: { type: String, required: false, select: false },
        roles: {
            type: [ String ],
            enum: [ 'student', 'instructor', 'admin', 'teaching_assistant', 'system_admin' ],
            default: [ 'student' ],
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
        preferences: {
            emailNotifications: { type: Boolean, default: true },
            pushNotifications: { type: Boolean, default: true },
            theme: { type: String, enum: [ 'light', 'dark', 'auto' ], default: 'auto' },
            language: { type: String, default: 'en' },
            timezone: { type: String, default: 'UTC' },
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Virtual relationships to profiles
userSchema.virtual('studentProfile', {
    ref: 'StudentProfile',
    localField: '_id',
    foreignField: 'user',
    justOne: true
});

userSchema.virtual('instructorProfile', {
    ref: 'InstructorProfile',
    localField: '_id',
    foreignField: 'user',
    justOne: true
});

// Indexes for performance
userSchema.index({ roles: 1 });
userSchema.index({ status: 1 });
userSchema.index({ email: 1, tenantId: 1 }, { unique: true });

// Apply Tenant Plugin
userSchema.plugin(tenantPlugin);

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
