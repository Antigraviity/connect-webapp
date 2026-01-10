import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch single job by ID or slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const skipViewIncrement = searchParams.get('skipView') === 'true';

    // Find by ID or slug
    const job = await db.job.findFirst({
      where: {
        OR: [
          { id },
          { slug: id },
        ],
      },
      include: {
        employer: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            verified: true,
            phone: true,
            city: true,
            state: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    if (!job) {
      return NextResponse.json(
        { success: false, message: 'Job not found' },
        { status: 404 }
      );
    }

    // Only increment views for public views (not employer dashboard)
    if (!skipViewIncrement) {
      await db.job.update({
        where: { id: job.id },
        data: { views: { increment: 1 } },
      });
    }

    return NextResponse.json({
      success: true,
      job,
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch job' },
      { status: 500 }
    );
  }
}

// PATCH - Update job
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Verify job exists
    const existingJob = await db.job.findUnique({ where: { id } });
    if (!existingJob) {
      return NextResponse.json(
        { success: false, message: 'Job not found' },
        { status: 404 }
      );
    }

    // Prepare update data - only include fields that should be updated
    const updateData: any = {};

    // Basic fields
    const allowedFields = [
      'title', 'description', 'requirements', 'responsibilities', 'benefits',
      'jobType', 'category', 'experienceLevel', 'minExperience', 'maxExperience', 'education',
      'salaryMin', 'salaryMax', 'salaryPeriod', 'showSalary',
      'location', 'city', 'state', 'country', 'zipCode', 'isRemote',
      'status', 'featured', 'urgent', 'companyName', 'companyLogo'
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Handle skills array
    if (body.skills !== undefined) {
      if (Array.isArray(body.skills)) {
        updateData.skills = JSON.stringify(body.skills);
      } else if (typeof body.skills === 'string') {
        updateData.skills = body.skills;
      }
    }

    // Handle deadline
    if (body.deadline !== undefined) {
      updateData.deadline = body.deadline ? new Date(body.deadline) : null;
    }

    // Set postedAt if status changed to ACTIVE
    if (body.status === 'ACTIVE' && existingJob.status !== 'ACTIVE') {
      updateData.postedAt = new Date();
    }

    const job = await db.job.update({
      where: { id },
      data: updateData,
      include: {
        employer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Job updated successfully',
      job,
    });
  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update job' },
      { status: 500 }
    );
  }
}

// DELETE - Delete job
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verify job exists
    const existingJob = await db.job.findUnique({ where: { id } });
    if (!existingJob) {
      return NextResponse.json(
        { success: false, message: 'Job not found' },
        { status: 404 }
      );
    }

    await db.job.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: 'Job deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting job:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete job' },
      { status: 500 }
    );
  }
}
