import { Request, Response, NextFunction } from 'express';
import { AssessmentService } from './assessment.service';
import { AuthRequest } from '../../common/middlewares/auth.middleware';

export class AssessmentController
{
    // Quizzes
    static async createQuiz(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const quiz = await AssessmentService.createQuiz(req.body);
            res.status(201).json({ success: true, data: quiz });
        } catch (error) {
            next(error);
        }
    }

    static async getQuizzes(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const { courseId, moduleId, lessonId } = req.query;
            const quizzes = await AssessmentService.getQuizzes({
                courseId: courseId as string,
                moduleId: moduleId as string,
                lessonId: lessonId as string,
            });
            res.json({ success: true, data: quizzes });
        } catch (error) {
            next(error);
        }
    }

    static async addQuestion(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const question = await AssessmentService.addQuestion(req.params.quizId as string, req.body);
            res.status(201).json({ success: true, data: question });
        } catch (error) {
            next(error);
        }
    }

    static async getQuiz(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const isInstructor = req.user.roles.some((r: string) => [ 'instructor', 'admin' ].includes(r));
            const data = await AssessmentService.getQuiz(req.params.quizId as string, isInstructor);
            res.json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }

    static async publish(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const quiz = await AssessmentService.publishQuiz(req.params.quizId as string);
            res.json({ success: true, data: quiz });
        } catch (error) {
            next(error);
        }
    }

    // Quiz Attempts
    static async startAttempt(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const { quizId, courseId } = req.body;
            const attempt = await AssessmentService.startQuizAttempt(req.user.id, quizId, courseId);
            res.status(201).json({ success: true, data: attempt });
        } catch (error) {
            next(error);
        }
    }

    static async submitAttempt(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const { answers } = req.body;
            const result = await AssessmentService.submitQuizAttempt(req.params.attemptId as string, answers);
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    // Assignments
    static async createAssignment(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const assignment = await AssessmentService.createAssignment(req.body);
            res.status(201).json({ success: true, data: assignment });
        } catch (error) {
            next(error);
        }
    }

    static async getAssignments(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const { courseId, moduleId, lessonId } = req.query;
            const assignments = await AssessmentService.getAssignments({
                courseId: courseId as string,
                moduleId: moduleId as string,
                lessonId: lessonId as string,
            });
            res.json({ success: true, data: assignments });
        } catch (error) {
            next(error);
        }
    }

    static async submitAssignment(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const submission = await AssessmentService.submitAssignment(
                req.user.id,
                req.params.assignmentId as string,
                req.body.content
            );
            res.status(201).json({ success: true, data: submission });
        } catch (error) {
            next(error);
        }
    }
}
