import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// Access shared OTP store
if (!global.emailOtpStore) {
    global.emailOtpStore = new Map();
}
const emailOtpStore = global.emailOtpStore as Map<string, { otp: string; timestamp: number; attempts?: number; expiresAt?: number }>;

export async function POST(request: NextRequest) {
    try {
        const { vendorId, email, otp } = await request.json();

        if (!vendorId || !email || !otp) {
            return NextResponse.json({
                success: false,
                message: 'Missing required fields'
            }, { status: 400 });
        }

        // 1. Verify OTP
        const storedData = emailOtpStore.get(email.toLowerCase());

        if (!storedData) {
            return NextResponse.json({
                success: false,
                message: 'OTP not found or expired. Please request a new OTP.'
            }, { status: 400 });
        }

        if (storedData.expiresAt && Date.now() > storedData.expiresAt) {
            emailOtpStore.delete(email.toLowerCase());
            return NextResponse.json({
                success: false,
                message: 'OTP has expired. Please request a new OTP.'
            }, { status: 400 });
        }

        if (storedData.otp !== otp) {
            return NextResponse.json({
                success: false,
                message: 'Invalid OTP. Please try again.'
            }, { status: 400 });
        }

        // 2. Check if email is already taken
        const existingUser = await db.user.findUnique({
            where: { email: email.toLowerCase() }
        });

        if (existingUser) {
            return NextResponse.json({
                success: false,
                message: 'Email is already in use by another account'
            }, { status: 409 });
        }

        // 3. Update User Email
        await db.user.update({
            where: { id: vendorId },
            data: {
                email: email.toLowerCase(),
                emailVerified: new Date() // auto-verify since they just proved ownership
            }
        });

        // 4. Clean up OTP
        emailOtpStore.delete(email.toLowerCase());

        return NextResponse.json({
            success: true,
            message: 'Email updated successfully'
        });

    } catch (error) {
        console.error('Update email error:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to update email',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
