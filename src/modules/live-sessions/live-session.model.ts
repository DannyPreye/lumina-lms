import { Schema, model, Document, Types } from 'mongoose';
import { tenantPlugin, ITenantAware } from '../../common/plugins/tenant.plugin';

export interface ILiveSession extends Document, ITenantAware
{
    courseId: Types.ObjectId;
    instructorId: Types.ObjectId;
    title: string;
    description?: string;
    agenda?: string;
    type: 'lecture' | 'tutorial' | 'office_hours' | 'group_discussion' | 'webinar';
    platform: 'zoom' | 'google_meet' | 'teams' | 'custom';
    meetingId?: string;
    meetingUrl: string;
    password?: string;
    scheduledStart: Date;
    scheduledEnd: Date;
    actualStart?: Date;
    actualEnd?: Date;
    duration?: number;
    capacity?: number;
    registeredStudents: {
        userId: Types.ObjectId;
        registeredAt: Date;
        reminderSent: boolean;
    }[];
    attendance: {
        userId: Types.ObjectId;
        joinedAt?: Date;
        leftAt?: Date;
        duration?: number;
        status: 'attended' | 'late' | 'absent';
    }[];
    recording?: {
        available: boolean;
        url?: string;
        duration?: number;
        uploadedAt?: Date;
        transcript?: string;
    };
    materials: {
        title: string;
        type: 'slides' | 'document' | 'link';
        url: string;
    }[];
    settings: {
        recordingEnabled: boolean;
        waitingRoomEnabled: boolean;
        chatEnabled: boolean;
        screenShareEnabled: boolean;
        breakoutRoomsEnabled: boolean;
        pollsEnabled: boolean;
    };
    status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
    createdAt: Date;
    updatedAt: Date;
}

const liveSessionSchema = new Schema<ILiveSession>(
    {
        courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
        instructorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        title: { type: String, required: true },
        description: String,
        agenda: String,
        type: {
            type: String,
            enum: [ 'lecture', 'tutorial', 'office_hours', 'group_discussion', 'webinar' ],
            required: true,
        },
        platform: {
            type: String,
            enum: [ 'zoom', 'google_meet', 'teams', 'custom' ],
            required: true,
        },
        meetingId: String,
        meetingUrl: { type: String, required: true },
        password: String,
        scheduledStart: { type: Date, required: true },
        scheduledEnd: { type: Date, required: true },
        actualStart: Date,
        actualEnd: Date,
        duration: Number,
        capacity: Number,
        registeredStudents: [
            {
                userId: { type: Schema.Types.ObjectId, ref: 'User' },
                registeredAt: { type: Date, default: Date.now },
                reminderSent: { type: Boolean, default: false },
            },
        ],
        attendance: [
            {
                userId: { type: Schema.Types.ObjectId, ref: 'User' },
                joinedAt: Date,
                leftAt: Date,
                duration: Number,
                status: { type: String, enum: [ 'attended', 'late', 'absent' ] },
            },
        ],
        recording: {
            available: { type: Boolean, default: false },
            url: String,
            duration: Number,
            uploadedAt: Date,
            transcript: String,
        },
        materials: [
            {
                title: String,
                type: { type: String, enum: [ 'slides', 'document', 'link' ] },
                url: String,
            },
        ],
        settings: {
            recordingEnabled: { type: Boolean, default: true },
            waitingRoomEnabled: { type: Boolean, default: true },
            chatEnabled: { type: Boolean, default: true },
            screenShareEnabled: { type: Boolean, default: true },
            breakoutRoomsEnabled: { type: Boolean, default: false },
            pollsEnabled: { type: Boolean, default: false },
        },
        status: {
            type: String,
            enum: [ 'scheduled', 'ongoing', 'completed', 'cancelled' ],
            default: 'scheduled',
        },
    },
    { timestamps: true }
);

liveSessionSchema.index({ courseId: 1, scheduledStart: 1 });

liveSessionSchema.plugin(tenantPlugin);

export const LiveSession = model<ILiveSession>('LiveSession', liveSessionSchema);
