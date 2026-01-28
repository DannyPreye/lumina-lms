import { Request, Response, NextFunction } from 'express';
import { CourseService } from './course.service';
import { AuthRequest } from '../../common/middlewares/auth.middleware';

export class CourseController
{
    static async listInstructorCourses(req: import('../../common/middlewares/auth.middleware').AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const instructorId = req.user.id;
            const result = await CourseService.listInstructorCourses(instructorId, req.query);
            res.json({ success: true, ...result });
        } catch (error) {
            next(error);
        }
    }

    static async createCourse(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const course = await CourseService.createCourse(req.user!.id, req.body);
            res.status(201).json({ success: true, data: course });
        } catch (error) {
            next(error);
        }
    }

    static async getCourse(req: Request, res: Response, next: NextFunction)
    {
        try {
            const course = await CourseService.getCourseBySlug(req.params.slug as string);
            res.json({ success: true, data: course });
        } catch (error) {
            next(error);
        }
    }

    static async getStructure(req: Request, res: Response, next: NextFunction)
    {
        try {
            const structure = await CourseService.getCourseStructure(req.params.courseId as string);
            res.json({ success: true, data: structure });
        } catch (error) {
            next(error);
        }
    }

    static async addModule(req: Request, res: Response, next: NextFunction)
    {
        try {
            const module = await CourseService.addModule(req.params.courseId as string, req.body);
            res.status(201).json({ success: true, data: module });
        } catch (error) {
            next(error);
        }
    }

    static async addLesson(req: Request, res: Response, next: NextFunction)
    {
        try {
            const { courseId, moduleId } = req.params;
            const lesson = await CourseService.addLesson(courseId as string, moduleId as string, req.body);
            res.status(201).json({ success: true, data: lesson });
        } catch (error) {
            next(error);
        }
    }

    static async getCoursesByCategory(req: Request, res: Response, next: NextFunction)
    {
        try {
            const { categoryId } = req.params;
            const courses = await CourseService.getCoursesByCategory(categoryId as string);
            res.json({ success: true, data: courses });
        } catch (error) {
            next(error);
        }
    }

    static async getInstructorCourse(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const isAdmin = req.user.roles.includes('admin');
            const course = await CourseService.getInstructorCourseById(req.params.courseId as string, req.user.id, isAdmin);
            res.json({ success: true, data: course });
        } catch (error) {
            next(error);
        }
    }

    static async updateStatus(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const { status } = req.body;
            const isAdmin = req.user.roles.includes('admin');
            const course = await CourseService.updateCourseStatus(req.params.courseId as string, req.user.id, status, isAdmin);
            res.json({ success: true, data: course });
        } catch (error) {
            next(error);
        }
    }

    static async updateCourse(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const isAdmin = req.user.roles.includes('admin');
            const course = await CourseService.updateCourse(req.params.courseId as string, req.user.id, req.body, isAdmin);
            res.json({ success: true, data: course });
        } catch (error) {
            next(error);
        }
    }

    static async deleteCourse(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const isAdmin = req.user.roles.includes('admin');
            await CourseService.deleteCourse(req.params.courseId as string, req.user.id, isAdmin);
            res.json({ success: true, message: 'Course deleted successfully' });
        } catch (error) {
            next(error);
        }
    }

    static async updateModule(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const { courseId, moduleId } = req.params;
            const isAdmin = req.user.roles.includes('admin');
            const module = await CourseService.updateModule(courseId as string, moduleId as string, req.user.id, req.body, isAdmin);
            res.json({ success: true, data: module });
        } catch (error) {
            next(error);
        }
    }

    static async deleteModule(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const { courseId, moduleId } = req.params;
            const isAdmin = req.user.roles.includes('admin');
            await CourseService.deleteModule(courseId as string, moduleId as string, req.user.id, isAdmin);
            res.json({ success: true, message: 'Module deleted successfully' });
        } catch (error) {
            next(error);
        }
    }

    static async updateLesson(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const { courseId, moduleId, lessonId } = req.params;
            const isAdmin = req.user.roles.includes('admin');
            const lesson = await CourseService.updateLesson(courseId as string, moduleId as string, lessonId as string, req.user.id, req.body, isAdmin);
            res.json({ success: true, data: lesson });
        } catch (error) {
            next(error);
        }
    }

    static async deleteLesson(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const { courseId, moduleId, lessonId } = req.params;
            const isAdmin = req.user.roles.includes('admin');
            await CourseService.deleteLesson(courseId as string, moduleId as string, lessonId as string, req.user.id, isAdmin);
            res.json({ success: true, message: 'Lesson deleted successfully' });
        } catch (error) {
            next(error);
        }
    }

    static async list(req: Request, res: Response, next: NextFunction)
    {
        try {
            const result = await CourseService.listCourses(req.query);
            res.json({ success: true, ...result });
        } catch (error) {
            next(error);
        }
    }
}
