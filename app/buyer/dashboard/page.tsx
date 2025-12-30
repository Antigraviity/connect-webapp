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
  FiBarChart2,
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {jobStatsData.map((stat, index) => {
          const Icon = stat.icon;
          const colors = [
            { bg: "bg-blue-50", text: "text-blue-600" },
            { bg: "bg-green-50", text: "text-green-600" },
            { bg: "bg-purple-50", text: "text-purple-600" },
            { bg: "bg-orange-50", text: "text-orange-600" },
          ][index % 4];

          return (
            <div key={index} className="bg-white rounded-2xl p-6 group transition-all duration-300 border border-gray-100 hover:border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-gray-400 text-[10px] font-semibold uppercase tracking-[0.15em] mb-2">{stat.label}</h3>
                  <p className="text-2xl font-semibold text-gray-900 tracking-tight mb-1">{stat.value}</p>
                  <span className="text-[10px] font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md">
                    {stat.change}
                  </span>
                </div>
                <div className={`w-14 h-14 rounded-2xl ${colors.bg} ${colors.text} flex items-center justify-center transition-all duration-300 group-hover:scale-110`}>
                  <Icon className="w-7 h-7" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upcoming Interviews Alert */}
      {applications.filter(app => app.status === 'INTERVIEW' || app.status === 'SHORTLISTED').length > 0 && (
        <div className="bg-white rounded-2xl p-6 overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-110"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-xl text-gray-900 tracking-tight flex items-center gap-2">
                <FiCalendar className="w-6 h-6 text-primary-300" />
                Upcoming Interviews
              </h3>
              <Link href="/buyer/applications" className="text-sm font-bold text-primary-500 border-b-2 border-transparent hover:border-primary-500 transition-all">
                View Schedule
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {applications
                .filter(app => app.status === 'INTERVIEW' || app.status === 'SHORTLISTED')
                .slice(0, 2)
                .map((app) => (
                  <Link key={app.id} href="/buyer/applications" className="bg-gray-50 rounded-xl p-5 hover:bg-white hover:shadow-lg transition-all group/card border border-transparent hover:border-primary-100">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-gray-900 text-lg">{app.job?.company || 'Company'}</p>
                        <p className="text-primary-500 font-semibold">{app.job?.title || 'Position'}</p>
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest bg-white px-3 py-1 rounded-lg text-primary-500 shadow-sm">
                        {app.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-4 text-sm font-medium text-gray-500">
                      <span className="flex items-center gap-1.5"><FiClock className="w-4 h-4 text-primary-300" /> {formatDate(app.createdAt)}</span>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Apply CTA - Show when no applications */}
      {!loading && applications.length === 0 && (
        <div className="bg-primary-50/50 rounded-3xl p-8 text-center group transition-all hover:bg-white hover:shadow-xl hover:shadow-primary-100/50">
          <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
            <FiBriefcase className="w-10 h-10 text-primary-300" />
          </div>
          <h3 className="font-semibold text-2xl text-gray-900 mb-2">Ready to Find Your Dream Job?</h3>
          <p className="text-gray-500 font-medium mb-8 max-w-md mx-auto">Browse thousands of job opportunities and apply today with your updated profile.</p>
          <Link href="/buyer/jobs" className="inline-flex items-center gap-3 bg-transparent text-primary-500 px-8 py-4 rounded-2xl font-semibold border-2 border-primary-500 hover:bg-gradient-to-r hover:from-primary-300 hover:to-primary-500 hover:text-white hover:border-transparent transition-all duration-300">
            Find Jobs <FiArrowRight className="w-5 h-5" />
          </Link>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Applications */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-semibold text-xl text-gray-900 tracking-tight">Recent Applications</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchJobsData}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all text-sm font-medium shadow-sm"
              >
                <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <Link href="/buyer/applications" className="text-sm font-semibold text-primary-500 flex items-center gap-1 hover:gap-2 transition-all">
                Explore All <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-100 border-t-primary-300"></div>
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-16 bg-gray-50/50 rounded-3xl">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FiFileText className="w-10 h-10 text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium mb-4">You haven't applied to any jobs yet</p>
              <Link
                href="/buyer/jobs"
                className="inline-flex items-center gap-2 text-primary-500 font-semibold hover:gap-3 transition-all"
              >
                Start your journey <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.slice(0, 5).map((app) => (
                <Link key={app.id} href="/buyer/applications" className="flex items-center gap-5 p-5 bg-white rounded-2xl hover:bg-gray-50 transition-all duration-300 group border border-transparent hover:border-gray-200">
                  <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 font-black text-xl group-hover:bg-gray-900 group-hover:text-white transition-all duration-300">
                    {(app.job?.company || 'C').charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-lg leading-tight mb-1 group-hover:text-black transition-colors">{app.job?.title || 'Job Position'}</p>
                    <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <span className="text-gray-800">{app.job?.company || 'Company'}</span>
                      <span className="w-1.5 h-1.5 bg-gray-200 rounded-full"></span>
                      {app.job?.location || 'Location'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest rounded-lg border-2 border-gray-100 text-gray-600`}>
                      {app.status}
                    </span>
                    <p className="text-xs font-medium text-gray-400 mt-3">{formatDate(app.createdAt)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Saved Jobs */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-semibold text-xl text-gray-900 tracking-tight">Saved Jobs</h3>
            <Link href="/buyer/saved-jobs" className="text-sm font-semibold text-primary-500 flex items-center gap-1 hover:gap-2 transition-all">
              View All <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-100 border-t-primary-300"></div>
            </div>
          ) : savedJobs.length === 0 ? (
            <div className="text-center py-16 bg-gray-50/50 rounded-3xl">
              <FiBookmark className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium mb-4">No saved jobs yet</p>
              <Link
                href="/buyer/jobs"
                className="text-primary-500 font-semibold hover:underline"
              >
                Browse jobs to save for later
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedJobs.slice(0, 3).map((saved) => (
                <Link key={saved.id} href="/buyer/jobs" className="block p-5 bg-white rounded-2xl hover:bg-gray-50 transition-all duration-300 group border border-gray-100 hover:border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 font-bold text-lg group-hover:bg-gray-900 group-hover:text-white transition-all">
                      {(saved.job?.company || 'C').charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 group-hover:text-primary-500 transition-colors uppercase tracking-tight text-sm">{saved.job?.title || 'Job Position'}</p>
                      <p className="text-xs text-gray-500">{saved.job?.company || 'Company'}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-xs text-gray-600 mb-4">
                    <p className="flex items-center gap-2"><FiMapPin className="w-4 h-4 text-gray-400" /> {saved.job?.location || 'Location'}</p>
                    <p className="flex items-center gap-2"><FiDollarSign className="w-4 h-4 text-gray-400" /> {saved.job?.salaryRange || 'Not specified'}</p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-[10px] text-gray-400 font-medium tracking-wide">Saved {formatDate(saved.createdAt)}</span>
                    <span className="text-primary-500 text-xs font-semibold">View Details</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {serviceStatsData.map((stat, index) => {
          const Icon = stat.icon;
          const colors = [
            { bg: "bg-blue-100", text: "text-blue-600" },
            { bg: "bg-green-100", text: "text-green-600" },
            { bg: "bg-purple-100", text: "text-purple-600" },
            { bg: "bg-orange-100", text: "text-orange-600" },
          ][index % 4];

          return (
            <div key={index} className="bg-white rounded-2xl p-6 group transition-all duration-300 border border-gray-100 hover:border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-gray-400 text-[10px] font-semibold uppercase tracking-[0.15em] mb-2">{stat.label}</h3>
                  <p className="text-2xl font-semibold text-gray-900 tracking-tight mb-1">{stat.value}</p>
                  <span className="text-[10px] font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md">
                    {stat.change}
                  </span>
                </div>
                <div className={`w-14 h-14 rounded-2xl ${colors.bg} ${colors.text} flex items-center justify-center transition-all duration-300 group-hover:scale-110`}>
                  <Icon className="w-7 h-7" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Book Services */}
      <div className="relative bg-gray-50 rounded-3xl p-12 overflow-hidden border border-gray-100 hover:border-gray-200 transition-all">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1621905251918-48416bd8575a?q=80&w=2000&auto=format&fit=crop"
            alt="Professional Services Background"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/70 to-white/10"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-xl text-center lg:text-left">
          <div className="w-16 h-16 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6">
            <FiPackage className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="font-semibold text-2xl text-gray-900 mb-3">Need a Professional Service?</h3>
          <p className="text-gray-500 font-normal text-base mb-8 max-w-md">Book trusted professionals for home maintenance, repair, and lifestyle services at your convenience.</p>
          <Link href="/buyer/services" className="inline-flex items-center gap-2 bg-transparent text-primary-500 px-6 py-3 rounded-xl font-semibold border-2 border-primary-500 hover:bg-gradient-to-r hover:from-primary-300 hover:to-primary-500 hover:text-white hover:border-transparent transition-all duration-300">
            Book Now <FiPlus className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Bookings - LIVE DATA */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-semibold text-xl text-gray-900 tracking-tight">Recent Bookings</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchBookings}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all text-sm font-medium shadow-sm"
              >
                <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <Link href="/buyer/bookings" className="text-sm font-semibold text-primary-500 flex items-center gap-1 hover:gap-2 transition-all">
                Manage All <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-100 border-t-primary-300"></div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-16 bg-gray-50/50 rounded-3xl">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FiCalendar className="w-10 h-10 text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium mb-4">No services booked yet</p>
              <Link
                href="/book-services"
                className="inline-flex items-center gap-2 text-primary-500 font-semibold hover:gap-3 transition-all"
              >
                Book a service <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.slice(0, 5).map((booking) => (
                <Link key={booking.id} href="/buyer/bookings" className="flex items-center gap-5 p-5 bg-white rounded-2xl hover:bg-gray-50 transition-all duration-300 group border border-transparent hover:border-gray-200">
                  <div className="relative">
                    <img
                      src={getServiceImage(booking.service?.images)}
                      alt={booking.service?.title}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-sm transition-all"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1581578731548-c64695cc6954?w=100';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-lg leading-tight mb-1 group-hover:text-black transition-colors">{booking.service?.title || 'Service Title'}</p>
                    <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <span className="text-gray-800">{booking.seller?.name || 'Service Provider'}</span>
                      <span className="w-1.5 h-1.5 bg-gray-200 rounded-full"></span>
                      <FiClock className="w-3.5 h-3.5 text-gray-400" />
                      {formatDate(booking.bookingDate)} • {booking.bookingTime}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest rounded-lg border-2 border-gray-100 text-gray-600`}>
                      {getStatusLabel(booking.status)}
                    </span>
                    <p className="font-semibold text-gray-900 mt-2">₹{booking.totalAmount.toLocaleString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Bookings Alert */}
      {bookings.filter(b => ['PENDING', 'CONFIRMED'].includes(b.status)).length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 hover:border-gray-200 transition-all">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
              <FiCalendar className="w-5 h-5 text-gray-400" />
              Upcoming Bookings
            </h3>
            <Link href="/buyer/bookings" className="text-sm font-semibold text-primary-500 hover:text-primary-600 transition-colors">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookings
              .filter(b => ['PENDING', 'CONFIRMED'].includes(b.status))
              .slice(0, 3)
              .map((booking) => (
                <div key={booking.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-gray-200 transition-all">
                  <p className="font-semibold text-gray-900">{booking.service?.title}</p>
                  <p className="text-sm text-gray-500 mt-1">{booking.seller?.name}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <FiClock className="w-3 h-3" />
                      {formatDate(booking.bookingDate)}
                    </span>
                    <span>{booking.bookingTime}</span>
                    <span className="bg-primary-50 text-primary-600 px-2 py-0.5 rounded-md font-medium">{getStatusLabel(booking.status)}</span>
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
      const response = await fetch(`/api/orders?buyerId=${userId}&limit=50&type=PRODUCT`);
      const data = await response.json();

      if (data.success) {
        const ordersList = data.orders || [];
        setOrders(ordersList);

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {productStats.map((stat, index) => {
          const Icon = stat.icon;
          const colors = [
            { bg: "bg-blue-100", text: "text-blue-600" },
            { bg: "bg-blue-50", text: "text-blue-400" },
            { bg: "bg-pink-100", text: "text-pink-600" },
            { bg: "bg-gray-100", text: "text-gray-900" },
          ][index % 4];

          return (
            <div key={index} className="bg-white rounded-2xl p-6 group transition-all duration-300 border border-gray-100 hover:border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-gray-400 text-[10px] font-semibold uppercase tracking-[0.15em] mb-2">{stat.label}</h3>
                  <p className="text-2xl font-semibold text-gray-900 tracking-tight mb-1">{stat.value}</p>
                  <span className="text-[10px] font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md">
                    {stat.change}
                  </span>
                </div>
                <div className={`w-14 h-14 rounded-2xl ${colors.bg} ${colors.text} flex items-center justify-center transition-all duration-300 group-hover:scale-110`}>
                  <Icon className="w-7 h-7" />
                </div>
              </div>
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
                <h3 className="font-semibold text-lg">Order Arriving Today!</h3>
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
            <Link href="/buyer/orders" className="bg-transparent text-blue-600 px-5 py-2.5 rounded-lg font-semibold border-2 border-blue-600 hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-600 hover:text-white hover:border-transparent transition-all duration-300">
              Track Order
            </Link>
          </div>
        </div>
      )}

      {/* Shop Now CTA */}
      {!arrivingTodayOrder && (
        <div className="relative bg-gray-50 rounded-3xl p-12 overflow-hidden border border-gray-100 hover:border-gray-200 transition-all">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2000&auto=format&fit=crop"
              alt="Shopping Background"
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/70 to-white/10"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 max-w-xl text-center lg:text-left">
            <div className="w-16 h-16 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6">
              <FiShoppingCart className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-2xl text-gray-900 mb-3">Ready to Shop?</h3>
            <p className="text-gray-500 font-normal text-base mb-8 max-w-md">Discover products from local sellers near you</p>
            <Link href="/buy-products" className="inline-flex items-center gap-2 bg-transparent text-primary-500 px-6 py-3 rounded-xl font-semibold border-2 border-primary-500 hover:bg-gradient-to-r hover:from-primary-300 hover:to-primary-500 hover:text-white hover:border-transparent transition-all duration-300">
              Shop Now <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-semibold text-xl text-gray-900 tracking-tight">Recent Orders</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={refreshData}
                className="text-primary-300 hover:text-primary-500 p-2 bg-primary-50 rounded-xl transition-all"
                title="Refresh"
              >
                <FiRefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <Link href="/buyer/orders" className="text-sm font-semibold text-primary-500 flex items-center gap-1 hover:gap-2 transition-all">
                Track All <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-100 border-t-primary-300"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 bg-gray-50/50 rounded-3xl">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FiShoppingCart className="w-10 h-10 text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium mb-4">No orders placed yet</p>
              <Link
                href="/buy-products"
                className="inline-flex items-center gap-2 text-primary-500 font-semibold hover:gap-3 transition-all"
              >
                Start shopping <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.slice(0, 5).map((order) => {
                const statusDisplay = getOrderStatusDisplay(order);
                const eta = getOrderETA(order);

                return (
                  <Link key={order.id} href="/buyer/orders" className="flex items-center gap-5 p-5 bg-white rounded-2xl hover:bg-gray-50 transition-all duration-300 group border border-transparent hover:border-gray-200">
                    <div className="relative">
                      <img
                        src={getServiceImage(order.service?.images)}
                        alt={order.service?.title}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-sm transition-all"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=100';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-lg leading-tight mb-1 group-hover:text-black transition-colors">{order.orderNumber}</p>
                      <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                        <span className="text-gray-800">{order.service?.title}</span>
                      </p>
                      <p className="text-xs font-medium text-gray-400 mt-1">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest rounded-lg border-2 border-gray-100 text-gray-600`}>
                        {statusDisplay.label}
                      </span>
                      <p className="font-semibold text-gray-900 mt-2">₹{order.totalAmount.toLocaleString()}</p>
                      {eta && <div className="mt-1 flex items-center justify-end gap-1 text-[10px] font-semibold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-full inline-block">ETA: {eta}</div>}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Wishlist Items */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-semibold text-xl text-gray-900 tracking-tight">
              {favorites.length > 0 ? 'Your Wishlist' : 'Trending Products'}
            </h3>
            <Link
              href={favorites.length > 0 ? "/buyer/wishlist" : "/buyer/products"}
              className="text-sm font-semibold text-primary-500 flex items-center gap-1 hover:gap-2 transition-all"
            >
              {favorites.length > 0 ? 'View All' : 'Shop Now'} <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {favoritesLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-100 border-t-primary-300"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(favorites.length > 0 ? favorites : []).slice(0, 3).map((fav) => {
                const hasDiscount = fav.service?.discountPrice && fav.service.discountPrice < fav.service.price;
                const discountPercent = hasDiscount
                  ? Math.round((1 - (fav.service.discountPrice! / fav.service.price)) * 100)
                  : 0;

                return (
                  <Link key={fav.id} href={`/buy-products/${fav.service?.id}`} className="group bg-white rounded-2xl p-4 hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200">
                    <div className="relative overflow-hidden rounded-xl mb-4">
                      <img
                        src={getServiceImage(fav.service?.images)}
                        alt={fav.service?.title}
                        className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=100';
                        }}
                      />
                      {hasDiscount && (
                        <span className="absolute top-2 left-2 bg-gray-900 text-white text-[10px] font-semibold px-2.5 py-1 rounded-lg">
                          {discountPercent}% OFF
                        </span>
                      )}
                    </div>
                    <p className="font-semibold text-gray-900 truncate mb-1 group-hover:text-black transition-colors tracking-tight text-sm">{fav.service?.title}</p>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                      <FiStar className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                      {fav.service?.rating?.toFixed(1) || '0.0'}
                      <span className="text-gray-400">({fav.service?.totalReviews || 0})</span>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div>
                        {hasDiscount ? (
                          <div className="flex items-baseline gap-2">
                            <span className="font-semibold text-lg text-gray-900">₹{fav.service.discountPrice}</span>
                            <span className="text-xs text-gray-400 line-through font-medium">₹{fav.service.price}</span>
                          </div>
                        ) : (
                          <span className="font-semibold text-lg text-gray-900">₹{fav.service?.price}</span>
                        )}
                      </div>
                      <div className="bg-gray-50 text-gray-400 p-2 rounded-xl group-hover:bg-gradient-to-r group-hover:from-primary-300 group-hover:to-primary-500 group-hover:text-white transition-all">
                        <FiArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
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
    <div className="p-6 lg:p-10 bg-gray-50/30 min-h-screen">
      {/* Welcome Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-semibold text-gray-900 tracking-tight mb-2">
            Welcome back, <span className="text-primary-500">{user.name}</span>! 👋
          </h1>
          <p className="text-gray-500 font-normal text-sm lg:text-base max-w-2xl tracking-normal">
            {activeTab === "jobs" && "Track your career progress and discover exclusive opportunities tailored for you."}
            {activeTab === "services" && "Manage your professional service bookings and explore top-rated specialists."}
            {activeTab === "products" && "Keep track of your purchases and shop curated products from verified local sellers."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white p-3 px-5 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-[10px] font-semibold uppercase text-gray-400 tracking-[0.15em] leading-none mb-1.5">Today's Date</p>
            <p className="font-semibold text-gray-900 tracking-tight leading-none text-lg">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
          </div>
        </div>
      </div>

      {/* Dynamic Content Based on Active Tab from Layout */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
        {activeTab === "jobs" && <JobsDashboard />}
        {activeTab === "services" && <ServicesDashboard />}
        {activeTab === "products" && <ProductsDashboard />}
      </div>
    </div>
  );
}
