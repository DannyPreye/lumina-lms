import { LiveSession, ILiveSession } from './live-session.model';
import createError from 'http-errors';
import { Types } from 'mongoose';

export class LiveSessionService
{
    static async createSession(instructorId: string, sessionData: any)
    {
        return await LiveSession.create({ ...sessionData, instructorId });
    }

    static async getCourseSessions(courseId: string)
    {
        return await LiveSession.find({ courseId }).sort('scheduledStart');
    }

    static async getSessionById(sessionId: string)
    {
        const session = await LiveSession.findById(sessionId).populate('instructorId', 'profile');
        if (!session) throw createError(404, 'Live session not found');
        return session;
    }

    static async registerStudent(sessionId: string, userId: string)
    {
        const session = await LiveSession.findById(sessionId);
        if (!session) throw createError(404, 'Live session not found');

        if (session.capacity && session.registeredStudents.length >= session.capacity) {
            throw createError(400, 'Session is at full capacity');
        }

        const isAlreadyRegistered = session.registeredStudents.some(
            (s) => s.userId.toString() === userId
        );
        if (isAlreadyRegistered) throw createError(400, 'User is already registered');

        session.registeredStudents.push({
            userId: new Types.ObjectId(userId),
            registeredAt: new Date(),
            reminderSent: false,
        });

        return await session.save();
    }

    static async updateStatus(sessionId: string, status: string)
    {
        const update: any = { status };
        if (status === 'ongoing') update.actualStart = new Date();
        if (status === 'completed') update.actualEnd = new Date();

        return await LiveSession.findByIdAndUpdate(sessionId, { $set: update }, { new: true });
    }

    static async recordAttendance(sessionId: string, userId: string, attendanceData: any)
    {
        const session = await LiveSession.findById(sessionId);
        if (!session) throw createError(404, 'Live session not found');

        const attendanceIndex = session.attendance.findIndex(
            (a) => a.userId.toString() === userId
        );

        if (attendanceIndex > -1) {
            session.attendance[ attendanceIndex ] = { ...session.attendance[ attendanceIndex ], ...attendanceData };
        } else {
            session.attendance.push({
                userId: new Types.ObjectId(userId),
                ...attendanceData,
            });
        }

        return await session.save();
    }
}
