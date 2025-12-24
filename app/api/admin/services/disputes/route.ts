import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get all disputes - using orders with CANCELLED/REFUNDED status
    const disputes = await db.order.findMany({
      where: {
        OR: [
          { status: 'CANCELLED' },
          { status: 'REFUNDED' },
        ],
        service: {
          type: 'SERVICE'
        }
      },
      include: {
        buyer: {
          select: {
            name: true,
            email: true,
          }
        },
        service: {
          select: {
            title: true,
            seller: {
              select: {
                name: true,
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    const disputesFormatted = disputes.map((dispute, index) => {
      // Determine dispute status and priority
      let disputeStatus = 'OPEN';
      let priority = 'MEDIUM';
      
      if (dispute.status === 'REFUNDED') {
        disputeStatus = 'RESOLVED';
        priority = 'LOW';
      } else if (dispute.status === 'CANCELLED') {
        disputeStatus = 'IN_PROGRESS';
        priority = 'HIGH';
      }

      return {
        id: `DSP-${String(index + 1).padStart(3, '0')}`,
        fullId: dispute.id,
        disputeId: `DSP-${String(index + 1).padStart(3, '0')}`,
        title: dispute.status === 'CANCELLED' 
          ? 'Service cancelled by customer'
          : 'Refund requested',
        description: `Order ${dispute.id.substring(0, 8)} - ${dispute.service?.title || 'Service'}`,
        serviceName: dispute.service?.title || 'Unknown Service',
        bookingId: `BK-${dispute.id.substring(0, 4).toUpperCase()}`,
        customerName: dispute.buyer?.name || 'Unknown Customer',
        customerEmail: dispute.buyer?.email || 'N/A',
        vendorName: dispute.service?.seller?.name || 'Unknown Vendor',
        disputedAmount: `₹${dispute.totalAmount?.toLocaleString('en-IN') || 0}`,
        disputedAmountValue: dispute.totalAmount || 0,
        status: disputeStatus,
        priority: priority,
        createdAt: new Date(dispute.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        createdAtISO: new Date(dispute.createdAt).toISOString(),
      };
    });

    // Calculate statistics
    const totalDisputes = disputesFormatted.length;
    const openDisputes = disputesFormatted.filter(d => d.status === 'OPEN').length;
    const inProgressDisputes = disputesFormatted.filter(d => d.status === 'IN_PROGRESS').length;
    const resolvedDisputes = disputesFormatted.filter(d => d.status === 'RESOLVED').length;

    const stats = {
      totalDisputes: totalDisputes,
      openDisputes: openDisputes,
      inProgressDisputes: inProgressDisputes,
      resolvedDisputes: resolvedDisputes,
    };

    return NextResponse.json({
      success: true,
      disputes: disputesFormatted,
      stats: stats
    });

  } catch (error) {
    console.error('Disputes fetch error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch disputes',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
