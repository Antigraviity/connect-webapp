"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import {
  FiArrowLeft,
  FiBriefcase,
  FiMapPin,
  FiDollarSign,
  FiClock,
  FiCalendar,
  FiUsers,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiPause,
  FiPlay,
  FiX,
  FiCheck,
  FiLoader,
  FiAlertCircle,
  FiExternalLink,
  FiShare2,
  FiGlobe,
  FiTag,
  FiBookmark,
  FiTrendingUp,
} from "react-icons/fi";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface Job {
  id: string;
  title: string;
  slug: string;
  description: string;
  requirements?: string;
  responsibilities?: string;
  benefits?: string;
  jobType: string;
  experienceLevel?: string;
  minExperience?: number;
  maxExperience?: number;
  skills?: string;
  education?: string;
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
    image?: string;
  };
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return { bg: "bg-green-100", text: "text-green-800", label: "Active" };
    case "PAUSED":
      return { bg: "bg-yellow-100", text: "text-yellow-800", label: "Paused" };
    case "CLOSED":
      return { bg: "bg-red-100", text: "text-red-800", label: "Closed" };
    case "DRAFT":
      return { bg: "bg-gray-100", text: "text-gray-800", label: "Draft" };
    case "EXPIRED":
      return { bg: "bg-orange-100", text: "text-orange-800", label: "Expired" };
    default:
      return { bg: "bg-gray-100", text: "text-gray-800", label: status };
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
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

