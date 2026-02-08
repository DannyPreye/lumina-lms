import { Schema, model, Document, Types } from 'mongoose';
import { tenantPlugin, ITenantAware } from '../../common/plugins/tenant.plugin';

export interface IActivity extends Document, ITenantAware
{
    type: string; // e.g. 'user_registered', 'certificate_issued', etc.
    user: Types.ObjectId | string;
    meta?: Record<string, any>;
    createdAt: Date;
}

const activitySchema = new Schema<IActivity>({
    type: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    meta: { type: Schema.Types.Mixed },
}, { timestamps: { createdAt: true, updatedAt: false } });

activitySchema.plugin(tenantPlugin);

export const Activity = model<IActivity>('Activity', activitySchema);
