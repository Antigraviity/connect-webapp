import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { searchParams } = new URL(request.url);
        const vendorId = searchParams.get('vendorId');

        // Await params if using Next.js 15 app router dynamic routes
        const { id } = await params;

        if (!vendorId) {
            return NextResponse.json({ success: false, message: 'Vendor ID required' }, { status: 400 });
        }

        const invoice = await db.vendorInvoice.findUnique({
            where: { id },
            include: {
                vendor: {
                    select: {
                        name: true,
                        email: true,
                        phone: true,
                        address: true,
                        city: true,
                        state: true,
                        zipCode: true,
                        country: true
                    }
                }
            }
        });

        if (!invoice || invoice.vendorId !== vendorId) {
            return NextResponse.json({ success: false, message: 'Invoice not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: invoice });
    } catch (error) {
        console.error('Fetch invoice error:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch invoice',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
