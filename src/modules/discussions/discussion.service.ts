import { Discussion, IDiscussion } from './discussion.model';
import createError from 'http-errors';
import { Types } from 'mongoose';
import { GamificationService } from '../gamification/gamification.service';
import { NotificationService } from '../notifications/notification.service';
import { AnalyticsService } from '../analytics/analytics.service';

export class DiscussionService
{
    static async createDiscussion(authorId: string, discussionData: any)
    {
        const discussion = await Discussion.create({ ...discussionData, authorId });

        // --- INTER-MODULE CONNECTION: Gamification ---
        await GamificationService.addPoints(authorId, 25, 'discussion_post', discussion._id.toString());

        // --- INTER-MODULE CONNECTION: Analytics ---
        await AnalyticsService.trackActivity(authorId, discussion.courseId.toString(), 'discussionPosts', 1);

        return discussion;
    }

    static async getCourseDiscussions(courseId: string, filters: any = {})
    {
        const {
            page = 1,
            limit = 10,
            type,
            tag,
            search,
            sortBy = 'newest'
        } = filters;

        const query: any = { courseId, deletedAt: { $exists: false } };

        if (type) query.type = type;
        if (tag) query.tags = tag;

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { body: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

        const discussions = await Discussion.find(query)
            .populate('authorId', 'profile')
            .sort(sortBy === 'popular' ? '-upvotes' : '-createdAt')
            .skip(skip)
            .limit(parseInt(limit as string));

        const total = await Discussion.countDocuments(query);

        return {
            discussions,
            total,
            page: parseInt(page as string),
            pages: Math.ceil(total / parseInt(limit as string))
        };
    }

    static async getDiscussionById(discussionId: string)
    {
        const discussion = await Discussion.findById(discussionId)
            .populate('authorId', 'profile')
            .populate('replies.authorId', 'profile');

        if (!discussion || discussion.deletedAt) {
            throw createError(404, 'Discussion not found');
        }

        // Increment views
        discussion.views += 1;
        await discussion.save();

        return discussion;
    }

    static async addReply(discussionId: string, authorId: string, replyData: any)
    {
        const discussion = await Discussion.findById(discussionId);
        if (!discussion || discussion.isLocked) {
            throw createError(400, 'Discussion not found or locked');
        }

        const reply = {
            ...replyData,
            authorId: new Types.ObjectId(authorId),
            upvotes: 0,
            downvotes: 0,
            isAcceptedAnswer: false,
            aiGenerated: false,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        discussion.replies.push(reply as any);
        await discussion.save();

        // --- INTER-MODULE CONNECTION: Gamification ---
        await GamificationService.addPoints(authorId, 15, 'discussion_post', discussion._id.toString());

        // --- INTER-MODULE CONNECTION: Notification ---
        // Notify the thread author
        if (discussion.authorId.toString() !== authorId) {
            await NotificationService.send({
                userId: discussion.authorId,
                type: 'discussion_reply',
                title: `New reply to: ${discussion.title}`,
                message: `Someone replied to your post.`,
                data: { courseId: discussion.courseId, discussionId: discussion._id },
                actionUrl: `/discussions/${discussion._id}`
            });
        }

        return discussion;
    }

    static async upvoteDiscussion(discussionId: string)
    {
        return await Discussion.findByIdAndUpdate(
            discussionId,
            { $inc: { upvotes: 1 } },
            { new: true }
        );
    }

    static async acceptAnswer(discussionId: string, replyId: string, instructorId: string)
    {
        const discussion = await Discussion.findById(discussionId);
        if (!discussion) throw createError(404, 'Discussion not found');

        // Safety check: Logic to ensure only author or instructor can accept answer could be added here

        discussion.replies.forEach(reply =>
        {
            if (reply._id.toString() === replyId) {
                reply.isAcceptedAnswer = true;
                discussion.hasAcceptedAnswer = true;
                discussion.acceptedAnswerId = reply._id;
            } else {
                reply.isAcceptedAnswer = false;
            }
        });

        return await discussion.save();
    }
}
