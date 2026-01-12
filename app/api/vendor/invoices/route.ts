import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const vendorId = searchParams.get('vendorId');

        if (!vendorId) {
            return NextResponse.json({ success: false, message: 'Vendor ID required' }, { status: 400 });
        }

        const invoices = await db.vendorInvoice.findMany({
            where: { vendorId },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ success: true, data: invoices });
    } catch (error) {
        console.error('Fetch invoices error:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch invoices',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
