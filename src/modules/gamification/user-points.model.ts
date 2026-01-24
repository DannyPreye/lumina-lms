import { Schema, model, Document, Types } from 'mongoose';

export interface IPointsHistory
{
    points: number;
    action: 'lesson_complete' | 'quiz_pass' | 'assignment_submit' | 'discussion_post' | 'badge_earned' | 'daily_login';
    referenceId?: Types.ObjectId;
    createdAt: Date;
}

export interface IUserPoints extends Document
{
    userId: Types.ObjectId;
    totalPoints: number;
    level: number;
    pointsHistory: IPointsHistory[];
    streak: {
        current: number;
        longest: number;
        lastActivityDate: Date;
    };
    updatedAt: Date;
}

const pointsHistorySchema = new Schema<IPointsHistory>(
    {
        points: { type: Number, required: true },
        action: {
            type: String,
            enum: [ 'lesson_complete', 'quiz_pass', 'assignment_submit', 'discussion_post', 'badge_earned', 'daily_login' ],
            required: true,
        },
        referenceId: Schema.Types.ObjectId,
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

const userPointsSchema = new Schema<IUserPoints>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
        totalPoints: { type: Number, default: 0 },
        level: { type: Number, default: 1 },
        pointsHistory: [ pointsHistorySchema ],
        streak: {
            current: { type: Number, default: 0 },
            longest: { type: Number, default: 0 },
            lastActivityDate: { type: Date, default: Date.now },
        },
    },
    { timestamps: true }
);

export const UserPoints = model<IUserPoints>('UserPoints', userPointsSchema);
