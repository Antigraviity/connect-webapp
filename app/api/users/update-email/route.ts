import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';

// Access shared OTP store
if (!global.emailOtpStore) {
    global.emailOtpStore = new Map();
}
const emailOtpStore = global.emailOtpStore as Map<string, { otp: string; timestamp: number; attempts?: number; expiresAt?: number }>;

export async function POST(request: NextRequest) {
    try {
        const { userId, email, otp } = await request.json();

        if (!userId || !email || !otp) {
            return NextResponse.json({
                success: false,
                message: 'Missing required fields'
            }, { status: 400 });
        }

        // 1. Verify User exists
        const user = await db.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return NextResponse.json({
                success: false,
                message: 'User not found'
            }, { status: 404 });
        }

        // 2. Verify OTP
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
            // Optional: Increment attempts and lockout if too many
            return NextResponse.json({
                success: false,
                message: 'Invalid OTP. Please try again.'
            }, { status: 400 });
        }

        // 3. Check if email is already taken
        const existingUser = await db.user.findUnique({
            where: { email: email.toLowerCase() }
        });

        if (existingUser && existingUser.id !== userId) {
            return NextResponse.json({
                success: false,
                message: 'Email is already in use by another account'
            }, { status: 409 });
        }

        // 4. Update User Email
        await db.user.update({
            where: { id: userId },
            data: {
                email: email.toLowerCase(),
                emailVerified: new Date() // auto-verify since they just proved ownership
            }
        });

        // 5. Clean up OTP
        emailOtpStore.delete(email.toLowerCase());

        return NextResponse.json({
            success: true,
            message: 'Email updated successfully. Please use your new email to sign in next time.'
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
