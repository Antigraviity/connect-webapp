"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import {
  FiCalendar,
  FiMapPin,
  FiDollarSign,
  FiClock,
  FiSearch,
  FiFilter,
  FiEye,
  FiX,
  FiFileText,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiSend,
  FiLoader,
  FiRefreshCw
} from "react-icons/fi";

interface Application {
  id: string;
  jobId: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  resumeUrl?: string;
  coverLetter?: string;
  status: string;
  appliedAt: string;
  updatedAt: string;
  interviewDate?: string;
  interviewTime?: string;
  job: {
    id: string;
    title: string;
    slug: string;
    companyName?: string;
    location?: string;
    city?: string;
    state?: string;
    salaryMin?: number;
    salaryMax?: number;
    salaryPeriod?: string;
    showSalary: boolean;
    description?: string;
    employer?: {
      id: string;
      name: string;
      email: string;
    };
  };
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "UNDER_REVIEW":
      return "bg-yellow-100 text-yellow-800";
    case "INTERVIEW_SCHEDULED":
      return "bg-blue-100 text-blue-800";
    case "INTERVIEW_COMPLETED":
      return "bg-purple-100 text-purple-800";
    case "ACCEPTED":
      return "bg-green-100 text-green-800";
    case "REJECTED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "UNDER_REVIEW":
      return <FiAlertCircle className="w-4 h-4" />;
    case "INTERVIEW_SCHEDULED":
      return <FiCalendar className="w-4 h-4" />;
    case "INTERVIEW_COMPLETED":
      return <FiCheckCircle className="w-4 h-4" />;
    case "ACCEPTED":
      return <FiCheckCircle className="w-4 h-4" />;
    case "REJECTED":
      return <FiXCircle className="w-4 h-4" />;
    default:
      return <FiFileText className="w-4 h-4" />;
  }
};

