import axios from 'axios';
import createError from 'http-errors';
import { Transaction } from '../system-admin/system-core.model';
import { Course } from '../courses/course.model';
import { EnrollmentService } from '../enrollments/enrollment.service';
import { AnalyticsService } from '../analytics/analytics.service';
import crypto from 'crypto';
import { Converter } from 'easy-currencies';


import { getTenant } from '../../common/contexts/tenant.context';

// Cache exchange rate for 1 hour to avoid excessive API calls
let cachedRate: { rate: number; timestamp: number; } | null = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

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


        let amountInNGN: number = 0;

        switch (course.pricing.currency) {
            case 'USD':
                amountInNGN = await this.convertUSDToNGN(course.pricing.amount, 'USD');
                break;
            case 'GBP':
                amountInNGN = await this.convertUSDToNGN(course.pricing.amount, 'GBP');
                break;
            case 'EUR':
                amountInNGN = await this.convertUSDToNGN(course.pricing.amount, 'EUR');
                break;
            case 'NGN':
                amountInNGN = course.pricing.amount;
                break;
            default:
                amountInNGN = course.pricing.amount;
                break;
        }

        const amount = Math.round(amountInNGN * 100); // Paystack takes kobo (NGN)

        const { paystackSecretKey } = this.getPaymentConfig();
        const baseUrl = this.getTenantUrl();

        try {
            const response = await axios.post(
                'https://api.paystack.co/transaction/initialize',
                {
                    email,
                    amount,
                    callback_url: `${baseUrl}/payment/verify`,
                    metadata: {
                        userId,
                        courseId,
                        orderType: 'course_purchase'
                    }
                },
                {
                    headers: {
                        Authorization: `Bearer ${paystackSecretKey}`,
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
        const { paystackSecretKey } = this.getPaymentConfig();
        try {
            const response = await axios.get(
                `https://api.paystack.co/transaction/verify/${reference}`,
                {
                    headers: {
                        Authorization: `Bearer ${paystackSecretKey}`
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

                    // Track Revenue
                    await AnalyticsService.trackCourseMetric(
                        metadata.courseId,
                        'revenue',
                        'totalRevenue',
                        amount / 100
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
        const { paystackSecretKey } = this.getPaymentConfig();
        const hash = crypto
            .createHmac('sha512', paystackSecretKey)
            .update(JSON.stringify(payload))
            .digest('hex');

        if (hash !== signature) {
            throw createError(401, 'Invalid signature');
        }

        const event = payload.event;
        if (event === 'charge.success') {
            const { reference, metadata, amount } = payload.data;

            const transaction = await Transaction.findOne({ processorTransactionId: reference });
            if (transaction && transaction.status !== 'completed') {
                transaction.status = 'completed';
                await transaction.save();

                // Enroll user
                await EnrollmentService.enrollUser(
                    metadata.userId,
                    metadata.courseId,
                    'purchase'
                );

                // Track Revenue
                await AnalyticsService.trackCourseMetric(
                    metadata.courseId,
                    'revenue',
                    'totalRevenue',
                    amount / 100
                );
            }
        }
        return true;
    }

    static async convertUSDToNGN(
        amountInUSD: number,
        convertFromCurrency: 'USD' | 'NGN' | 'GBP' | 'EUR',
    ): Promise<number>
    {
        try {
            const rate = await this.getUSDtoNGNRate(convertFromCurrency);
            return amountInUSD * rate;
        } catch (error) {
            console.error('Error converting currency:', error);
            throw error;
        }
    }

    private static async getUSDtoNGNRate(
        convertFromCurrency: 'USD' | 'NGN' | 'GBP' | 'EUR',
    ): Promise<number>
    {
        try {
            // Check if we have a valid cached rate
            if (cachedRate && Date.now() - cachedRate.timestamp < CACHE_DURATION) {
                return cachedRate.rate;
            }

            const converter = new Converter();
            // Get the latest rate
            const rate = await converter.convert(1, convertFromCurrency, 'NGN');

            console.log('This is the rate', rate);

            // Cache the new rate
            cachedRate = {
                rate: rate,
                timestamp: Date.now(),
            };

            return rate;
        } catch (error) {
            console.error('Error getting exchange rate:', error);
            throw error;
        }
    }

    private static getPaymentConfig()
    {
        const tenant = getTenant();
        if (!tenant) throw createError(500, 'Tenant context not found for payment');

        const { paystackSecretKey } = tenant.config.payments || {}; // Safe navigation
        if (!paystackSecretKey) throw createError(400, 'Payment configuration missing for this tenant');

        return { paystackSecretKey };
    }

    private static getTenantUrl()
    {
        const tenant = getTenant();
        if (!tenant) return process.env.FRONTEND_URL;

        if (tenant.domain) return `https://${tenant.domain}`;
        // Fallback to subdomain logic if needed, or assume FRONTEND_URL is wildcard capable
        // For this implementation, we'll try to reconstruct from slug + base domain if FRONTEND_URL has it
        // Or mainly simpler: just use tenant.domain if custom, else assume current logic handles it or use a specific env

        // Simpler approach: If we are in tenant context, we trust the requester knew the URL.
        // But for callback_url, we need to tell Paystack where to send the user back.
        // Let's assume FRONTEND_URL is the base platform URL e.g. "lms.com"
        // and we want "school-a.lms.com"

        const mainUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        // If localhost, strict subdomain handling is tricky without /etc/hosts.
        // Let's return a safe bet or the configured domain.
        return tenant.domain ? `https://${tenant.domain}` : mainUrl; // TODO: Improve subdomain construction
    }
}
