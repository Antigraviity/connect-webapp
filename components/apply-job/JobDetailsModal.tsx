"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FiX,
  FiStar,
  FiMapPin,
  FiBriefcase,
  FiShield,
  FiCalendar,
  FiUser,
  FiClock,
  FiGlobe,
  FiLogIn,
} from "react-icons/fi";
import { FaRupeeSign } from "react-icons/fa";

interface Job {
  id: string;
  title: string;
  slug: string;
  description: string;
  requirements?: string | null;
  responsibilities?: string | null;
  benefits?: string | null;
  jobType: string;
  minExperience: number | null;
  maxExperience: number | null;
  experienceLevel: string | null;
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
  skills: string | null;
  education?: string | null;
  postedAt: string | null;
  deadline?: string | null;
  createdAt: string;
  employer: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    verified: boolean;
  };
  _count?: {
    applications: number;
  };
}

interface JobDetailsModalProps {
  job: Job;
  onClose: () => void;
}

export default function JobDetailsModal({
  job,
  onClose,
}: JobDetailsModalProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();
        setIsAuthenticated(!!data?.user);
      } catch (err) {
        setIsAuthenticated(false);
      } finally {
        setCheckingAuth(false);
      }
    };
    checkAuth();
  }, []);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  // Handle Apply button click
  const handleApplyClick = () => {
    if (!isAuthenticated) {
      // Store the intended job in sessionStorage so we can redirect back after login
      sessionStorage.setItem('applyJobId', job.id);
      sessionStorage.setItem('redirectAfterLogin', '/buyer/jobs');

      // Redirect to sign in page
      router.push('/signin?redirect=/buyer/jobs');
    } else {
      // User is logged in, redirect to buyer dashboard jobs page
      router.push(`/buyer/jobs?applyTo=${job.id}`);
    }
  };

  // Helper function to format salary
  const formatSalary = () => {
    if (!job.showSalary) return 'Not disclosed';

    const min = job.salaryMin;
    const max = job.salaryMax;
    const period = job.salaryPeriod || 'monthly';

    if (!min && !max) return 'Not disclosed';

    const formatNumber = (num: number) => {
      if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
      if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
      return num.toLocaleString();
    };

    const periodLabel = period === 'yearly' ? '/yr' : '/mo';

    if (min && max) {
      return `₹${formatNumber(min)} - ₹${formatNumber(max)}${periodLabel}`;
    }
    return `₹${formatNumber(min || max || 0)}${periodLabel}`;
  };

  // Helper function to format experience
  const formatExperience = () => {
    const min = job.minExperience;
    const max = job.maxExperience;

    if (min === 0 && (!max || max === 0)) return 'Fresher';
    if (min === 0 && max) return `0-${max} years`;
    if (min && max) return `${min}-${max} years`;
    if (min) return `${min}+ years`;
    return job.experienceLevel || 'Not specified';
  };

  // Helper function to format job type
  const formatJobType = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'FULL_TIME': 'Full Time',
      'PART_TIME': 'Part Time',
      'CONTRACT': 'Contract',
      'FREELANCE': 'Freelance',
      'INTERNSHIP': 'Internship',
      'REMOTE': 'Remote',
    };
    return typeMap[type] || type.replace('_', ' ');
  };

  // Helper function to get job image
  const getJobImage = () => {
    if (job.companyLogo) return job.companyLogo;
    if (job.employer?.image) return job.employer.image;

    const defaultImages = [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
      'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
      'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800',
      'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800',
    ];

    const index = job.id.charCodeAt(0) % defaultImages.length;
    return defaultImages[index];
  };

  // Helper to get location string
  const getLocation = () => {
    const parts = [];
    if (job.city) parts.push(job.city);
    if (job.state) parts.push(job.state);
    if (parts.length === 0 && job.location) return job.location;
    if (parts.length === 0 && job.isRemote) return 'Remote';
    return parts.join(', ') || 'Location not specified';
  };

  // Parse skills from JSON string
  const getSkills = (): string[] => {
    if (!job.skills) return [];
    try {
      return JSON.parse(job.skills);
    } catch {
      return job.skills.split(',').map(s => s.trim());
    }
  };

  // Parse responsibilities and requirements
  const parseTextToList = (text: string | null | undefined): string[] => {
    if (!text) return [];
    // Try to parse as JSON array first
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) return parsed;
    } catch { }
    // Otherwise split by newlines or bullet points
    return text.split(/[\n•\-]/).filter(item => item.trim().length > 0).map(item => item.trim());
  };

  const responsibilities = parseTextToList(job.responsibilities);
  const requirements = parseTextToList(job.requirements);
  const skills = getSkills();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-slide-up">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
          >
            <FiX className="w-6 h-6 text-gray-700" />
          </button>

          {/* Hero Image */}
          <div className="relative h-72 overflow-hidden">
            <img
              src={getJobImage()}
              alt={job.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-center gap-2 mb-2">
                {job.featured && (
                  <span className="bg-yellow-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                    Featured
                  </span>
                )}
                {job.urgent && (
                  <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                    Urgent
                  </span>
                )}
                {job.isRemote && (
                  <span className="bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                    Remote
                  </span>
                )}
              </div>
              <h2 className="text-3xl font-bold text-white mb-2 font-heading">
                {job.title}
              </h2>
              <div className="flex items-center gap-4 text-white">
                <div className="flex items-center gap-1">
                  <FiStar className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="font-semibold">{job.employer?.verified ? '4.8' : '4.5'}</span>
                  <span className="text-white/80">({job._count?.applications || 0} applications)</span>
                </div>
                {job.employer?.verified && (
                  <span className="bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                    ✓ Verified
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-[calc(100vh-20rem)] overflow-y-auto">
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Details */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Company Info */}
                  <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center overflow-hidden">
                      {job.companyLogo || job.employer?.image ? (
                        <img
                          src={job.companyLogo || job.employer?.image || ''}
                          alt={job.companyName || job.employer?.name || 'Company'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FiUser className="w-8 h-8 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {job.companyName || job.employer?.name || 'Company'}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FiMapPin className="w-4 h-4" />
                        {getLocation()}
                      </div>
                    </div>
                  </div>

                  {/* Job Overview */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <FaRupeeSign className="w-4 h-4" />
                        <span className="text-xs font-medium">Salary</span>
                      </div>
                      <p className="text-sm font-bold text-gray-900">
                        {formatSalary()}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <FiBriefcase className="w-4 h-4" />
                        <span className="text-xs font-medium">Experience</span>
                      </div>
                      <p className="text-sm font-bold text-gray-900">
                        {formatExperience()}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <FiClock className="w-4 h-4" />
                        <span className="text-xs font-medium">Job Type</span>
                      </div>
                      <p className="text-sm font-bold text-gray-900">
                        {formatJobType(job.jobType)}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <FiGlobe className="w-4 h-4" />
                        <span className="text-xs font-medium">Work Mode</span>
                      </div>
                      <p className="text-sm font-bold text-gray-900">
                        {job.isRemote ? 'Remote' : 'On-site'}
                      </p>
                    </div>
                  </div>

                  {/* Skills */}
                  {skills.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">
                        Required Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill, index) => (
                          <span
                            key={index}
                            className="bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">
                      About this Job
                    </h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {job.description}
                    </p>
                  </div>

                  {/* Key Responsibilities */}
                  {responsibilities.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">
                        Key Responsibilities
                      </h3>
                      <ul className="space-y-2">
                        {responsibilities.map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-green-500 mt-1">✓</span>
                            <span className="text-gray-700">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Requirements */}
                  {requirements.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">
                        Requirements
                      </h3>
                      <ul className="space-y-2">
                        {requirements.map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-blue-500 mt-1">•</span>
                            <span className="text-gray-700">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Education */}
                  {job.education && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">
                        Education
                      </h3>
                      <p className="text-gray-700">{job.education}</p>
                    </div>
                  )}

                  {/* Benefits */}
                  {job.benefits && (
                    <div className="bg-blue-50 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <FiShield className="w-5 h-5 text-primary-600 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">
                            Benefits & Perks
                          </h4>
                          <p className="text-sm text-gray-700 whitespace-pre-line">
                            {job.benefits}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Posted Date & Deadline */}
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    {job.postedAt && (
                      <div className="flex items-center gap-2">
                        <FiCalendar className="w-4 h-4" />
                        <span>Posted: {new Date(job.postedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                    {job.deadline && (
                      <div className="flex items-center gap-2">
                        <FiClock className="w-4 h-4" />
                        <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - Apply Section */}
                <div className="lg:col-span-1">
                  <div className="sticky top-6 bg-gray-50 rounded-2xl p-6 space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Apply for this Job
                    </h3>

                    {checkingAuth ? (
                      <div className="text-center py-8">
                        <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full mx-auto mb-3"></div>
                        <p className="text-sm text-gray-600">Checking...</p>
                      </div>
                    ) : !isAuthenticated ? (
                      <div className="text-center py-6">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FiLogIn className="w-8 h-8 text-blue-600" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                          Sign in to Apply
                        </h4>
                        <p className="text-sm text-gray-600 mb-6">
                          Please sign in to your account to apply for this job and track your applications.
                        </p>
                        <button
                          onClick={handleApplyClick}
                          className="w-full bg-gradient-to-r from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-800 text-white font-semibold py-3.5 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl"
                        >
                          Sign In to Apply
                        </button>
                        <p className="text-xs text-gray-500 mt-4">
                          Don't have an account?{' '}
                          <button
                            onClick={() => router.push('/signin?mode=register')}
                            className="text-primary-600 hover:underline font-medium"
                          >
                            Create one
                          </button>
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FiBriefcase className="w-8 h-8 text-green-600" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                          Ready to Apply!
                        </h4>
                        <p className="text-sm text-gray-600 mb-6">
                          Click below to complete your application in your dashboard where you can also track all your job applications.
                        </p>
                        <button
                          onClick={handleApplyClick}
                          className="w-full bg-gradient-to-r from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-800 text-white font-semibold py-3.5 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl"
                        >
                          Apply Now
                        </button>
                        <p className="text-xs text-gray-500 mt-4">
                          You'll be redirected to your dashboard
                        </p>
                      </div>
                    )}

                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <p className="text-xs text-center text-gray-500">
                        By applying, you agree to our Terms & Conditions
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
