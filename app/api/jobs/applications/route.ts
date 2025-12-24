import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch applications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const employerId = searchParams.get('employerId');
    const applicantId = searchParams.get('applicantId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (jobId) {
      where.jobId = jobId;
    }

    if (employerId) {
      where.job = { employerId };
    }

    if (applicantId) {
      where.applicantId = applicantId;
    }

    if (status) {
      where.status = status;
    }

    // Fetch applications
    const [applications, total] = await Promise.all([
      db.jobApplication.findMany({
        where,
        include: {
          job: {
            select: {
              id: true,
              title: true,
              slug: true,
              companyName: true,
              companyLogo: true,
              city: true,
              jobType: true,
              status: true,
            },
          },
          applicant: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              phone: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.jobApplication.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      applications,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

// POST - Submit application
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      jobId,
      applicantId,
      applicantName,
      applicantEmail,
      applicantPhone,
      resume,
      coverLetter,
      portfolio,
      linkedIn,
      expectedSalary,
      noticePeriod,
      availableFrom,
      answers,
    } = body;

    if (!jobId || !applicantName || !applicantEmail) {
      return NextResponse.json(
        { success: false, message: 'Job ID, name, and email are required' },
        { status: 400 }
      );
    }

    // Check if job exists and is active
    const job = await db.job.findUnique({ where: { id: jobId } });
    if (!job) {
      return NextResponse.json(
        { success: false, message: 'Job not found' },
        { status: 404 }
      );
    }

    if (job.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, message: 'This job is no longer accepting applications' },
        { status: 400 }
      );
    }

    // Check if already applied (by email or user ID)
    const existingApplication = await db.jobApplication.findFirst({
      where: {
        jobId,
        OR: [
          { applicantEmail },
          ...(applicantId ? [{ applicantId }] : []),
        ],
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { success: false, message: 'You have already applied for this job' },
        { status: 400 }
      );
    }

    // Create application
    const application = await db.jobApplication.create({
      data: {
        jobId,
        applicantId,
        applicantName,
        applicantEmail,
        applicantPhone,
        resume,
        coverLetter,
        portfolio,
        linkedIn,
        expectedSalary,
        noticePeriod,
        availableFrom: availableFrom ? new Date(availableFrom) : null,
        answers: answers ? JSON.stringify(answers) : null,
        status: 'PENDING',
      },
      include: {
        job: {
          select: {
            title: true,
            companyName: true,
          },
        },
      },
    });

    // Create notification for employer
    await db.notification.create({
      data: {
        userId: job.employerId,
        title: 'New Job Application',
        message: `${applicantName} applied for ${job.title}`,
        type: 'SERVICE', // Using SERVICE as there's no JOB type in the enum
        link: `/company/applications?jobId=${jobId}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      application,
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit application' },
      { status: 500 }
    );
  }
}

// PATCH - Update application status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { applicationId, status, notes, rating, interviewDate, interviewType, interviewNotes } = body;

    if (!applicationId) {
      return NextResponse.json(
        { success: false, message: 'Application ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (rating !== undefined) updateData.rating = rating;
    if (interviewDate) updateData.interviewDate = new Date(interviewDate);
    if (interviewType) updateData.interviewType = interviewType;
    if (interviewNotes !== undefined) updateData.interviewNotes = interviewNotes;

    const application = await db.jobApplication.update({
      where: { id: applicationId },
      data: updateData,
      include: {
        job: {
          select: {
            title: true,
            companyName: true,
          },
        },
      },
    });

    // Notify applicant of status change
    if (status && application.applicantId) {
      const statusMessages: { [key: string]: string } = {
        REVIEWING: 'Your application is being reviewed',
        SHORTLISTED: 'Congratulations! You have been shortlisted',
        INTERVIEW: 'You have been invited for an interview',
        OFFERED: 'Congratulations! You have received a job offer',
        HIRED: 'Congratulations! You have been hired',
        REJECTED: 'Your application status has been updated',
      };

      await db.notification.create({
        data: {
          userId: application.applicantId,
          title: `Application Update - ${application.job.title}`,
          message: statusMessages[status] || 'Your application status has been updated',
          type: 'SERVICE',
          link: `/jobs/my-applications`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Application updated successfully',
      application,
    });
  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update application' },
      { status: 500 }
    );
  }
}
