"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useVendorTab } from "../layout";
import {
  FiTrendingUp,
  FiShoppingBag,
  FiStar,
  FiPackage,
  FiDollarSign,
  FiUsers,
  FiCalendar,
  FiClock,
  FiArrowRight,
  FiPlus,
  FiEye,
  FiEdit,
  FiBox,
  FiTruck,
  FiShoppingCart,
  FiAlertCircle,
  FiCheckCircle,
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

// ==================== ICON MAPPING ====================
const iconMap: Record<string, any> = {
  FiDollarSign,
  FiShoppingBag,
  FiStar,
  FiPackage,
  FiShoppingCart,
  FiBox,
  FiUsers,
  FiTrendingUp,
};

// ==================== EMPTY/DEFAULT DATA (No hardcoded dummy data) ====================
const emptyServiceStats = [
  { label: "Total Earnings", value: "₹0", change: "0%", icon: "FiDollarSign", color: "bg-green-500" },
  { label: "Total Bookings", value: "0", change: "0 active", icon: "FiShoppingBag", color: "bg-emerald-500" },
  { label: "Average Rating", value: "0", change: "0 reviews", icon: "FiStar", color: "bg-yellow-500" },
  { label: "Active Services", value: "0", change: "0 pending", icon: "FiPackage", color: "bg-purple-500" },
];

const emptyProductStats = [
  { label: "Total Revenue", value: "₹0", change: "0%", icon: "FiDollarSign", color: "bg-green-500" },
  { label: "Total Orders", value: "0", change: "0 pending", icon: "FiShoppingCart", color: "bg-emerald-500" },
  { label: "Products Listed", value: "0", change: "0 low stock", icon: "FiBox", color: "bg-purple-500" },
  { label: "Average Rating", value: "0", change: "0 reviews", icon: "FiStar", color: "bg-yellow-500" },
];

const emptyBookingStatusData = [
  { name: "Completed", value: 0, color: "#059669" },
  { name: "Active", value: 0, color: "#0d9488" },
  { name: "Pending", value: 0, color: "#f59e0b" },
  { name: "Cancelled", value: 0, color: "#ef4444" },
];

const emptyCategoryData = [
  { name: "No Data", value: 1, color: "#e5e7eb" },
];

// ==================== HELPER FUNCTIONS ====================
const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    "Pending": "bg-yellow-100 text-yellow-800",
    "Confirmed": "bg-emerald-100 text-emerald-800",
    "In Progress": "bg-teal-100 text-teal-800",
    "Completed": "bg-emerald-100 text-emerald-800",
    "Cancelled": "bg-red-100 text-red-800",
    "Processing": "bg-emerald-100 text-emerald-800",
    "Shipped": "bg-teal-100 text-teal-800",
    "Delivered": "bg-emerald-100 text-emerald-800",
    "Active": "bg-green-100 text-green-800",
    "Low Stock": "bg-orange-100 text-orange-800",
    "Out of Stock": "bg-red-100 text-red-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};

// ==================== SERVICES DASHBOARD ====================
function ServicesDashboard({ onDataUpdate }: { onDataUpdate?: () => void }) {
  const router = useRouter();
  // State for live data - initialized with empty data, not dummy data
  const [stats, setStats] = useState(emptyServiceStats);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [earningsData, setEarningsData] = useState<any[]>([]);
  const [bookingStatusData, setBookingStatusData] = useState(emptyBookingStatusData);
  const [loading, setLoading] = useState(true);
  const [noUser, setNoUser] = useState(false);

  // Fetch live data from APIs
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Get seller ID from localStorage
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          console.error('❌ No user found in localStorage');
          console.log('💡 Please login to see your dashboard data');
          setNoUser(true);
          setLoading(false);
          // Redirect to login page
          router.push('/signin');
          return;
        }

        const user = JSON.parse(userStr);
        const sellerId = user.id;

        console.log('🔄 Fetching LIVE vendor dashboard data...');
        console.log('👤 Seller ID:', sellerId);
        console.log('📊 Loading real-time data from database...');

        const [statsRes, bookingsRes, servicesRes, earningsRes, statusRes] = await Promise.all([
          fetch(`/api/vendor/stats?sellerId=${sellerId}`),
          fetch(`/api/vendor/recent-orders?sellerId=${sellerId}&limit=4`),
          fetch(`/api/vendor/my-services?sellerId=${sellerId}&type=SERVICE&limit=3`),
          fetch(`/api/vendor/earnings-chart?sellerId=${sellerId}`),
          fetch(`/api/vendor/booking-status?sellerId=${sellerId}`),
        ]);

        // Check for errors
        if (!statsRes.ok) {
          console.error('❌ Stats API failed:', statsRes.status, statsRes.statusText);
          throw new Error('Failed to fetch stats');
        }
        if (!bookingsRes.ok) {
          console.error('❌ Bookings API failed:', bookingsRes.status, bookingsRes.statusText);
          throw new Error('Failed to fetch bookings');
        }
        if (!servicesRes.ok) {
          console.error('❌ Services API failed:', servicesRes.status, servicesRes.statusText);
          throw new Error('Failed to fetch services');
        }
        if (!earningsRes.ok) {
          console.error('❌ Earnings API failed:', earningsRes.status, earningsRes.statusText);
          throw new Error('Failed to fetch earnings');
        }
        if (!statusRes.ok) {
          console.error('❌ Status API failed:', statusRes.status, statusRes.statusText);
          throw new Error('Failed to fetch status');
        }

        const [statsData, bookingsData, servicesData, earningsDataRes, statusData] = await Promise.all([
          statsRes.json(),
          bookingsRes.json(),
          servicesRes.json(),
          earningsRes.json(),
          statusRes.json(),
        ]);

        console.log('✅ LIVE DATA LOADED SUCCESSFULLY!');
        console.log('📈 Stats:', statsData);
        console.log('📋 Recent Bookings:', bookingsData.length, 'orders');
        console.log('🛍️ Services:', servicesData.length, 'items');
        console.log('💰 Earnings Data:', earningsDataRes);
        console.log('📊 Status Distribution:', statusData);
        console.log('🎯 All data is now LIVE from your database!');

        // Update state with live data
        setStats(statsData);
        setRecentBookings(bookingsData);
        setServices(servicesData);
        setEarningsData(earningsDataRes);
        setBookingStatusData(statusData);
        setLoading(false);

        // Notify parent component of data update
        if (onDataUpdate) {
          onDataUpdate();
        }
      } catch (error) {
        console.error('❌ Error fetching dashboard data:', error);
        console.log('💡 Check your database connection and API routes');
        // Keep empty data on error - no dummy data fallback
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Optional: Refresh data every 30 seconds for real-time updates
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => {
          const iconName = typeof stat.icon === 'string' ? stat.icon : 'FiDollarSign';
          const Icon = iconMap[iconName] || FiDollarSign;
          const colors = [
            { bg: "bg-emerald-50", text: "text-emerald-600" },
            { bg: "bg-teal-50", text: "text-teal-600" },
            { bg: "bg-amber-50", text: "text-amber-600" },
            { bg: "bg-rose-50", text: "text-rose-600" },
          ][index % 4];

          return (
            <div key={index} className="bg-white rounded-2xl p-4 sm:p-6 group transition-all duration-300 border border-gray-100 hover:border-emerald-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="text-gray-400 text-[10px] font-semibold uppercase tracking-[0.15em] mb-1 sm:mb-2 truncate">{stat.label}</h3>
                  <p className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight mb-1 font-heading truncate">{stat.value}</p>
                  <span className="inline-block text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {stat.change}
                  </span>
                </div>
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${colors.bg} ${colors.text} flex items-center justify-center transition-all duration-300 group-hover:scale-110 shrink-0 ml-3`}>
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Today's Schedule Alert */}
      <div className="bg-white rounded-2xl p-6 overflow-hidden relative group border border-gray-100 shadow-sm">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-110"></div>
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h3 className="font-bold text-lg sm:text-xl text-gray-900 tracking-tight flex items-center gap-2">
              <FiCalendar className="w-6 h-6 text-emerald-300 shrink-0" />
              Recent Service Bookings
            </h3>
            <Link href="/vendor/schedule" className="text-sm font-bold text-emerald-600 border-b-2 border-transparent hover:border-emerald-600 transition-all">
              View Schedule
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {recentBookings.slice(0, 2).map((booking) => (
              <div key={booking.id} className="bg-gray-50 rounded-xl p-5 hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-emerald-100">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-gray-900 text-lg">{booking.customer}</p>
                    <p className="text-emerald-600 font-bold">{booking.service}</p>
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg shadow-sm ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-4 text-sm font-bold text-gray-500">
                  <span className="flex items-center gap-1.5"><FiClock className="w-4 h-4 text-emerald-300" /> {booking.date} • {booking.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Bookings List */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-xl text-gray-900 tracking-tight">Recent Activity</h3>
            <div className="flex items-center gap-3">
              <Link href="/vendor/bookings" className="text-sm font-bold text-emerald-600 flex items-center gap-1 hover:gap-2 transition-all">
                Explore All <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            {recentBookings.length === 0 ? (
              <div className="text-center py-16 bg-gray-50/50 rounded-3xl">
                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <FiShoppingBag className="w-10 h-10 text-gray-300" />
                </div>
                <p className="text-gray-500 font-bold">No recent bookings found</p>
              </div>
            ) : (
              recentBookings.map((booking) => (
                <div key={booking.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 p-4 sm:p-5 bg-white rounded-2xl hover:bg-gray-50 transition-all duration-300 group border border-transparent hover:border-gray-200">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 font-black text-xl group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shrink-0">
                      {booking.avatar || (booking.customer || 'C').charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0 sm:hidden">
                      <p className="font-bold text-gray-900 text-lg leading-tight mb-1 truncate">{booking.customer}</p>
                      <p className="text-xs font-bold text-gray-500 truncate">{booking.service}</p>
                    </div>
                  </div>
                  <div className="hidden sm:block flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-lg leading-tight mb-1 group-hover:text-black transition-colors truncate">{booking.customer}</p>
                    <p className="text-sm font-bold text-gray-500 flex items-center gap-2 truncate">
                      <span className="text-gray-800">{booking.service}</span>
                      <span className="w-1.5 h-1.5 bg-gray-200 rounded-full shrink-0"></span>
                      {booking.date}
                    </p>
                  </div>
                  <div className="flex items-center justify-between w-full sm:w-auto sm:text-right gap-4">
                    <div className="sm:hidden text-xs text-gray-500 font-medium">
                      {booking.date}
                    </div>
                    <div className="flex items-center sm:flex-col gap-3 sm:gap-2">
                      <span className={`px-3 sm:px-4 py-1 sm:py-1.5 text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-lg border-2 border-gray-100 text-gray-600 bg-white`}>
                        {booking.status}
                      </span>
                      <p className="font-bold text-gray-900 text-sm sm:text-base">{booking.amount}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* My Services */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <h3 className="font-bold text-xl text-gray-900 tracking-tight">Active Services</h3>
          <Link href="/vendor/services/add" className="text-sm font-bold text-emerald-600 flex items-center gap-1 hover:gap-2 transition-all">
            <FiPlus className="w-4 h-4" /> Add New Service
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.length === 0 ? (
            <div className="col-span-3 text-center py-16 bg-gray-50/50 rounded-3xl">
              <FiPackage className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 font-bold">No services listed yet</p>
              <Link href="/vendor/services/add" className="text-emerald-600 text-sm mt-3 inline-block font-bold">Add your first service</Link>
            </div>
          ) : (
            services.map((service) => (
              <div key={service.id} className="group bg-white rounded-2xl p-4 sm:p-5 hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-emerald-200">
                <div className="relative overflow-hidden rounded-xl mb-4">
                  <img src={service.image} alt={service.name} className="w-full h-32 sm:h-40 object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold text-gray-900 truncate tracking-tight text-base sm:text-lg">{service.name}</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 mb-4">
                  <FiStar className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                  {service.rating}
                  <span className="text-gray-400 hidden sm:inline">({service.bookings} bookings)</span>
                  <span className="text-gray-400 sm:hidden">({service.bookings})</span>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="font-bold text-lg sm:text-xl text-emerald-600">{service.price}</span>
                  <Link href={`/vendor/services/edit/${service.id}`} className="bg-gray-50 text-gray-400 p-2 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                    <FiEdit className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <h3 className="font-bold text-xl text-gray-900 tracking-tight mb-8">Performance Trend</h3>
        {earningsData.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-gray-500 bg-gray-50/50 rounded-3xl">
            <div className="text-center">
              <FiTrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="font-bold">No performance data yet</p>
            </div>
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={earningsData}>
                <defs>
                  <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  formatter={(value) => [`₹${value}`, 'Earnings']}
                />
                <Area type="monotone" dataKey="earnings" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorEarnings)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== PRODUCTS DASHBOARD ====================
function ProductsDashboard({ onDataUpdate }: { onDataUpdate?: () => void }) {
  const router = useRouter();
  // State for live data - initialized with empty data, not dummy data
  const [stats, setStats] = useState(emptyProductStats);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState(emptyCategoryData);
  const [loading, setLoading] = useState(true);
  const [noUser, setNoUser] = useState(false);

  // Fetch live data from APIs
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          console.error('❌ No user found in localStorage');
          setNoUser(true);
          setLoading(false);
          // Redirect to login page
          router.push('/signin');
          return;
        }

        const user = JSON.parse(userStr);
        const sellerId = user.id;

        console.log('🔄 Fetching LIVE products dashboard data...');
        console.log('👤 Seller ID:', sellerId);

        const [statsRes, ordersRes, productsRes] = await Promise.all([
          fetch(`/api/vendor/stats?sellerId=${sellerId}`),
          fetch(`/api/vendor/recent-orders?sellerId=${sellerId}&limit=4`),
          fetch(`/api/vendor/my-services?sellerId=${sellerId}&type=PRODUCT&limit=3`),
        ]);

        if (!statsRes.ok || !ordersRes.ok || !productsRes.ok) {
          throw new Error('Failed to fetch some data');
        }

        const [statsData, ordersData, productsData] = await Promise.all([
          statsRes.json(),
          ordersRes.json(),
          productsRes.json(),
        ]);

        console.log('✅ PRODUCTS DATA LOADED!');
        console.log('📊 Stats:', statsData);
        console.log('📋 Recent Orders:', ordersData.length, 'orders');
        console.log('🛍️ Products:', productsData.length, 'items');

        setStats(statsData);
        setRecentOrders(ordersData);
        setProducts(productsData);
        setLoading(false);

        if (onDataUpdate) {
          onDataUpdate();
        }
      } catch (error) {
        console.error('❌ Error fetching products dashboard:', error);
        // Keep empty data on error - no dummy data fallback
        setLoading(false);
      }
    };

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => {
          const iconName = typeof stat.icon === 'string' ? stat.icon : 'FiDollarSign';
          const Icon = iconMap[iconName] || FiDollarSign;
          const colors = [
            { bg: "bg-emerald-50", text: "text-emerald-600" },
            { bg: "bg-teal-50", text: "text-teal-600" },
            { bg: "bg-amber-50", text: "text-amber-600" },
            { bg: "bg-rose-50", text: "text-rose-600" },
          ][index % 4];

          return (
            <div key={index} className="bg-white rounded-2xl p-4 sm:p-6 group transition-all duration-300 border border-gray-100 hover:border-emerald-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="text-gray-400 text-[10px] font-semibold uppercase tracking-[0.15em] mb-1 sm:mb-2 truncate">{stat.label}</h3>
                  <p className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight mb-1 font-heading truncate">{stat.value}</p>
                  <span className="inline-block text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {stat.change}
                  </span>
                </div>
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${colors.bg} ${colors.text} flex items-center justify-center transition-all duration-300 group-hover:scale-110 shrink-0 ml-3`}>
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl p-6 overflow-hidden relative group border border-gray-100 shadow-sm">
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-110"></div>
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h3 className="font-bold text-lg sm:text-xl text-gray-900 tracking-tight flex items-center gap-2">
              <FiTruck className="w-6 h-6 text-teal-300 shrink-0" />
              Latest Orders
            </h3>
            <Link href="/vendor/orders" className="text-sm font-bold text-emerald-600 border-b-2 border-transparent hover:border-emerald-600 transition-all">
              Manage Orders
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {recentOrders.slice(0, 2).map((order) => (
              <div key={order.id} className="bg-gray-50 rounded-xl p-5 hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-emerald-100">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-gray-900 text-xs sm:text-sm mb-1 uppercase tracking-tight truncate">{order.id}</p>
                    <p className="text-emerald-600 font-bold truncate">{order.items}</p>
                  </div>
                  <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-2 sm:px-3 py-1 rounded-lg shadow-sm shrink-0 ml-2 ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-xs sm:text-sm font-bold text-gray-500">
                  <span className="flex items-center gap-1.5"><FiUsers className="w-4 h-4 text-teal-300 shrink-0" /> {order.customer}</span>
                  <span className="flex items-center gap-1.5"><FiClock className="w-4 h-4 text-teal-300 shrink-0" /> {order.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders List */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-xl text-gray-900 tracking-tight">Recent Activity</h3>
            <div className="flex items-center gap-3">
              <Link href="/vendor/orders" className="text-sm font-bold text-emerald-600 flex items-center gap-1 hover:gap-2 transition-all">
                Explore All <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            {recentOrders.length === 0 ? (
              <div className="text-center py-16 bg-gray-50/50 rounded-3xl">
                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <FiShoppingCart className="w-10 h-10 text-gray-300" />
                </div>
                <p className="text-gray-500 font-bold">No recent orders found</p>
              </div>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 p-4 sm:p-5 bg-white rounded-2xl hover:bg-gray-50 transition-all duration-300 group border border-transparent hover:border-gray-200">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 font-black text-xl group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shrink-0">
                      {order.avatar || (order.customer || 'C').charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0 sm:hidden">
                      <p className="font-bold text-gray-900 text-base leading-tight mb-1 truncate">{order.id}</p>
                      <p className="text-xs font-bold text-gray-500 truncate">{order.items}</p>
                    </div>
                  </div>
                  <div className="hidden sm:block flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-lg leading-tight mb-1 group-hover:text-black transition-colors truncate">{order.id}</p>
                    <p className="text-sm font-bold text-gray-500 flex items-center gap-2 truncate">
                      <span className="text-gray-800 truncate max-w-[200px]">{order.items}</span>
                      <span className="w-1.5 h-1.5 bg-gray-200 rounded-full shrink-0"></span>
                      {order.date}
                    </p>
                  </div>
                  <div className="flex items-center justify-between w-full sm:w-auto sm:text-right gap-4">
                    <div className="sm:hidden text-xs text-gray-500 font-medium">
                      {order.date}
                    </div>
                    <div className="flex items-center sm:flex-col gap-3 sm:gap-2">
                      <span className={`px-3 sm:px-4 py-1 sm:py-1.5 text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-lg border-2 border-gray-100 text-gray-600 bg-white`}>
                        {order.status}
                      </span>
                      <p className="font-bold text-gray-900 text-sm sm:text-base">{order.amount}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* My Products */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mt-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <h3 className="font-bold text-xl text-gray-900 tracking-tight">Active Products</h3>
          <Link href="/vendor/products/add" className="text-sm font-bold text-emerald-600 flex items-center gap-1 hover:gap-2 transition-all">
            <FiPlus className="w-4 h-4" /> Add New Product
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.length === 0 ? (
            <div className="col-span-3 text-center py-16 bg-gray-50/50 rounded-3xl">
              <FiBox className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 font-bold">No products listed yet</p>
              <Link href="/vendor/products/add" className="text-emerald-600 text-sm mt-3 inline-block font-bold">Add your first product</Link>
            </div>
          ) : (
            products.map((product) => (
              <div key={product.id} className="group bg-white rounded-2xl p-4 sm:p-5 hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-emerald-200 shadow-sm">
                <div className="relative overflow-hidden rounded-xl mb-4">
                  <img src={product.image} alt={product.name} className="w-full h-32 sm:h-40 object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold text-gray-900 truncate tracking-tight text-base sm:text-lg">{product.name}</p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <FiStar className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                    {product.rating}
                  </div>
                  <span className="text-gray-400 hidden sm:inline">({product.sold} sold • Stock: {product.stock})</span>
                  <span className="text-gray-400 sm:hidden">({product.sold} sold)</span>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="font-bold text-lg sm:text-xl text-emerald-600">{product.price}</span>
                  <Link href={`/vendor/products/edit/${product.id}`} className="bg-gray-50 text-gray-400 p-2 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                    <FiEdit className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mt-8">
        <h3 className="font-bold text-xl text-gray-900 tracking-tight mb-8">Revenue Trend</h3>
        {revenueData.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-gray-500 bg-gray-50/50 rounded-3xl font-bold">
            <div className="text-center">
              <FiTrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No revenue data yet</p>
            </div>
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  formatter={(value) => [`₹${value}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#0d9488" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================
export default function VendorDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const { activeTab } = useVendorTab();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      document.title = "Seller Dashboard | Forge India Connect";
    } else {
      // No user found, redirect to login
      router.push('/signin');
      return;
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // If no user, show nothing (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-10 bg-gray-50/30 min-h-screen">
      {/* Welcome Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4">
        <div className="text-center sm:text-left">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 tracking-tight mb-1">
            Welcome back, <span className="text-emerald-600">{user?.name}</span>! 👋
          </h1>
          <p className="text-gray-500 font-normal text-xs sm:text-sm max-w-2xl tracking-normal">
            {activeTab === "services"
              ? "Manage your professional service bookings and track your business performance."
              : "Manage your product inventory and track your store orders in real-time."}
          </p>
        </div>
        <div className="flex items-center justify-center sm:justify-end gap-3">
          <div className="bg-white p-2 sm:p-2.5 px-3 sm:px-4 rounded-xl border border-gray-100 shadow-sm transition-all hover:bg-gray-50">
            <p className="text-[8px] sm:text-[10px] font-semibold uppercase text-gray-400 tracking-[0.15em] leading-none mb-1">Today's Date</p>
            <p className="font-semibold text-gray-900 tracking-tight leading-none text-sm sm:text-base">
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
        {activeTab === "services" && <ServicesDashboard onDataUpdate={() => setLastUpdated(new Date())} />}
        {activeTab === "products" && <ProductsDashboard onDataUpdate={() => setLastUpdated(new Date())} />}
      </div>
    </div>
  );
}
