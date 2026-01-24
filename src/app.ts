import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import createError from 'http-errors';
import { mountSwagger } from './docs/swagger';
import passport from './config/passport.config';

import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/user.routes';
import courseRoutes from './modules/courses/course.routes';
import enrollmentRoutes from './modules/enrollments/enrollment.routes';
import assessmentRoutes from './modules/assessments/assessment.routes';
import discussionRoutes from './modules/discussions/discussion.routes';
import liveSessionRoutes from './modules/live-sessions/live-session.routes';
import gamificationRoutes from './modules/gamification/gamification.routes';
import certificateRoutes from './modules/certificates/certificate.routes';
import notificationRoutes from './modules/notifications/notification.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';
import aiRoutes from './modules/ai/ai.routes';
import paymentRoutes from './modules/payments/payment.routes';
import cartRoutes from './modules/cart/cart.routes';
import wishlistRoutes from './modules/wishlist/wishlist.routes';
import blogRoutes from './modules/blog/blog.routes';
import assetRoutes from './modules/assets/asset.routes';
import systemAdminRoutes from './modules/system-admin/system-admin.routes';

const app: Application = express();


// Passport Middleware
app.use(passport.initialize());


// Security Middlewares
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', limiter);

// Body Parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(compression());

// Routes
app.get('/', (req: Request, res: Response) =>
{
    res.json({ message: 'Lumina API is running' });
});

// Auth Routes
app.use('/api/v1/auth', authRoutes);

// User Routes
app.use('/api/v1/users', userRoutes);

// Swagger Documentation
mountSwagger(app);

// Course Routes
app.use('/api/v1/courses', courseRoutes);

// Enrollment Routes
app.use('/api/v1/enrollments', enrollmentRoutes);

// Assessment Routes
app.use('/api/v1/assessments', assessmentRoutes);

// Discussion Routes
app.use('/api/v1/discussions', discussionRoutes);

// Live Session Routes
app.use('/api/v1/live-sessions', liveSessionRoutes);

// Gamification Routes
app.use('/api/v1/gamification', gamificationRoutes);

// Certificate Routes
app.use('/api/v1/certificates', certificateRoutes);

// Notification Routes
app.use('/api/v1/notifications', notificationRoutes);

// Analytics Routes
app.use('/api/v1/analytics', analyticsRoutes);

// AI Routes
app.use('/api/v1/ai', aiRoutes);

// Payment Routes
app.use('/api/v1/payments', paymentRoutes);

// Cart Routes
app.use('/api/v1/cart', cartRoutes);

// Wishlist Routes
app.use('/api/v1/wishlist', wishlistRoutes);

// Blog Routes
app.use('/api/v1/blog', blogRoutes);

// Asset Routes
app.use('/api/v1/assets', assetRoutes);

// System & Admin Routes
app.use('/api/v1/system-admin', systemAdminRoutes);

// 404 handler
app.use((req: Request, res: Response, next: NextFunction) =>
{
    next(createError(404, 'Route not found'));
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) =>
{
    const statusCode = err.status || 500;
    res.status(statusCode).json({
        status: 'error',
        message: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

export default app;
