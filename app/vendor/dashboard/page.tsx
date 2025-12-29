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
  { label: "Total Bookings", value: "0", change: "0 active", icon: "FiShoppingBag", color: "bg-blue-500" },
  { label: "Average Rating", value: "0", change: "0 reviews", icon: "FiStar", color: "bg-yellow-500" },
  { label: "Active Services", value: "0", change: "0 pending", icon: "FiPackage", color: "bg-purple-500" },
];

const emptyProductStats = [
  { label: "Total Revenue", value: "₹0", change: "0%", icon: "FiDollarSign", color: "bg-green-500" },
  { label: "Total Orders", value: "0", change: "0 pending", icon: "FiShoppingCart", color: "bg-blue-500" },
  { label: "Products Listed", value: "0", change: "0 low stock", icon: "FiBox", color: "bg-purple-500" },
  { label: "Average Rating", value: "0", change: "0 reviews", icon: "FiStar", color: "bg-yellow-500" },
];

const emptyBookingStatusData = [
  { name: "Completed", value: 0, color: "#10b981" },
  { name: "Active", value: 0, color: "#3b82f6" },
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
    "Confirmed": "bg-blue-100 text-blue-800",
    "In Progress": "bg-purple-100 text-purple-800",
    "Completed": "bg-green-100 text-green-800",
    "Cancelled": "bg-red-100 text-red-800",
    "Processing": "bg-blue-100 text-blue-800",
    "Shipped": "bg-purple-100 text-purple-800",
    "Delivered": "bg-green-100 text-green-800",
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const iconName = typeof stat.icon === 'string' ? stat.icon : 'FiDollarSign';
          const Icon = iconMap[iconName] || FiDollarSign;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  {stat.change}
                </span>
              </div>
              <h3 className="text-gray-600 text-sm">{stat.label}</h3>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Today's Schedule Alert */}
      {recentBookings.length > 0 && (
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <FiCalendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{recentBookings.length} Recent Booking{recentBookings.length !== 1 ? 's' : ''}</h3>
                <p className="text-blue-100 text-sm">
                  {recentBookings[0] ? `Next: ${recentBookings[0].service} - ${recentBookings[0].customer}` : 'View your schedule'}
                </p>
              </div>
            </div>
            <Link href="/vendor/schedule" className="bg-white text-blue-600 px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
              View Schedule
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Recent Bookings</h3>
            <Link href="/vendor/bookings" className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
              View All <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentBookings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FiShoppingBag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No recent bookings</p>
              </div>
            ) : (
              recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {booking.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{booking.customer}</p>
                    <p className="text-sm text-gray-500">{booking.service} • {booking.date}, {booking.time}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                    <p className="font-semibold text-gray-900 mt-1">{booking.amount}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Booking Status Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="font-bold text-gray-900 mb-4">Booking Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={bookingStatusData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}>
                {bookingStatusData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            {bookingStatusData.map((item) => (
              <span key={item.name} className="flex items-center gap-1 text-xs text-gray-600">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                {item.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* My Services */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">My Services</h3>
          <Link href="/vendor/services/add" className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
            <FiPlus className="w-4 h-4" /> Add New
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {services.length === 0 ? (
            <div className="col-span-3 text-center py-8 text-gray-500">
              <FiPackage className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No services yet</p>
              <Link href="/vendor/services/add" className="text-blue-600 text-sm mt-2 inline-block">Add your first service</Link>
            </div>
          ) : (
            services.map((service) => (
              <div key={service.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all">
                <div className="flex items-start gap-3 mb-3">
                  <img src={service.image} alt={service.name} className="w-14 h-14 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">{service.name}</p>
                    <p className="text-blue-600 font-bold">{service.price}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{service.bookings} bookings</span>
                  <span className="flex items-center gap-1">
                    <FiStar className="w-4 h-4 text-yellow-500 fill-current" /> {service.rating}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(service.status)}`}>
                    {service.status}
                  </span>
                  <Link href={`/vendor/services/edit/${service.id}`} className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1">
                    <FiEdit className="w-3 h-3" /> Edit
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Earnings Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h3 className="font-bold text-gray-900 mb-4">Earnings Trend (Last 6 Months)</h3>
        {earningsData.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-gray-500">
            <div className="text-center">
              <FiTrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No earnings data available</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={earningsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`₹${value}`, 'Earnings']} />
              <Area type="monotone" dataKey="earnings" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const iconName = typeof stat.icon === 'string' ? stat.icon : 'FiDollarSign';
          const Icon = iconMap[iconName] || FiDollarSign;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  {stat.change}
                </span>
              </div>
              <h3 className="text-gray-600 text-sm">{stat.label}</h3>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Pending Orders Alert */}
      {recentOrders.length > 0 && (
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <FiTruck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{recentOrders.length} Recent Order{recentOrders.length !== 1 ? 's' : ''}</h3>
                <p className="text-blue-100 text-sm">
                  {recentOrders[0] ? `Latest: ${recentOrders[0].id} - ${recentOrders[0].status}` : 'View your orders'}
                </p>
              </div>
            </div>
            <Link href="/vendor/orders" className="bg-white text-blue-600 px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
              Manage Orders
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Recent Orders</h3>
            <Link href="/vendor/orders" className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
              View All <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FiShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No recent orders</p>
              </div>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {order.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{order.id}</p>
                    <p className="text-sm text-gray-500 truncate">{order.items}</p>
                    <p className="text-xs text-gray-400">{order.customer} • {order.date}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <p className="font-semibold text-gray-900 mt-1">{order.amount}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Product Categories Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="font-bold text-gray-900 mb-4">Sales by Category</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}>
                {categoryData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            {categoryData.map((item) => (
              <span key={item.name} className="flex items-center gap-1 text-xs text-gray-600">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                {item.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* My Products */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">My Products</h3>
          <Link href="/vendor/products/add" className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
            <FiPlus className="w-4 h-4" /> Add New
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {products.length === 0 ? (
            <div className="col-span-3 text-center py-8 text-gray-500">
              <FiBox className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No products yet</p>
              <Link href="/vendor/products/add" className="text-blue-600 text-sm mt-2 inline-block">Add your first product</Link>
            </div>
          ) : (
            products.map((product) => (
              <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all">
                <div className="flex items-start gap-3 mb-3">
                  <img src={product.image} alt={product.name} className="w-14 h-14 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">{product.name}</p>
                    <p className="text-blue-600 font-bold">{product.price}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>{product.sold} sold</span>
                  <span className="flex items-center gap-1">
                    <FiStar className="w-4 h-4 text-yellow-500 fill-current" /> {product.rating}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Stock: {product.stock}</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(product.status)}`}>
                    {product.status}
                  </span>
                </div>
                <div className="flex items-center justify-end mt-3 pt-3 border-t">
                  <Link href={`/vendor/products/edit/${product.id}`} className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1">
                    <FiEdit className="w-3 h-3" /> Edit
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h3 className="font-bold text-gray-900 mb-4">Revenue Trend (Last 6 Months)</h3>
        {revenueData.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-gray-500">
            <div className="text-center">
              <FiTrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No revenue data available</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
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
    <div className="p-6">
      {/* Welcome Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user?.name || "Vendor"}! 👋
              </h1>
              <span className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold animate-pulse">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                LIVE DATA
              </span>
            </div>
            <p className="text-gray-600 mt-1">
              {activeTab === "services" 
                ? "Manage your services and track bookings" 
                : "Manage your products and track orders"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Auto-refreshes every 30 seconds</p>
            <p className="text-xs text-gray-400">Last updated: {lastUpdated.toLocaleTimeString()}</p>
          </div>
        </div>
      </div>

      {/* Dynamic Content Based on Active Tab */}
      {activeTab === "services" && <ServicesDashboard onDataUpdate={() => setLastUpdated(new Date())} />}
      {activeTab === "products" && <ProductsDashboard />}
    </div>
  );
}
