import { Schema, model, Document, Types } from 'mongoose';
import { tenantPlugin, ITenantAware } from '../../common/plugins/tenant.plugin';

export interface IAIGeneratedContent extends Document, ITenantAware
{
    type: 'quiz' | 'lesson' | 'summary' | 'feedback' | 'recommendation';
    sourceType: 'lesson' | 'course' | 'user_query';
    sourceId: Types.ObjectId;
    prompt: string;
    aiModel: string;
    generatedContent: Record<string, any>;
    reviewed: boolean;
    reviewedBy?: Types.ObjectId;
    reviewedAt?: Date;
    approvalStatus: 'pending' | 'approved' | 'rejected';
    usage: {
        tokens: number;
        cost: number;
    };
    createdAt: Date;
}

const aiGeneratedContentSchema = new Schema<IAIGeneratedContent>(
    {
        type: {
            type: String,
            enum: [ 'quiz', 'lesson', 'summary', 'feedback', 'recommendation' ],
            required: true,
        },
        sourceType: { type: String, enum: [ 'lesson', 'course', 'user_query' ], required: true },
        sourceId: { type: Schema.Types.ObjectId, required: true },
        prompt: { type: String, required: true },
        aiModel: { type: String, required: true },
        generatedContent: { type: Schema.Types.Mixed, required: true },
        reviewed: { type: Boolean, default: false },
        reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        reviewedAt: Date,
        approvalStatus: {
            type: String,
            enum: [ 'pending', 'approved', 'rejected' ],
            default: 'pending',
        },
        usage: {
            tokens: { type: Number, default: 0 },
            cost: { type: Number, default: 0 },
        },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

aiGeneratedContentSchema.plugin(tenantPlugin);

export const AIGeneratedContent = model<IAIGeneratedContent>('AIGeneratedContent', aiGeneratedContentSchema);
