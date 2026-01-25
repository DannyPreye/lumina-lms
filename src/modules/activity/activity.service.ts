import { Activity } from './activity.model';

export class ActivityService
{
    static async log(type: string, user: string, meta: Record<string, any> = {})
    {
        return Activity.create({ type, user, meta });
    }

    static async getRecent(limit = 5)
    {
        return Activity.find({})
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('user', 'email profile');
    }
}
