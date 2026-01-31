import { Request, Response, NextFunction } from 'express';
import { PaymentService } from './payment.service';
import { AuthRequest } from '../../common/middlewares/auth.middleware';
import { User } from '../users/user.model';

export class PaymentController
{
    static async checkout(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const { courseId } = req.body;

            console.log("user email", req.user);
            const user = await User.findById(req.user.id);
            const result = await PaymentService.initializeCoursePurchase(
                req.user.id,
                user?.email as string,
                courseId
            );
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    static async verify(req: Request, res: Response, next: NextFunction)
    {
        try {
            const { reference } = req.query;
            const success = await PaymentService.verifyPayment(reference as string);
            res.json({ success, message: success ? 'Payment successful' : 'Payment failed' });
        } catch (error) {
            next(error);
        }
    }

    static async webhook(req: Request, res: Response, next: NextFunction)
    {
        try {
            const signature = req.headers[ 'x-paystack-signature' ] as string;
            await PaymentService.handleWebhook(req.body, signature);
            res.sendStatus(200);
        } catch (error) {
            // Webhook errors shouldn't necessarily trigger global error handler in a way that retries unwantedly
            console.error('Webhook Error:', error);
            res.sendStatus(400);
        }
    }
}
