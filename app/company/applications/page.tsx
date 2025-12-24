"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import {
  FiDownload,
  FiMail,
  FiPhone,
  FiMapPin,
  FiBriefcase,
  FiFilter,
  FiSearch,
  FiEye,
  FiCalendar,
  FiClock,
  FiUser,
  FiFileText,
  FiMessageSquare,
  FiCheck,
  FiX,
  FiChevronDown,
  FiChevronUp,
  FiExternalLink,
  FiStar,
  FiVideo,
  FiMoreVertical,
  FiLinkedin,
  FiGlobe,
  FiLoader,
  FiAlertCircle,
  FiRefreshCw,
} from "react-icons/fi";

interface Application {
  id: string;
  jobId: string;
  applicantId?: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone?: string;
  resume?: string;
  coverLetter?: string;
  portfolio?: string;
  linkedIn?: string;
  expectedSalary?: string;
  noticePeriod?: string;
  availableFrom?: string;
  answers?: string;
  status: string;
  notes?: string;
  rating?: number;
  interviewDate?: string;
  interviewType?: string;
  interviewNotes?: string;
  createdAt: string;
  updatedAt: string;
  job?: {
    id: string;
    title: string;
    companyName?: string;
    city?: string;
    status: string;
  };
  applicant?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    city?: string;
    state?: string;
    image?: string;
  };
}

interface Job {
  id: string;
  title: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "PENDING":
      return {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        border: "border-yellow-200",
        label: "Pending Review",
      };
    case "REVIEWING":
      return {
        bg: "bg-blue-100",
        text: "text-blue-800",
        border: "border-blue-200",
        label: "Reviewing",
      };
    case "SHORTLISTED":
      return {
        bg: "bg-indigo-100",
        text: "text-indigo-800",
        border: "border-indigo-200",
        label: "Shortlisted",
      };
    case "INTERVIEW":
      return {
        bg: "bg-purple-100",
        text: "text-purple-800",
        border: "border-purple-200",
        label: "Interview",
      };
    case "OFFERED":
      return {
        bg: "bg-cyan-100",
        text: "text-cyan-800",
        border: "border-cyan-200",
        label: "Offered",
      };
    case "HIRED":
      return {
        bg: "bg-green-100",
        text: "text-green-800",
        border: "border-green-200",
        label: "Hired",
      };
    case "REJECTED":
      return {
        bg: "bg-red-100",
        text: "text-red-800",
        border: "border-red-200",
        label: "Rejected",
      };
    case "WITHDRAWN":
      return {
        bg: "bg-gray-100",
        text: "text-gray-800",
        border: "border-gray-200",
        label: "Withdrawn",
      };
    default:
      return {
        bg: "bg-gray-100",
        text: "text-gray-800",
        border: "border-gray-200",
        label: status,
      };
  }
};

