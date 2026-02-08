import { Schema, model, Document, Types } from 'mongoose';
import { tenantPlugin, ITenantAware } from '../../common/plugins/tenant.plugin';

export interface ITransaction extends Document, ITenantAware
{
    userId: Types.ObjectId;
    courseId?: Types.ObjectId;
    type: 'course_purchase' | 'subscription' | 'refund';
    amount: number;
    currency: string;
    paymentMethod: 'card' | 'paypal' | 'stripe' | 'other';
    paymentProcessor: string;
    processorTransactionId: string;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    metadata: {
        discountCode?: string;
        discountAmount?: number;
        taxAmount?: number;
    };
    refund?: {
        refunded: boolean;
        refundAmount: number;
        refundReason?: string;
        refundedAt?: Date;
    };
    createdAt: Date;
    updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
        type: { type: String, enum: [ 'course_purchase', 'subscription', 'refund' ], required: true },
        amount: { type: Number, required: true },
        currency: { type: String, default: 'USD' },
        paymentMethod: { type: String, enum: [ 'card', 'paypal', 'stripe', 'other' ], required: true },
        paymentProcessor: String,
        processorTransactionId: { type: String, required: true },
        status: { type: String, enum: [ 'pending', 'completed', 'failed', 'refunded' ], default: 'pending' },
        metadata: {
            discountCode: String,
            discountAmount: Number,
            taxAmount: Number,
        },
        refund: {
            refunded: { type: Boolean, default: false },
            refundAmount: Number,
            refundReason: String,
            refundedAt: Date,
        },
    },
    { timestamps: true }
);

transactionSchema.index({ processorTransactionId: 1, tenantId: 1 }, { unique: true });
transactionSchema.plugin(tenantPlugin);

export const Transaction = model<ITransaction>('Transaction', transactionSchema);

export interface ISystemSetting extends Document, ITenantAware
{
    key: string;
    value: any;
    category: 'general' | 'email' | 'payment' | 'ai' | 'security';
    isEncrypted: boolean;
    updatedBy: Types.ObjectId;
    updatedAt: Date;
}

const systemSettingSchema = new Schema<ISystemSetting>(
    {
        key: { type: String, required: true },
        value: { type: Schema.Types.Mixed, required: true },
        category: { type: String, enum: [ 'general', 'email', 'payment', 'ai', 'security' ], default: 'general' },
        isEncrypted: { type: Boolean, default: false },
        updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: { createdAt: false, updatedAt: true } }
);

systemSettingSchema.index({ key: 1, tenantId: 1 }, { unique: true });
systemSettingSchema.plugin(tenantPlugin);
export const SystemSetting = model<ISystemSetting>('SystemSetting', systemSettingSchema);

export interface IAuditLog extends Document, ITenantAware
{
    userId: Types.ObjectId;
    action: string;
    entity: string;
    entityId: Types.ObjectId;
    changes?: {
        before: any;
        after: any;
    };
    ipAddress?: string;
    userAgent?: string;
    timestamp: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        action: { type: String, required: true },
        entity: { type: String, required: true },
        entityId: { type: Schema.Types.ObjectId, required: true },
        changes: {
            before: Schema.Types.Mixed,
            after: Schema.Types.Mixed,
        },
        ipAddress: String,
        userAgent: String,
        timestamp: { type: Date, default: Date.now },
    },
    { timestamps: false }
);

auditLogSchema.plugin(tenantPlugin);
export const AuditLog = model<IAuditLog>('AuditLog', auditLogSchema);
