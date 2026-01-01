import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    try {
        const { serviceId, userId } = await request.json();

        if (!serviceId) {
            return NextResponse.json(
                { success: false, message: 'Service ID is required' },
                { status: 400 }
            );
        }

        // Increment the view count in the database
        const updatedService = await prisma.service.update({
            where: { id: serviceId },
            data: {
                views: {
                    increment: 1,
                },
            },
            select: {
                id: true,
                views: true,
            },
        });

        // Optionally: Track individual views with user info for analytics
        // You can create a ServiceView table to track who viewed what and when
        // if (userId) {
        //   await prisma.serviceView.create({
        //     data: {
        //       serviceId,
        //       userId,
        //       viewedAt: new Date(),
        //     },
        //   });
        // }

        return NextResponse.json({
            success: true,
            views: updatedService.views,
            message: 'View count updated',
        });
    } catch (error) {
        console.error('Track view error:', error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to track view',
            },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
