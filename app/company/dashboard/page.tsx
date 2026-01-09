"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import {
  FiTrendingUp,
  FiBriefcase,
  FiUsers,
  FiEye,
  FiArrowUp,
  FiArrowDown,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiCalendar,
  FiMapPin,
  FiDollarSign,
  FiStar,
  FiMessageSquare,
  FiFilter,
  FiMoreVertical,
  FiEdit2,
  FiTrash2,
  FiPause,
  FiPlay,
  FiAlertCircle,
  FiBell,
  FiRefreshCw,
} from "react-icons/fi";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

interface DashboardStats {
  totalJobs: number;
  activeJobs: number;
  activeJobsChange: number;
  draftJobs: number;
  closedJobs: number;
  totalApplications: number;
  thisMonthApplications: number;
  applicationsChange: number;
  newApplications: number;
  applicationsByStatus: {
    pending: number;
    reviewing: number;
    shortlisted: number;
    interview: number;
    offered: number;
    hired: number;
    rejected: number;
  };
  totalViews: number;
  interviewsScheduled: number;
  interviewsChange: number;
  applicationsTrend: { month: string; year: number; count: number }[];
  recentApplications: any[];
  recentJobs: any[];
}

// Helper Functions
const getStatusColor = (status: string) => {
  switch (status) {
    case "PENDING":
      return "bg-amber-50 text-amber-700";
    case "REVIEWING":
      return "bg-company-50 text-company-700";
    case "SHORTLISTED":
      return "bg-company-100 text-company-800";
    case "INTERVIEW":
      return "bg-admin-50 text-admin-700";
    case "OFFERED":
      return "bg-company-600 text-white";
    case "HIRED":
      return "bg-admin-600 text-white";
    case "REJECTED":
      return "bg-red-50 text-red-700";
    case "ACTIVE":
      return "bg-green-50 text-green-700";
    case "PAUSED":
      return "bg-amber-50 text-amber-700";
    case "CLOSED":
      return "bg-red-50 text-red-700";
    case "DRAFT":
      return "bg-gray-50 text-gray-700";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hours ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString();
};

export default function CompanyDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState("This Month");

  useEffect(() => {
    if (user?.id) {
      fetchDashboardStats();

      // Implement dynamic polling every 60 seconds (silent mode)
      const pollInterval = setInterval(() => {
        fetchDashboardStats(true);
      }, 60000);

      return () => clearInterval(pollInterval);
    }
  }, [user?.id]);

  const fetchDashboardStats = async (silent = false) => {
    if (!user?.id) return;

    if (!silent) {
      setLoading(true);
    }
    setError(null);

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const response = await fetch(`/api/employer/stats?employerId=${user.id}`, {
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
      } else {
        setError(data.message || "Failed to fetch dashboard stats");
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error("Error fetching stats:", err);

      if (err.name === 'AbortError') {
        setError("Request timed out. Please check your connection and try again.");
      } else {
        setError("Failed to load dashboard data. Please try again.");
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  // Prepare chart data
  const applicationStatusData = stats ? [
    { name: "Pending", value: stats.applicationsByStatus.pending, color: "#94a3b8" },
    { name: "Reviewing", value: stats.applicationsByStatus.reviewing, color: "#7dd3fc" }, // Sky-300
    { name: "Shortlisted", value: stats.applicationsByStatus.shortlisted, color: "#0ea5e9" }, // Sky-500
    { name: "Interview", value: stats.applicationsByStatus.interview, color: "#64748b" }, // Steel/Admin
    { name: "Offered", value: stats.applicationsByStatus.offered, color: "#0369a1" }, // Sky-700
    { name: "Hired", value: stats.applicationsByStatus.hired, color: "#0f172a" }, // Navy
    { name: "Rejected", value: stats.applicationsByStatus.rejected, color: "#ef4444" }, // Red
  ].filter(item => item.value > 0) : [];

  const applicationsTrendData = stats?.applicationsTrend.map(item => ({
    month: item.month,
    applications: item.count,
  })) || [];

  if (loading && !stats) {
    return <LoadingSpinner size="lg" label="Loading..." className="min-h-[400px]" />;
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <FiAlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Please Sign In</h3>
          <p className="text-gray-600 mb-4">Sign in to access your employer dashboard.</p>
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-company-400 to-company-600 text-white rounded-lg hover:from-company-500 hover:to-company-700 transition-all shadow-md"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 bg-gray-50/30 min-h-screen space-y-6">
      {/* Welcome Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900 tracking-tight mb-1">
            Welcome back, <span className="text-primary-500">{user.name || 'Employer'}</span>! 👋
          </h1>
          <p className="text-gray-500 font-normal text-sm max-w-2xl tracking-normal">
            Manage your recruitment pipeline and track job performance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white p-2.5 px-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-[10px] font-semibold uppercase text-gray-400 tracking-[0.15em] leading-none mb-1">Today's Date</p>
            <p className="font-semibold text-gray-900 tracking-tight leading-none text-base">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
          </div>
        </div>
      </div>
      {/* Error State */}
      {
        error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <FiAlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => fetchDashboardStats()}
              className="ml-auto text-sm text-red-600 font-medium hover:text-red-700"
            >
              Try Again
            </button>
          </div>
        )
      }

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active Jobs */}
        <div className="bg-white rounded-2xl p-6 group transition-all duration-300 border border-gray-100 hover:border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-gray-400 text-[10px] font-semibold uppercase tracking-[0.15em] mb-2">Active Job Posts</h3>
            <p className="text-2xl font-semibold text-gray-900 tracking-tight mb-1">{stats?.activeJobs || 0}</p>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md">
                {stats?.draftJobs || 0} drafts, {stats?.closedJobs || 0} closed
              </span>
              {stats && stats.activeJobsChange !== 0 && (
                <span className={`text-[10px] font-semibold flex items-center gap-0.5 ${stats.activeJobsChange > 0 ? "text-green-600" : "text-red-600"}`}>
                  {stats.activeJobsChange > 0 ? '+' : ''}{stats.activeJobsChange}
                </span>
              )}
            </div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
            <FiBriefcase className="w-7 h-7" />
          </div>
        </div>

        {/* Total Applications */}
        <div className="bg-white rounded-2xl p-6 group transition-all duration-300 border border-gray-100 hover:border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-gray-400 text-[10px] font-semibold uppercase tracking-[0.15em] mb-2">Total Applications</h3>
            <p className="text-2xl font-semibold text-gray-900 tracking-tight mb-1">{stats?.totalApplications || 0}</p>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md">
                {stats?.thisMonthApplications || 0} this month
              </span>
              {stats && stats.applicationsChange !== 0 && (
                <span className={`text-[10px] font-semibold flex items-center gap-0.5 ${stats.applicationsChange > 0 ? "text-green-600" : "text-red-600"}`}>
                  {stats.applicationsChange > 0 ? '+' : ''}{stats.applicationsChange}%
                </span>
              )}
            </div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
            <FiUsers className="w-7 h-7" />
          </div>
        </div>

        {/* Profile Views */}
        <div className="bg-white rounded-2xl p-6 group transition-all duration-300 border border-gray-100 hover:border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-gray-400 text-[10px] font-semibold uppercase tracking-[0.15em] mb-2">Total Job Views</h3>
            <p className="text-2xl font-semibold text-gray-900 tracking-tight mb-1">{stats?.totalViews?.toLocaleString() || 0}</p>
            <span className="text-[10px] font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md">
              across all jobs
            </span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
            <FiEye className="w-7 h-7" />
          </div>
        </div>

        {/* Interviews Scheduled */}
        <div className="bg-white rounded-2xl p-6 group transition-all duration-300 border border-gray-100 hover:border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-gray-400 text-[10px] font-semibold uppercase tracking-[0.15em] mb-2">Interviews Scheduled</h3>
            <p className="text-2xl font-semibold text-gray-900 tracking-tight mb-1">{stats?.interviewsScheduled || 0}</p>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md">
                this week
              </span>
              {stats && stats.interviewsChange !== 0 && (
                <span className={`text-[10px] font-semibold flex items-center gap-0.5 ${stats.interviewsChange > 0 ? "text-green-600" : "text-red-600"}`}>
                  {stats.interviewsChange > 0 ? '+' : ''}{stats.interviewsChange}
                </span>
              )}
            </div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
            <FiCalendar className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* Notification Section */}
      {
        stats && stats.newApplications > 0 && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row items-center justify-between gap-6 group transition-all duration-300 hover:border-blue-200">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
                <FiBell className="w-7 h-7 text-blue-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 leading-tight">New Candidate Applications</h2>
                <p className="text-gray-500 text-sm mt-1">
                  You have <span className="font-semibold text-blue-600">{stats.newApplications} new application{stats.newApplications !== 1 ? 's' : ''}</span> waiting for your review.
                </p>
              </div>
            </div>
            <Link
              href="/company/applications"
              className="w-full md:w-auto px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200 transition-all text-sm shadow-sm flex items-center justify-center gap-2"
            >
              Review Applications
              <FiUsers className="w-4 h-4" />
            </Link>
          </div>
        )
      }


      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications Trend */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-gray-900">Applications Trend</h2>
            <span className="text-sm text-gray-500">Last 6 months</span>
          </div>
          {applicationsTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={applicationsTrendData}>
                <defs>
                  <linearGradient id="colorApplications" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="applications"
                  stroke="#0ea5e9"
                  fillOpacity={1}
                  fill="url(#colorApplications)"
                  name="Applications"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-gray-500">
              <div className="text-center">
                <FiTrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No application data yet</p>
                <p className="text-sm">Post jobs to start receiving applications</p>
              </div>
            </div>
          )}
        </div>

        {/* Application Status Distribution */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-8">Application Status Distribution</h2>
          {applicationStatusData.length > 0 ? (
            <>
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={applicationStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {applicationStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                {applicationStatusData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs text-gray-600">{item.name}</span>
                    <span className="text-xs font-semibold text-gray-900">({item.value})</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-gray-500">
              <div className="text-center">
                <FiUsers className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No applications yet</p>
                <p className="text-sm">Applications will appear here once received</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Jobs & Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Jobs */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-gray-900">Recent Job Posts</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchDashboardStats()}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all text-sm font-medium shadow-sm"
              >
                {loading ? <LoadingSpinner size="sm" color="current" /> : <FiRefreshCw className="w-4 h-4" />}
                Refresh
              </button>
              <Link
                href="/company/jobs"
                className="text-sm text-company-500 font-semibold hover:text-company-600"
              >
                View All →
              </Link>
            </div>
          </div>
          {stats?.recentJobs && stats.recentJobs.length > 0 ? (
            <div className="space-y-4">
              {stats.recentJobs.map((job: any) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">{job.title}</h3>
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(job.status)}`}>
                        {job.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      {job.city && (
                        <span className="flex items-center gap-1">
                          <FiMapPin className="w-3 h-3" />
                          {job.city}
                        </span>
                      )}
                      <span>{job.jobType?.replace('_', ' ')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-center">
                      <p className="font-bold text-gray-900">{job._count?.applications || 0}</p>
                      <p className="text-xs text-gray-500">Applications</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-gray-900">{job.views || 0}</p>
                      <p className="text-xs text-gray-500">Views</p>
                    </div>
                    <Link
                      href={`/company/jobs/${job.id}`}
                      className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-all"
                      title="View Job"
                    >
                      <FiEye className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FiBriefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No jobs posted yet</p>
            </div>
          )}
        </div>

        {/* Recent Applications */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-gray-900">Recent Applications</h2>
            <Link
              href="/company/applications"
              className="text-sm text-company-500 font-semibold hover:text-company-600"
            >
              View All →
            </Link>
          </div>
          {stats?.recentApplications && stats.recentApplications.length > 0 ? (
            <div className="space-y-4">
              {stats.recentApplications.slice(0, 5).map((application: any) => (
                <div
                  key={application.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-company-400 to-admin-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {application.applicantName?.charAt(0)?.toUpperCase() || 'A'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{application.applicantName}</h3>
                      <p className="text-xs text-gray-500">{application.job?.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(application.status)}`}>
                      {application.status}
                    </span>
                    <span className="text-xs text-gray-500">{formatTimeAgo(application.createdAt)}</span>
                    <Link
                      href={`/company/applications?search=${application.applicantName}`}
                      className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-all ml-1"
                      title="View Application"
                    >
                      <FiEye className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FiUsers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No applications yet</p>
              <p className="text-sm text-gray-400 mt-1">Applications will appear here once received</p>
            </div>
          )}
        </div>
      </div>

      {/* Empty State for New Users */}
      {
        stats && stats.totalJobs === 0 && (
          <div className="bg-gradient-to-r from-company-50 to-admin-50 border border-company-100 rounded-xl p-8 text-center">
            <FiBriefcase className="w-16 h-16 text-company-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Get Started with Hiring</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Post your first job to start receiving applications from qualified candidates.
            </p>
          </div>
        )
      }
    </div>
  );
}
