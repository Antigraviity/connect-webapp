import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import Razorpay from 'razorpay';

// Plan configuration (should match frontend)
const PLANS: Record<string, number> = {
    'free': 0,
    'starter': 499,
    'professional': 999,
    'enterprise': 2499
};

// GET - Fetch vendor subscription & Razorpay config
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const vendorId = searchParams.get('vendorId');

        if (!vendorId) {
            return NextResponse.json({
                success: false,
                message: 'Vendor ID is required'
            }, { status: 400 });
        }

        const [subscription, siteSettings, user] = await Promise.all([
            db.vendorSubscription.findUnique({ where: { userId: vendorId } }),
            db.siteSetting.findFirst(),
            db.user.findUnique({ where: { id: vendorId }, select: { createdAt: true } })
        ]);

        const razorpayKey = siteSettings?.enableRazorpay ? siteSettings.razorpayKey : null;

        if (!subscription) {
            // Default to free plan if no record exists
            return NextResponse.json({
                success: true,
                data: {
                    plan: 'free',
                    status: 'active',
                    startDate: user?.createdAt.toISOString() || new Date().toISOString(),
                    endDate: null,
                    autoRenew: false,
                    daysRemaining: null
                },
                razorpayKey
            });
        }

        return NextResponse.json({
            success: true,
            data: {
                plan: subscription.planId,
                status: subscription.status,
                startDate: subscription.startDate.toISOString(),
                endDate: subscription.endDate ? subscription.endDate.toISOString() : null,
                autoRenew: subscription.autoRenew,
            },
            razorpayKey
        });

    } catch (error) {
        console.error('Fetch subscription error:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch subscription',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

// POST - Create Razorpay Order
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { vendorId, planId, billingCycle } = body;

        if (!vendorId || !planId) {
            return NextResponse.json({
                success: false,
                message: 'Vendor ID and Plan ID are required'
            }, { status: 400 });
        }

        if (planId === 'free') {
            // Handle free plan downgrade/upgrade immediately
            const subscription = await db.vendorSubscription.upsert({
                where: { userId: vendorId },
                update: {
                    planId,
                    startDate: new Date(),
                    endDate: null,
                    status: 'active',
                },
                create: {
                    userId: vendorId,
                    planId,
                    startDate: new Date(),
                    endDate: null,
                    status: 'active',
                }
            });
            return NextResponse.json({
                success: true,
                message: 'Switched to free plan',
                data: subscription
            });
        }

        // Get Razorpay credentials
        const siteSettings = await db.siteSetting.findFirst();
        if (!siteSettings?.enableRazorpay || !siteSettings.razorpayKey || !siteSettings.razorpaySecret) {
            return NextResponse.json({
                success: false,
                message: 'Razorpay is not enabled or configured'
            }, { status: 400 });
        }

        const razorpay = new Razorpay({
            key_id: siteSettings.razorpayKey,
            key_secret: siteSettings.razorpaySecret
        });

        // Calculate Amount
        let amount = PLANS[planId] || 0;
        if (billingCycle === 'yearly') {
            amount = amount * 10; // 2 months free
        }

        // Add 18% GST and convert to paisa
        const totalAmount = Math.round(amount * 1.18 * 100);

        const order = await razorpay.orders.create({
            amount: totalAmount,
            currency: 'INR',
            receipt: `sub_${vendorId.slice(-10)}_${Date.now().toString().slice(-10)}`, // Max 40 chars
            notes: {
                vendorId: vendorId.substring(0, 50), // Truncate notes just in case
                planId,
                billingCycle
            }
        });

        return NextResponse.json({
            success: true,
            orderId: order.id,
            amount: totalAmount,
            currency: 'INR',
            key: siteSettings.razorpayKey
        });

    } catch (error: any) {
        console.error('Create subscription order error details:', {
            message: error.message,
            stack: error.stack,
            response: error.error // Razorpay specific error structure
        });
        return NextResponse.json({
            success: false,
            message: 'Failed to create subscription order',
            error: error instanceof Error ? error.message : 'Unknown error',
            details: error.error // Include Razorpay error details in response for client-side debugging if safe (usually safe for dev)
        }, { status: 500 });
    }
}
