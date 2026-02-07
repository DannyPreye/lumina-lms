import { Router } from 'express';
import { AssessmentController } from './assessment.controller';
import { protect, authorize } from '../../common/middlewares/auth.middleware';

const router = Router();

// --- QUIZZES ---
// Student: View quiz (answers stripped)
router.get('/quizzes', protect, AssessmentController.getQuizzes as any);
router.get('/quizzes/:quizId', protect, AssessmentController.getQuiz as any);

// Instructor: Manage quizzes
router.post(
    '/quizzes',
    protect,
    authorize('instructor', 'admin'),
    AssessmentController.createQuiz as any
);

router.post(
    '/quizzes/:quizId/questions',
    protect,
    authorize('instructor', 'admin'),
    AssessmentController.addQuestion as any
);

router.patch(
    '/quizzes/:quizId/publish',
    protect,
    authorize('instructor', 'admin'),
    AssessmentController.publish as any
);

// --- QUIZ ATTEMPTS ---
router.post('/attempts/start', protect, AssessmentController.startAttempt as any);
router.post('/attempts/:attemptId/submit', protect, AssessmentController.submitAttempt as any);

// --- ASSIGNMENTS ---
// Instructor: Create assignments
router.post(
    '/assignments',
    protect,
    authorize('instructor', 'admin'),
    authorize('instructor', 'admin'),
    AssessmentController.createAssignment as any
);

// Student: List assignments
router.get('/assignments', protect, AssessmentController.getAssignments as any);

// Student: Submit assignment
router.post(
    '/assignments/:assignmentId/submit',
    protect,
    AssessmentController.submitAssignment as any
);

export default router;
