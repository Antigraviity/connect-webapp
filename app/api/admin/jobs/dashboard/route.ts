import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get counts for main stats
    const [
      activeJobs,
      totalCompanies,
      totalApplications,
      upcomingInterviews
    ] = await Promise.all([
      db.job.count({ where: { status: 'ACTIVE' } }),
      db.user.count({ where: { userType: 'EMPLOYER' } }),
      db.jobApplication.count(),
      db.jobApplication.count({
        where: {
          status: 'INTERVIEW',
          interviewDate: {
            gte: new Date()
          }
        }
      })
    ]);

    // Get application status breakdown
    const [hired, shortlisted, interviewsCount, pending, expiring, newSeekers] = await Promise.all([
      db.jobApplication.count({ where: { status: 'HIRED' } }),
      db.jobApplication.count({ where: { status: 'SHORTLISTED' } }),
      db.jobApplication.count({ where: { status: 'INTERVIEW' } }),
      db.jobApplication.count({ where: { status: 'PENDING' } }),
      db.job.count({ 
        where: { 
          status: 'ACTIVE',
          deadline: {
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
          }
        } 
      }),
      db.jobSeekerProfile.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      })
    ]);

    // Get job categories with counts
    const jobsWithCategories = await db.job.groupBy({
      by: ['jobType'],
      _count: { id: true },
      where: { status: 'ACTIVE' }
    });

    const categoryData = jobsWithCategories.map(item => ({
      name: item.jobType,
      value: item._count.id
    }));

    // Get recent applications
    const recentApplications = await db.jobApplication.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        job: {
          select: {
            title: true,
            companyName: true
          }
        },
        applicant: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    // Get top companies (employers with most active jobs)
    const topCompaniesRaw = await db.user.findMany({
      where: { userType: 'EMPLOYER' },
      include: {
        jobs: {
          where: { status: 'ACTIVE' },
          include: {
            applications: true
          }
        }
      },
      take: 10
    });

    const topCompanies = topCompaniesRaw
      .map(employer => ({
        name: employer.name || employer.email,
        industry: 'Technology',
        activeJobs: employer.jobs.length,
        applications: employer.jobs.reduce((sum, job) => sum + job.applications.length, 0),
        hires: employer.jobs.reduce((sum, job) => 
          sum + job.applications.filter(app => app.status === 'HIRED').length, 0
        ),
        rating: 4.5
      }))
      .filter(c => c.activeJobs > 0)
      .sort((a, b) => b.applications - a.applications)
      .slice(0, 4);

    // Get pending job approvals
    const pendingJobs = await db.job.findMany({
      where: { status: 'DRAFT' },
      take: 3,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        companyName: true,
        salaryMin: true,
        salaryMax: true,
        city: true,
        createdAt: true
      }
    });

    // Get upcoming interviews
    const interviews = await db.jobApplication.findMany({
      where: {
        status: 'INTERVIEW',
        interviewDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      },
      take: 3,
      orderBy: { interviewDate: 'asc' },
      include: {
        applicant: {
          select: {
            name: true,
            email: true
          }
        },
        job: {
          select: {
            title: true,
            companyName: true
          }
        }
      }
    });

    // Format data for response
    const stats = {
      activeJobs,
      totalCompanies,
      applications: totalApplications,
      interviews: upcomingInterviews
    };

    const breakdown = {
      hired,
      shortlisted,
      interviews: interviewsCount,
      pending,
      expiring,
      newSeekers
    };

    const formattedRecentApplications = recentApplications.map(app => ({
      id: app.id.substring(0, 8).toUpperCase(),
      candidate: app.applicantName || app.applicant?.name || app.applicant?.email || 'Unknown',
      job: app.job.title,
      company: app.job.companyName || 'Unknown Company',
      matchScore: 85,
      status: app.status,
      time: getTimeAgo(app.createdAt)
    }));

    const formattedPendingJobs = pendingJobs.map(job => ({
      id: job.id.substring(0, 8).toUpperCase(),
      title: job.title,
      company: job.companyName || 'Unknown',
      salary: job.salaryMin && job.salaryMax 
        ? `₹${(job.salaryMin / 100000).toFixed(0)}-${(job.salaryMax / 100000).toFixed(0)} LPA`
        : 'Not specified',
      location: job.city || 'Remote',
      submitted: getTimeAgo(job.createdAt)
    }));

    const formattedInterviews = interviews.map(interview => ({
      candidate: interview.applicantName || interview.applicant?.name || 'Unknown',
      job: interview.job.title,
      company: interview.job.companyName || 'Unknown',
      time: interview.interviewDate 
        ? formatInterviewTime(interview.interviewDate)
        : 'TBD',
      type: interview.interviewType || 'Interview'
    }));

    return NextResponse.json({
      success: true,
      stats,
      breakdown,
      categoryData,
      recentApplications: formattedRecentApplications,
      topCompanies,
      pendingJobs: formattedPendingJobs,
      upcomingInterviews: formattedInterviews
    });

  } catch (error) {
    console.error('Jobs dashboard error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch jobs dashboard data',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  
  if (seconds < 60) return `${seconds} seconds ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

function formatInterviewTime(date: Date): string {
  const now = new Date();
  const interviewDate = new Date(date);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const interviewDay = new Date(interviewDate.getFullYear(), interviewDate.getMonth(), interviewDate.getDate());

  const time = interviewDate.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit', 
    hour12: true 
  });

  if (interviewDay.getTime() === today.getTime()) {
    return `Today, ${time}`;
  } else if (interviewDay.getTime() === tomorrow.getTime()) {
    return `Tomorrow, ${time}`;
  } else {
    return interviewDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: '2-digit' 
    });
  }
}
