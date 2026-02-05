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
            .populate({
                path: 'authorId',
                select: 'email',
                populate: [ { path: 'studentProfile' }, { path: 'instructorProfile' } ]
            })
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
            .populate({
                path: 'authorId',
                select: 'email',
                populate: [ { path: 'studentProfile' }, { path: 'instructorProfile' } ]
            })
            .populate({
                path: 'replies.authorId',
                select: 'email',
                populate: [ { path: 'studentProfile' }, { path: 'instructorProfile' } ]
            });

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

    static async updateDiscussion(discussionId: string, authorId: string, updateData: any, isAdmin: boolean = false)
    {
        const discussion = await Discussion.findById(discussionId);
        if (!discussion) throw createError(404, 'Discussion not found');

        // Authorization: Only author or admin can update
        if (discussion.authorId.toString() !== authorId && !isAdmin) {
            throw createError(403, 'You are not authorized to update this discussion');
        }

        Object.assign(discussion, updateData);
        return await discussion.save();
    }

    static async deleteDiscussion(discussionId: string, authorId: string, isAdmin: boolean = false)
    {
        const discussion = await Discussion.findById(discussionId);
        if (!discussion) throw createError(404, 'Discussion not found');

        // Authorization: Only author or admin can delete
        if (discussion.authorId.toString() !== authorId && !isAdmin) {
            throw createError(403, 'You are not authorized to delete this discussion');
        }

        discussion.deletedAt = new Date();
        await discussion.save();

        return { success: true, message: 'Discussion deleted successfully' };
    }

    static async toggleLock(discussionId: string, instructorId: string, isAdmin: boolean = false)
    {
        const discussion = await Discussion.findById(discussionId).populate('courseId', 'instructorId coInstructors');
        if (!discussion) throw createError(404, 'Discussion not found');

        const course = discussion.courseId as any;
        const isCourseInstructor = course.instructorId.toString() === instructorId || course.coInstructors?.some((id: any) => id.toString() === instructorId);

        if (!isCourseInstructor && !isAdmin) {
            throw createError(403, 'Only instructors or admins can lock/unlock discussions');
        }

        discussion.isLocked = !discussion.isLocked;
        return await discussion.save();
    }

    static async togglePin(discussionId: string, instructorId: string, isAdmin: boolean = false)
    {
        const discussion = await Discussion.findById(discussionId).populate('courseId', 'instructorId coInstructors');
        if (!discussion) throw createError(404, 'Discussion not found');

        const course = discussion.courseId as any;
        const isCourseInstructor = course.instructorId.toString() === instructorId || course.coInstructors?.some((id: any) => id.toString() === instructorId);

        if (!isCourseInstructor && !isAdmin) {
            throw createError(403, 'Only instructors or admins can pin missions');
        }

        discussion.isPinned = !discussion.isPinned;
        return await discussion.save();
    }

    static async vote(discussionId: string, userId: string, type: 'up' | 'down')
    {
        const discussion = await Discussion.findById(discussionId);
        if (!discussion) throw createError(404, 'Discussion not found');

        const userObjectId = new Types.ObjectId(userId);
        const hasUpvoted = discussion.upvotedBy.some(id => id.equals(userObjectId));
        const hasDownvoted = discussion.downvotedBy.some(id => id.equals(userObjectId));

        if (type === 'up') {
            if (hasUpvoted) {
                // Remove upvote (Toggle off)
                (discussion.upvotedBy as any).pull(userObjectId);
                discussion.upvotes = Math.max(0, discussion.upvotes - 1);
            } else {
                // Add upvote
                discussion.upvotedBy.push(userObjectId);
                discussion.upvotes += 1;
                // Remove downvote if exists
                if (hasDownvoted) {
                    (discussion.downvotedBy as any).pull(userObjectId);
                    discussion.downvotes = Math.max(0, discussion.downvotes - 1);
                }
            }
        } else {
            if (hasDownvoted) {
                // Remove downvote (Toggle off)
                (discussion.downvotedBy as any).pull(userObjectId);
                discussion.downvotes = Math.max(0, discussion.downvotes - 1);
            } else {
                // Add downvote
                discussion.downvotedBy.push(userObjectId);
                discussion.downvotes += 1;
                // Remove upvote if exists
                if (hasUpvoted) {
                    (discussion.upvotedBy as any).pull(userObjectId);
                    discussion.upvotes = Math.max(0, discussion.upvotes - 1);
                }
            }
        }

        return await discussion.save();
    }

    static async voteReply(discussionId: string, replyId: string, userId: string, type: 'up' | 'down')
    {
        const discussion = await Discussion.findById(discussionId);
        if (!discussion) throw createError(404, 'Discussion not found');

        const reply = (discussion.replies as any).id(replyId);
        if (!reply) throw createError(404, 'Reply not found');

        const userObjectId = new Types.ObjectId(userId);
        const hasUpvoted = reply.upvotedBy.some((id: any) => id.equals(userObjectId));
        const hasDownvoted = reply.downvotedBy.some((id: any) => id.equals(userObjectId));

        if (type === 'up') {
            if (hasUpvoted) {
                reply.upvotedBy.pull(userObjectId);
                reply.upvotes = Math.max(0, reply.upvotes - 1);
            } else {
                reply.upvotedBy.push(userObjectId);
                reply.upvotes += 1;
                if (hasDownvoted) {
                    reply.downvotedBy.pull(userObjectId);
                    reply.downvotes = Math.max(0, reply.downvotes - 1);
                }
            }
        } else {
            if (hasDownvoted) {
                reply.downvotedBy.pull(userObjectId);
                reply.downvotes = Math.max(0, reply.downvotes - 1);
            } else {
                reply.downvotedBy.push(userObjectId);
                reply.downvotes += 1;
                if (hasUpvoted) {
                    reply.upvotedBy.pull(userObjectId);
                    reply.upvotes = Math.max(0, reply.upvotes - 1);
                }
            }
        }

        return await discussion.save();
    }

    static async updateReply(discussionId: string, replyId: string, authorId: string, updateData: any)
    {
        const discussion = await Discussion.findById(discussionId);
        if (!discussion) throw createError(404, 'Discussion not found');

        const reply = (discussion.replies as any).id(replyId);
        if (!reply) throw createError(404, 'Reply not found');

        if (reply.authorId.toString() !== authorId) {
            throw createError(403, 'You are not authorized to update this reply');
        }

        Object.assign(reply, updateData);
        return await discussion.save();
    }

    static async deleteReply(discussionId: string, replyId: string, authorId: string, isAdmin: boolean = false)
    {
        const discussion = await Discussion.findById(discussionId);
        if (!discussion) throw createError(404, 'Discussion not found');

        const reply = (discussion.replies as any).id(replyId);
        if (!reply) throw createError(404, 'Reply not found');

        if (reply.authorId.toString() !== authorId && !isAdmin) {
            throw createError(403, 'You are not authorized to delete this reply');
        }

        (reply as any).deleteOne();
        return await discussion.save();
    }

    static async acceptAnswer(discussionId: string, replyId: string, userId: string, isAdmin: boolean = false)
    {
        const discussion = await Discussion.findById(discussionId).populate('courseId', 'instructorId coInstructors');
        if (!discussion) throw createError(404, 'Discussion not found');

        const course = discussion.courseId as any;
        const isAuthor = discussion.authorId.toString() === userId;
        const isInstructor = course.instructorId.toString() === userId || course.coInstructors?.some((id: any) => id.toString() === userId);

        if (!isAuthor && !isInstructor && !isAdmin) {
            throw createError(403, 'Only the author or an instructor can accept an answer');
        }

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
