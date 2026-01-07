"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import {
  FiMapPin,
  FiDollarSign,
  FiClock,
  FiBriefcase,
  FiSearch,
  FiFilter,
  FiBookmark,
  FiEye,
  FiSend,
  FiX,
  FiUser,
  FiUsers,
  FiCalendar,
  FiLoader,
  FiAlertCircle,
  FiRefreshCw,
  FiCheck,
  FiGlobe,
  FiMessageSquare,
} from "react-icons/fi";
import { useRouter } from "next/navigation";

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
  _count?: {
    applications: number;
  };
  employer?: {
    id: string;
    name: string;
    email: string;
    image?: string;
    industry?: string;
    companySize?: string;
  };
}

const formatJobType = (type: string) => {
  return type?.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) || type;
};

const formatSalary = (min?: number, max?: number, period?: string) => {
  if (!min && !max) return null;

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

  if (period) {
    const periodLabels: Record<string, string> = {
      yearly: 'LPA',
      monthly: '/month',
      hourly: '/hour',
    };
    salary += ` ${periodLabels[period] || period}`;
  }

  return salary;
};

const formatExperience = (level?: string, min?: number, max?: number) => {
  if (level) return level;
  if (min && max) return `${min}-${max} years`;
  if (min) return `${min}+ years`;
  if (max) return `Up to ${max} years`;
  return null;
};

const formatTimeAgo = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
};

const parseSkills = (skillsStr?: string): string[] => {
  if (!skillsStr) return [];
  try {
    return JSON.parse(skillsStr);
  } catch {
    return skillsStr.split(',').map(s => s.trim()).filter(Boolean);
  }
};

