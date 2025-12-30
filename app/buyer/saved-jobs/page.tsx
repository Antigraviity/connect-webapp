"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import {
  FiBookmark,
  FiMapPin,
  FiDollarSign,
  FiBriefcase,
  FiClock,
  FiTrash2,
  FiExternalLink,
  FiSearch,
  FiX,
  FiUsers,
  FiLoader,
  FiAlertCircle,
  FiRefreshCw,
} from "react-icons/fi";

interface SavedJob {
  id: string;
  userId: string;
  jobId: string;
  createdAt: string;
  job: {
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
    isRemote: boolean;
    status: string;
    featured: boolean;
    postedAt?: string;
    createdAt: string;
    companyName?: string;
    companyLogo?: string;
    employer?: {
      id: string;
      name: string;
      email: string;
      image?: string;
    };
    _count?: {
      applications: number;
    };
  };
}

export default function SavedJobsPage() {
  const { user } = useAuth();
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedJob, setSelectedJob] = useState<SavedJob | null>(null);
  const [removingJobId, setRemovingJobId] = useState<string | null>(null);

  // Fetch saved jobs
  useEffect(() => {
    const fetchSavedJobs = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/saved-jobs?userId=${user.id}`);
        const data = await response.json();

        if (data.success) {
          console.log('✅ Fetched saved jobs:', data.savedJobs.length);
          setSavedJobs(data.savedJobs || []);
        } else {
          setError(data.message || 'Failed to fetch saved jobs');
        }
      } catch (err) {
        console.error('Error fetching saved jobs:', err);
        setError('Failed to load saved jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchSavedJobs();
  }, [user]);

  // Handle unsave job
  const handleUnsaveJob = async (jobId: string) => {
    if (!user) return;

    setRemovingJobId(jobId);

    try {
      const response = await fetch(`/api/saved-jobs?userId=${user.id}&jobId=${jobId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        // Remove from local state
        setSavedJobs(savedJobs.filter(savedJob => savedJob.job.id !== jobId));
        if (selectedJob?.job.id === jobId) {
          setSelectedJob(null);
        }
        console.log('✅ Job unsaved successfully');
      } else {
        alert(data.message || 'Failed to unsave job');
      }
    } catch (err) {
      console.error('Error unsaving job:', err);
      alert('Failed to unsave job');
    } finally {
      setRemovingJobId(null);
    }
  };

  // Format salary
  const formatSalary = (job: SavedJob['job']) => {
    if (!job.showSalary) return 'Not disclosed';
    const min = job.salaryMin;
    const max = job.salaryMax;
    const period = job.salaryPeriod || 'yearly';

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
  const getLocation = (job: SavedJob['job']) => {
    const parts = [];
    if (job.city) parts.push(job.city);
    if (job.state) parts.push(job.state);
    if (parts.length === 0 && job.location) return job.location;
    return parts.join(', ') || 'Location not specified';
  };

  // Get company name
  const getCompanyName = (job: SavedJob['job']) => {
    return job.companyName || job.employer?.name || 'Company';
  };

  // Get job type display
  const getJobTypeDisplay = (jobType: string) => {
    return jobType.replace('_', ' ');
  };

  // Get experience display
  const getExperienceDisplay = (job: SavedJob['job']) => {
    const min = job.minExperience;
    const max = job.maxExperience;

    if (min && max) {
      return `${min}-${max} years`;
    } else if (min) {
      return `${min}+ years`;
    } else if (max) {
      return `Up to ${max} years`;
    } else if (job.experienceLevel) {
      return job.experienceLevel;
    }

    return 'Experience not specified';
  };

  // Parse skills
  const getSkills = (job: SavedJob['job']) => {
    try {
      if (job.skills) {
        const parsed = JSON.parse(job.skills);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (e) {
      // If not JSON, try splitting by comma
      if (job.skills) {
        return job.skills.split(',').map(s => s.trim()).filter(Boolean);
      }
    }
    return [];
  };

  // Time ago
  const timeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? 's' : ''} ago`;
  };

  // Filter jobs
  const filteredJobs = savedJobs.filter(savedJob => {
    const job = savedJob.job;
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getCompanyName(job).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "all" || job.jobType.toLowerCase() === filterType.toLowerCase().replace('-', '_');
    return matchesSearch && matchesFilter;
  });

  // Building icon component for fallback
  const BuildingIcon = () => (
    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );

  // Not logged in
  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <FiAlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Please sign in</h3>
          <p className="text-gray-600 mb-6">You need to be signed in to view your saved jobs</p>
          <Link
            href="/signin"
            className="inline-flex items-center px-6 py-3 bg-[#0053B0] text-white rounded-lg hover:bg-[#003d85] transition-colors"
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
          <p className="text-gray-600">Loading your saved jobs...</p>
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
            <h3 className="text-lg font-semibold text-red-900">Error Loading Saved Jobs</h3>
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
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Saved Jobs</h1>
        <p className="text-gray-600 mt-1">
          {savedJobs.length} job{savedJobs.length !== 1 ? 's' : ''} saved for later review
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search saved jobs..."
                value={searchQuery}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filter */}
          <div className="sm:w-48">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
              <option value="freelance">Freelance</option>
              <option value="remote">Remote</option>
            </select>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      {filteredJobs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <FiBookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Saved Jobs</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || filterType !== "all"
              ? "No jobs match your search criteria"
              : "Start saving jobs you're interested in to view them here"}
          </p>
          <Link
            href="/buyer/jobs"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-300 to-primary-500 text-white rounded-xl hover:from-primary-400 hover:to-primary-600 shadow-md hover:shadow-lg transition-all"
          >
            <FiBriefcase className="w-4 h-4" />
            Browse Jobs
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((savedJob) => {
            const job = savedJob.job;
            const companyName = getCompanyName(job);
            const location = getLocation(job);
            const salary = formatSalary(job);
            const experience = getExperienceDisplay(job);
            const skills = getSkills(job);
            const isRemoving = removingJobId === job.id;

            return (
              <div
                key={savedJob.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  {/* Job Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      {/* Company Logo */}
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        {job.companyLogo ? (
                          <img src={job.companyLogo} alt={companyName} className="w-full h-full rounded-lg object-cover" />
                        ) : (
                          <BuildingIcon />
                        )}
                      </div>

                      {/* Job Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                              {job.title}
                            </h3>
                            <p className="text-gray-600 mt-1">{companyName}</p>
                          </div>
                        </div>

                        {/* Job Meta */}
                        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <FiMapPin className="w-4 h-4" />
                            <span>{location}</span>
                            {job.isRemote && (
                              <span className="ml-1 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                                Remote
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <FiBriefcase className="w-4 h-4" />
                            <span>{getJobTypeDisplay(job.jobType)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FiClock className="w-4 h-4" />
                            <span>{experience}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FiDollarSign className="w-4 h-4" />
                            <span className="font-medium text-gray-900">{salary}</span>
                          </div>
                        </div>

                        {/* Skills */}
                        {skills.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {skills.slice(0, 5).map((skill, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium"
                              >
                                {skill}
                              </span>
                            ))}
                            {skills.length > 5 && (
                              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                                +{skills.length - 5} more
                              </span>
                            )}
                          </div>
                        )}

                        {/* Description Preview */}
                        <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                          {job.description}
                        </p>

                        {/* Dates */}
                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                          {job.postedAt && <span>Posted {timeAgo(job.postedAt)}</span>}
                          {job.postedAt && <span>•</span>}
                          <span>Saved {timeAgo(savedJob.createdAt)}</span>
                          {job._count && (
                            <>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <FiUsers className="w-3 h-3" />
                                <span>{job._count.applications} applicants</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex lg:flex-col gap-2 lg:ml-4">
                    <button
                      onClick={() => setSelectedJob(savedJob)}
                      className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-300 to-primary-500 text-white rounded-xl hover:from-primary-400 hover:to-primary-600 shadow-sm hover:shadow-md transition-all text-sm font-medium"
                    >
                      <FiExternalLink className="w-4 h-4" />
                      View Details
                    </button>
                    <button
                      onClick={() => handleUnsaveJob(job.id)}
                      disabled={isRemoving}
                      className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                      {isRemoving ? (
                        <FiLoader className="w-4 h-4 animate-spin" />
                      ) : (
                        <FiTrash2 className="w-4 h-4" />
                      )}
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Stats Summary */}
      {filteredJobs.length > 0 && (
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-700">
              <FiBookmark className="w-5 h-5" />
              <span className="font-medium">
                Showing {filteredJobs.length} of {savedJobs.length} saved jobs
              </span>
            </div>
            <Link
              href="/buyer/jobs"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
            >
              Browse More Jobs
              <FiExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Job Detail Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSelectedJob(null)}></div>
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 z-10 bg-gradient-to-r from-primary-500 to-primary-700 flex items-center justify-between p-6 shadow-md">
                <h2 className="text-xl font-bold text-white">Job Details</h2>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Job Header */}
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#0053B0] to-[#003d85] rounded-lg flex items-center justify-center">
                    {selectedJob.job.companyLogo ? (
                      <img src={selectedJob.job.companyLogo} alt={getCompanyName(selectedJob.job)} className="w-full h-full rounded-lg object-cover" />
                    ) : (
                      <span className="text-white font-bold text-2xl">
                        {getCompanyName(selectedJob.job).split(' ').map((word: string) => word.charAt(0)).join('').slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">{selectedJob.job.title}</h3>
                    <p className="text-lg text-gray-700 mb-3">{getCompanyName(selectedJob.job)}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <FiMapPin className="w-5 h-5 text-[#0053B0]" />
                        <span>{getLocation(selectedJob.job)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <FiDollarSign className="w-5 h-5 text-[#0053B0]" />
                        <span>{formatSalary(selectedJob.job)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <FiClock className="w-5 h-5 text-[#0053B0]" />
                        <span>{getExperienceDisplay(selectedJob.job)}</span>
                      </div>
                      {selectedJob.job._count && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <FiUsers className="w-5 h-5 text-[#0053B0]" />
                          <span>{selectedJob.job._count.applications} applicants</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Job Description */}
                <div>
                  <h4 className="text-lg font-semibold text-[#0053B0] mb-3">Job Description</h4>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedJob.job.description}</p>
                </div>

                {/* Skills */}
                {getSkills(selectedJob.job).length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-[#0053B0] mb-3">Required Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {getSkills(selectedJob.job).map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => {
                    handleUnsaveJob(selectedJob.job.id);
                    setSelectedJob(null);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl hover:bg-red-100 transition-colors font-medium text-sm"
                >
                  <FiTrash2 className="w-4 h-4" />
                  Remove
                </button>
                <Link
                  href={`/buyer/jobs?applyTo=${selectedJob.job.id}`}
                  className="px-6 py-2 bg-gradient-to-r from-primary-300 to-primary-500 text-white rounded-xl hover:from-primary-400 hover:to-primary-600 shadow-md hover:shadow-lg transition-all font-medium text-sm"
                >
                  Apply
                </Link>
              </div>
            </div>
          </div>
        </div>
      )
      }
    </div >
  );
}
