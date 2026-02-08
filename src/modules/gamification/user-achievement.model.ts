import { Schema, model, Document, Types } from 'mongoose';
import { tenantPlugin, ITenantAware } from '../../common/plugins/tenant.plugin';

export interface IUserAchievement extends Document, ITenantAware
{
    userId: Types.ObjectId;
    achievementId: Types.ObjectId;
    courseId?: Types.ObjectId;
    progress: number; // 0-100
    earned: boolean;
    earnedAt?: Date;
    metadata: Record<string, any>;
    createdAt: Date;
}

const userAchievementSchema = new Schema<IUserAchievement>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        achievementId: { type: Schema.Types.ObjectId, ref: 'Achievement', required: true },
        courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
        progress: { type: Number, default: 0 },
        earned: { type: Boolean, default: false },
        earnedAt: Date,
        metadata: { type: Schema.Types.Mixed, default: {} },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

userAchievementSchema.index({ userId: 1, achievementId: 1, courseId: 1, tenantId: 1 }, { unique: true });

userAchievementSchema.plugin(tenantPlugin);

export const UserAchievement = model<IUserAchievement>('UserAchievement', userAchievementSchema);
