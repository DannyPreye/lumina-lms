import { AIConversation, IAIConversation } from './ai-conversation.model';
import { AIGeneratedContent, IAIGeneratedContent } from './ai-generated-content.model';
import createError from 'http-errors';
import { Types } from 'mongoose';

export class AIService
{
    static async startConversation(userId: string, data: any)
    {
        return await AIConversation.create({
            userId: new Types.ObjectId(userId),
            courseId: new Types.ObjectId(data.courseId),
            lessonId: data.lessonId ? new Types.ObjectId(data.lessonId) : undefined,
            type: data.type || 'tutor',
            context: data.context || {},
            messages: data.initialMessage ? [ data.initialMessage ] : []
        });
    }

    static async addMessage(conversationId: string, userId: string, messageData: any)
    {
        const conversation = await AIConversation.findOne({ _id: conversationId, userId });
        if (!conversation) throw createError(404, 'Conversation not found');

        conversation.messages.push({
            ...messageData,
            timestamp: new Date()
        });

        return await conversation.save();
    }

    static async getConversation(conversationId: string, userId: string)
    {
        const conversation = await AIConversation.findOne({ _id: conversationId, userId });
        if (!conversation) throw createError(404, 'Conversation not found');
        return conversation;
    }

    static async logGeneratedContent(data: any)
    {
        return await AIGeneratedContent.create(data);
    }

    static async reviewContent(contentId: string, reviewerId: string, status: string)
    {
        return await AIGeneratedContent.findByIdAndUpdate(
            contentId,
            {
                approvalStatus: status,
                reviewed: true,
                reviewedBy: new Types.ObjectId(reviewerId),
                reviewedAt: new Date()
            },
            { new: true }
        );
    }

    static async getGeneratedContent(contentId: string)
    {
        const content = await AIGeneratedContent.findById(contentId);
        if (!content) throw createError(404, 'AI content not found');
        return content;
    }
}