export default function FindJobs() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const applyToJobId = searchParams.get('applyTo');

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [experienceFilter, setExperienceFilter] = useState("ALL");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [bookmarkedJobs, setBookmarkedJobs] = useState<string[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const [applying, setApplying] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();
    if (user) {
      fetchSavedJobs();
      fetchApplications();
    }
  }, [user]);

  // Handle applyTo query parameter - auto-select job when redirected from apply-job page
  useEffect(() => {
    if (applyToJobId && jobs.length > 0 && !loading) {
      const jobToApply = jobs.find(job => job.id === applyToJobId);
      if (jobToApply) {
        setSelectedJob(jobToApply);
        // Clear stored job IDs since we're now on the jobs page
        sessionStorage.removeItem('applyJobId');
        localStorage.removeItem('applyJobId');
      }
    }
  }, [applyToJobId, jobs, loading]);

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch only active jobs
      const response = await fetch('/api/jobs?status=ACTIVE');
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

  const fetchSavedJobs = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/saved-jobs?userId=${user.id}`);
      const data = await response.json();

      if (data.success) {
        const savedJobIds = data.savedJobs.map((item: any) => item.jobId);
        setBookmarkedJobs(savedJobIds);
        console.log('✅ Loaded saved jobs:', savedJobIds.length);
      }
    } catch (err) {
      console.error('Error fetching saved jobs:', err);
    }
  };

  const fetchApplications = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/jobs/applications?applicantId=${user.id}`);
      const data = await response.json();

      if (data.success) {
        const appliedJobIds = data.applications.map((app: any) => app.jobId);
        setAppliedJobs(appliedJobIds);
        console.log('✅ Loaded applications:', appliedJobIds.length);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
    }
  };

  // Get unique locations for filter
  const locations = [...new Set(jobs.map(job => job.city).filter(Boolean))];

  const filteredJobs = jobs.filter(job => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLocation = locationFilter === "ALL" ||
      job.city?.toLowerCase().includes(locationFilter.toLowerCase());

    const matchesType = typeFilter === "ALL" || job.jobType === typeFilter;

    // Experience filter logic
    let matchesExperience = true;
    if (experienceFilter !== "ALL") {
      const minExp = job.minExperience || 0;
      const maxExp = job.maxExperience || 99;

      if (experienceFilter === "0-1") {
        matchesExperience = minExp <= 1;
      } else if (experienceFilter === "2-3") {
        matchesExperience = minExp <= 3 && maxExp >= 2;
      } else if (experienceFilter === "3-5") {
        matchesExperience = minExp <= 5 && maxExp >= 3;
      } else if (experienceFilter === "5+") {
        matchesExperience = maxExp >= 5;
      }
    }

    return matchesSearch && matchesLocation && matchesType && matchesExperience;
  });

  const toggleBookmark = async (jobId: string) => {
    if (!user) {
      alert('Please sign in to save jobs');
      return;
    }

    const isSaved = bookmarkedJobs.includes(jobId);

    try {
      if (isSaved) {
        // Unsave the job
        const response = await fetch(`/api/saved-jobs?userId=${user.id}&jobId=${jobId}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (data.success) {
          setBookmarkedJobs(prev => prev.filter(id => id !== jobId));
          console.log('✅ Job unsaved successfully');
        } else {
          alert(data.message || 'Failed to unsave job');
        }
      } else {
        // Save the job
        const response = await fetch('/api/saved-jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, jobId }),
        });

        const data = await response.json();

        if (data.success) {
          setBookmarkedJobs(prev => [...prev, jobId]);
          console.log('✅ Job saved successfully');
        } else {
          alert(data.message || 'Failed to save job');
        }
      }
    } catch (err) {
      console.error('Error toggling bookmark:', err);
      alert('Failed to update bookmark');
    }
  };

  const handleApply = async (job: Job) => {
    if (!user) {
      alert("Please sign in to apply for jobs");
      return;
    }

    setApplying(job.id);

    try {
      const response = await fetch('/api/jobs/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job.id,
          applicantId: user.id,
          applicantName: user.name,
          applicantEmail: user.email,
          applicantPhone: user.phone || '',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setAppliedJobs(prev => [...prev, job.id]);

        // Auto-create conversation with employer
        try {
          await fetch('/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              senderId: user.id,
              receiverId: job.employer?.id,
              content: `Hi, I just applied for the ${job.title} position. I'm very interested in this opportunity and would love to discuss it further!`,
              type: 'JOB',
              orderId: job.id
            }),
          });
          console.log('✅ Conversation created with employer');
        } catch (convErr) {
          console.error('Failed to create conversation:', convErr);
        }

        alert("Application submitted successfully! You can now message the employer.");
        setSelectedJob(null);

        // Clear any stored redirect URLs and job IDs after successful application
        sessionStorage.removeItem('applyJobId');
        sessionStorage.removeItem('redirectAfterLogin');
        localStorage.removeItem('applyJobId');
        localStorage.removeItem('redirectAfterLogin');
      } else {
        alert(data.message || "Failed to submit application");
      }
    } catch (err) {
      console.error("Error applying:", err);
      alert("Failed to submit application");
    } finally {
      setApplying(null);
    }
  };

  const handleMessageEmployer = async (job: Job) => {
    if (!user) {
      alert("Please sign in to message employers");
      return;
    }

    if (!job.employer?.id) {
      alert("Employer information not available");
      return;
    }

    try {
      const hasApplied = appliedJobs.includes(job.id);
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: user.id,
          receiverId: job.employer.id,
          content: hasApplied
            ? `Hi, I applied for the ${job.title} position. I'd like to discuss this opportunity further.`
            : `Hi, I'm interested in the ${job.title} position. Could you tell me more about this role?`,
          type: 'JOB',
          orderId: job.id
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push(`/buyer/messages/jobs?chat=${job.employer.id}`);
      } else {
        alert(data.message || "Failed to start conversation");
      }
    } catch (err) {
      console.error("Error creating conversation:", err);
      alert("Failed to message employer");
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FiLoader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Find Jobs</h1>
          <p className="text-gray-600 mt-1">Discover your next career opportunity</p>
        </div>
        <button
          onClick={fetchJobs}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all text-sm font-medium shadow-sm"
        >
          <FiRefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <FiAlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-red-700">{error}</p>
          <button onClick={fetchJobs} className="ml-auto text-red-600 font-medium hover:text-red-700">
            Try Again
          </button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs, companies, skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0053B0] focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0053B0] focus:border-transparent"
              >
                <option value="ALL">All Locations</option>
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0053B0] focus:border-transparent"
              >
                <option value="ALL">All Types</option>
                <option value="FULL_TIME">Full-time</option>
                <option value="PART_TIME">Part-time</option>
                <option value="CONTRACT">Contract</option>
                <option value="FREELANCE">Freelance</option>
                <option value="INTERNSHIP">Internship</option>
                <option value="REMOTE">Remote</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
              <select
                value={experienceFilter}
                onChange={(e) => setExperienceFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0053B0] focus:border-transparent"
              >
                <option value="ALL">All Levels</option>
                <option value="0-1">0-1 years</option>
                <option value="2-3">2-3 years</option>
                <option value="3-5">3-5 years</option>
                <option value="5+">5+ years</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Jobs</p>
              <p className="text-2xl font-bold text-gray-900">{filteredJobs.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiBriefcase className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Bookmarked</p>
              <p className="text-2xl font-bold text-gray-900">{bookmarkedJobs.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiBookmark className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Applied</p>
              <p className="text-2xl font-bold text-gray-900">{appliedJobs.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FiSend className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Job Listings */}
      <div className="space-y-4">
        {filteredJobs.map((job) => {
          const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryPeriod);
          const experience = formatExperience(job.experienceLevel, job.minExperience, job.maxExperience);
          const skills = parseSkills(job.skills);
          const applicants = job._count?.applications || 0;
          const companyInitials = (job.companyName || job.employer?.name || 'C')
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .slice(0, 2)
            .toUpperCase();

          return (
            <div
              key={job.id}
              className={`bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow ${job.featured ? 'ring-2 ring-yellow-400' : ''
                }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {/* Company Logo */}
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-xl">{companyInitials}</span>
                  </div>

                  {/* Job Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
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
                        <p className="text-lg text-gray-700 mb-1">{job.companyName || job.employer?.name}</p>
                      </div>
                      <button
                        onClick={() => toggleBookmark(job.id)}
                        className={`p-2 rounded-lg transition-colors ${bookmarkedJobs.includes(job.id)
                          ? "text-[#0053B0] bg-blue-50 hover:bg-blue-100"
                          : "text-gray-400 hover:text-[#0053B0] hover:bg-blue-50"
                          }`}
                      >
                        <FiBookmark className={`w-5 h-5 ${bookmarkedJobs.includes(job.id) ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FiMapPin className="w-4 h-4" />
                        <span>
                          {job.city || job.location || 'Location not specified'}
                          {job.isRemote && (
                            <span className="ml-1 text-blue-600">(Remote)</span>
                          )}
                        </span>
                      </div>
                      {salary && job.showSalary && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FiDollarSign className="w-4 h-4" />
                          <span>{salary}</span>
                        </div>
                      )}
                      {experience && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FiClock className="w-4 h-4" />
                          <span>{experience}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FiUsers className="w-4 h-4" />
                        <span>{applicants} applicants</span>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {job.description}
                    </p>

                    {/* Skills */}
                    {skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {skills.slice(0, 4).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded"
                          >
                            {skill}
                          </span>
                        ))}
                        {skills.length > 4 && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">
                            +{skills.length - 4} more
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {formatJobType(job.jobType)}
                        </span>
                        <span className="text-xs text-gray-500">
                          <FiCalendar className="w-3 h-3 inline mr-1" />
                          Posted {formatTimeAgo(job.postedAt || job.createdAt)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedJob(job)}
                          className="flex items-center gap-1 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          <FiEye className="w-4 h-4" />
                          View Details
                        </button>
                        <button
                          onClick={() => handleMessageEmployer(job)}
                          className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-primary-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <FiMessageSquare className="w-4 h-4" />
                          Message
                        </button>
                        {appliedJobs.includes(job.id) ? (
                          <button
                            disabled
                            className="flex items-center gap-1 px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium cursor-default"
                          >
                            <FiCheck className="w-4 h-4" />
                            Applied
                          </button>
                        ) : (
                          <button
                            onClick={() => handleApply(job)}
                            disabled={applying === job.id}
                            className="flex items-center gap-1 px-4 py-2 border-2 border-primary-500 text-primary-600 rounded-lg hover:bg-gradient-to-r hover:from-primary-300 hover:to-primary-500 hover:text-white hover:border-transparent transition-all text-sm font-medium disabled:opacity-50"
                          >
                            {applying === job.id ? (
                              <FiLoader className="w-4 h-4 animate-spin" />
                            ) : (
                              <FiSend className="w-4 h-4" />
                            )}
                            Apply Now
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {!loading && filteredJobs.length === 0 && (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiBriefcase className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || locationFilter !== "ALL" || typeFilter !== "ALL" || experienceFilter !== "ALL"
              ? "Try adjusting your search criteria"
              : "Check back later for new opportunities"
            }
          </p>
          {(searchQuery || locationFilter !== "ALL" || typeFilter !== "ALL" || experienceFilter !== "ALL") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setLocationFilter("ALL");
                setTypeFilter("ALL");
                setExperienceFilter("ALL");
              }}
              className="text-blue-600 font-medium hover:text-blue-700"
            >
              Clear all filters
            </button>
          )}
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
                  <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center p-1">
                    <div className="w-full h-full bg-white rounded-lg flex items-center justify-center">
                      <span className="text-primary-600 font-bold text-2xl">
                        {(selectedJob.companyName || selectedJob.employer?.name || 'C')
                          .split(' ')
                          .map(word => word.charAt(0))
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-2xl font-semibold text-gray-900">{selectedJob.title}</h3>
                      {selectedJob.featured && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">
                          Featured
                        </span>
                      )}
                    </div>
                    <p className="text-lg text-gray-700 mb-3">{selectedJob.companyName || selectedJob.employer?.name}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <FiMapPin className="w-5 h-5 text-primary-500" />
                        <span>
                          {selectedJob.city && `${selectedJob.city}, `}
                          {selectedJob.state && `${selectedJob.state}, `}
                          {selectedJob.country}
                          {selectedJob.isRemote && (
                            <span className="ml-2 px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full">
                              Remote
                            </span>
                          )}
                        </span>
                      </div>
                      {selectedJob.showSalary && formatSalary(selectedJob.salaryMin, selectedJob.salaryMax, selectedJob.salaryPeriod) && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <FiDollarSign className="w-5 h-5 text-primary-500" />
                          <span>{formatSalary(selectedJob.salaryMin, selectedJob.salaryMax, selectedJob.salaryPeriod)}</span>
                        </div>
                      )}
                      {formatExperience(selectedJob.experienceLevel, selectedJob.minExperience, selectedJob.maxExperience) && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <FiClock className="w-5 h-5 text-primary-500" />
                          <span>{formatExperience(selectedJob.experienceLevel, selectedJob.minExperience, selectedJob.maxExperience)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-gray-600">
                        <FiUsers className="w-5 h-5 text-primary-500" />
                        <span>{selectedJob._count?.applications || 0} applicants</span>
                      </div>
                      {selectedJob.employer?.industry && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <FiBriefcase className="w-5 h-5 text-primary-500" />
                          <span>{selectedJob.employer.industry}</span>
                        </div>
                      )}
                      {selectedJob.employer?.companySize && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <FiUser className="w-5 h-5 text-primary-500" />
                          <span>{selectedJob.employer.companySize} employees</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Skills */}
                {parseSkills(selectedJob.skills).length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-primary-600 mb-3">Required Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {parseSkills(selectedJob.skills).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 bg-gray-50 text-gray-700 border border-gray-100 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Job Description */}
                <div>
                  <h4 className="text-lg font-semibold text-primary-600 mb-3">Job Description</h4>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedJob.description}</p>
                </div>

                {/* Requirements */}
                {selectedJob.requirements && (
                  <div>
                    <h4 className="text-lg font-semibold text-primary-600 mb-3">Requirements</h4>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedJob.requirements}</p>
                  </div>
                )}

                {/* Responsibilities */}
                {selectedJob.responsibilities && (
                  <div>
                    <h4 className="text-lg font-semibold text-primary-600 mb-3">Key Responsibilities</h4>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedJob.responsibilities}</p>
                  </div>
                )}

                {/* Benefits */}
                {selectedJob.benefits && (
                  <div>
                    <h4 className="text-lg font-semibold text-primary-600 mb-3">Benefits & Perks</h4>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedJob.benefits}</p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-200 flex justify-end gap-3 bg-gray-50/50 rounded-b-xl">
                <button
                  onClick={() => toggleBookmark(selectedJob.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors text-sm border shadow-sm ${bookmarkedJobs.includes(selectedJob.id)
                    ? "bg-primary-50 text-primary-600 border-primary-200 hover:bg-primary-100"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                >
                  <FiBookmark className={`w-4 h-4 ${bookmarkedJobs.includes(selectedJob.id) ? "fill-current" : ""}`} />
                  {bookmarkedJobs.includes(selectedJob.id) ? "Bookmarked" : "Bookmark"}
                </button>

                <button
                  onClick={() => handleMessageEmployer(selectedJob)}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 shadow-sm transition-colors text-sm"
                >
                  <FiMessageSquare className="w-4 h-4" />
                  Message Employer
                </button>



                {appliedJobs.includes(selectedJob.id) ? (
                  <button
                    disabled
                    className="flex items-center gap-2 px-6 py-2 bg-green-100 text-green-700 rounded-xl font-medium cursor-default shadow-sm"
                  >
                    <FiCheck className="w-4 h-4" />
                    Already Applied
                  </button>
                ) : (
                  <button
                    onClick={() => handleApply(selectedJob)}
                    disabled={applying === selectedJob.id}
                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-primary-300 to-primary-500 text-white rounded-xl hover:from-primary-400 hover:to-primary-600 shadow-md hover:shadow-lg transition-all font-medium text-sm disabled:opacity-50"
                  >
                    {applying === selectedJob.id ? (
                      <FiLoader className="w-4 h-4 animate-spin" />
                    ) : (
                      <FiSend className="w-4 h-4" />
                    )}
                    Apply for this Job
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
