import { Schema, model, Document, Types } from 'mongoose';
import { tenantPlugin, ITenantAware } from '../../common/plugins/tenant.plugin';

export interface IStudentProfile extends Document, ITenantAware
{
    user: Types.ObjectId;
    firstName: string;
    lastName: string;
    displayName: string;
    avatar?: string;
    bio?: string;
    interests: string[];
    socialLinks: {
        linkedin?: string;
        twitter?: string;
        github?: string;
    };
    enrolledCoursesCount: number;
    completedCoursesCount: number;
    createdAt: Date;
    updatedAt: Date;
}

const studentProfileSchema = new Schema<IStudentProfile>(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        displayName: { type: String, required: true },
        avatar: String,
        bio: String,
        interests: [ String ],
        socialLinks: {
            linkedin: String,
            twitter: String,
            github: String,
        },
        enrolledCoursesCount: { type: Number, default: 0 },
        completedCoursesCount: { type: Number, default: 0 },
    },
    { timestamps: true }
);

studentProfileSchema.index({ user: 1, tenantId: 1 }, { unique: true });
studentProfileSchema.plugin(tenantPlugin);

export const StudentProfile = model<IStudentProfile>('StudentProfile', studentProfileSchema);
