import { Router } from 'express';
import { PaymentController } from './payment.controller';
import { protect } from '../../common/middlewares/auth.middleware';

const router = Router();

// Student routes
router.post('/checkout', protect, PaymentController.checkout as any);
router.get('/verify', protect, PaymentController.verify as any);

// Webhook - Public (called by Paystack)
router.post('/webhook', PaymentController.webhook as any);

export default router;
