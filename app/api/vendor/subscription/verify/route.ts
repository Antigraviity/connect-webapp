import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            vendorId,
            planId,
            billingCycle
        } = body;

        const siteSettings = await db.siteSetting.findFirst();
        if (!siteSettings?.razorpaySecret) {
            return NextResponse.json({
                success: false,
                message: 'Razorpay secret not configured'
            }, { status: 500 });
        }

        // Verify Signature
        const generatedSignature = crypto
            .createHmac('sha256', siteSettings.razorpaySecret)
            .update(razorpay_order_id + '|' + razorpay_payment_id)
            .digest('hex');

        if (generatedSignature !== razorpay_signature) {
            return NextResponse.json({
                success: false,
                message: 'Invalid signature'
            }, { status: 400 });
        }

        // Calculate subscription dates
        const startDate = new Date();
        let endDate = new Date();

        if (billingCycle === 'yearly') {
            endDate.setFullYear(endDate.getFullYear() + 1);
        } else {
            endDate.setMonth(endDate.getMonth() + 1);
        }

        // Update Subscription
        const subscription = await db.vendorSubscription.upsert({
            where: { userId: vendorId },
            update: {
                planId,
                startDate,
                endDate,
                status: 'active',
                autoRenew: false // Razorpay standard checkout is one-time usually unless using subscriptions API
            },
            create: {
                userId: vendorId,
                planId,
                startDate,
                endDate,
                status: 'active',
                autoRenew: false
            }
        });

        // Create Transaction Record (Optional but good for audit)
        // You might want to add a Payment/Transaction model if not exists, 
        // relying on Order model might be for products. 
        // For now, we just update subscription as requested.

        // Create Invoice
        // Calculate amount again for security (or trust razorpay amount if verified)
        // Ideally we should refetch plan price, but for now we use similar logic to creation

        let amount = 0;
        // Simple plan price map - ideally fetch from config/constants
        const PLANS: Record<string, number> = {
            'starter': 499,
            'professional': 999,
            'enterprise': 2499
        };

        if (PLANS[planId]) {
            amount = PLANS[planId];
            if (billingCycle === 'yearly') {
                amount = amount * 10;
            }
        }

        const taxAmount = amount * 0.18;
        const totalAmount = amount + taxAmount;

        const invoice = await db.vendorInvoice.create({
            data: {
                invoiceNumber: `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
                vendorId,
                amount,
                taxAmount,
                totalAmount,
                planId,
                billingCycle,
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
                status: 'PAID'
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Payment verified and subscription updated',
            data: subscription,
            invoiceId: invoice.id
        });

    } catch (error) {
        console.error('Payment verification error:', error);
        return NextResponse.json({
            success: false,
            message: 'Payment verification failed',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
