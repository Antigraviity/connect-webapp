import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { startOfMonth, subMonths, format, isSameMonth } from "date-fns";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const employerId = searchParams.get("employerId");

        if (!employerId) {
            return NextResponse.json(
                { success: false, message: "Employer ID is required" },
                { status: 400 }
            );
        }

        // Fetch all jobs and their applications for this employer
        // Optimize: We select only necessary fields
        const jobs = await db.job.findMany({
            where: { employerId },
            include: {
                applications: {
                    select: {
                        id: true,
                        status: true,
                        createdAt: true,
                        updatedAt: true,
                        job: {
                            select: {
                                title: true, // Used for 'Department' breakdown
                                jobType: true
                            }
                        }
                    }
                }
            }
        });

        // Flatten applications
        const applications = jobs.flatMap(job => job.applications);

        // --- 1. Key Metrics ---

        // Status Groups
        const hiredApps = applications.filter(a => a.status === "HIRED");
        const offeredApps = applications.filter(a => a.status === "OFFERED");
        const totalApps = applications.length;

        // Conversion Rate: Hired / Total
        const conversionRate = totalApps > 0
            ? ((hiredApps.length / totalApps) * 100)
            : 0;

        // Avg Time to Hire (in Days)
        // Considering only HIRED applicants
        let totalTimeMs = 0;
        hiredApps.forEach(app => {
            const start = new Date(app.createdAt).getTime();
            const end = new Date(app.updatedAt).getTime();
            totalTimeMs += (end - start);
        });
        const avgTimeMs = hiredApps.length > 0 ? totalTimeMs / hiredApps.length : 0;
        const avgTimeDays = Math.round(avgTimeMs / (1000 * 60 * 60 * 24));

        // Offer Acceptance Rate
        // Proxy: HIRED / (OFFERED + HIRED) - assuming simplified flow
        const totalOffers = offeredApps.length + hiredApps.length;
        const offerAcceptanceRate = totalOffers > 0
            ? ((hiredApps.length / totalOffers) * 100)
            : 0;

        // Cost per Hire (Mocked as we don't have cost data)
        const costPerHire = "₹12K"; // Static for now, or could vary slightly

        // Create metrics object
        // Note: Variance (+1.2% etc) is hard to calc without historical snapshots. 
        // We will return 0 or mock variance for now.
        const metrics = {
            conversionRate: conversionRate.toFixed(1),
            avgTimeHire: avgTimeDays,
            offerAcceptance: offerAcceptanceRate.toFixed(0),
            costPerHire,
        };


        // --- 2. Application Flow (Last 6 Months) ---
        const last6Months = Array.from({ length: 6 }, (_, i) => {
            const date = subMonths(new Date(), 5 - i);
            return {
                month: format(date, "MMM"), // "Jan", "Feb"
                dateObj: date,
                received: 0,
                shortlisted: 0,
                interviewed: 0,
                hired: 0
            };
        });

        applications.forEach(app => {
            const appDate = new Date(app.createdAt);

            // Find matching month bin
            const monthBin = last6Months.find(m => isSameMonth(m.dateObj, appDate));

            if (monthBin) {
                monthBin.received++;

                // Count statuses based on current status (approximation)
                // If status is INTERVIEW, it implies they were Shortlisted too in a funnel model,
                // but typically analytics tracks "entered stage X in month Y".
                // Without event sourcing, we approximate by "Status reached for app created in Month X"
                // OR "Current Status of app created in Month X".

                const s = app.status;
                if (["SHORTLISTED", "INTERVIEW", "OFFERED", "HIRED"].includes(s)) monthBin.shortlisted++;
                if (["INTERVIEW", "OFFERED", "HIRED"].includes(s)) monthBin.interviewed++;
                if (s === "HIRED") monthBin.hired++;
            }
        });

        const flowData = last6Months.map(({ month, received, shortlisted, interviewed, hired }) => ({
            month, received, shortlisted, interviewed, hired
        }));


        // --- 3. Hiring Funnel ---
        const funnelCounts = {
            applied: totalApps,
            shortlisted: applications.filter(a => ["SHORTLISTED", "INTERVIEW", "OFFERED", "HIRED"].includes(a.status)).length,
            interview: applications.filter(a => ["INTERVIEW", "OFFERED", "HIRED"].includes(a.status)).length,
            hired: hiredApps.length
        };

        const conversionFunnel = [
            { stage: "Applied", rate: 100, count: funnelCounts.applied },
            {
                stage: "Shortlisted",
                rate: funnelCounts.applied ? Math.round((funnelCounts.shortlisted / funnelCounts.applied) * 100) : 0,
                count: funnelCounts.shortlisted
            },
            {
                stage: "Interview",
                rate: funnelCounts.applied ? Math.round((funnelCounts.interview / funnelCounts.applied) * 100) : 0,
                count: funnelCounts.interview
            },
            {
                stage: "Hired",
                rate: funnelCounts.applied ? Math.round((funnelCounts.hired / funnelCounts.applied) * 100) : 0,
                count: funnelCounts.hired
            },
        ];

        // --- 4. Time to Hire by Department ---
        // We use Job Title or Job Type as Department proxy
        const deptStats: Record<string, { totalTime: number, count: number }> = {};

        hiredApps.forEach(app => {
            // Simple grouping by first word of title or Job Type
            // Let's use Job Type if valid, otherwise Title
            const dept = app.job?.jobType
                ? app.job.jobType.replace("_", " ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) // "FULL_TIME" -> "Full Time"
                : "General";

            if (!deptStats[dept]) deptStats[dept] = { totalTime: 0, count: 0 };

            const start = new Date(app.createdAt).getTime();
            const end = new Date(app.updatedAt).getTime();
            deptStats[dept].totalTime += (end - start);
            deptStats[dept].count++;
        });

        const timeToHireByDept = Object.entries(deptStats).map(([dept, stats]) => ({
            department: dept,
            days: Math.round((stats.totalTime / stats.count) / (1000 * 60 * 60 * 24))
        })).sort((a, b) => b.days - a.days); // Sort descending

        // --- Sources (Mocked) ---
        // If we had source info we would aggregate it here.
        // Defaulting to "Direct Apply"
        const parsedSources = [
            { source: "Direct Apply", applications: totalApps, hired: hiredApps.length }
        ];

        return NextResponse.json({
            success: true,
            data: {
                metrics,
                applicationFlow: flowData,
                conversionFunnel,
                timeToHire: timeToHireByDept.length ? timeToHireByDept : [{ department: "General", days: avgTimeDays }],
                sources: parsedSources
            }
        });

    } catch (error) {
        console.error("Error fetching analytics:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch analytics" },
            { status: 500 }
        );
    }
}
