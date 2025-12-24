import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch employer dashboard stats
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employerId = searchParams.get('employerId');

    if (!employerId) {
      return NextResponse.json(
        { success: false, message: 'Employer ID is required' },
        { status: 400 }
      );
    }

    // Get current date info for comparisons
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

    // Fetch all stats in parallel
    const [
      // Job counts
      totalJobs,
      activeJobs,
      lastWeekActiveJobs,
      draftJobs,
      closedJobs,
      
      // Application counts
      totalApplications,
      thisMonthApplications,
      lastMonthApplications,
      pendingApplications,
      reviewingApplications,
      shortlistedApplications,
      interviewApplications,
      offeredApplications,
      hiredApplications,
      rejectedApplications,
      
      // Views
      totalViews,
      
      // Interview count this week
      interviewsThisWeek,
      lastWeekInterviews,
      
      // Recent applications
      recentApplications,
      
      // Recent jobs
      recentJobs,
      
      // Applications by month (last 6 months)
      applicationsByMonth,
    ] = await Promise.all([
      // Job counts
      db.job.count({ where: { employerId } }),
      db.job.count({ where: { employerId, status: 'ACTIVE' } }),
      db.job.count({ 
        where: { 
          employerId, 
          status: 'ACTIVE',
          createdAt: { gte: startOfLastWeek, lt: startOfWeek }
        } 
      }),
      db.job.count({ where: { employerId, status: 'DRAFT' } }),
      db.job.count({ where: { employerId, status: 'CLOSED' } }),
      
      // Application counts
      db.jobApplication.count({ where: { job: { employerId } } }),
      db.jobApplication.count({ 
        where: { 
          job: { employerId },
          createdAt: { gte: startOfMonth }
        } 
      }),
      db.jobApplication.count({ 
        where: { 
          job: { employerId },
          createdAt: { gte: startOfLastMonth, lt: startOfMonth }
        } 
      }),
      db.jobApplication.count({ where: { job: { employerId }, status: 'PENDING' } }),
      db.jobApplication.count({ where: { job: { employerId }, status: 'REVIEWING' } }),
      db.jobApplication.count({ where: { job: { employerId }, status: 'SHORTLISTED' } }),
      db.jobApplication.count({ where: { job: { employerId }, status: 'INTERVIEW' } }),
      db.jobApplication.count({ where: { job: { employerId }, status: 'OFFERED' } }),
      db.jobApplication.count({ where: { job: { employerId }, status: 'HIRED' } }),
      db.jobApplication.count({ where: { job: { employerId }, status: 'REJECTED' } }),
      
      // Total views
      db.job.aggregate({
        where: { employerId },
        _sum: { views: true },
      }),
      
      // Interviews this week
      db.jobApplication.count({ 
        where: { 
          job: { employerId },
          status: 'INTERVIEW',
          interviewDate: { gte: startOfWeek }
        } 
      }),
      db.jobApplication.count({ 
        where: { 
          job: { employerId },
          status: 'INTERVIEW',
          interviewDate: { gte: startOfLastWeek, lt: startOfWeek }
        } 
      }),
      
      // Recent applications (last 10)
      db.jobApplication.findMany({
        where: { job: { employerId } },
        include: {
          job: {
            select: {
              id: true,
              title: true,
              companyName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      
      // Recent jobs
      db.job.findMany({
        where: { employerId },
        include: {
          _count: {
            select: { applications: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      
      // Applications by month (last 6 months) - manual aggregation
      Promise.all(
        Array.from({ length: 6 }, (_, i) => {
          const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
          return db.jobApplication.count({
            where: {
              job: { employerId },
              createdAt: { gte: monthStart, lte: monthEnd },
            },
          }).then(count => ({
            month: monthStart.toLocaleString('default', { month: 'short' }),
            year: monthStart.getFullYear(),
            count,
          }));
        })
      ),
    ]);

    // Calculate changes
    const activeJobsChange = activeJobs - lastWeekActiveJobs;
    const applicationsChange = lastMonthApplications > 0 
      ? Math.round(((thisMonthApplications - lastMonthApplications) / lastMonthApplications) * 100)
      : thisMonthApplications > 0 ? 100 : 0;
    const interviewsChange = interviewsThisWeek - lastWeekInterviews;

    return NextResponse.json({
      success: true,
      stats: {
        // Overview
        totalJobs,
        activeJobs,
        activeJobsChange,
        draftJobs,
        closedJobs,
        
        // Applications
        totalApplications,
        thisMonthApplications,
        applicationsChange,
        newApplications: pendingApplications,
        
        // Application status breakdown
        applicationsByStatus: {
          pending: pendingApplications,
          reviewing: reviewingApplications,
          shortlisted: shortlistedApplications,
          interview: interviewApplications,
          offered: offeredApplications,
          hired: hiredApplications,
          rejected: rejectedApplications,
        },
        
        // Views
        totalViews: totalViews._sum.views || 0,
        
        // Interviews
        interviewsScheduled: interviewsThisWeek,
        interviewsChange,
        
        // Trends (reverse to show oldest first)
        applicationsTrend: applicationsByMonth.reverse(),
        
        // Recent data
        recentApplications,
        recentJobs,
      },
    });
  } catch (error) {
    console.error('Error fetching employer stats:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch employer stats' },
      { status: 500 }
    );
  }
}
