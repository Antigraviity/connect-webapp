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
      <div className="mb-2 sm:mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 sm:pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight mb-1">
            Welcome back, <span className="text-company-500">{user.name?.split(' ')[0] || 'Employer'}</span>! 👋
          </h1>
          <p className="text-gray-500 font-normal text-xs sm:text-sm max-w-2xl tracking-normal">
            Manage your recruitment pipeline and track job performance.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="bg-white p-2 sm:p-2.5 px-3 sm:px-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-[9px] sm:text-[10px] font-semibold uppercase text-gray-400 tracking-[0.15em] leading-none mb-1">Today's Date</p>
            <p className="font-semibold text-gray-900 tracking-tight leading-none text-sm sm:text-base">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Active Jobs */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 group transition-all duration-300 border border-gray-100 hover:border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
          <div className="order-2 sm:order-1">
            <h3 className="text-gray-400 text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.15em] mb-1 sm:mb-2">Active Jobs</h3>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight mb-0.5 sm:mb-1">{stats?.activeJobs || 0}</p>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-[9px] sm:text-[10px] font-medium text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded-md">
                {stats?.draftJobs || 0} drafts
              </span>
              {stats && stats.activeJobsChange !== 0 && (
                <span className={`text-[9px] sm:text-[10px] font-bold flex items-center gap-0.5 ${stats.activeJobsChange > 0 ? "text-green-600" : "text-red-600"}`}>
                  {stats.activeJobsChange > 0 ? '+' : ''}{stats.activeJobsChange}
                </span>
              )}
            </div>
          </div>
          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center transition-all duration-300 group-hover:scale-110 order-1 sm:order-2 self-start sm:self-auto">
            <FiBriefcase className="w-5 h-5 sm:w-7 sm:h-7" />
          </div>
        </div>

        {/* Total Applications */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 group transition-all duration-300 border border-gray-100 hover:border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
          <div className="order-2 sm:order-1">
            <h3 className="text-gray-400 text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.15em] mb-1 sm:mb-2">Applications</h3>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight mb-0.5 sm:mb-1">{stats?.totalApplications || 0}</p>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-[9px] sm:text-[10px] font-medium text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded-md">
                {stats?.thisMonthApplications || 0} this month
              </span>
              {stats && stats.applicationsChange !== 0 && (
                <span className={`text-[9px] sm:text-[10px] font-bold flex items-center gap-0.5 ${stats.applicationsChange > 0 ? "text-green-600" : "text-red-600"}`}>
                  {stats.applicationsChange > 0 ? '+' : ''}{stats.applicationsChange}%
                </span>
              )}
            </div>
          </div>
          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-green-50 text-green-600 flex items-center justify-center transition-all duration-300 group-hover:scale-110 order-1 sm:order-2 self-start sm:self-auto">
            <FiUsers className="w-5 h-5 sm:w-7 sm:h-7" />
          </div>
        </div>

        {/* Profile Views */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 group transition-all duration-300 border border-gray-100 hover:border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
          <div className="order-2 sm:order-1">
            <h3 className="text-gray-400 text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.15em] mb-1 sm:mb-2">Total Job Views</h3>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight mb-0.5 sm:mb-1">{stats?.totalViews?.toLocaleString() || 0}</p>
            <span className="text-[9px] sm:text-[10px] font-medium text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded-md">
              across all posts
            </span>
          </div>
          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center transition-all duration-300 group-hover:scale-110 order-1 sm:order-2 self-start sm:self-auto">
            <FiEye className="w-5 h-5 sm:w-7 sm:h-7" />
          </div>
        </div>

        {/* Interviews Scheduled */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 group transition-all duration-300 border border-gray-100 hover:border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
          <div className="order-2 sm:order-1">
            <h3 className="text-gray-400 text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.15em] mb-1 sm:mb-2">Interviews</h3>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight mb-0.5 sm:mb-1">{stats?.interviewsScheduled || 0}</p>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-[9px] sm:text-[10px] font-medium text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded-md">
                next 7 days
              </span>
              {stats && stats.interviewsChange !== 0 && (
                <span className={`text-[9px] sm:text-[10px] font-bold flex items-center gap-0.5 ${stats.interviewsChange > 0 ? "text-green-600" : "text-red-600"}`}>
                  {stats.interviewsChange > 0 ? '+' : ''}{stats.interviewsChange}
                </span>
              )}
            </div>
          </div>
          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center transition-all duration-300 group-hover:scale-110 order-1 sm:order-2 self-start sm:self-auto">
            <FiCalendar className="w-5 h-5 sm:w-7 sm:h-7" />
          </div>
        </div>
      </div>

      {/* Notification Section */}
      {
        stats && stats.newApplications > 0 && (
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 p-4 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 group transition-all duration-300 hover:border-company-200">
            <div className="flex items-center gap-3 sm:gap-4 w-full">
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-company-50 rounded-xl sm:rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 shrink-0">
                <FiBell className="w-5 h-5 sm:w-7 sm:h-7 text-company-500" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">New Candidate Applications</h2>
                <p className="text-gray-500 text-xs sm:text-sm mt-0.5 sm:mt-1">
                  You have <span className="font-semibold text-company-600">{stats.newApplications} new application{stats.newApplications !== 1 ? 's' : ''}</span> waiting for review.
                </p>
              </div>
            </div>
            <Link
              href="/company/applications"
              className="w-full md:w-auto px-6 py-2 sm:py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 hover:text-company-600 hover:border-company-200 transition-all text-sm shadow-sm flex items-center justify-center gap-2"
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
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 p-5 sm:p-8">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">Applications Trend</h2>
            <span className="text-xs sm:text-sm text-gray-500">Last 6 months</span>
          </div>
          {applicationsTrendData.length > 0 ? (
            <div className="h-[240px] sm:h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={applicationsTrendData}>
                  <defs>
                    <linearGradient id="colorApplications" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="applications"
                    stroke="#0ea5e9"
                    fillOpacity={1}
                    fill="url(#colorApplications)"
                    name="Applications"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[240px] sm:h-[280px] flex items-center justify-center text-gray-500 bg-gray-50/50 rounded-2xl">
              <div className="text-center p-4">
                <FiTrendingUp className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">No application data yet</p>
                <p className="text-xs text-gray-400">Post jobs to start receiving applications</p>
              </div>
            </div>
          )}
        </div>

        {/* Application Status Distribution */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 p-5 sm:p-8">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-6 sm:mb-8">Status Distribution</h2>
          {applicationStatusData.length > 0 ? (
            <>
              <div className="flex items-center justify-center h-[200px] sm:h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={applicationStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {applicationStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3 mt-4">
                {applicationStatusData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-[11px] text-gray-600 font-medium truncate">{item.name}</span>
                    <span className="text-[11px] font-bold text-gray-900">({item.value})</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[240px] sm:h-[280px] flex items-center justify-center text-gray-500 bg-gray-50/50 rounded-2xl">
              <div className="text-center p-4">
                <FiUsers className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">No applications yet</p>
                <p className="text-xs text-gray-400">Distribution will appear here once received</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Jobs & Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Jobs */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 p-5 sm:p-8">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">Recent Job Posts</h2>
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => fetchDashboardStats()}
                className="p-2 bg-gray-50 border border-gray-100 rounded-xl text-gray-600 hover:text-company-600 hover:bg-company-50 transition-all shadow-sm"
                title="Refresh"
              >
                {loading ? <LoadingSpinner size="sm" color="current" /> : <FiRefreshCw className="w-4 h-4" />}
              </button>
              <Link
                href="/company/jobs"
                className="text-xs sm:text-sm text-company-600 font-bold hover:text-company-700"
              >
                View All
              </Link>
            </div>
          </div>
          {stats?.recentJobs && stats.recentJobs.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {stats.recentJobs.map((job: any) => (
                <div
                  key={job.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-gray-50/50 border border-gray-100 hover:border-company-100 hover:bg-white transition-all group"
                >
                  <div className="flex-1 min-w-0 mb-3 sm:mb-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="font-bold text-gray-900 truncate text-sm sm:text-base group-hover:text-company-600 transition-colors">{job.title}</h3>
                      <span className={`px-2 py-0.5 text-[9px] sm:text-[10px] font-bold rounded-md uppercase tracking-wider shrink-0 ${getStatusColor(job.status)}`}>
                        {job.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] sm:text-xs text-gray-500 font-medium">
                      {job.city && (
                        <span className="flex items-center gap-1">
                          <FiMapPin className="w-3 h-3 text-gray-400" />
                          {job.city}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <FiClock className="w-3 h-3 text-gray-400" />
                        {job.jobType?.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-8 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="font-bold text-gray-900 text-sm">{job._count?.applications || 0}</p>
                        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-tight">Apps</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-gray-900 text-sm">{job.views || 0}</p>
                        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-tight">Views</p>
                      </div>
                    </div>
                    <Link
                      href={`/company/jobs/${job.id}`}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-company-600 hover:border-company-200 hover:shadow-sm flex items-center justify-center transition-all"
                      title="View Job"
                    >
                      <FiEye className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-50/50 rounded-2xl">
              <FiBriefcase className="w-10 h-10 text-gray-300 mx-auto mb-3 opacity-50" />
              <p className="text-gray-500 text-sm font-medium">No jobs posted yet</p>
              <p className="text-xs text-gray-400 mt-1">Your recent posts will appear here</p>
            </div>
          )}
        </div>

        {/* Recent Applications */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 p-5 sm:p-8">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">Recent Applications</h2>
            <Link
              href="/company/applications"
              className="text-xs sm:text-sm text-company-600 font-bold hover:text-company-700"
            >
              View All
            </Link>
          </div>
          {stats?.recentApplications && stats.recentApplications.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {stats.recentApplications.slice(0, 5).map((application: any) => (
                <div
                  key={application.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-gray-50/50 border border-gray-100 hover:border-company-100 hover:bg-white transition-all group"
                >
                  <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-company-400 to-company-600 rounded-full flex items-center justify-center text-white text-sm sm:text-base font-bold shadow-md ring-2 ring-white">
                      {application.applicantName?.charAt(0)?.toUpperCase() || 'A'}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base truncate group-hover:text-company-600 transition-colors uppercase tracking-tight">{application.applicantName}</h3>
                      <p className="text-[10px] sm:text-xs text-gray-500 font-medium truncate flex items-center gap-1">
                        <FiBriefcase className="w-3 h-3 shrink-0" />
                        {application.job?.title}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <span className={`px-2 py-0.5 text-[9px] sm:text-[10px] font-bold rounded-md uppercase tracking-wider shrink-0 shadow-sm ${getStatusColor(application.status)}`}>
                        {application.status}
                      </span>
                      <span className="text-[10px] sm:text-xs text-gray-400 font-bold whitespace-nowrap">{formatTimeAgo(application.createdAt)}</span>
                    </div>
                    <Link
                      href={`/company/applications?search=${application.applicantName}`}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-company-600 hover:border-company-200 hover:shadow-sm flex items-center justify-center transition-all"
                      title="View Application"
                    >
                      <FiEye className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-50/50 rounded-2xl">
              <FiUsers className="w-10 h-10 text-gray-300 mx-auto mb-3 opacity-50" />
              <p className="text-gray-500 text-sm font-medium">No applications yet</p>
              <p className="text-xs text-gray-400 mt-1">Activity will appear here once received</p>
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
