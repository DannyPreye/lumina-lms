import { Schema, model, Document, Types } from 'mongoose';
import { tenantPlugin, ITenantAware } from '../../common/plugins/tenant.plugin';

export interface ILeaderboard extends Document, ITenantAware
{
    type: 'global' | 'course' | 'weekly' | 'monthly';
    courseId?: Types.ObjectId;
    period: {
        start: Date;
        end: Date;
    };
    rankings: {
        rank: number;
        userId: Types.ObjectId;
        score: number;
        badges: number;
        coursesCompleted: number;
        metadata: Record<string, any>;
    }[];
    lastUpdated: Date;
    createdAt: Date;
}

const leaderboardSchema = new Schema<ILeaderboard>(
    {
        type: { type: String, enum: [ 'global', 'course', 'weekly', 'monthly' ], required: true },
        courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
        period: {
            start: { type: Date, required: true },
            end: { type: Date, required: true },
        },
        rankings: [
            {
                rank: Number,
                userId: { type: Schema.Types.ObjectId, ref: 'User' },
                score: Number,
                badges: Number,
                coursesCompleted: Number,
                metadata: Schema.Types.Mixed,
            },
        ],
        lastUpdated: { type: Date, default: Date.now },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

leaderboardSchema.index({ type: 1, courseId: 1, 'period.start': 1 });

leaderboardSchema.plugin(tenantPlugin);

export const Leaderboard = model<ILeaderboard>('Leaderboard', leaderboardSchema);
