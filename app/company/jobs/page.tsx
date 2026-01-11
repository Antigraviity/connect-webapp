"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import {
  FiPlus,
  FiSearch,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiUsers,
  FiMoreVertical,
  FiPause,
  FiPlay,
  FiCopy,
  FiExternalLink,
  FiCalendar,
  FiMapPin,
  FiDollarSign,
  FiClock,
  FiBriefcase,
  FiFilter,
  FiDownload,
  FiTrendingUp,
  FiX,
  FiCheck,
  FiAlertCircle,
  FiGrid,
  FiList,
  FiRefreshCw,
} from "react-icons/fi";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface Job {
  id: string;
  title: string;
  slug: string;
  description: string;
  jobType: string;
  experienceLevel?: string;
  minExperience?: number;
  maxExperience?: number;
  skills?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryPeriod?: string;
  showSalary: boolean;
  location?: string;
  city?: string;
  state?: string;
  country?: string;
  isRemote: boolean;
  status: string;
  featured: boolean;
  urgent: boolean;
  views: number;
  postedAt?: string;
  deadline?: string;
  companyName?: string;
  companyLogo?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    applications: number;
  };
  employer?: {
    id: string;
    name: string;
    email: string;
  };
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return {
        bg: "bg-green-100",
        text: "text-green-800",
        icon: FiCheck,
        label: "Active",
      };
    case "PAUSED":
      return {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        icon: FiPause,
        label: "Paused",
      };
    case "CLOSED":
      return {
        bg: "bg-red-100",
        text: "text-red-800",
        icon: FiX,
        label: "Closed",
      };
    case "DRAFT":
      return {
        bg: "bg-gray-100",
        text: "text-gray-800",
        icon: FiEdit2,
        label: "Draft",
      };
    case "EXPIRED":
      return {
        bg: "bg-orange-100",
        text: "text-orange-800",
        icon: FiClock,
        label: "Expired",
      };
    default:
      return {
        bg: "bg-gray-100",
        text: "text-gray-800",
        icon: FiAlertCircle,
        label: status,
      };
  }
};

const getJobTypeBadge = (type: string) => {
  switch (type) {
    case "REMOTE":
      return "bg-company-50 text-company-700";
    case "FULL_TIME":
      return "bg-green-50 text-green-700";
    case "PART_TIME":
      return "bg-purple-50 text-purple-700";
    case "CONTRACT":
      return "bg-orange-50 text-orange-700";
    case "FREELANCE":
      return "bg-cyan-50 text-cyan-700";
    case "INTERNSHIP":
      return "bg-sky-50 text-sky-700";
    default:
      return "bg-gray-50 text-gray-700";
  }
};

const formatJobType = (type: string) => {
  return type?.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) || type;
};

