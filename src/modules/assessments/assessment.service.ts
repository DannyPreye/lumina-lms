import { Quiz, IQuiz } from './quiz.model';
import { Question, IQuestion } from './question.model';
import { QuizAttempt, IQuizAttempt } from './quiz-attempt.model';
import { Assignment, IAssignment } from './assignment.model';
import { Submission, ISubmission } from './submission.model';
import createError from 'http-errors';
import { GamificationService } from '../gamification/gamification.service';
import { NotificationService } from '../notifications/notification.service';
import { AnalyticsService } from '../analytics/analytics.service';

export class AssessmentService
{
    // Quizzes & Questions
    static async createQuiz(quizData: any)
    {
        return await Quiz.create(quizData);
    }

    static async addQuestion(quizId: string, questionData: any)
    {
        const quiz = await Quiz.findById(quizId);
        if (!quiz) throw createError(404, 'Quiz not found');

        const question = await Question.create({ ...questionData, quizId });

        // Update quiz metadata
        quiz.questionCount += 1;
        quiz.totalPoints += question.points;
        await quiz.save();

        return question;
    }

    static async getQuiz(quizId: string, includeAnswers: boolean = false)
    {
        const quiz = await Quiz.findById(quizId);
        if (!quiz) throw createError(404, 'Quiz not found');

        const questions = await Question.find({ quizId }).sort('order');

        // Strip answers if not authorized (e.g. student taking the quiz)
        if (!includeAnswers) {
            questions.forEach(q =>
            {
                if (q.options) {
                    q.options.forEach(opt =>
                    {
                        (opt as any).isCorrect = undefined;
                    });
                }
                (q as any).explanation = undefined;
                (q as any).sampleAnswer = undefined;
            });
        }

        return { quiz, questions };
    }

    static async getQuizzes(filters: { courseId?: string; moduleId?: string; lessonId?: string; })
    {
        const query: any = {};
        if (filters.courseId) query.courseId = filters.courseId;
        if (filters.moduleId) query.moduleId = filters.moduleId;
        if (filters.lessonId) query.lessonId = filters.lessonId;

        return await Quiz.find(query).sort('createdAt');
    }

    static async publishQuiz(quizId: string)
    {
        return await Quiz.findByIdAndUpdate(quizId, { status: 'published' }, { new: true });
    }

    // Quiz Attempts
    static async startQuizAttempt(userId: string, quizId: string, courseId: string)
    {
        const quiz = await Quiz.findById(quizId);
        if (!quiz || quiz.status !== 'published') throw createError(404, 'Quiz not found or not published');

        const lastAttempt = await QuizAttempt.findOne({ userId, quizId }).sort('-attemptNumber');
        const attemptNumber = lastAttempt ? lastAttempt.attemptNumber + 1 : 1;

        if (quiz.settings.maxAttempts && attemptNumber > quiz.settings.maxAttempts) {
            throw createError(400, 'Maximum attempts reached');
        }

        return await QuizAttempt.create({
            userId,
            quizId,
            courseId,
            attemptNumber,
            totalPoints: quiz.totalPoints,
            startedAt: new Date()
        });
    }

    static async submitQuizAttempt(attemptId: string, answers: any[])
    {
        const attempt = await QuizAttempt.findById(attemptId);
        if (!attempt || attempt.submittedAt) throw createError(404, 'Attempt not found or already submitted');

        const quiz = await Quiz.findById(attempt.quizId);
        if (!quiz) throw createError(404, 'Quiz not found');

        const questions = await Question.find({ quizId: quiz._id });

        let earnedPoints = 0;
        const gradedAnswers = questions.map(q =>
        {
            const studentAnswer = answers.find(a => a.questionId.toString() === q._id.toString());
            let isCorrect = false;
            let pointsAwarded = 0;

            if (q.type === 'multiple_choice' && studentAnswer) {
                const correctOption = q.options?.find(opt => opt.isCorrect);
                if (correctOption && correctOption._id!.toString() === studentAnswer.answer) {
                    isCorrect = true;
                    pointsAwarded = q.points;
                }
            }

            earnedPoints += pointsAwarded;
            return {
                questionId: q._id,
                answer: studentAnswer?.answer,
                isCorrect,
                pointsAwarded,
                aiGraded: false
            };
        });

        attempt.answers = gradedAnswers as any;
        attempt.earnedPoints = earnedPoints;
        attempt.score = (earnedPoints / attempt.totalPoints) * 100;
        attempt.passed = attempt.score >= quiz.settings.passingScore;
        attempt.submittedAt = new Date();
        attempt.timeSpent = Math.round((attempt.submittedAt.getTime() - attempt.startedAt.getTime()) / 1000);

        await attempt.save();

        // --- INTER-MODULE CONNECTION: Gamification ---
        if (attempt.passed) {
            await GamificationService.addPoints(attempt.userId.toString(), 100, 'quiz_pass', attempt._id.toString());
        }

        // --- INTER-MODULE CONNECTION: Notification ---
        await NotificationService.send({
            userId: attempt.userId,
            type: 'quiz_graded',
            title: `Quiz Result: ${quiz.title}`,
            message: `You scored ${attempt.score}% on the quiz. ${attempt.passed ? 'Congratulations, you passed!' : 'Review the material and try again.'}`,
            data: { courseId: attempt.courseId, quizId: attempt.quizId },
            actionUrl: `/courses/${attempt.courseId}/quizzes/${attempt.quizId}`
        });

        // --- INTER-MODULE CONNECTION: Analytics ---
        await AnalyticsService.trackActivity(attempt.userId.toString(), attempt.courseId.toString(), 'quizzesTaken', 1);

        return attempt;
    }

    // Assignments
    static async createAssignment(assignmentData: any)
    {
        return await Assignment.create(assignmentData);
    }

    static async getAssignments(filters: { courseId?: string; moduleId?: string; lessonId?: string; })
    {
        const query: any = {};
        if (filters.courseId) query.courseId = filters.courseId;
        if (filters.moduleId) query.moduleId = filters.moduleId;
        if (filters.lessonId) query.lessonId = filters.lessonId;

        return await Assignment.find(query).sort('createdAt');
    }

    static async submitAssignment(userId: string, assignmentId: string, content: any)
    {
        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) throw createError(404, 'Assignment not found');

        const lastSubmission = await Submission.findOne({ userId, assignmentId }).sort('-attemptNumber');
        const attemptNumber = lastSubmission ? lastSubmission.attemptNumber + 1 : 1;

        const isLate = new Date() > assignment.dueDate;
        if (isLate && !assignment.lateSubmission.allowed) {
            throw createError(400, 'Late submissions are not allowed');
        }

        const submission = await Submission.create({
            userId,
            assignmentId,
            courseId: assignment.courseId,
            attemptNumber,
            content,
            status: 'submitted',
            isLate,
            submittedAt: new Date()
        });

        // --- INTER-MODULE CONNECTION: Gamification ---
        // Award participation points
        await GamificationService.addPoints(userId, 200, 'assignment_submit', submission._id.toString());

        // --- INTER-MODULE CONNECTION: Analytics ---
        await AnalyticsService.trackActivity(userId, assignment.courseId.toString(), 'assignmentsSubmitted', 1);

        // --- INTER-MODULE CONNECTION: Notification ---
        // Notify the student
        await NotificationService.send({
            userId,
            type: 'assignment_due', // Reusing type for context
            title: `Assignment Submitted: ${assignment.title}`,
            message: `Your project has been received and is awaiting review.`,
            data: { courseId: assignment.courseId, assignmentId: assignment._id }
        });

        return submission;
    }
}