export default function MyApplications() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);


  // Fetch applications from API
  useEffect(() => {
    const fetchApplications = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/jobs/applications?applicantId=${user.id}`);
        const data = await response.json();

        if (data.success) {
          console.log('✅ Fetched applications:', data.applications.length);
          setApplications(data.applications || []);
        } else {
          setError(data.message || 'Failed to fetch applications');
        }
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError('Failed to load applications');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [user]);

  const filteredApplications = applications.filter(application => {
    const matchesSearch = application.job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (application.job.companyName || application.job.employer?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || application.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Format salary
  const formatSalary = (app: Application) => {
    if (!app.job.showSalary) return 'Not disclosed';
    const min = app.job.salaryMin;
    const max = app.job.salaryMax;
    const period = app.job.salaryPeriod || 'yearly';

    if (!min && !max) return 'Not disclosed';

    const formatNum = (n: number) => {
      if (n >= 100000) return `₹${(n / 100000).toFixed(0)}L`;
      if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
      return `₹${n}`;
    };

    let salary = '';
    if (min && max) {
      salary = `${formatNum(min)}-${formatNum(max)}`;
    } else if (min) {
      salary = `${formatNum(min)}+`;
    } else if (max) {
      salary = `Up to ${formatNum(max)}`;
    }

    if (period === 'yearly') {
      salary += ' LPA';
    } else if (period === 'monthly') {
      salary += '/month';
    }

    return salary;
  };

  // Get location
  const getLocation = (app: Application) => {
    const parts = [];
    if (app.job.city) parts.push(app.job.city);
    if (app.job.state) parts.push(app.job.state);
    if (parts.length === 0 && app.job.location) return app.job.location;
    return parts.join(', ') || 'Location not specified';
  };

  // Get company name
  const getCompanyName = (app: Application) => {
    return app.job.companyName || app.job.employer?.name || 'Company';
  };

  // Get company initials
  const getCompanyInitials = (companyName: string) => {
    return companyName
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  // If not logged in
  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <FiAlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Please sign in</h3>
          <p className="text-gray-600 mb-6">You need to be signed in to view your applications</p>
          <Link
            href="/signin"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-300 to-primary-500 text-white rounded-xl hover:from-primary-400 hover:to-primary-600 shadow-md hover:shadow-lg transition-all"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FiLoader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your applications...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <FiAlertCircle className="w-6 h-6 text-red-500" />
            <h3 className="text-lg font-semibold text-red-900">Error Loading Applications</h3>
          </div>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <FiRefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
          <p className="text-gray-600 mt-1">Track and manage your job applications</p>
        </div>
        <Link
          href="/buyer/jobs"
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-300 to-primary-500 text-white rounded-xl hover:from-primary-400 hover:to-primary-600 shadow-md hover:shadow-lg transition-all"
        >
          Find More Jobs
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0053B0] focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0053B0] focus:border-transparent"
            >
              <option value="ALL">All Status</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
              <option value="INTERVIEW_COMPLETED">Interview Completed</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Applied</p>
              <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiSend className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Under Review</p>
              <p className="text-2xl font-bold text-gray-900">
                {applications.filter(app => app.status === 'PENDING' || app.status === 'UNDER_REVIEW').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <FiAlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Interviews</p>
              <p className="text-2xl font-bold text-gray-900">
                {applications.filter(app => app.status === 'INTERVIEW_SCHEDULED' || app.status === 'INTERVIEWING').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FiCalendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Accepted</p>
              <p className="text-2xl font-bold text-gray-900">
                {applications.filter(app => app.status === 'ACCEPTED' || app.status === 'HIRED').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FiCheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">
                {applications.filter(app => app.status === 'REJECTED').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <FiXCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">All Applications</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredApplications.map((application) => {
            const companyName = getCompanyName(application);
            const companyInitials = getCompanyInitials(companyName);
            const location = getLocation(application);
            const salary = formatSalary(application);

            return (
              <div key={application.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Company Logo Placeholder */}
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-xl">
                        {companyInitials}
                      </span>
                    </div>

                    {/* Application Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {application.job.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">{companyName}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                              application.status
                            )}`}
                          >
                            {getStatusIcon(application.status)}
                            {application.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FiMapPin className="w-4 h-4" />
                          <span>{location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FiDollarSign className="w-4 h-4" />
                          <span>{salary}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FiCalendar className="w-4 h-4" />
                          <span>Applied: {new Date(application.appliedAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Application Notes */}
                      {application.coverLetter && (
                        <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                          {application.coverLetter}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="text-right ml-4">
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => setSelectedApplication(application)}
                        className="flex items-center gap-1 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                      >
                        <FiEye className="w-4 h-4" />
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredApplications.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiFileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || statusFilter !== "ALL"
                ? "Try adjusting your search or filter criteria"
                : "You haven't applied to any jobs yet"
              }
            </p>
            <Link
              href="/buyer/jobs"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-300 to-primary-500 text-white rounded-xl hover:from-primary-400 hover:to-primary-600 shadow-md hover:shadow-lg transition-all"
            >
              Find Jobs to Apply
            </Link>
          </div>
        )}
      </div>

      {/* Application Detail Modal */}
      {selectedApplication && mounted && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-primary-500 to-primary-700 rounded-t-xl">
              <h2 className="text-xl font-bold text-white">Application Details</h2>
              <button
                onClick={() => setSelectedApplication(null)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">
                    {getCompanyInitials(getCompanyName(selectedApplication))}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {selectedApplication.job.title}
                  </h3>
                  <p className="text-gray-600 mb-3">{getCompanyName(selectedApplication)}</p>
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(
                      selectedApplication.status
                    )}`}
                  >
                    {getStatusIcon(selectedApplication.status)}
                    {selectedApplication.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Application Info</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <FiMapPin className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-600">{getLocation(selectedApplication)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiDollarSign className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-600">{formatSalary(selectedApplication)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiCalendar className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-600">
                        Applied: {new Date(selectedApplication.appliedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedApplication.status === 'INTERVIEW_SCHEDULED' && selectedApplication.interviewDate && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Interview Details</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <FiCalendar className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-600">
                          {new Date(selectedApplication.interviewDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiClock className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-600">{selectedApplication.interviewTime}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {selectedApplication.job.description && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Job Description</h4>
                  <p className="text-gray-600 whitespace-pre-wrap">{selectedApplication.job.description}</p>
                </div>
              )}

              {selectedApplication.coverLetter && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Cover Letter</h4>
                  <p className="text-gray-600 whitespace-pre-wrap">{selectedApplication.coverLetter}</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <Link
                href="/buyer/jobs"
                className="px-6 py-2 text-center bg-gradient-to-r from-primary-300 to-primary-500 text-white rounded-xl hover:from-primary-400 hover:to-primary-600 shadow-md hover:shadow-lg transition-all"
              >
                Find Similar Jobs
              </Link>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
