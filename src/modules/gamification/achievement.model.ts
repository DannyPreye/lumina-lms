import { Schema, model, Document, Types } from 'mongoose';
import { tenantPlugin, ITenantAware } from '../../common/plugins/tenant.plugin';

export interface IAchievement extends Document, ITenantAware
{
    name: string;
    description: string;
    icon: string;
    type: 'badge' | 'trophy' | 'certificate';
    category: 'course_completion' | 'streak' | 'score' | 'participation' | 'skill_mastery';
    criteria: {
        type: 'course_complete' | 'lessons_complete' | 'quiz_score' | 'assignment_score' | 'discussion_posts' | 'login_streak' | 'custom';
        threshold: number;
        courseId?: Types.ObjectId;
        skillId?: Types.ObjectId;
    };
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    points: number;
    isActive: boolean;
    createdAt: Date;
}

const achievementSchema = new Schema<IAchievement>(
    {
        name: { type: String, required: true },
        description: { type: String, required: true },
        icon: { type: String, required: true },
        type: { type: String, enum: [ 'badge', 'trophy', 'certificate' ], required: true },
        category: { type: String, enum: [ 'course_completion', 'streak', 'score', 'participation', 'skill_mastery' ], required: true },
        criteria: {
            type: { type: String, enum: [ 'course_complete', 'lessons_complete', 'quiz_score', 'assignment_score', 'discussion_posts', 'login_streak', 'custom' ], required: true },
            threshold: { type: Number, required: true },
            courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
            skillId: { type: Schema.Types.ObjectId },
        },
        rarity: { type: String, enum: [ 'common', 'rare', 'epic', 'legendary' ], default: 'common' },
        points: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

achievementSchema.plugin(tenantPlugin);

export const Achievement = model<IAchievement>('Achievement', achievementSchema);
