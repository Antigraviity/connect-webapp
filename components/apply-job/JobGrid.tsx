"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiStar, FiMapPin, FiHeart, FiBriefcase, FiDollarSign, FiLoader } from "react-icons/fi";

interface Job {
  id: string;
  title: string;
  slug: string;
  description: string;
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
  postedAt: string | null;
  createdAt: string;
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

interface JobGridProps {
  filters: {
    category: string;
    salaryRange: number[];
    experience: number;
    jobType: string;
    sortBy: string;
    location?: string;
    query?: string;
  };
  onJobClick: (job: any) => void;
}

export default function JobGrid({
  filters,
  onJobClick,
}: JobGridProps) {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const itemsPerPage = 9;

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First check localStorage for user data
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user && (user.userType === 'BUYER' || user.role === 'USER')) {
            setIsAuthenticated(true);
            console.log('✅ User authenticated from localStorage:', user.email);
            return;
          }
        }
        
        // Fallback to API check
        const response = await fetch('/api/auth/session');
        const data = await response.json();
        setIsAuthenticated(!!data?.user);
        console.log('✅ Auth check from API:', !!data?.user);
      } catch (err) {
        console.error('❌ Auth check failed:', err);
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  // Fetch jobs from API
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Build query parameters
        const params = new URLSearchParams();
        params.set('page', currentPage.toString());
        params.set('limit', itemsPerPage.toString());
        params.set('status', 'ACTIVE'); // Only fetch active jobs
        
        // Add job type filter
        if (filters.jobType && filters.jobType !== 'all') {
          const jobTypeMap: { [key: string]: string } = {
            'full-time': 'FULL_TIME',
            'part-time': 'PART_TIME',
            'contract': 'CONTRACT',
            'internship': 'INTERNSHIP',
            'freelance': 'FREELANCE',
            'remote': 'REMOTE',
          };
          if (jobTypeMap[filters.jobType]) {
            params.set('jobType', jobTypeMap[filters.jobType]);
          }
        }

        // Add location filter
        if (filters.location) {
          params.set('city', filters.location);
        }

        // Add search query
        if (filters.query) {
          params.set('search', filters.query);
        }

        const response = await fetch(`/api/jobs?${params.toString()}`);
        const data = await response.json();

        if (data.success) {
          let filteredJobs = data.jobs;
          
          // Client-side filtering for salary and experience (since API might not support all filters)
          filteredJobs = filteredJobs.filter((job: Job) => {
            // Experience filter
            if (filters.experience > 0) {
              const minExp = job.minExperience || 0;
              if (minExp < filters.experience) return false;
            }
            
            // Salary filter
            if (filters.salaryRange[1] < 100000) {
              const salary = job.salaryMin || job.salaryMax || 0;
              if (salary > filters.salaryRange[1]) return false;
            }
            
            return true;
          });

          // Client-side sorting
          filteredJobs.sort((a: Job, b: Job) => {
            switch (filters.sortBy) {
              case 'salary-low':
                return (a.salaryMin || 0) - (b.salaryMin || 0);
              case 'salary-high':
                return (b.salaryMax || 0) - (a.salaryMax || 0);
              case 'rating':
                return (b.views || 0) - (a.views || 0);
              default: // popularity - featured first, then by views
                if (a.featured !== b.featured) return b.featured ? 1 : -1;
                return (b.views || 0) - (a.views || 0);
            }
          });

          setJobs(filteredJobs);
          setTotalJobs(filteredJobs.length);
          setTotalPages(Math.ceil(filteredJobs.length / itemsPerPage));
        } else {
          setError(data.message || 'Failed to fetch jobs');
          setJobs([]);
        }
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError('Failed to connect to the server');
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [filters, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const toggleFavorite = (jobId: string) => {
    setFavorites((prev) =>
      prev.includes(jobId)
        ? prev.filter((id) => id !== jobId)
        : [...prev, jobId]
    );
  };

  // Handle Apply Now button click
  const handleApplyClick = (e: React.MouseEvent, job: Job) => {
    e.stopPropagation(); // Prevent triggering onJobClick
    
    console.log('👆 Apply Now clicked for job:', job.title, '| Auth:', isAuthenticated);
    
    if (!isAuthenticated) {
      // Store the intended job in sessionStorage and localStorage for redundancy
      sessionStorage.setItem('applyJobId', job.id);
      sessionStorage.setItem('redirectAfterLogin', `/buyer/jobs?applyTo=${job.id}`);
      localStorage.setItem('applyJobId', job.id);
      localStorage.setItem('redirectAfterLogin', `/buyer/jobs?applyTo=${job.id}`);
      
      console.log('🔒 User not authenticated, redirecting to sign in');
      console.log('💾 Stored redirect URL:', `/buyer/jobs?applyTo=${job.id}`);
      
      // Redirect to sign in page with the full redirect URL including the job ID
      router.push(`/signin?redirect=${encodeURIComponent(`/buyer/jobs?applyTo=${job.id}`)}`);
    } else {
      console.log('✅ User authenticated, redirecting to /buyer/jobs');
      // User is logged in, redirect to buyer jobs page with job ID
      router.push(`/buyer/jobs?applyTo=${job.id}`);
    }
  };

  // Helper function to format salary
  const formatSalary = (job: Job) => {
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
  const formatExperience = (job: Job) => {
    const min = job.minExperience;
    const max = job.maxExperience;
    
    if (min === 0 && (!max || max === 0)) return 'Fresher';
    if (min === 0 && max) return `0-${max} years`;
    if (min && max) return `${min}-${max} years`;
    if (min) return `${min}+ years exp`;
    return 'Not specified';
  };

  // Helper function to get job image
  const getJobImage = (job: Job) => {
    if (job.companyLogo) return job.companyLogo;
    if (job.employer?.image) return job.employer.image;
    
    // Default images based on job type
    const defaultImages = [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500',
      'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=500',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500',
      'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=500',
      'https://images.unsplash.com/photo-1551434678-e076c223a692?w=500',
    ];
    
    // Use consistent image based on job id
    const index = job.id.charCodeAt(0) % defaultImages.length;
    return defaultImages[index];
  };

  // Helper to get location string
  const getLocation = (job: Job) => {
    const parts = [];
    if (job.city) parts.push(job.city);
    if (job.state) parts.push(job.state);
    if (parts.length === 0 && job.location) return job.location;
    if (parts.length === 0 && job.isRemote) return 'Remote';
    return parts.join(', ') || 'Location not specified';
  };

  // Get current page jobs
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentJobs = jobs.slice(startIndex, endIndex);

  const Pagination = () => {
    if (totalPages <= 1) return null;

    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-center gap-2 my-6">
        <button
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        
        <div className="flex gap-2">
          {pages.map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPage === page
                  ? "bg-blue-600 text-white"
                  : "border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <FiLoader className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-600">Loading jobs...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
          <FiBriefcase className="w-10 h-10 text-red-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Error loading jobs
        </h3>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Results Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 font-heading">
          {totalJobs} Jobs Available
        </h2>
      </div>

      {/* Top Pagination */}
      <Pagination />

      {/* Job Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {currentJobs.map((job) => (
          <div
            key={job.id}
            className="bg-white rounded-2xl shadow-md hover:shadow-xl border border-transparent hover:border-primary-300 transition-all duration-300 overflow-hidden group cursor-pointer"
          >
            {/* Image - Reduced height */}
            <div
              className="relative h-40 overflow-hidden"
              onClick={() => onJobClick(job)}
            >
              <img
                src={getJobImage(job)}
                alt={job.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              {job.featured && (
                <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                  Featured
                </div>
              )}
              {job.urgent && (
                <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                  Urgent
                </div>
              )}
              {job.isRemote && (
                <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                  Remote
                </div>
              )}
            </div>

            {/* Content - More compact */}
            <div className="p-3" onClick={() => onJobClick(job)}>
              {/* Job Title */}
              <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-primary-600 transition-colors">
                {job.title}
              </h3>

              {/* Company */}
              <p className="text-xs text-gray-600 mb-2">
                {job.companyName || job.employer?.name || 'Company'}
              </p>

              {/* Rating & Reviews (using views as a proxy) */}
              <div className="flex items-center gap-4 mb-2">
                <div className="flex items-center gap-1">
                  <FiStar className="w-3 h-3 text-yellow-500 fill-current" />
                  <span className="text-xs font-semibold text-gray-900">
                    {job.employer?.verified ? '4.8' : '4.5'}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({job._count?.applications || 0} applications)
                  </span>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                <FiMapPin className="w-3 h-3" />
                <span>{getLocation(job)}</span>
              </div>

              {/* Experience */}
              <div className="flex items-center gap-2 text-xs text-blue-600 mb-2">
                <FiBriefcase className="w-3 h-3" />
                <span className="font-medium">
                  {formatExperience(job)}
                </span>
              </div>

              {/* Salary & Button */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <div>
                  <p className="text-[10px] text-gray-500">Salary</p>
                  <p className="text-lg font-bold text-primary-600">
                    {formatSalary(job)}
                  </p>
                </div>
                <button 
                  onClick={(e) => handleApplyClick(e, job)}
                  className="border border-primary-300 text-primary-300 text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-gradient-to-r from-primary-300 to-primary-500 hover:text-white shadow-sm hover:shadow-md transition-all"
                >
                  Apply Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Pagination */}
      <Pagination />

      {/* No Results */}
      {jobs.length === 0 && !loading && (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
            <FiBriefcase className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            No jobs found
          </h3>
          <p className="text-gray-600 mb-6">
            Try adjusting your filters to see more results, or check back later for new job postings.
          </p>
        </div>
      )}
    </div>
  );
}
