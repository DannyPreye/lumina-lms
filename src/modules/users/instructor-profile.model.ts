import { Schema, model, Document, Types } from 'mongoose';

export interface IInstructorProfile extends Document
{
    user: Types.ObjectId;
    firstName: string;
    lastName: string;
    displayName: string;
    avatar?: string;
    bio?: string;
    title?: string; // e.g. "Senior Software Engineer"
    expertise: string[]; // e.g. ["Node.js", "React"]
    socialLinks: {
        linkedin?: string;
        twitter?: string;
        github?: string;
        website?: string;
    };
    averageRating: number;
    totalStudents: number;
    totalCourses: number;
    createdAt: Date;
    updatedAt: Date;
}

const instructorProfileSchema = new Schema<IInstructorProfile>(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        displayName: { type: String, required: true },
        avatar: String,
        bio: String,
        title: String,
        expertise: [ String ],
        socialLinks: {
            linkedin: String,
            twitter: String,
            github: String,
            website: String,
        },
        averageRating: { type: Number, default: 0 },
        totalStudents: { type: Number, default: 0 },
        totalCourses: { type: Number, default: 0 },
    },
    { timestamps: true }
);

export const InstructorProfile = model<IInstructorProfile>('InstructorProfile', instructorProfileSchema);
