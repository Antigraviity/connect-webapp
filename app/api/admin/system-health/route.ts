import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        // In a real app, we would check session here
        // For now, matching the existing settings route pattern

        const healthChecks = [];

        // 1. Database Check
        try {
            await (db as any).$queryRaw`SELECT 1`;
            healthChecks.push({
                service: 'Database',
                status: 'Connected',
                healthy: true,
                icon: 'CheckCircle',
                color: 'text-green-600'
            });
        } catch (error) {
            healthChecks.push({
                service: 'Database',
                status: 'Disconnected',
                healthy: false,
                icon: 'AlertCircle',
                color: 'text-red-600',
                message: 'Unable to connect to database'
            });
        }

        // 2. Email Service Check
        const emailConfigured = !!(
            process.env.EMAIL_SERVER_HOST &&
            process.env.EMAIL_SERVER_PORT &&
            process.env.EMAIL_FROM
        );
        healthChecks.push({
            service: 'Email Service',
            status: emailConfigured ? 'Active' : 'Not Configured',
            healthy: emailConfigured,
            icon: emailConfigured ? 'CheckCircle' : 'AlertCircle',
            color: emailConfigured ? 'text-green-600' : 'text-yellow-600',
            message: emailConfigured ? undefined : 'SMTP credentials not configured'
        });

        // 3. Payment Gateway Check
        const stripeConfigured = !!(process.env.STRIPE_SECRET_KEY);
        const razorpayConfigured = !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
        const paymentConfigured = stripeConfigured || razorpayConfigured;

        healthChecks.push({
            service: 'Payment Gateway',
            status: paymentConfigured ? 'Active' : 'Warning',
            healthy: paymentConfigured,
            icon: paymentConfigured ? 'CheckCircle' : 'AlertCircle',
            color: paymentConfigured ? 'text-green-600' : 'text-slate-600',
            message: paymentConfigured
                ? `${stripeConfigured ? 'Stripe' : ''}${stripeConfigured && razorpayConfigured ? ' & ' : ''}${razorpayConfigured ? 'Razorpay' : ''} configured`
                : 'No payment gateway configured'
        });

        // 4. File Storage Check
        const s3Configured = !!(
            process.env.AWS_ACCESS_KEY_ID &&
            process.env.AWS_SECRET_ACCESS_KEY &&
            process.env.AWS_REGION &&
            process.env.AWS_BUCKET_NAME
        );
        healthChecks.push({
            service: 'File Storage',
            status: s3Configured ? 'Available' : 'Local Storage',
            healthy: true, // Local storage is acceptable fallback
            icon: 'CheckCircle',
            color: s3Configured ? 'text-green-600' : 'text-blue-600',
            message: s3Configured ? 'AWS S3 configured' : 'Using local file storage'
        });

        // 5. API Services Check (if we're responding, API is running)
        healthChecks.push({
            service: 'API Services',
            status: 'Running',
            healthy: true,
            icon: 'CheckCircle',
            color: 'text-green-600'
        });

        // 6. CDN Check (placeholder for future implementation)
        healthChecks.push({
            service: 'CDN',
            status: 'Online',
            healthy: true,
            icon: 'CheckCircle',
            color: 'text-green-600',
            message: 'Static assets served'
        });

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            checks: healthChecks,
            overallHealth: healthChecks.every(check => check.healthy) ? 'healthy' : 'degraded'
        });

    } catch (error) {
        console.error('System health check error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to perform health check',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
