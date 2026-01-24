import axios from 'axios';
import createError from 'http-errors';
import { Transaction } from '../system-admin/system-core.model';
import { Course } from '../courses/course.model';
import { EnrollmentService } from '../enrollments/enrollment.service';
import crypto from 'crypto';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';

export class PaymentService
{
    /**
     * Initialize a Paystack transaction for a course purchase
     */
    static async initializeCoursePurchase(userId: string, email: string, courseId: string)
    {
        const course = await Course.findById(courseId);
        if (!course) throw createError(404, 'Course not found');
        if (course.status !== 'published') throw createError(400, 'Course is not available');

        // Check if course is free
        if (course.pricing.type === 'free' || course.pricing.amount <= 0) {
            await EnrollmentService.enrollUser(userId, courseId, 'free');
            return { isFree: true };
        }

        const amount = course.pricing.amount * 100; // Paystack takes kobo (NGN) or cents

        try {
            const response = await axios.post(
                'https://api.paystack.co/transaction/initialize',
                {
                    email,
                    amount,
                    callback_url: `${process.env.FRONTEND_URL}/payment/verify`,
                    metadata: {
                        userId,
                        courseId,
                        orderType: 'course_purchase'
                    }
                },
                {
                    headers: {
                        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Create pending transaction in our DB
            await Transaction.create({
                userId,
                courseId,
                type: 'course_purchase',
                amount: course.pricing.amount,
                currency: course.pricing.currency || 'USD',
                paymentMethod: 'card',
                paymentProcessor: 'paystack',
                processorTransactionId: response.data.data.reference,
                status: 'pending'
            });

            return { isFree: false, ...response.data.data };
        } catch (error: any) {
            console.error('Paystack Initialization Error:', error.response?.data || error.message);
            throw createError(500, 'Failed to initialize payment');
        }
    }

    /**
     * Verify Paystack payment
     */
    static async verifyPayment(reference: string)
    {
        try {
            const response = await axios.get(
                `https://api.paystack.co/transaction/verify/${reference}`,
                {
                    headers: {
                        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
                    }
                }
            );

            const { status, metadata, amount } = response.data.data;

            if (status === 'success') {
                const transaction = await Transaction.findOne({ processorTransactionId: reference });
                if (transaction && transaction.status !== 'completed') {
                    transaction.status = 'completed';
                    await transaction.save();

                    // Enroll the user
                    await EnrollmentService.enrollUser(
                        metadata.userId,
                        metadata.courseId,
                        'paid'
                    );
                }
                return true;
            }
            return false;
        } catch (error: any) {
            console.error('Paystack Verification Error:', error.response?.data || error.message);
            return false;
        }
    }

    /**
     * Handle Paystack Webhook
     */
    static async handleWebhook(payload: any, signature: string)
    {
        const hash = crypto
            .createHmac('sha512', PAYSTACK_SECRET_KEY)
            .update(JSON.stringify(payload))
            .digest('hex');

        if (hash !== signature) {
            throw createError(401, 'Invalid signature');
        }

        const event = payload.event;
        if (event === 'charge.success') {
            const { reference, metadata } = payload.data;

            const transaction = await Transaction.findOne({ processorTransactionId: reference });
            if (transaction && transaction.status !== 'completed') {
                transaction.status = 'completed';
                await transaction.save();

                // Enroll user
                await EnrollmentService.enrollUser(
                    metadata.userId,
                    metadata.courseId,
                    'paid'
                );
            }
        }
        return true;
    }
}