const formatSalary = (min?: number, max?: number, period?: string) => {
  if (!min && !max) return null;

  const formatNum = (n: number) => {
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
    return `₹${n}`;
  };

  let salary = '';
  if (min && max) {
    salary = `${formatNum(min)} - ${formatNum(max)}`;
  } else if (min) {
    salary = `${formatNum(min)}+`;
  } else if (max) {
    salary = `Up to ${formatNum(max)}`;
  }

  if (period) {
    salary += ` / ${period}`;
  }

  return salary;
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const parseSkills = (skillsStr?: string): string[] => {
  if (!skillsStr) return [];
  try {
    return JSON.parse(skillsStr);
  } catch {
    return skillsStr.split(',').map(s => s.trim()).filter(Boolean);
  }
};

export default function JobsPage() {
  const { user, loading: authLoading } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterJobType, setFilterJobType] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "cards">("cards");
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchJobs();
    }
  }, [user?.id]);

  const fetchJobs = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/jobs?employerId=${user.id}`);
      const data = await response.json();

      if (data.success) {
        setJobs(data.jobs || []);
      } else {
        setError(data.message || "Failed to fetch jobs");
      }
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateJobStatus = async (jobId: string, newStatus: string) => {
    setUpdatingStatus(jobId);
    setActionMenuOpen(null);

    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();

      if (data.success) {
        setJobs(prev => prev.map(job =>
          job.id === jobId ? { ...job, status: newStatus } : job
        ));
      } else {
        alert(data.message || "Failed to update job status");
      }
    } catch (err) {
      console.error("Error updating job:", err);
      alert("Failed to update job status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDeleteJob = (jobId: string) => {
    setJobToDelete(jobId);
    setShowDeleteModal(true);
    setActionMenuOpen(null);
  };

  const confirmDelete = async () => {
    if (!jobToDelete) return;

    setDeleting(true);

    try {
      const response = await fetch(`/api/jobs/${jobToDelete}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        setJobs(prev => prev.filter(job => job.id !== jobToDelete));
        setShowDeleteModal(false);
        setJobToDelete(null);
      } else {
        alert(data.message || "Failed to delete job");
      }
    } catch (err) {
      console.error("Error deleting job:", err);
      alert("Failed to delete job");
    } finally {
      setDeleting(false);
    }
  };

  // Get unique job types for filter
  const jobTypes = [...new Set(jobs.map((job) => job.jobType))];

  // Filter jobs
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || job.status === filterStatus;

    const matchesJobType =
      filterJobType === "all" || job.jobType === filterJobType;

    return matchesSearch && matchesStatus && matchesJobType;
  });

  // Calculate stats
  const stats = {
    total: jobs.length,
    active: jobs.filter((j) => j.status === "ACTIVE").length,
    paused: jobs.filter((j) => j.status === "PAUSED").length,
    closed: jobs.filter((j) => j.status === "CLOSED").length,
    draft: jobs.filter((j) => j.status === "DRAFT").length,
    totalApplications: jobs.reduce((sum, j) => sum + (j._count?.applications || 0), 0),
    totalViews: jobs.reduce((sum, j) => sum + (j.views || 0), 0),
  };

  const toggleJobSelection = (jobId: string) => {
    setSelectedJobs((prev) =>
      prev.includes(jobId)
        ? prev.filter((id) => id !== jobId)
        : [...prev, jobId]
    );
  };

  const selectAllJobs = () => {
    if (selectedJobs.length === filteredJobs.length) {
      setSelectedJobs([]);
    } else {
      setSelectedJobs(filteredJobs.map((job) => job.id));
    }
  };

  if (authLoading || loading) {
    return <LoadingSpinner size="lg" label="Loading..." className="min-h-[400px]" />;
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <FiAlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Please Sign In</h3>
          <p className="text-gray-600 mb-4">Sign in to manage your job posts.</p>
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Posts</h1>
          <p className="text-gray-600 mt-1">
            Manage your job postings and track applications
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchJobs}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all text-sm font-medium shadow-sm"
          >
            {loading ? <LoadingSpinner size="sm" color="current" /> : <FiRefreshCw className="w-4 h-4" />}
            Refresh
          </button>
          <Link
            href="/company/jobs/add"
            className="flex items-center gap-2 bg-gradient-to-r from-company-400 to-company-600 text-white px-4 py-2 rounded-lg hover:from-company-500 hover:to-company-700 transition-all shadow-md text-sm font-semibold"
          >
            <FiPlus className="w-4 h-4" />
            Post Job
          </Link>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <FiAlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
          <button
            onClick={fetchJobs}
            className="ml-auto text-sm text-red-600 font-medium hover:text-red-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4 mb-2 sm:mb-6">
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center">
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Total</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">{stats.total}</p>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center">
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Active</p>
          <p className="text-xl sm:text-2xl font-bold text-green-600 leading-tight">{stats.active}</p>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center">
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Paused</p>
          <p className="text-xl sm:text-2xl font-bold text-yellow-600 leading-tight">{stats.paused}</p>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center">
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Closed</p>
          <p className="text-xl sm:text-2xl font-bold text-red-600 leading-tight">{stats.closed}</p>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center">
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Draft</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-600 leading-tight">{stats.draft}</p>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center ring-1 ring-company-100 bg-company-50/20">
          <p className="text-[10px] text-company-500 font-bold uppercase tracking-wider">Applications</p>
          <p className="text-xl sm:text-2xl font-bold text-company-600 leading-tight">{stats.totalApplications}</p>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center">
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Views</p>
          <p className="text-xl sm:text-2xl font-bold text-indigo-600 leading-tight">{stats.totalViews}</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-md border border-gray-100 p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by job title or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 sm:py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-company-500 focus:bg-white transition-all outline-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 sm:py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-company-500 focus:bg-white transition-all outline-none cursor-pointer sm:min-w-[140px]"
            >
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="PAUSED">Paused</option>
              <option value="CLOSED">Closed</option>
              <option value="DRAFT">Draft</option>
            </select>

            <select
              value={filterJobType}
              onChange={(e) => setFilterJobType(e.target.value)}
              className="px-4 py-2 sm:py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-company-500 focus:bg-white transition-all outline-none cursor-pointer sm:min-w-[160px]"
            >
              <option value="all">All Job Types</option>
              {jobTypes.map((type) => (
                <option key={type} value={type}>
                  {formatJobType(type)}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-200">
              <button
                onClick={() => setViewMode("cards")}
                className={`p-1.5 rounded-lg transition-all ${viewMode === "cards" ? "bg-white text-company-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
              >
                <FiGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg transition-all ${viewMode === "table" ? "bg-white text-company-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
              >
                <FiList className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedJobs.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs sm:text-sm text-gray-600 font-medium">
                {selectedJobs.length} selected
              </span>
              <button
                onClick={() => setSelectedJobs([])}
                className="text-xs text-company-600 font-bold hover:underline"
              >
                Clear
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50">
                Close
              </button>
              <button className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700">
                Delete
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Jobs Display */}
      {viewMode === "cards" ? (
        /* Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredJobs.map((job) => {
            const statusBadge = getStatusBadge(job.status);
            const StatusIcon = statusBadge.icon;
            const skills = parseSkills(job.skills);
            const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryPeriod);
            const applicationsCount = job._count?.applications || 0;
            const cvr = job.views > 0 ? ((applicationsCount / job.views) * 100).toFixed(1) : '0.0';

            return (
              <div
                key={job.id}
                className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 p-5 sm:p-6 hover:shadow-lg hover:border-company-200 transition-all duration-300 relative group"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{job.title}</h3>
                      {job.urgent && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                          Urgent
                        </span>
                      )}
                      {job.featured && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">
                          Featured
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      {job.companyName && (
                        <span className="flex items-center gap-1">
                          <FiBriefcase className="w-4 h-4" />
                          {job.companyName}
                        </span>
                      )}
                      {(job.city || job.location) && (
                        <span className="flex items-center gap-1">
                          <FiMapPin className="w-4 h-4" />
                          {job.city || job.location}
                          {job.isRemote && " (Remote)"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Menu */}
                  <div className="relative">
                    <button
                      onClick={() =>
                        setActionMenuOpen(actionMenuOpen === job.id ? null : job.id)
                      }
                      disabled={updatingStatus === job.id}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {updatingStatus === job.id ? (
                        <LoadingSpinner size="sm" color="company" />
                      ) : (
                        <FiMoreVertical className="w-5 h-5" />
                      )}
                    </button>

                    {actionMenuOpen === job.id && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                        <Link
                          href={`/company/jobs/${job.id}`}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <FiEye className="w-4 h-4" />
                          View Details
                        </Link>
                        <Link
                          href={`/company/jobs/${job.id}/edit`}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <FiEdit2 className="w-4 h-4" />
                          Edit Job
                        </Link>
                        <hr className="my-1" />
                        {job.status === "ACTIVE" ? (
                          <button
                            onClick={() => handleUpdateJobStatus(job.id, "PAUSED")}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-yellow-600 hover:bg-yellow-50"
                          >
                            <FiPause className="w-4 h-4" />
                            Pause Job
                          </button>
                        ) : job.status === "PAUSED" ? (
                          <button
                            onClick={() => handleUpdateJobStatus(job.id, "ACTIVE")}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-green-600 hover:bg-green-50"
                          >
                            <FiPlay className="w-4 h-4" />
                            Resume Job
                          </button>
                        ) : job.status === "DRAFT" ? (
                          <button
                            onClick={() => handleUpdateJobStatus(job.id, "ACTIVE")}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-green-600 hover:bg-green-50"
                          >
                            <FiCheck className="w-4 h-4" />
                            Publish Job
                          </button>
                        ) : null}
                        {job.status !== "CLOSED" && (
                          <button
                            onClick={() => handleUpdateJobStatus(job.id, "CLOSED")}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-orange-600 hover:bg-orange-50"
                          >
                            <FiX className="w-4 h-4" />
                            Close Job
                          </button>
                        )}
                        <hr className="my-1" />
                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <FiTrash2 className="w-4 h-4" />
                          Delete Job
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full ${statusBadge.bg} ${statusBadge.text}`}>
                    <StatusIcon className="w-3 h-3" />
                    {statusBadge.label}
                  </span>
                  {job.isRemote && (
                    <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-company-50 text-company-700">
                      Remote
                    </span>
                  )}
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getJobTypeBadge(job.jobType)}`}>
                    {formatJobType(job.jobType)}
                  </span>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {salary && job.showSalary && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FiDollarSign className="w-4 h-4 text-gray-400" />
                      <span>{salary}</span>
                    </div>
                  )}
                  {(job.minExperience || job.maxExperience || job.experienceLevel) && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FiClock className="w-4 h-4 text-gray-400" />
                      <span>
                        {job.experienceLevel ||
                          (job.minExperience && job.maxExperience
                            ? `${job.minExperience}-${job.maxExperience} years`
                            : job.minExperience
                              ? `${job.minExperience}+ years`
                              : job.maxExperience
                                ? `Up to ${job.maxExperience} years`
                                : ''
                          )
                        }
                      </span>
                    </div>
                  )}
                </div>

                {/* Skills */}
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {skills.slice(0, 4).map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-company-50 text-company-700 text-xs font-medium rounded"
                      >
                        {skill}
                      </span>
                    ))}
                    {skills.length > 4 && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                        +{skills.length - 4} more
                      </span>
                    )}
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-lg font-bold text-gray-900">
                      <FiUsers className="w-4 h-4 text-company-500" />
                      {applicationsCount}
                    </div>
                    <p className="text-xs text-gray-500">Applications</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-lg font-bold text-gray-900">
                      <FiEye className="w-4 h-4 text-green-500" />
                      {job.views || 0}
                    </div>
                    <p className="text-xs text-gray-500">Views</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-lg font-bold text-green-600">
                      <FiTrendingUp className="w-4 h-4" />
                      {cvr}%
                    </div>
                    <p className="text-xs text-gray-500">CVR</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <FiCalendar className="w-3.5 h-3.5" />
                    <span>Posted {job.postedAt ? formatDate(job.postedAt) : formatDate(job.createdAt)}</span>
                    {job.deadline && (
                      <>
                        <span>•</span>
                        <span>Expires {formatDate(job.deadline)}</span>
                      </>
                    )}
                  </div>
                  <Link
                    href={`/company/applications?jobId=${job.id}`}
                    className="text-sm text-company-600 font-bold hover:text-company-700 transition-colors flex items-center gap-1 group/link"
                  >
                    View Applications <span className="group-hover/link:translate-x-1 transition-transform">→</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                    <input
                      type="checkbox"
                      checked={selectedJobs.length === filteredJobs.length && filteredJobs.length > 0}
                      onChange={selectAllJobs}
                      className="rounded border-gray-300 text-company-500 focus:ring-company-500"
                    />
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                    Job Title
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                    Type
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                    Location
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                    Applications
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                    Views
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                    Posted Date
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.length > 0 ? (
                  filteredJobs.map((job) => {
                    const statusBadge = getStatusBadge(job.status);
                    const applicationsCount = job._count?.applications || 0;

                    return (
                      <tr
                        key={job.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <input
                            type="checkbox"
                            checked={selectedJobs.includes(job.id)}
                            onChange={() => toggleJobSelection(job.id)}
                            className="rounded border-gray-300 text-company-500 focus:ring-company-500"
                          />
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-gray-900">{job.title}</p>
                              {job.urgent && (
                                <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded">
                                  Urgent
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">
                              {formatJobType(job.jobType)}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-700">
                          {formatJobType(job.jobType)}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-700">
                          {job.city || job.location || '-'}
                          {job.isRemote && <span className="text-blue-600 ml-1">(Remote)</span>}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <FiUsers className="w-4 h-4 text-gray-400" />
                            <span className="font-semibold text-gray-900">
                              {applicationsCount}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <FiEye className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">{job.views || 0}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-700">
                          {job.postedAt ? formatDate(job.postedAt) : formatDate(job.createdAt)}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${statusBadge.bg} ${statusBadge.text}`}
                          >
                            {statusBadge.label}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2 relative z-10">
                            <Link
                              href={`/company/jobs/${job.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <FiEye className="w-4 h-4" />
                            </Link>
                            <Link
                              href={`/company/jobs/${job.id}/edit`}
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Edit Job"
                            >
                              <FiEdit2 className="w-4 h-4" />
                            </Link>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteJob(job.id);
                              }}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Job"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <FiSearch className="w-12 h-12 text-gray-300 mb-4" />
                        <p className="text-gray-500 font-medium">No jobs found</p>
                        <p className="text-gray-400 text-sm mt-1">
                          Try adjusting your search or filters
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredJobs.length === 0 && !loading && viewMode === "cards" && (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiBriefcase className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs found</h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || filterStatus !== "all" || filterJobType !== "all"
              ? "Try adjusting your search or filters"
              : "Get started by posting your first job"}
          </p>
          <Link
            href="/company/jobs/add"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-company-400 to-company-600 text-white px-5 py-2.5 rounded-xl hover:from-company-500 hover:to-company-700 transition-all shadow-md font-semibold text-sm"
          >
            <FiPlus className="w-4 h-4" />
            Post Job
          </Link>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => !deleting && setShowDeleteModal(false)}
          />
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <FiTrash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Delete Job Post</h3>
                <p className="text-sm text-gray-600">
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this job post? All associated
              applications and data will be permanently removed.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {deleting && <LoadingSpinner size="sm" color="current" className="mr-2" />}
                Delete Job
              </button>
            </div>
          </div>
        </div>
      )
      }

      {/* Click outside to close action menu */}
      {
        actionMenuOpen && (
          <div
            className="fixed inset-0 z-0"
            onClick={() => setActionMenuOpen(null)}
          />
        )
      }
    </div >
  );
}
