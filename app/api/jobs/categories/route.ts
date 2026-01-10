import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
    try {
        const categories = await db.job.findMany({
            where: {
                status: 'ACTIVE',
                category: {
                    not: null, // Ensure we don't pick up null categories if any
                },
            },
            distinct: ['category'],
            select: {
                category: true,
            },
            orderBy: {
                category: 'asc',
            },
        });

        // Extract just the strings and filter out any empties just in case
        const categoryList = categories
            .map((c) => c.category)
            .filter((c): c is string => !!c && c.trim().length > 0);

        return NextResponse.json({
            success: true,
            categories: categoryList,
        });
    } catch (error) {
        console.error('Error fetching job categories:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch categories' },
            { status: 500 }
        );
    }
}
