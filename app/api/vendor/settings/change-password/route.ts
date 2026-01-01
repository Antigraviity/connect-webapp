import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { vendorId, currentPassword, newPassword } = body;

        if (!vendorId || !currentPassword || !newPassword) {
            return NextResponse.json({
                success: false,
                message: 'All fields are required'
            }, { status: 400 });
        }

        // Find user
        const user = await db.user.findUnique({
            where: { id: vendorId }
        });

        if (!user || !user.password) {
            return NextResponse.json({
                success: false,
                message: 'User not found'
            }, { status: 404 });
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            return NextResponse.json({
                success: false,
                message: 'Invalid current password'
            }, { status: 401 });
        }

        // Hash new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Update password in DB
        await db.user.update({
            where: { id: vendorId },
            data: { password: hashedNewPassword }
        });

        return NextResponse.json({
            success: true,
            message: 'Password updated successfully'
        });

    } catch (error) {
        console.error('Change password error:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to update password',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
