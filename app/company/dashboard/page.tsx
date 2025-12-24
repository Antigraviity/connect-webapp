"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import {
  FiTrendingUp,
  FiBriefcase,
  FiUsers,
  FiEye,
  FiPlus,
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
  FiRefreshCw,
  FiLoader,
  FiAlertCircle,
} from "react-icons/fi";
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
      return "bg-yellow-100 text-yellow-800";
    case "REVIEWING":
      return "bg-blue-100 text-blue-800";
    case "SHORTLISTED":
      return "bg-indigo-100 text-indigo-800";
    case "INTERVIEW":
      return "bg-purple-100 text-purple-800";
    case "OFFERED":
      return "bg-cyan-100 text-cyan-800";
    case "HIRED":
      return "bg-green-100 text-green-800";
    case "REJECTED":
      return "bg-red-100 text-red-800";
    case "ACTIVE":
      return "bg-green-100 text-green-800";
    case "PAUSED":
      return "bg-yellow-100 text-yellow-800";
    case "CLOSED":
      return "bg-red-100 text-red-800";
    case "DRAFT":
      return "bg-gray-100 text-gray-800";
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
    }
  }, [user?.id]);

  const fetchDashboardStats = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/employer/stats?employerId=${user.id}`);
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
      } else {
        setError(data.message || "Failed to fetch dashboard stats");
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const applicationStatusData = stats ? [
    { name: "Pending", value: stats.applicationsByStatus.pending, color: "#f59e0b" },
    { name: "Reviewing", value: stats.applicationsByStatus.reviewing, color: "#3b82f6" },
    { name: "Shortlisted", value: stats.applicationsByStatus.shortlisted, color: "#6366f1" },
    { name: "Interview", value: stats.applicationsByStatus.interview, color: "#8b5cf6" },
    { name: "Offered", value: stats.applicationsByStatus.offered, color: "#06b6d4" },
    { name: "Hired", value: stats.applicationsByStatus.hired, color: "#10b981" },
    { name: "Rejected", value: stats.applicationsByStatus.rejected, color: "#ef4444" },
  ].filter(item => item.value > 0) : [];

  const applicationsTrendData = stats?.applicationsTrend.map(item => ({
    month: item.month,
    applications: item.count,
  })) || [];

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FiLoader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
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
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's what's happening with your job postings.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardStats}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            href="/company/jobs/add"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
          >
            <FiPlus className="w-4 h-4" />
            Post New Job
          </Link>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <FiAlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
          <button
            onClick={fetchDashboardStats}
            className="ml-auto text-sm text-red-600 font-medium hover:text-red-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active Jobs */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-500 p-3 rounded-lg">
              <FiBriefcase className="w-6 h-6 text-white" />
            </div>
            {stats && stats.activeJobsChange !== 0 && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                stats.activeJobsChange > 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
              }`}>
                {stats.activeJobsChange > 0 ? <FiArrowUp className="w-3 h-3" /> : <FiArrowDown className="w-3 h-3" />}
                {stats.activeJobsChange > 0 ? '+' : ''}{stats.activeJobsChange}
              </div>
            )}
          </div>
          <h3 className="text-gray-600 text-sm font-medium">Active Job Posts</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.activeJobs || 0}</p>
          <p className="text-xs text-gray-500 mt-1">
            {stats?.draftJobs || 0} drafts, {stats?.closedJobs || 0} closed
          </p>
        </div>

        {/* Total Applications */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-500 p-3 rounded-lg">
              <FiUsers className="w-6 h-6 text-white" />
            </div>
            {stats && stats.applicationsChange !== 0 && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                stats.applicationsChange > 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
              }`}>
                {stats.applicationsChange > 0 ? <FiArrowUp className="w-3 h-3" /> : <FiArrowDown className="w-3 h-3" />}
                {stats.applicationsChange > 0 ? '+' : ''}{stats.applicationsChange}%
              </div>
            )}
          </div>
          <h3 className="text-gray-600 text-sm font-medium">Total Applications</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.totalApplications || 0}</p>
          <p className="text-xs text-gray-500 mt-1">{stats?.thisMonthApplications || 0} this month</p>
        </div>

        {/* Profile Views */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-500 p-3 rounded-lg">
              <FiEye className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm font-medium">Total Job Views</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.totalViews?.toLocaleString() || 0}</p>
          <p className="text-xs text-gray-500 mt-1">across all jobs</p>
        </div>

        {/* Interviews Scheduled */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-500 p-3 rounded-lg">
              <FiCalendar className="w-6 h-6 text-white" />
            </div>
            {stats && stats.interviewsChange !== 0 && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                stats.interviewsChange > 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
              }`}>
                {stats.interviewsChange > 0 ? <FiArrowUp className="w-3 h-3" /> : <FiArrowDown className="w-3 h-3" />}
                {stats.interviewsChange > 0 ? '+' : ''}{stats.interviewsChange}
              </div>
            )}
          </div>
          <h3 className="text-gray-600 text-sm font-medium">Interviews Scheduled</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.interviewsScheduled || 0}</p>
          <p className="text-xs text-gray-500 mt-1">this week</p>
        </div>
      </div>

      {/* Quick Actions Banner */}
      {stats && stats.newApplications > 0 && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <FiBriefcase className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Ready to hire top talent?</h2>
                <p className="text-blue-100 mt-1">
                  {stats.newApplications} new application{stats.newApplications !== 1 ? 's' : ''} waiting for your review. Don't miss out on great candidates!
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/company/applications"
                className="bg-white/20 backdrop-blur text-white font-semibold px-6 py-3 rounded-lg hover:bg-white/30 transition-colors whitespace-nowrap"
              >
                Review Applications
              </Link>
              <Link
                href="/company/jobs/add"
                className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors whitespace-nowrap"
              >
                + Post New Job
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications Trend */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Applications Trend</h2>
            <span className="text-sm text-gray-500">Last 6 months</span>
          </div>
          {applicationsTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={applicationsTrendData}>
                <defs>
                  <linearGradient id="colorApplications" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
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
                  stroke="#3b82f6"
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
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Application Status Distribution</h2>
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
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Your Recent Jobs</h2>
            <Link
              href="/company/jobs"
              className="text-sm text-blue-600 font-semibold hover:text-blue-700"
            >
              View All →
            </Link>
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
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FiBriefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No jobs posted yet</p>
              <Link
                href="/company/jobs/add"
                className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
              >
                <FiPlus className="w-4 h-4" />
                Post Your First Job
              </Link>
            </div>
          )}
        </div>

        {/* Recent Applications */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Recent Applications</h2>
            <Link
              href="/company/applications"
              className="text-sm text-blue-600 font-semibold hover:text-blue-700"
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
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
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
      {stats && stats.totalJobs === 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-8 text-center">
          <FiBriefcase className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Get Started with Hiring</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Post your first job to start receiving applications from qualified candidates.
          </p>
          <Link
            href="/company/jobs/add"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiPlus className="w-5 h-5" />
            Post Your First Job
          </Link>
        </div>
      )}
    </div>
  );
}
