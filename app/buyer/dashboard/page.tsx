"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTab } from "../layout";
import { 
  FiTrendingUp, 
  FiShoppingBag, 
  FiStar, 
  FiBriefcase,
  FiPackage,
  FiClock,
  FiMapPin,
  FiHeart,
  FiCalendar,
  FiDollarSign,
  FiTruck,
  FiCheckCircle,
  FiShoppingCart,
  FiFileText,
  FiArrowRight,
  FiSearch,
  FiFilter,
  FiBookmark,
  FiAward,
  FiUsers,
  FiEye,
  FiExternalLink,
  FiPlus,
  FiRefreshCw,
} from "react-icons/fi";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

// ==================== INTERFACES ====================
interface Booking {
  id: string;
  orderNumber: string;
  bookingDate: string;
  bookingTime: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  servicePrice: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  specialRequests?: string;
  createdAt: string;
  service: {
    id: string;
    title: string;
    images: string;
    price: number;
    duration: number;
  };
  seller: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  bookingDate: string;
  bookingTime: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  servicePrice: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  specialRequests?: string;
  createdAt: string;
  service: {
    id: string;
    title: string;
    slug: string;
    images: string;
    price: number;
  };
  seller: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  buyer?: {
    id: string;
    name: string;
    email: string;
  };
}

interface Favorite {
  id: string;
  userId: string;
  serviceId: string;
  createdAt: string;
  service: {
    id: string;
    title: string;
    images: string;
    price: number;
    discountPrice?: number;
    rating: number;
    totalReviews: number;
    seller: {
      id: string;
      name: string;
      verified: boolean;
      image?: string;
    };
    category: {
      id: string;
      name: string;
      slug: string;
    };
  };
}

// ==================== HELPER FUNCTIONS ====================
// Mock data for activity chart (until we implement real tracking)
const jobActivityData = [
  { week: "Week 1", applications: 0, views: 0 },
  { week: "Week 2", applications: 0, views: 0 },
  { week: "Week 3", applications: 0, views: 0 },
  { week: "Week 4", applications: 0, views: 0 },
];

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    "Interview": "bg-purple-100 text-purple-800",
    "Applied": "bg-blue-100 text-blue-800",
    "Shortlisted": "bg-green-100 text-green-800",
    "Rejected": "bg-red-100 text-red-800",
    "COMPLETED": "bg-green-100 text-green-800",
    "Completed": "bg-green-100 text-green-800",
    "PENDING": "bg-yellow-100 text-yellow-800",
    "Pending": "bg-yellow-100 text-yellow-800",
    "CONFIRMED": "bg-blue-100 text-blue-800",
    "Confirmed": "bg-blue-100 text-blue-800",
    "Scheduled": "bg-blue-100 text-blue-800",
    "IN_PROGRESS": "bg-purple-100 text-purple-800",
    "In Progress": "bg-purple-100 text-purple-800",
    "CANCELLED": "bg-red-100 text-red-800",
    "Cancelled": "bg-red-100 text-red-800",
    "Out for Delivery": "bg-orange-100 text-orange-800",
    "Delivered": "bg-green-100 text-green-800",
    "Processing": "bg-blue-100 text-blue-800",
    "In Transit": "bg-yellow-100 text-yellow-800",
    "REFUNDED": "bg-gray-100 text-gray-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    "PENDING": "Pending",
    "CONFIRMED": "Confirmed",
    "IN_PROGRESS": "In Progress",
    "COMPLETED": "Completed",
    "CANCELLED": "Cancelled",
    "REFUNDED": "Refunded",
  };
  return labels[status] || status;
};

