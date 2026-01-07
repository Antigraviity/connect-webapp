import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({
                success: false,
                message: 'User ID is required'
            }, { status: 400 });
        }

        // Delete user from DB (or mark as inactive)
        // For now, following the vendor implementation and deleting
        await db.user.delete({
            where: { id: userId }
        });

        return NextResponse.json({
            success: true,
            message: 'Account deactivated successfully'
        });

    } catch (error) {
        console.error('Deactivate account error:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to deactivate account',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
