"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Briefcase, Clock, DollarSign, Building2 } from "lucide-react";

interface Job {
  id: string;
  title: string;
  slug: string;
  description: string;
  jobType: string;
  experienceLevel: string | null;
  minExperience: number | null;
  maxExperience: number | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryPeriod: string | null;
  showSalary: boolean;
  city: string | null;
  state: string | null;
  isRemote: boolean;
  status: string;
  featured: boolean;
  urgent: boolean;
  companyName: string | null;
  companyLogo: string | null;
  postedAt: string | null;
  employer: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    verified: boolean;
  };
  _count: {
    applications: number;
  };
}

export default function FeaturedJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedJobs();
  }, []);

  const fetchFeaturedJobs = async () => {
    try {
      // Fetch featured jobs that are ACTIVE
      const response = await fetch('/api/jobs?featured=true&status=ACTIVE&limit=4');
      const data = await response.json();

      if (data.success) {
        setJobs(data.jobs || []);
      }
    } catch (error) {
      console.error('Error fetching featured jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format job type for display
  const formatJobType = (jobType: string) => {
    return jobType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  // Format salary
  const formatSalary = (job: Job) => {
    if (!job.showSalary || !job.salaryMin) return null;

    const formatAmount = (amount: number) => {
      if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
      if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
      return `₹${amount}`;
    };

    if (job.salaryMax && job.salaryMax !== job.salaryMin) {
      return `${formatAmount(job.salaryMin)} - ${formatAmount(job.salaryMax)}`;
    }
    return `${formatAmount(job.salaryMin)}`;
  };

  // Format experience
  const formatExperience = (job: Job) => {
    if (!job.minExperience && !job.maxExperience) return null;
    if (job.minExperience && job.maxExperience) {
      return `${job.minExperience}-${job.maxExperience} years`;
    }
    if (job.minExperience) return `${job.minExperience}+ years`;
    return null;
  };

  // Get time ago
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

  if (loading) {
    return (
      <section className="py-16 bg-amber-50 px-8 md:px-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading featured jobs...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // If no featured jobs, don't show the section
  if (jobs.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-amber-50 px-8 md:px-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-4xl font-bold text-gray-900">Featured Jobs</h2>
            {/* Mild Blue Underline */}
            <div className="w-24 h-[2px] bg-blue-500 mt-2 rounded-full"></div>
          </div>
          <Link
            href="/apply-job"
            className="text-primary-500 hover:text-secondary-500 font-semibold flex items-center gap-1"
          >
            Explore All →
          </Link>
        </div>

        {/* Grid of Jobs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-primary-300 hover:shadow-xl transition-all duration-300"
            >
              {/* Company Logo / Image */}
              <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-primary-50 to-secondary-50">
                {job.companyLogo ? (
                  <img
                    src={job.companyLogo}
                    alt={job.companyName || job.employer.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      // Fallback to employer image if company logo fails
                      e.currentTarget.src = job.employer.image || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(job.companyName || job.employer.name);
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building2 className="w-20 h-20 text-primary-300" />
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {job.featured && (
                    <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full">
                      ⭐ Featured
                    </span>
                  )}
                  {job.urgent && (
                    <span className="px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
                      🔥 Urgent
                    </span>
                  )}
                </div>

                {/* Job Type Badge */}
                <div className="absolute bottom-3 left-3 bg-white/90 px-3 py-1 rounded-full text-xs font-semibold text-gray-700 backdrop-blur">
                  {formatJobType(job.jobType)}
                </div>
              </div>

              {/* Content */}
              <div className="p-4 flex flex-col justify-between h-[220px]">
                <div>
                  {/* Company Name */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {job.companyName || job.employer.name}
                    </span>
                    {job.employer.verified && (
                      <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                        ✓ Verified
                      </span>
                    )}
                  </div>

                  {/* Job Title */}
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                    {job.title}
                  </h3>

                  {/* Location */}
                  <div className="flex items-center gap-1 text-gray-500 text-xs mb-2">
                    <MapPin className="w-3 h-3" />
                    {job.isRemote ? (
                      <span>Remote</span>
                    ) : job.city && job.state ? (
                      <span>{job.city}, {job.state}</span>
                    ) : (
                      <span>Location not specified</span>
                    )}
                  </div>

                  {/* Experience & Salary */}
                  <div className="flex flex-col gap-1 mb-2">
                    {formatExperience(job) && (
                      <div className="flex items-center gap-1 text-gray-600 text-xs">
                        <Briefcase className="w-3 h-3" />
                        <span>{formatExperience(job)}</span>
                      </div>
                    )}
                    {formatSalary(job) && (
                      <div className="flex items-center gap-1 text-green-600 text-xs font-medium">
                        <DollarSign className="w-3 h-3" />
                        <span>{formatSalary(job)}</span>
                        {job.salaryPeriod && <span className="text-gray-500">/{job.salaryPeriod}</span>}
                      </div>
                    )}
                  </div>

                  {/* Posted Time & Applications */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{getTimeAgo(job.postedAt)}</span>
                    </div>
                    <span>{job._count.applications} applicants</span>
                  </div>
                </div>

                {/* Footer with Apply Button */}
                <div className="flex items-center justify-end border-t border-gray-100 pt-3 mt-auto">
                  <Link
                    href={`/apply-job/${job.slug}`}
                    className="border border-primary-300 text-primary-300 text-sm font-semibold px-4 py-2 rounded-full hover:bg-gradient-to-r hover:from-primary-300 hover:to-primary-500 hover:text-white shadow-sm hover:shadow-md transition-all"
                  >
                    Apply Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
