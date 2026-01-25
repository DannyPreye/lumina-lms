import { Request, Response } from 'express';
import DashboardService from './dashboard.service';

class DashboardController
{
    static async getStudentDashboard(req: Request, res: Response)
    {
        try {
            const data = await DashboardService.getStudentDashboard(req.user);
            res.json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Failed to fetch student dashboard', error });
        }
    }

    static async getAdminDashboard(req: Request, res: Response)
    {
        try {
            const data = await DashboardService.getAdminDashboard(req.user);
            res.json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Failed to fetch admin dashboard', error });
        }
    }

    static async getInstructorDashboard(req: Request, res: Response)
    {
        try {
            const data = await DashboardService.getInstructorDashboard(req.user);
            res.json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Failed to fetch instructor dashboard', error });
        }
    }
}

export default DashboardController;
