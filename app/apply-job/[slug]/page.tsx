"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  Building2,
  ArrowLeft,
  CheckCircle,
  Users,
  Calendar,
  Globe,
  Mail,
  Phone,
  FileText,
  Send,
  Loader2,
  X
} from "lucide-react";

interface Job {
  id: string;
  title: string;
  slug: string;
  description: string;
  requirements: string | null;
  responsibilities: string | null;
  benefits: string | null;
  jobType: string;
  experienceLevel: string | null;
  minExperience: number | null;
  maxExperience: number | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryPeriod: string | null;
  showSalary: boolean;
  location: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  isRemote: boolean;
  status: string;
  featured: boolean;
  urgent: boolean;
  views: number;
  companyName: string | null;
  companyLogo: string | null;
  companyWebsite: string | null;
  skills: string | null;
  postedAt: string | null;
  deadline: string | null;
  createdAt: string;
  employer: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    image: string | null;
    verified: boolean;
  };
  _count: {
    applications: number;
  };
}

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Application form state
  const [applyForm, setApplyForm] = useState({
    name: '',
    email: '',
    phone: '',
    coverLetter: '',
    resume: null as File | null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Check authentication
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
        setIsAuthenticated(true);
        setApplyForm(prev => ({
          ...prev,
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
        }));
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  // Fetch job details
  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/jobs?slug=${slug}`);
        const data = await response.json();

        if (data.success && data.jobs && data.jobs.length > 0) {
          setJob(data.jobs[0]);
        } else {
          setError('Job not found');
        }
      } catch (err) {
        console.error('Error fetching job:', err);
        setError('Failed to load job details');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchJob();
    }
  }, [slug]);

  // Format functions
  const formatJobType = (jobType: string) => {
    return jobType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatSalary = (job: Job) => {
    if (!job.showSalary || !job.salaryMin) return 'Not disclosed';

    const formatAmount = (amount: number) => {
      if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
      if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
      return `₹${amount}`;
    };

    const period = job.salaryPeriod === 'yearly' ? '/year' : '/month';

    if (job.salaryMax && job.salaryMax !== job.salaryMin) {
      return `${formatAmount(job.salaryMin)} - ${formatAmount(job.salaryMax)}${period}`;
    }
    return `${formatAmount(job.salaryMin)}${period}`;
  };

  const formatExperience = (job: Job) => {
    if (!job.minExperience && !job.maxExperience) return 'Not specified';
    if (job.minExperience === 0 && (!job.maxExperience || job.maxExperience === 0)) return 'Fresher';
    if (job.minExperience && job.maxExperience) {
      return `${job.minExperience}-${job.maxExperience} years`;
    }
    if (job.minExperience) return `${job.minExperience}+ years`;
    return 'Not specified';
  };

  const getTimeAgo = (dateString: string | null) => {
    if (!dateString) return 'Recently';

    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  const getLocation = (job: Job) => {
    if (job.isRemote) return 'Remote';
    const parts = [];
    if (job.city) parts.push(job.city);
    if (job.state) parts.push(job.state);
    if (job.country) parts.push(job.country);
    return parts.length > 0 ? parts.join(', ') : (job.location || 'Not specified');
  };

  // Handle Apply button click
  const handleApplyClick = () => {
    if (!isAuthenticated) {
      // Store job info and redirect to signin
      sessionStorage.setItem('applyJobId', job?.id || '');
      sessionStorage.setItem('redirectAfterLogin', `/apply-job/${slug}`);
      router.push(`/signin?redirect=${encodeURIComponent(`/apply-job/${slug}`)}`);
      return;
    }
    setShowApplyModal(true);
  };

  // Handle application submission
  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!job || !user) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/jobs/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job.id,
          applicantId: user.id,
          applicantName: applyForm.name,
          applicantEmail: applyForm.email,
          applicantPhone: applyForm.phone,
          coverLetter: applyForm.coverLetter,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitSuccess(true);
      } else {
        setSubmitError(data.message || 'Failed to submit application');
      }
    } catch (err) {
      console.error('Error submitting application:', err);
      setSubmitError('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The job you\'re looking for doesn\'t exist.'}</p>
          <Link
            href="/apply-job"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-full hover:bg-primary-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Browse All Jobs
          </Link>
        </div>
      </div>
    );
  }

  // Parse skills if available
  const skills = job.skills ? JSON.parse(job.skills) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link
            href="/apply-job"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Jobs
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Job Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start gap-4">
                {/* Company Logo */}
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  {job.companyLogo ? (
                    <img
                      src={job.companyLogo}
                      alt={job.companyName || ''}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <Building2 className="w-8 h-8 text-gray-400" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-gray-600">
                      {job.companyName || job.employer.name}
                    </span>
                    {job.employer.verified && (
                      <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h1>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-primary-50 text-primary-700 text-sm font-medium rounded-full">
                      {formatJobType(job.jobType)}
                    </span>
                    {job.featured && (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-medium rounded-full">
                        ⭐ Featured
                      </span>
                    )}
                    {job.urgent && (
                      <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">
                        🔥 Urgent
                      </span>
                    )}
                    {job.isRemote && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                        🌐 Remote
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Job Description</h2>
              <div className="prose prose-sm max-w-none text-gray-600">
                <p className="whitespace-pre-line">{job.description}</p>
              </div>
            </div>

            {/* Requirements */}
            {job.requirements && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Requirements</h2>
                <div className="prose prose-sm max-w-none text-gray-600">
                  <p className="whitespace-pre-line">{job.requirements}</p>
                </div>
              </div>
            )}

            {/* Responsibilities */}
            {job.responsibilities && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Responsibilities</h2>
                <div className="prose prose-sm max-w-none text-gray-600">
                  <p className="whitespace-pre-line">{job.responsibilities}</p>
                </div>
              </div>
            )}

            {/* Benefits */}
            {job.benefits && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Benefits</h2>
                <div className="prose prose-sm max-w-none text-gray-600">
                  <p className="whitespace-pre-line">{job.benefits}</p>
                </div>
              </div>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Apply Button Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
              <div className="text-center mb-6">
                <p className="text-sm text-gray-500 mb-1">Salary</p>
                <p className="text-2xl font-bold text-primary-600">{formatSalary(job)}</p>
              </div>

              <button
                onClick={handleApplyClick}
                className="w-full bg-primary-600 text-white font-semibold py-3 rounded-full hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Apply Now
              </button>

              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{getLocation(job)}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                  <span>{formatExperience(job)} experience</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>Posted {getTimeAgo(job.postedAt || job.createdAt)}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>{job._count.applications} applicants</span>
                </div>
                {job.deadline && (
                  <div className="flex items-center gap-3 text-sm text-red-600">
                    <Calendar className="w-4 h-4" />
                    <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Company Info Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">About the Company</h3>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                  {job.companyLogo ? (
                    <img
                      src={job.companyLogo}
                      alt={job.companyName || ''}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <Building2 className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {job.companyName || job.employer.name}
                  </p>
                  {job.employer.verified && (
                    <p className="text-xs text-blue-600">✓ Verified Employer</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                {job.companyWebsite && (
                  <a
                    href={job.companyWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary-600 hover:underline"
                  >
                    <Globe className="w-4 h-4" />
                    Visit Website
                  </a>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{job.employer.email}</span>
                </div>
                {job.employer.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{job.employer.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowApplyModal(false)} />

          <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {submitSuccess ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Application Submitted!</h3>
                <p className="text-gray-600 mb-6">
                  Your application for <strong>{job.title}</strong> has been sent successfully.
                </p>
                <button
                  onClick={() => {
                    setShowApplyModal(false);
                    router.push('/buyer/jobs');
                  }}
                  className="px-6 py-2 bg-primary-600 text-white font-semibold rounded-full hover:bg-primary-700 transition-colors"
                >
                  View My Applications
                </button>
              </div>
            ) : (
              <>
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900">Apply for {job.title}</h3>
                    <button
                      onClick={() => setShowApplyModal(false)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmitApplication} className="p-6 space-y-4">
                  {submitError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      {submitError}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={applyForm.name}
                      onChange={(e) => setApplyForm({ ...applyForm, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={applyForm.email}
                      onChange={(e) => setApplyForm({ ...applyForm, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                    <input
                      type="tel"
                      required
                      value={applyForm.phone}
                      onChange={(e) => setApplyForm({ ...applyForm, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                      maxLength={10}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="9876543210"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cover Letter</label>
                    <textarea
                      rows={4}
                      value={applyForm.coverLetter}
                      onChange={(e) => setApplyForm({ ...applyForm, coverLetter: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Tell us why you're a great fit for this role..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-primary-600 text-white font-semibold py-3 rounded-full hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Application
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