const renderStars = (rating: number) => {
  return [...Array(5)].map((_, i) => (
    <FiStar
      key={i}
      className={`w-3 h-3 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
    />
  ));
};

const getServiceImage = (images: string) => {
  try {
    const parsed = typeof images === 'string' ? JSON.parse(images) : images;
    if (parsed && parsed.length > 0) {
      return parsed[0];
    }
  } catch (e) {
    // Fallback
  }
  return 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=100';
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
};

const formatFullDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

// ==================== TAB CONTENT COMPONENTS ====================

// Jobs Dashboard Content - WITH LIVE DATA
function JobsDashboard() {
  const [applications, setApplications] = useState<any[]>([]);
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalApplications: 0,
    interviews: 0,
    profileViews: 0,
    savedJobs: 0,
    thisWeek: 0,
    upcomingInterviews: 0,
  });

  useEffect(() => {
    // Get user ID from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserId(user.id);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchJobsData();
    }
  }, [userId]);

  const fetchJobsData = async () => {
    try {
      setLoading(true);
      // Fetch applications - correct endpoint
      const appsResponse = await fetch(`/api/jobs/applications?applicantId=${userId}`);
      const appsData = await appsResponse.json();
      
      // Fetch saved jobs
      const savedResponse = await fetch(`/api/saved-jobs?userId=${userId}`);
      const savedData = await savedResponse.json();
      
      if (appsData.success) {
        const appsList = appsData.applications || [];
        setApplications(appsList);
        
        // Calculate stats
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        const totalApplications = appsList.length;
        const thisWeek = appsList.filter((app: any) => 
          new Date(app.createdAt) >= weekAgo
        ).length;
        
        // Count interviews (applications with status INTERVIEW or SHORTLISTED)
        const interviews = appsList.filter((app: any) => 
          app.status === 'INTERVIEW' || app.status === 'SHORTLISTED'
        ).length;
        
        setStats(prev => ({
          ...prev,
          totalApplications,
          interviews,
          thisWeek,
          upcomingInterviews: interviews, // For now, same as interviews
          profileViews: 0, // We don't track this yet
        }));
      }
      
      if (savedData.success) {
        const savedList = savedData.savedJobs || [];
        setSavedJobs(savedList);
        setStats(prev => ({
          ...prev,
          savedJobs: savedList.length,
        }));
      }
    } catch (error) {
      console.error('Error fetching jobs data:', error);
    } finally {
      setLoading(false);
    }
  };

  const jobStatsData = [
    { 
      label: "Applications Sent", 
      value: loading ? "-" : stats.totalApplications.toString(), 
      change: `+${stats.thisWeek} this week`, 
      icon: FiFileText, 
      color: "bg-blue-500" 
    },
    { 
      label: "Interviews Scheduled", 
      value: loading ? "-" : stats.interviews.toString(), 
      change: stats.upcomingInterviews > 0 ? `${stats.upcomingInterviews} upcoming` : "None scheduled", 
      icon: FiCalendar, 
      color: "bg-purple-500" 
    },
    { 
      label: "Profile Views", 
      value: loading ? "-" : stats.profileViews.toString(), 
      change: "Not available", 
      icon: FiEye, 
      color: "bg-primary-500" 
    },
    { 
      label: "Saved Jobs", 
      value: loading ? "-" : stats.savedJobs.toString(), 
      change: "Total saved", 
      icon: FiBookmark, 
      color: "bg-pink-500" 
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {jobStatsData.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  {stat.change}
                </span>
              </div>
              <h3 className="text-gray-600 text-sm">{stat.label}</h3>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Upcoming Interviews Alert - Only show if there are interviews */}
      {applications.filter(app => app.status === 'INTERVIEW' || app.status === 'SHORTLISTED').length > 0 && (
        <div className="bg-gradient-to-r from-blue-800 to-blue-900 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <FiCalendar className="w-5 h-5" />
              Upcoming Interviews
            </h3>
            <Link href="/buyer/applications" className="text-sm bg-white/20 px-3 py-1 rounded-full hover:bg-white/30">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {applications
              .filter(app => app.status === 'INTERVIEW' || app.status === 'SHORTLISTED')
              .slice(0, 2)
              .map((app) => (
              <div key={app.id} className="bg-white/10 rounded-lg p-4">
                <p className="font-semibold">{app.job?.company || 'Company'}</p>
                <p className="text-sm text-blue-100">{app.job?.title || 'Position'}</p>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span>{formatDate(app.createdAt)}</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded">{app.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Apply CTA - Show when no applications */}
      {!loading && applications.length === 0 && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg mb-1">Ready to Find Your Dream Job?</h3>
              <p className="text-blue-100 text-sm">Browse thousands of job opportunities and apply today</p>
            </div>
            <Link href="/buyer/jobs" className="bg-white text-blue-600 px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2">
              <FiBriefcase className="w-4 h-4" /> Find Jobs
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Applications */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Recent Applications</h3>
            <div className="flex items-center gap-2">
              <button 
                onClick={fetchJobsData}
                className="text-gray-500 hover:text-gray-700 p-1"
                title="Refresh"
              >
                <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <Link href="/buyer/applications" className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
                View All <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-12">
              <FiFileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No applications yet</p>
              <Link 
                href="/buyer/jobs" 
                className="text-blue-600 font-semibold hover:underline"
              >
                Start applying to jobs
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.slice(0, 5).map((app) => (
                <div key={app.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                    {(app.job?.company || 'C').charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{app.job?.title || 'Job Position'}</p>
                    <p className="text-sm text-gray-500">{app.job?.company || 'Company'} • {app.job?.location || 'Location'}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">{formatDate(app.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Application Activity Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="font-bold text-gray-900 mb-4">Activity This Month</h3>
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : applications.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400">
              No data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={jobActivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="applications" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} name="Applications" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Saved Jobs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Saved Jobs</h3>
          <Link href="/buyer/saved-jobs" className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
            View All <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : savedJobs.length === 0 ? (
          <div className="text-center py-8">
            <FiBookmark className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No saved jobs yet</p>
            <Link 
              href="/buyer/jobs" 
              className="text-blue-600 font-semibold hover:underline"
            >
              Browse jobs to save for later
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {savedJobs.slice(0, 3).map((saved) => (
              <div key={saved.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                    {(saved.job?.company || 'C').charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{saved.job?.title || 'Job Position'}</p>
                    <p className="text-sm text-gray-500">{saved.job?.company || 'Company'}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <p className="flex items-center gap-1"><FiMapPin className="w-4 h-4" /> {saved.job?.location || 'Location'}</p>
                  <p className="flex items-center gap-1"><FiDollarSign className="w-4 h-4" /> {saved.job?.salaryRange || 'Not specified'}</p>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  <span className="text-xs text-gray-500">Saved {formatDate(saved.createdAt)}</span>
                  <Link 
                    href="/buyer/jobs"
                    className="text-blue-600 text-sm font-medium hover:underline"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Services Dashboard Content - WITH LIVE DATA
function ServicesDashboard() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    totalSpent: 0,
  });

  useEffect(() => {
    // Get user ID from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserId(user.id);
      } catch (e) {
        console.error('Error parsing user data:', e);
        router.push('/signin');
      }
    } else {
      router.push('/signin');
    }
  }, [router]);

  useEffect(() => {
    if (userId) {
      fetchBookings();
    }
  }, [userId]);

  const fetchBookings = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      // IMPORTANT: Filter by buyerId to only show current user's bookings
      const response = await fetch(`/api/bookings?type=SERVICE&buyerId=${userId}`);
      const data = await response.json();
      
      if (data.success) {
        const bookingsList = data.bookings || [];
        setBookings(bookingsList);
        
        // Calculate stats
        const total = bookingsList.length;
        const active = bookingsList.filter((b: Booking) => 
          ['PENDING', 'CONFIRMED', 'IN_PROGRESS'].includes(b.status)
        ).length;
        const completed = bookingsList.filter((b: Booking) => b.status === 'COMPLETED').length;
        const totalSpent = bookingsList.reduce((sum: number, b: Booking) => sum + b.totalAmount, 0);
        
        setStats({ total, active, completed, totalSpent });
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate category data from bookings
  const getCategoryData = () => {
    if (!bookings || bookings.length === 0) {
      return [{ name: "No Data", value: 1, color: "#e5e7eb" }];
    }
    // If we have real bookings, show distribution
    const completed = stats.completed;
    const active = stats.active;
    const cancelled = bookings.filter(b => b.status === 'CANCELLED').length;
    
    const result = [];
    if (completed > 0) result.push({ name: "Completed", value: completed, color: "#10b981" });
    if (active > 0) result.push({ name: "Active", value: active, color: "#3b82f6" });
    if (cancelled > 0) result.push({ name: "Cancelled", value: cancelled, color: "#ef4444" });
    
    return result.length > 0 ? result : [{ name: "No Data", value: 1, color: "#e5e7eb" }];
  };

  const serviceStatsData = [
    { 
      label: "Total Bookings", 
      value: loading ? "-" : stats.total.toString(), 
      change: `${bookings.filter(b => {
        const bookingDate = new Date(b.createdAt);
        const now = new Date();
        return bookingDate.getMonth() === now.getMonth();
      }).length} this month`, 
      icon: FiShoppingBag, 
      color: "bg-primary-500" 
    },
    { 
      label: "Active Services", 
      value: loading ? "-" : stats.active.toString(), 
      change: `${stats.active} in progress`, 
      icon: FiClock, 
      color: "bg-blue-500" 
    },
    { 
      label: "Completed", 
      value: loading ? "-" : stats.completed.toString(), 
      change: "All time", 
      icon: FiCheckCircle, 
      color: "bg-green-500" 
    },
    { 
      label: "Total Spent", 
      value: loading ? "-" : `₹${stats.totalSpent.toLocaleString()}`, 
      change: "All bookings", 
      icon: FiDollarSign, 
      color: "bg-orange-500" 
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {serviceStatsData.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
                  {stat.change}
                </span>
              </div>
              <h3 className="text-gray-600 text-sm">{stat.label}</h3>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Book Services */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg mb-1">Need a Service?</h3>
            <p className="text-primary-100 text-sm">Book trusted professionals for all your needs</p>
          </div>
          <Link href="/book-services" className="bg-white text-primary-600 px-5 py-2.5 rounded-lg font-semibold hover:bg-primary-50 transition-colors flex items-center gap-2">
            <FiPlus className="w-4 h-4" /> Book Now
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings - LIVE DATA */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Recent Bookings</h3>
            <div className="flex items-center gap-2">
              <button 
                onClick={fetchBookings}
                className="text-gray-500 hover:text-gray-700 p-1"
                title="Refresh"
              >
                <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <Link href="/buyer/bookings" className="text-sm text-primary-600 font-medium hover:underline flex items-center gap-1">
                View All <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12">
              <FiCalendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No bookings yet</p>
              <Link 
                href="/book-services" 
                className="text-primary-600 font-semibold hover:underline"
              >
                Book your first service
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.slice(0, 5).map((booking) => (
                <div key={booking.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <img 
                    src={getServiceImage(booking.service?.images)} 
                    alt={booking.service?.title} 
                    className="w-14 h-14 rounded-lg object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=100';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{booking.service?.title || 'Service'}</p>
                    <p className="text-sm text-gray-500">{booking.seller?.name || 'Provider'}</p>
                    <p className="text-xs text-gray-400">
                      {formatDate(booking.bookingDate)} at {booking.bookingTime}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                      {getStatusLabel(booking.status)}
                    </span>
                    <p className="font-semibold text-gray-900 mt-1">₹{booking.totalAmount}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Service Categories Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="font-bold text-gray-900 mb-4">Booking Summary</h3>
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400">
              No data available
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie 
                    data={[
                      { name: "Completed", value: stats.completed, color: "#10b981" },
                      { name: "Active", value: stats.active, color: "#3b82f6" },
                      { name: "Cancelled", value: bookings.filter(b => b.status === 'CANCELLED').length, color: "#ef4444" },
                    ].filter(d => d.value > 0)} 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={70} 
                    dataKey="value" 
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {[
                      { name: "Completed", value: stats.completed, color: "#10b981" },
                      { name: "Active", value: stats.active, color: "#3b82f6" },
                      { name: "Cancelled", value: bookings.filter(b => b.status === 'CANCELLED').length, color: "#ef4444" },
                    ].filter(d => d.value > 0).map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="flex items-center gap-1 text-xs text-gray-600">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  Completed ({stats.completed})
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-600">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Active ({stats.active})
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Upcoming Bookings Alert */}
      {bookings.filter(b => ['PENDING', 'CONFIRMED'].includes(b.status)).length > 0 && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <FiCalendar className="w-5 h-5" />
              Upcoming Bookings
            </h3>
            <Link href="/buyer/bookings" className="text-sm bg-white/20 px-3 py-1 rounded-full hover:bg-white/30">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookings
              .filter(b => ['PENDING', 'CONFIRMED'].includes(b.status))
              .slice(0, 3)
              .map((booking) => (
              <div key={booking.id} className="bg-white/10 rounded-lg p-4">
                <p className="font-semibold">{booking.service?.title}</p>
                <p className="text-sm text-blue-100">{booking.seller?.name}</p>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span>{formatDate(booking.bookingDate)}</span>
                  <span>{booking.bookingTime}</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded">{getStatusLabel(booking.status)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Products Dashboard Content - WITH LIVE DATA
function ProductsDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoritesLoading, setFavoritesLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    inTransit: 0,
    wishlistItems: 0,
    totalSpent: 0,
    thisMonth: 0,
    arrivingToday: 0,
    onSale: 0,
  });

  useEffect(() => {
    // Get user ID from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserId(user.id);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchOrders();
      fetchFavorites();
    }
  }, [userId]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Fetch only PRODUCT orders, not SERVICE bookings
      const response = await fetch(`/api/orders?buyerId=${userId}&limit=50&type=PRODUCT`);
      const data = await response.json();
      
      if (data.success) {
        const ordersList = data.orders || [];
        setOrders(ordersList);
        
        // Calculate stats
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        const totalOrders = ordersList.length;
        const inTransit = ordersList.filter((o: Order) => 
          ['CONFIRMED', 'IN_PROGRESS'].includes(o.status)
        ).length;
        const totalSpent = ordersList
          .filter((o: Order) => o.status !== 'CANCELLED' && o.status !== 'REFUNDED')
          .reduce((sum: number, o: Order) => sum + o.totalAmount, 0);
        const thisMonth = ordersList.filter((o: Order) => {
          const orderDate = new Date(o.createdAt);
          return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
        }).length;
        
        // Check for orders arriving today (booking date is today and status is in transit)
        const arrivingToday = ordersList.filter((o: Order) => {
          const bookingDate = new Date(o.bookingDate);
          const bookingDay = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate());
          return bookingDay.getTime() === today.getTime() && ['CONFIRMED', 'IN_PROGRESS'].includes(o.status);
        }).length;
        
        setStats(prev => ({
          ...prev,
          totalOrders,
          inTransit,
          totalSpent,
          thisMonth,
          arrivingToday,
        }));
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      setFavoritesLoading(true);
      const response = await fetch(`/api/favorites?userId=${userId}`);
      const data = await response.json();
      
      if (data.success) {
        const favoritesList = data.favorites || [];
        setFavorites(favoritesList);
        
        // Count items on sale (with discount price)
        const onSale = favoritesList.filter((f: Favorite) => 
          f.service?.discountPrice && f.service.discountPrice < f.service.price
        ).length;
        
        setStats(prev => ({
          ...prev,
          wishlistItems: favoritesList.length,
          onSale,
        }));
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setFavoritesLoading(false);
    }
  };

  const refreshData = () => {
    if (userId) {
      fetchOrders();
      fetchFavorites();
    }
  };

  // Get order status display
  const getOrderStatusDisplay = (order: Order) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const bookingDate = new Date(order.bookingDate);
    const bookingDay = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate());
    
    if (order.status === 'COMPLETED') {
      return { label: 'Delivered', color: 'bg-green-100 text-green-800' };
    }
    if (order.status === 'CANCELLED') {
      return { label: 'Cancelled', color: 'bg-red-100 text-red-800' };
    }
    if (order.status === 'REFUNDED') {
      return { label: 'Refunded', color: 'bg-gray-100 text-gray-800' };
    }
    if (['CONFIRMED', 'IN_PROGRESS'].includes(order.status)) {
      if (bookingDay.getTime() === today.getTime()) {
        return { label: 'Out for Delivery', color: 'bg-orange-100 text-orange-800' };
      }
      return { label: 'In Transit', color: 'bg-yellow-100 text-yellow-800' };
    }
    if (order.status === 'PENDING') {
      return { label: 'Processing', color: 'bg-blue-100 text-blue-800' };
    }
    return { label: getStatusLabel(order.status), color: getStatusColor(order.status) };
  };

  // Get ETA for order
  const getOrderETA = (order: Order) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const bookingDate = new Date(order.bookingDate);
    const bookingDay = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate());
    
    if (order.status === 'COMPLETED' || order.status === 'CANCELLED' || order.status === 'REFUNDED') {
      return null;
    }
    
    if (bookingDay.getTime() === today.getTime()) {
      return `Today, ${order.bookingTime}`;
    }
    
    return formatFullDate(order.bookingDate);
  };

  // Calculate category distribution for pie chart
  const getCategoryDistribution = () => {
    if (!orders || orders.length === 0) {
      return [{ name: "No Data", value: 1, color: "#e5e7eb" }];
    }
    
    // Count by status for now since we don't have product categories
    const completed = orders.filter(o => o.status === 'COMPLETED').length;
    const inProgress = orders.filter(o => ['PENDING', 'CONFIRMED', 'IN_PROGRESS'].includes(o.status)).length;
    const cancelled = orders.filter(o => o.status === 'CANCELLED' || o.status === 'REFUNDED').length;
    
    const result = [];
    if (completed > 0) result.push({ name: "Delivered", value: completed, color: "#10b981" });
    if (inProgress > 0) result.push({ name: "In Progress", value: inProgress, color: "#3b82f6" });
    if (cancelled > 0) result.push({ name: "Cancelled", value: cancelled, color: "#ef4444" });
    
    return result.length > 0 ? result : [{ name: "No Orders", value: 1, color: "#e5e7eb" }];
  };

  // Get first arriving order for the banner
  const getArrivingTodayOrder = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return orders.find((o: Order) => {
      const bookingDate = new Date(o.bookingDate);
      const bookingDay = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate());
      return bookingDay.getTime() === today.getTime() && ['CONFIRMED', 'IN_PROGRESS'].includes(o.status);
    });
  };

  const arrivingTodayOrder = getArrivingTodayOrder();

  const productStats = [
    { 
      label: "Total Orders", 
      value: loading ? "-" : stats.totalOrders.toString(), 
      change: `${stats.thisMonth} this month`, 
      icon: FiShoppingCart, 
      color: "bg-blue-500" 
    },
    { 
      label: "In Transit", 
      value: loading ? "-" : stats.inTransit.toString(), 
      change: stats.arrivingToday > 0 ? `${stats.arrivingToday} arriving today` : "None arriving today", 
      icon: FiTruck, 
      color: "bg-blue-500" 
    },
    { 
      label: "Wishlist Items", 
      value: favoritesLoading ? "-" : stats.wishlistItems.toString(), 
      change: stats.onSale > 0 ? `${stats.onSale} on sale` : "None on sale", 
      icon: FiHeart, 
      color: "bg-pink-500" 
    },
    { 
      label: "Total Spent", 
      value: loading ? "-" : `₹${stats.totalSpent.toLocaleString()}`, 
      change: stats.totalOrders > 0 ? `${((stats.totalSpent / stats.totalOrders) || 0).toFixed(0)} avg` : "No orders", 
      icon: FiDollarSign, 
      color: "bg-primary-500" 
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {productStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  {stat.change}
                </span>
              </div>
              <h3 className="text-gray-600 text-sm">{stat.label}</h3>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Order Arriving Today Alert */}
      {arrivingTodayOrder && (
        <div className="bg-gradient-to-r from-blue-800 to-blue-800 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <FiTruck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Order Arriving Today!</h3>
                <p className="text-blue-100 text-sm">
                  {arrivingTodayOrder.orderNumber} • {arrivingTodayOrder.service?.title}
                  {orders.filter(o => {
                    const now = new Date();
                    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    const bookingDate = new Date(o.bookingDate);
                    const bookingDay = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate());
                    return bookingDay.getTime() === today.getTime() && ['CONFIRMED', 'IN_PROGRESS'].includes(o.status);
                  }).length > 1 && ` + ${stats.arrivingToday - 1} more`}
                </p>
              </div>
            </div>
            <Link href="/buyer/orders" className="bg-white text-blue-600 px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
              Track Order
            </Link>
          </div>
        </div>
      )}

      {/* Shop Now CTA (show when no orders arriving today) */}
      {!arrivingTodayOrder && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg mb-1">Ready to Shop?</h3>
              <p className="text-blue-100 text-sm">Discover products from local sellers near you</p>
            </div>
            <Link href="/buy-products" className="bg-white text-blue-600 px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2">
              <FiShoppingCart className="w-4 h-4" /> Shop Now
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders - LIVE DATA */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Recent Orders</h3>
            <div className="flex items-center gap-2">
              <button 
                onClick={refreshData}
                className="text-gray-500 hover:text-gray-700 p-1"
                title="Refresh"
              >
                <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <Link href="/buyer/orders" className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
                View All <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <FiShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No orders yet</p>
              <Link 
                href="/buy-products" 
                className="text-blue-600 font-semibold hover:underline"
              >
                Start shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 5).map((order) => {
                const statusDisplay = getOrderStatusDisplay(order);
                const eta = getOrderETA(order);
                
                return (
                  <div key={order.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex -space-x-2">
                      <img 
                        src={getServiceImage(order.service?.images)} 
                        alt={order.service?.title} 
                        className="w-12 h-12 rounded-lg object-cover border-2 border-white"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=100';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                      <p className="text-sm text-gray-500 truncate">{order.service?.title}</p>
                      <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusDisplay.color}`}>
                        {statusDisplay.label}
                      </span>
                      <p className="font-semibold text-gray-900 mt-1">₹{order.totalAmount.toLocaleString()}</p>
                      {eta && <p className="text-xs text-blue-600 mt-1">ETA: {eta}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Order Categories / Status Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="font-bold text-gray-900 mb-4">Purchase Categories</h3>
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie 
                    data={getCategoryDistribution()} 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={70} 
                    dataKey="value" 
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {getCategoryDistribution().map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-2">
                {getCategoryDistribution().map((cat) => (
                  <span key={cat.name} className="flex items-center gap-1 text-xs text-gray-600">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></span>
                    {cat.name}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Wishlist Items / Trending - LIVE DATA */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">
            {favorites.length > 0 ? 'Your Wishlist' : 'Trending Products'}
          </h3>
          <Link 
            href={favorites.length > 0 ? "/buyer/wishlist" : "/buyer/products"} 
            className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1"
          >
            {favorites.length > 0 ? 'View All' : 'Shop Now'} <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        {favoritesLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-8">
            <FiHeart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Your wishlist is empty</p>
            <Link 
              href="/buyer/products" 
              className="text-blue-600 font-semibold hover:underline"
            >
              Browse products to add favorites
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {favorites.slice(0, 3).map((fav) => {
              const hasDiscount = fav.service?.discountPrice && fav.service.discountPrice < fav.service.price;
              const discountPercent = hasDiscount 
                ? Math.round((1 - (fav.service.discountPrice! / fav.service.price)) * 100)
                : 0;
              
              return (
                <div key={fav.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all">
                  <div className="relative">
                    <img 
                      src={getServiceImage(fav.service?.images)} 
                      alt={fav.service?.title} 
                      className="w-full h-32 object-cover rounded-lg mb-3"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=100';
                      }}
                    />
                    {hasDiscount && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {discountPercent}% OFF
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-gray-900 truncate">{fav.service?.title}</p>
                  <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                    <FiStar className="w-4 h-4 text-yellow-500 fill-current" /> 
                    {fav.service?.rating?.toFixed(1) || '0.0'}
                    <span className="text-gray-400">({fav.service?.totalReviews || 0})</span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div>
                      {hasDiscount ? (
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-blue-600">₹{fav.service.discountPrice}</span>
                          <span className="text-sm text-gray-400 line-through">₹{fav.service.price}</span>
                        </div>
                      ) : (
                        <span className="font-bold text-blue-600">₹{fav.service?.price}</span>
                      )}
                    </div>
                    <Link 
                      href={`/buy-products/${fav.service?.id}`}
                      className="text-blue-600 text-sm font-medium hover:underline"
                    >
                      View
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================
export default function BuyerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { activeTab } = useTab();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      console.log('❌ No user data - redirecting to signin');
      router.replace('/signin');
      return;
    }
    
    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    } catch (error) {
      console.error('❌ Invalid user data - redirecting to signin');
      localStorage.clear();
      router.replace('/signin');
      return;
    }
    
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="p-6">
      {/* Welcome Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user.name}! 👋
        </h1>
        <p className="text-gray-600 mt-1">
          {activeTab === "jobs" && "Track your job applications and find new opportunities"}
          {activeTab === "services" && "Manage your service bookings and discover trusted professionals"}
          {activeTab === "products" && "Track your orders and shop from local sellers"}
        </p>
      </div>

      {/* Dynamic Content Based on Active Tab from Layout */}
      {activeTab === "jobs" && <JobsDashboard />}
      {activeTab === "services" && <ServicesDashboard />}
      {activeTab === "products" && <ProductsDashboard />}
    </div>
  );
}
