import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const jobId = searchParams.get('jobId');
        const status = searchParams.get('status');
        const company = searchParams.get('company');

        // Build where clause
        const where: any = {};
        if (jobId) where.jobId = jobId;
        if (status && status !== 'All Status') where.status = status.toUpperCase().replace(/\s+/g, '_');
        if (company && company !== 'All Companies') {
            where.job = { companyName: company };
        }

        // Fetch stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
            totalApplications,
            todayApplications,
            interviewsScheduled,
            hiredCount,
            statusCounts,
            applications
        ] = await Promise.all([
            db.jobApplication.count(),
            db.jobApplication.count({
                where: { createdAt: { gte: today } }
            }),
            db.jobApplication.count({
                where: { status: 'INTERVIEW' }
            }),
            db.jobApplication.count({
                where: { status: 'HIRED' }
            }),
            db.jobApplication.groupBy({
                by: ['status'],
                _count: { id: true }
            }),
            db.jobApplication.findMany({
                where,
                include: {
                    job: {
                        select: {
                            title: true,
                            companyName: true,
                            location: true,
                            city: true,
                            state: true
                        }
                    },
                    applicant: {
                        select: {
                            name: true,
                            email: true,
                            image: true,
                            jobSeekerProfile: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            })
        ]);

        // Format stats
        const stats = {
            totalApplications,
            todayApplications,
            interviewsScheduled,
            successRate: totalApplications > 0
                ? `${((hiredCount / totalApplications) * 100).toFixed(1)}%`
                : '0%'
        };

        // Format status breakdown
        const breakdown: any = {
            applied: 0,
            underReview: 0,
            interviewScheduled: 0,
            selected: 0,
            rejected: 0,
            withdrawn: 0
        };

        statusCounts.forEach(item => {
            const s = item.status;
            if (s === 'PENDING') breakdown.applied = item._count.id;
            if (s === 'REVIEWING') breakdown.underReview = item._count.id;
            if (s === 'INTERVIEW') breakdown.interviewScheduled = item._count.id;
            if (s === 'OFFERED' || s === 'HIRED' || s === 'SHORTLISTED') breakdown.selected += item._count.id;
            if (s === 'REJECTED') breakdown.rejected = item._count.id;
            if (s === 'WITHDRAWN') breakdown.withdrawn = item._count.id;
        });

        // Format applications for frontend
        const formattedApplications = applications.map(app => ({
            id: app.id,
            applicationRef: `JA${app.id.substring(0, 6).toUpperCase()}`,
            jobTitle: app.job.title,
            company: app.job.companyName || 'Unknown',
            applicantName: app.applicantName || app.applicant?.name || 'Unknown',
            applicantEmail: app.applicantEmail || app.applicant?.email || 'N/A',
            applicantPhone: app.applicantPhone || 'N/A',
            experience: app.applicant?.jobSeekerProfile?.experience || 'N/A',
            education: app.applicant?.jobSeekerProfile?.education || 'N/A',
            expectedSalary: app.expectedSalary ? `₹${app.expectedSalary.toLocaleString()}` : 'N/A',
            currentSalary: 'N/A', // Not stored in schema apparently, or use a default
            location: app.job.city ? `${app.job.city}, ${app.job.state || ''}` : app.job.location || 'Remote',
            appliedDate: app.createdAt.toISOString().split('T')[0],
            status: mapStatusToUI(app.status),
            interviewDate: app.interviewDate ? app.interviewDate.toISOString().split('T')[0] : null,
            resumeUrl: app.resume,
            skills: app.applicant?.jobSeekerProfile?.skills ? JSON.parse(app.applicant.jobSeekerProfile.skills as string) : [],
            coverLetter: app.coverLetter
        }));

        return NextResponse.json({
            success: true,
            stats,
            statusBreakdown: breakdown,
            applications: formattedApplications
        });
    } catch (error) {
        console.error('Error in admin applications API:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}

function mapStatusToUI(status: string) {
    switch (status) {
        case 'PENDING': return 'Applied';
        case 'REVIEWING': return 'Under Review';
        case 'INTERVIEW': return 'Interview Scheduled';
        case 'SHORTLISTED':
        case 'OFFERED':
        case 'HIRED': return 'Selected';
        case 'REJECTED': return 'Rejected';
        case 'WITHDRAWN': return 'Withdrawn';
        default: return status;
    }
}
