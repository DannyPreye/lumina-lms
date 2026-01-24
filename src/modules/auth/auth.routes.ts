import { Router } from 'express';
import { AuthController } from './auth.controller';
import passport from 'passport';

const router = Router();

// Standard Auth
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);
router.post('/refresh-token', AuthController.refreshAccessToken);
router.post('/verify-email', AuthController.verifyEmail);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

// Google OAuth
router.get(
    '/google',
    passport.authenticate('google', { scope: [ 'profile', 'email' ], session: false })
);

router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/login', session: false }),
    AuthController.googleCallback
);

export default router;