const formatTimeAgo = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export default function CompanyApplicationsPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const jobIdFromUrl = searchParams.get("jobId");
  
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedJob, setSelectedJob] = useState(jobIdFromUrl || "all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedApplication, setExpandedApplication] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<"shortlist" | "reject" | "interview" | "hire" | null>(null);
  const [sortBy, setSortBy] = useState("newest");
  const [updating, setUpdating] = useState<string | null>(null);
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewType, setInterviewType] = useState("Video Call");
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  const fetchData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);

    try {
      // Fetch applications for this employer
      const appsResponse = await fetch(`/api/jobs/applications?employerId=${user.id}`);
      const appsData = await appsResponse.json();

      if (appsData.success) {
        setApplications(appsData.applications || []);
      } else {
        setError(appsData.message || "Failed to fetch applications");
      }

      // Fetch jobs for filter dropdown
      const jobsResponse = await fetch(`/api/jobs?employerId=${user.id}`);
      const jobsData = await jobsResponse.json();

      if (jobsData.success) {
        setJobs(jobsData.jobs?.map((j: any) => ({ id: j.id, title: j.title })) || []);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (applicationId: string, newStatus: string, additionalData: any = {}) => {
    setUpdating(applicationId);

    try {
      const response = await fetch('/api/jobs/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId,
          status: newStatus,
          ...additionalData,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update local state
        setApplications(prev => prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: newStatus, ...additionalData }
            : app
        ));
        setShowActionModal(false);
        setSelectedApplication(null);
        setActionType(null);
      } else {
        alert(data.message || "Failed to update application");
      }
    } catch (err) {
      console.error("Error updating application:", err);
      alert("Failed to update application");
    } finally {
      setUpdating(null);
    }
  };

  // Calculate status counts
  const statusCounts = {
    ALL: applications.length,
    PENDING: applications.filter((a) => a.status === "PENDING").length,
    REVIEWING: applications.filter((a) => a.status === "REVIEWING").length,
    SHORTLISTED: applications.filter((a) => a.status === "SHORTLISTED").length,
    INTERVIEW: applications.filter((a) => a.status === "INTERVIEW").length,
    HIRED: applications.filter((a) => a.status === "HIRED").length,
    REJECTED: applications.filter((a) => a.status === "REJECTED").length,
  };

  const filteredApplications = applications
    .filter((app) => {
      const matchesStatus = selectedStatus === "ALL" || app.status === selectedStatus;
      const matchesJob = selectedJob === "all" || app.jobId === selectedJob;
      const matchesSearch =
        app.applicantName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.applicantEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.job?.title?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesJob && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === "name") return (a.applicantName || '').localeCompare(b.applicantName || '');
      return 0;
    });

  const handleAction = (action: "shortlist" | "reject" | "interview" | "hire", application: Application) => {
    setSelectedApplication(application);
    setActionType(action);
    setShowActionModal(true);
    setInterviewDate("");
    setInterviewType("Video Call");
    setRejectReason("");
  };

  const confirmAction = () => {
    if (!selectedApplication || !actionType) return;

    const statusMap: Record<string, string> = {
      shortlist: "SHORTLISTED",
      reject: "REJECTED",
      interview: "INTERVIEW",
      hire: "HIRED",
    };

    const additionalData: any = {};
    if (actionType === "interview") {
      additionalData.interviewDate = interviewDate;
      additionalData.interviewType = interviewType;
    }
    if (actionType === "reject") {
      additionalData.notes = rejectReason;
    }

    handleUpdateStatus(selectedApplication.id, statusMap[actionType], additionalData);
  };

  const toggleExpand = (id: string) => {
    setExpandedApplication(expandedApplication === id ? null : id);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FiLoader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
          <p className="text-gray-600 mt-1">
            Review and manage all candidate applications
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <FiAlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-red-700">{error}</p>
          <button onClick={fetchData} className="ml-auto text-red-600 font-medium hover:text-red-700">
            Try Again
          </button>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
        {Object.entries(statusCounts).map(([status, count]) => {
          const statusInfo = status === "ALL" 
            ? { bg: "bg-gray-100", text: "text-gray-800", label: "Total" }
            : getStatusColor(status);
          return (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedStatus === status
                  ? "border-blue-500 shadow-md"
                  : "border-gray-200 hover:border-gray-300"
              } bg-white`}
            >
              <p className="text-2xl font-bold text-gray-900">{count}</p>
              <p className={`text-sm font-medium ${statusInfo.text}`}>
                {statusInfo.label}
              </p>
            </button>
          );
        })}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, email, or job title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none cursor-pointer min-w-[200px]"
            >
              <option value="all">All Jobs</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.map((application) => {
          const statusInfo = getStatusColor(application.status);
          const isExpanded = expandedApplication === application.id;
          const initials = getInitials(application.applicantName || 'U');

          return (
            <div
              key={application.id}
              className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Main Content */}
              <div className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left: Candidate Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                        {initials}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-bold text-gray-900">
                                {application.applicantName}
                              </h3>
                            </div>
                            <p className="text-sm text-blue-600 font-medium mt-1">
                              Applied for: {application.job?.title || 'Unknown Job'}
                            </p>
                          </div>
                          <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${statusInfo.bg} ${statusInfo.text}`}>
                            {statusInfo.label}
                          </span>
                        </div>

                        {/* Contact & Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FiMail className="w-4 h-4 text-gray-400" />
                            <span className="truncate">{application.applicantEmail}</span>
                          </div>
                          {application.applicantPhone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <FiPhone className="w-4 h-4 text-gray-400" />
                              <span>{application.applicantPhone}</span>
                            </div>
                          )}
                          {application.applicant?.city && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <FiMapPin className="w-4 h-4 text-gray-400" />
                              <span>{application.applicant.city}, {application.applicant.state}</span>
                            </div>
                          )}
                        </div>

                        {/* Applied Time & Links */}
                        <div className="flex items-center gap-4 mt-4 text-sm">
                          <span className="text-gray-500">
                            <FiClock className="w-3.5 h-3.5 inline mr-1" />
                            Applied {formatTimeAgo(application.createdAt)}
                          </span>
                          {application.portfolio && (
                            <a
                              href={application.portfolio}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                            >
                              <FiGlobe className="w-3.5 h-3.5" />
                              Portfolio
                            </a>
                          )}
                          {application.linkedIn && (
                            <a
                              href={application.linkedIn}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                            >
                              <FiLinkedin className="w-3.5 h-3.5" />
                              LinkedIn
                            </a>
                          )}
                        </div>

                        {/* Interview Info (if scheduled) */}
                        {application.status === "INTERVIEW" && application.interviewDate && (
                          <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-100">
                            <div className="flex items-center gap-2 text-purple-700">
                              <FiVideo className="w-4 h-4" />
                              <span className="font-medium">Interview Scheduled:</span>
                              <span>{new Date(application.interviewDate).toLocaleString()}</span>
                              {application.interviewType && (
                                <span className="text-sm">({application.interviewType})</span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Notes */}
                        {application.notes && (
                          <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                            <p className="text-sm text-yellow-800">
                              <span className="font-medium">Notes:</span> {application.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex lg:flex-col gap-2 lg:w-40">
                    <button
                      onClick={() => toggleExpand(application.id)}
                      className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-3 py-2 rounded-lg transition-colors text-sm"
                    >
                      <FiEye className="w-4 h-4" />
                      <span className="hidden sm:inline">
                        {isExpanded ? "Less" : "More"}
                      </span>
                      {isExpanded ? (
                        <FiChevronUp className="w-4 h-4" />
                      ) : (
                        <FiChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    {application.resume && (
                      <a
                        href={application.resume}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-2 rounded-lg transition-colors text-sm"
                      >
                        <FiDownload className="w-4 h-4" />
                        <span className="hidden sm:inline">Resume</span>
                      </a>
                    )}
                    {(application.status === "PENDING" || application.status === "REVIEWING") && (
                      <>
                        <button
                          onClick={() => handleAction("shortlist", application)}
                          disabled={updating === application.id}
                          className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-3 py-2 rounded-lg transition-colors text-sm disabled:opacity-50"
                        >
                          {updating === application.id ? (
                            <FiLoader className="w-4 h-4 animate-spin" />
                          ) : (
                            <FiCheck className="w-4 h-4" />
                          )}
                          <span className="hidden sm:inline">Shortlist</span>
                        </button>
                        <button
                          onClick={() => handleAction("reject", application)}
                          disabled={updating === application.id}
                          className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium px-3 py-2 rounded-lg transition-colors text-sm disabled:opacity-50"
                        >
                          <FiX className="w-4 h-4" />
                          <span className="hidden sm:inline">Reject</span>
                        </button>
                      </>
                    )}
                    {application.status === "SHORTLISTED" && (
                      <button
                        onClick={() => handleAction("interview", application)}
                        disabled={updating === application.id}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium px-3 py-2 rounded-lg transition-colors text-sm disabled:opacity-50"
                      >
                        <FiCalendar className="w-4 h-4" />
                        <span className="hidden sm:inline">Schedule</span>
                      </button>
                    )}
                    {application.status === "INTERVIEW" && (
                      <button
                        onClick={() => handleAction("hire", application)}
                        disabled={updating === application.id}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-3 py-2 rounded-lg transition-colors text-sm disabled:opacity-50"
                      >
                        <FiStar className="w-4 h-4" />
                        <span className="hidden sm:inline">Hire</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t border-gray-200 p-6 bg-gray-50">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                      {application.expectedSalary && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">Expected Salary</h4>
                          <p className="text-sm text-gray-700">{application.expectedSalary}</p>
                        </div>
                      )}
                      {application.noticePeriod && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">Notice Period</h4>
                          <p className="text-sm text-gray-700">{application.noticePeriod}</p>
                        </div>
                      )}
                      {application.availableFrom && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">Available From</h4>
                          <p className="text-sm text-gray-700">
                            {new Date(application.availableFrom).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Right Column */}
                    {application.coverLetter && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Cover Letter</h4>
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {application.coverLetter}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-200">
                    <a
                      href={`mailto:${application.applicantEmail}`}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm"
                    >
                      <FiMail className="w-4 h-4" />
                      Send Email
                    </a>
                    {application.applicantPhone && (
                      <a
                        href={`tel:${application.applicantPhone}`}
                        className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-300 transition-colors text-sm"
                      >
                        <FiPhone className="w-4 h-4" />
                        Call
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {!loading && filteredApplications.length === 0 && (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiFilter className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No applications found
          </h3>
          <p className="text-gray-600">
            {applications.length === 0 
              ? "You haven't received any applications yet. Share your job posts to attract candidates!"
              : "No applications match your current filters. Try adjusting your search criteria."
            }
          </p>
          {applications.length === 0 && (
            <Link
              href="/company/jobs"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiBriefcase className="w-4 h-4" />
              View Job Posts
            </Link>
          )}
        </div>
      )}

      {/* Action Confirmation Modal */}
      {showActionModal && selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => !updating && setShowActionModal(false)}
          />
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {actionType === "shortlist" && "Shortlist Candidate"}
              {actionType === "reject" && "Reject Candidate"}
              {actionType === "interview" && "Schedule Interview"}
              {actionType === "hire" && "Hire Candidate"}
            </h3>
            <p className="text-gray-600 mb-6">
              {actionType === "shortlist" && `Are you sure you want to shortlist ${selectedApplication.applicantName} for ${selectedApplication.job?.title}?`}
              {actionType === "reject" && `Are you sure you want to reject ${selectedApplication.applicantName}'s application?`}
              {actionType === "interview" && `Schedule an interview with ${selectedApplication.applicantName} for ${selectedApplication.job?.title}?`}
              {actionType === "hire" && `Congratulations! You are about to hire ${selectedApplication.applicantName} for ${selectedApplication.job?.title}.`}
            </p>

            {actionType === "interview" && (
              <div className="mb-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Interview Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Interview Type
                  </label>
                  <select
                    value={interviewType}
                    onChange={(e) => setInterviewType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option>Video Call</option>
                    <option>Phone Call</option>
                    <option>In-Person</option>
                  </select>
                </div>
              </div>
            )}

            {actionType === "reject" && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason (Optional)
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Provide feedback for the candidate..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                />
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowActionModal(false)}
                disabled={!!updating}
                className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                disabled={!!updating || (actionType === "interview" && !interviewDate)}
                className={`px-4 py-2 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 ${
                  actionType === "reject"
                    ? "bg-red-600 hover:bg-red-700"
                    : actionType === "interview"
                    ? "bg-purple-600 hover:bg-purple-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {updating && <FiLoader className="w-4 h-4 animate-spin" />}
                {actionType === "shortlist" && "Shortlist"}
                {actionType === "reject" && "Reject"}
                {actionType === "interview" && "Schedule Interview"}
                {actionType === "hire" && "Confirm Hire"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
