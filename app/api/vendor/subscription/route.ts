import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// GET - Fetch vendor subscription
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

        const subscription = await db.vendorSubscription.findUnique({
            where: { userId: vendorId }
        });

        if (!subscription) {
            // Fetch user to get their signup date for the free plan
            const user = await db.user.findUnique({
                where: { id: vendorId },
                select: { createdAt: true }
            });

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
                }
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
            }
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

// POST - Update/Create vendor subscription
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

        const startDate = new Date();
        let endDate = null;

        if (planId !== 'free') {
            endDate = new Date();
            if (billingCycle === 'yearly') {
                endDate.setFullYear(endDate.getFullYear() + 1);
            } else {
                endDate.setMonth(endDate.getMonth() + 1);
            }
        }

        const subscription = await db.vendorSubscription.upsert({
            where: { userId: vendorId },
            update: {
                planId,
                startDate,
                endDate,
                status: 'active',
            },
            create: {
                userId: vendorId,
                planId,
                startDate,
                endDate,
                status: 'active',
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Subscription updated successfully',
            data: subscription
        });

    } catch (error) {
        console.error('Update subscription error:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to update subscription',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
