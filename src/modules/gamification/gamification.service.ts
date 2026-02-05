import { UserPoints } from './user-points.model';
import { Achievement } from './achievement.model';
import { UserAchievement } from './user-achievement.model';
import { Leaderboard } from './leaderboard.model';
import createError from 'http-errors';
import { Types } from 'mongoose';

export class GamificationService
{
    static async addPoints(userId: string, points: number, action: string, referenceId?: string)
    {
        let userPoints = await UserPoints.findOne({ userId });

        if (!userPoints) {
            userPoints = await UserPoints.create({ userId });
        }

        userPoints.totalPoints += points;

        // Simple level logic: every 1000 points is a level
        userPoints.level = Math.floor(userPoints.totalPoints / 1000) + 1;

        userPoints.pointsHistory.push({
            points,
            action: action as any,
            referenceId: referenceId ? new Types.ObjectId(referenceId) : undefined,
            createdAt: new Date()
        });

        await userPoints.save();

        // Check for achievements related to score/points
        await this.checkScoreAchievements(userId, userPoints.totalPoints);

        return userPoints;
    }

    static async updateStreak(userId: string)
    {
        const userPoints = await UserPoints.findOne({ userId });
        if (!userPoints) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const lastActivity = new Date(userPoints.streak.lastActivityDate);
        lastActivity.setHours(0, 0, 0, 0);

        const diffDays = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 3600 * 24));

        if (diffDays === 1) {
            // Extended streak
            userPoints.streak.current += 1;
            if (userPoints.streak.current > userPoints.streak.longest) {
                userPoints.streak.longest = userPoints.streak.current;
            }
        } else if (diffDays > 1) {
            // Streak broken
            userPoints.streak.current = 1;
        }

        userPoints.streak.lastActivityDate = new Date();
        await userPoints.save();

        // Check for streak achievements
        await this.checkStreakAchievements(userId, userPoints.streak.current);
    }

    private static async checkScoreAchievements(userId: string, currentScore: number)
    {
        const achievements = await Achievement.find({
            category: 'score',
            'criteria.type': 'quiz_score', // or similar
            isActive: true
        });

        for (const achievement of achievements) {
            if (currentScore >= achievement.criteria.threshold) {
                await this.awardAchievement(userId, achievement._id.toString());
            }
        }
    }

    private static async checkStreakAchievements(userId: string, currentStreak: number)
    {
        const achievements = await Achievement.find({
            category: 'streak',
            'criteria.type': 'login_streak',
            isActive: true
        });

        for (const achievement of achievements) {
            if (currentStreak >= achievement.criteria.threshold) {
                await this.awardAchievement(userId, achievement._id.toString());
            }
        }
    }

    static async awardAchievement(userId: string, achievementId: string, courseId?: string)
    {
        const existing = await UserAchievement.findOne({ userId, achievementId, courseId });
        if (existing && existing.earned) return;

        if (existing) {
            existing.earned = true;
            existing.earnedAt = new Date();
            existing.progress = 100;
            await existing.save();
        } else {
            await UserAchievement.create({
                userId,
                achievementId,
                courseId,
                earned: true,
                earnedAt: new Date(),
                progress: 100
            });
        }

        // Award bonus points for achievement
        const achievement = await Achievement.findById(achievementId);
        if (achievement && achievement.points > 0) {
            await this.addPoints(userId, achievement.points, 'badge_earned', achievementId);
        }
    }

    static async getLeaderboard(type: string, courseId?: string)
    {
        const query: any = { type };
        if (courseId) query.courseId = courseId;
        return await Leaderboard.findOne(query).sort('-createdAt').populate({
            path: 'rankings.userId',
            select: 'email',
            populate: [ { path: 'studentProfile' }, { path: 'instructorProfile' } ]
        });
    }

    static async getUserStats(userId: string)
    {
        const points = await UserPoints.findOne({ userId });
        const badges = await UserAchievement.find({ userId, earned: true }).populate('achievementId');
        return { points, badges };
    }
}