const parseSkills = (skillsStr?: string): string[] => {
  if (!skillsStr) return [];
  try {
    return JSON.parse(skillsStr);
  } catch {
    return skillsStr.split(',').map(s => s.trim()).filter(Boolean);
  }
};

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const jobId = params.id as string;

  useEffect(() => {
    if (jobId) {
      fetchJob();
    }
  }, [jobId]);

  const fetchJob = async () => {
    setLoading(true);
    setError(null);

    try {
      // Skip view increment for employer dashboard
      const response = await fetch(`/api/jobs/${jobId}?skipView=true`);
      const data = await response.json();

      if (data.success) {
        setJob(data.job);
      } else {
        setError(data.message || "Failed to fetch job");
      }
    } catch (err) {
      console.error("Error fetching job:", err);
      setError("Failed to load job details");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!job) return;

    setUpdating(true);

    try {
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();

      if (data.success) {
        setJob(prev => prev ? { ...prev, status: newStatus } : null);
      } else {
        alert(data.message || "Failed to update job status");
      }
    } catch (err) {
      console.error("Error updating job:", err);
      alert("Failed to update job status");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!job) return;

    setDeleting(true);

    try {
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        router.push('/company/jobs');
      } else {
        alert(data.message || "Failed to delete job");
      }
    } catch (err) {
      console.error("Error deleting job:", err);
      alert("Failed to delete job");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (authLoading || loading) {
    return <LoadingSpinner size="lg" label="Loading job details..." className="min-h-[400px]" />;
  }

  if (error || !job) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Job Not Found</h3>
          <p className="text-gray-600 mb-4">{error || "The job you're looking for doesn't exist."}</p>
          <Link
            href="/company/jobs"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-company-400 to-company-600 hover:from-company-500 hover:to-company-700 text-white rounded-lg transition-all font-bold shadow-md active:scale-95"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  const statusBadge = getStatusBadge(job.status);
  const skills = parseSkills(job.skills);
  const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryPeriod);
  const applicationsCount = job._count?.applications || 0;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/company/jobs"
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusBadge.bg} ${statusBadge.text}`}>
              {statusBadge.label}
            </span>
            {job.featured && (
              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">
                Featured
              </span>
            )}
            {job.urgent && (
              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                Urgent
              </span>
            )}
          </div>
          <p className="text-gray-600 mt-1">
            {job.companyName && `${job.companyName} • `}
            {job.city || job.location}
            {job.isRemote && " (Remote)"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/company/jobs/${job.id}/edit`}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FiEdit2 className="w-4 h-4" />
            Edit
          </Link>
          {job.status === "ACTIVE" ? (
            <button
              onClick={() => handleUpdateStatus("PAUSED")}
              disabled={updating}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-yellow-200 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors font-medium text-sm disabled:opacity-50"
            >
              {updating ? <LoadingSpinner size="sm" color="current" /> : <FiPause className="w-4 h-4" />}
              Pause Posting
            </button>
          ) : job.status === "PAUSED" ? (
            <button
              onClick={() => handleUpdateStatus("ACTIVE")}
              disabled={updating}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-green-200 text-green-600 hover:bg-green-50 rounded-lg transition-colors font-medium text-sm disabled:opacity-50"
            >
              {updating ? <LoadingSpinner size="sm" color="current" /> : <FiPlay className="w-4 h-4" />}
              Resume Posting
            </button>
          ) : job.status === "DRAFT" ? (
            <button
              onClick={() => handleUpdateStatus("ACTIVE")}
              disabled={updating}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-company-400 to-company-600 hover:from-company-500 hover:to-company-700 text-white font-bold rounded-lg transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              {updating ? <LoadingSpinner size="sm" color="current" /> : <FiCheck className="w-4 h-4" />}
              Publish
            </button>
          ) : null}
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
          >
            <FiTrash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-2xl font-bold text-company-600">
                <FiUsers className="w-6 h-6" />
                {applicationsCount}
              </div>
              <p className="text-sm text-gray-500 mt-1 font-medium">Applications</p>
              <Link
                href={`/company/applications?jobId=${job.id}`}
                className="text-xs text-company-600 hover:text-company-700 font-bold mt-2 inline-block transition-colors"
              >
                View All →
              </Link>
            </div>
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-2xl font-bold text-green-600">
                <FiEye className="w-6 h-6" />
                {job.views || 0}
              </div>
              <p className="text-sm text-gray-500 mt-1">Views</p>
            </div>
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-2xl font-bold text-admin-600">
                <FiTrendingUp className="w-6 h-6" />
                {job.views > 0 ? ((applicationsCount / job.views) * 100).toFixed(1) : '0.0'}%
              </div>
              <p className="text-sm text-gray-500 mt-1 font-medium">Conversion Rate</p>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Job Description</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
            </div>
          </div>

          {/* Requirements */}
          {job.requirements && (
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Requirements</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{job.requirements}</p>
              </div>
            </div>
          )}

          {/* Responsibilities */}
          {job.responsibilities && (
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Key Responsibilities</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{job.responsibilities}</p>
              </div>
            </div>
          )}

          {/* Benefits */}
          {job.benefits && (
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Benefits & Perks</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{job.benefits}</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Job Details Card */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Job Details</h2>
            <div className="space-y-4">
              {/* Job Type */}
              <div className="flex items-start gap-3">
                <FiBriefcase className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Job Type</p>
                  <p className="font-medium text-gray-900">{formatJobType(job.jobType)}</p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-3">
                <FiMapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium text-gray-900">
                    {job.city && `${job.city}, `}
                    {job.state && `${job.state}, `}
                    {job.country}
                    {job.isRemote && (
                      <span className="ml-2 px-2 py-0.5 bg-company-50 text-company-700 text-[10px] font-bold rounded-full shadow-sm">
                        Remote
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Salary */}
              {salary && job.showSalary && (
                <div className="flex items-start gap-3">
                  <FiDollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Salary</p>
                    <p className="font-medium text-gray-900">{salary}</p>
                  </div>
                </div>
              )}

              {/* Experience */}
              {(job.experienceLevel || job.minExperience || job.maxExperience) && (
                <div className="flex items-start gap-3">
                  <FiClock className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Experience</p>
                    <p className="font-medium text-gray-900">
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
                    </p>
                  </div>
                </div>
              )}

              {/* Education */}
              {job.education && (
                <div className="flex items-start gap-3">
                  <FiBookmark className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Education</p>
                    <p className="font-medium text-gray-900">{job.education}</p>
                  </div>
                </div>
              )}

              {/* Posted Date */}
              <div className="flex items-start gap-3">
                <FiCalendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Posted</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(job.postedAt || job.createdAt)}
                  </p>
                </div>
              </div>

              {/* Deadline */}
              {job.deadline && (
                <div className="flex items-start gap-3">
                  <FiClock className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Application Deadline</p>
                    <p className="font-medium text-gray-900">{formatDate(job.deadline)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Skills */}
          {skills.length > 0 && (
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FiTag className="w-5 h-5 text-company-600" />
                Required Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-company-50 text-company-700 rounded-full text-sm font-bold shadow-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                href={`/company/applications?jobId=${job.id}`}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-company-400 to-company-600 hover:from-company-500 hover:to-company-700 text-white rounded-lg transition-all font-bold shadow-md active:scale-95"
              >
                <FiUsers className="w-4 h-4" />
                View Applications ({applicationsCount})
              </Link>
              <Link
                href={`/company/jobs/${job.id}/edit`}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                <FiEdit2 className="w-4 h-4" />
                Edit Job
              </Link>
              <Link
                href={`/jobs/${job.slug}`}
                target="_blank"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                <FiExternalLink className="w-4 h-4" />
                View Public Page
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => !deleting && setShowDeleteModal(false)}
          />
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-red-500 to-red-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Delete Job Post</h3>
              <button
                onClick={() => !deleting && setShowDeleteModal(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                  <FiTrash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">Are you sure?</h4>
                  <p className="text-sm text-gray-600">This action cannot be undone.</p>
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <span className="font-semibold">"{job.title}"</span>? All associated applications and data will be permanently removed.
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
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-6 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {deleting ? <LoadingSpinner size="sm" color="current" /> : <FiTrash2 className="w-4 h-4" />}
                  Delete Permanently
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
