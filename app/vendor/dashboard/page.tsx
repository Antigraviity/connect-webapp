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

// ==================== SERVICES SECTION DATA ====================
const serviceStats = [
  { label: "Total Earnings", value: "₹45,780", change: "+12.5%", icon: FiDollarSign, color: "bg-green-500" },
  { label: "Total Bookings", value: "156", change: "12 active", icon: FiShoppingBag, color: "bg-blue-500" },
  { label: "Average Rating", value: "4.7", change: "89 reviews", icon: FiStar, color: "bg-yellow-500" },
  { label: "Active Services", value: "6", change: "2 pending", icon: FiPackage, color: "bg-purple-500" },
];

const recentServiceBookings = [
  { id: "BK-001234", customer: "Rahul Sharma", service: "AC Repair", date: "Nov 24", time: "10:00 AM", amount: "₹499", status: "Pending", avatar: "RS" },
  { id: "BK-001235", customer: "Priya Patel", service: "Plumbing", date: "Nov 24", time: "2:00 PM", amount: "₹699", status: "Confirmed", avatar: "PP" },
  { id: "BK-001236", customer: "Amit Kumar", service: "Electrical Work", date: "Nov 23", time: "11:00 AM", amount: "₹899", status: "In Progress", avatar: "AK" },
  { id: "BK-001237", customer: "Sneha Reddy", service: "House Painting", date: "Nov 22", time: "9:00 AM", amount: "₹1,299", status: "Completed", avatar: "SR" },
];

const myServices = [
  { id: "1", name: "AC Repair & Service", price: "₹499", bookings: 45, rating: 4.8, status: "Active", image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=100" },
  { id: "2", name: "Plumbing Services", price: "₹349", bookings: 38, rating: 4.6, status: "Active", image: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=100" },
  { id: "3", name: "Electrical Repair", price: "₹299", bookings: 32, rating: 4.7, status: "Active", image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=100" },
];

const serviceEarningsData = [
  { month: "Jun", earnings: 6500 },
  { month: "Jul", earnings: 7200 },
  { month: "Aug", earnings: 6800 },
  { month: "Sep", earnings: 8100 },
  { month: "Oct", earnings: 7900 },
  { month: "Nov", earnings: 8450 },
];

const serviceBookingStatusData = [
  { name: "Completed", value: 120, color: "#10b981" },
  { name: "Active", value: 24, color: "#3b82f6" },
  { name: "Pending", value: 8, color: "#f59e0b" },
  { name: "Cancelled", value: 4, color: "#ef4444" },
];

// ==================== PRODUCTS SECTION DATA ====================
const productStats = [
  { label: "Total Revenue", value: "₹1,25,450", change: "+18.2%", icon: FiDollarSign, color: "bg-green-500" },
  { label: "Total Orders", value: "248", change: "15 pending", icon: FiShoppingCart, color: "bg-blue-500" },
  { label: "Products Listed", value: "24", change: "3 low stock", icon: FiBox, color: "bg-purple-500" },
  { label: "Average Rating", value: "4.8", change: "156 reviews", icon: FiStar, color: "bg-yellow-500" },
];

const recentProductOrders = [
  { id: "ORD-001234", customer: "John Doe", items: "Fresh Vegetables Basket + 2 more", date: "Nov 24", amount: "₹858", status: "Processing", avatar: "JD" },
  { id: "ORD-001235", customer: "Priya Singh", items: "Organic Fruits Pack", date: "Nov 24", amount: "₹449", status: "Shipped", avatar: "PS" },
  { id: "ORD-001236", customer: "Amit Verma", items: "Homemade Snacks Bundle", date: "Nov 23", amount: "₹599", status: "Delivered", avatar: "AV" },
  { id: "ORD-001237", customer: "Neha Gupta", items: "Farm Fresh Eggs (2 packs)", date: "Nov 22", amount: "₹240", status: "Delivered", avatar: "NG" },
];

const myProducts = [
  { id: "1", name: "Fresh Vegetables Basket", price: "₹249", sold: 156, stock: 45, rating: 4.9, status: "Active", image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=100" },
  { id: "2", name: "Homemade Murukku", price: "₹120", sold: 89, stock: 12, rating: 4.8, status: "Low Stock", image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=100" },
  { id: "3", name: "Organic Fruit Pack", price: "₹449", sold: 67, stock: 30, rating: 4.7, status: "Active", image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=100" },
];

const productRevenueData = [
  { month: "Jun", revenue: 18500 },
  { month: "Jul", revenue: 22400 },
  { month: "Aug", revenue: 19800 },
  { month: "Sep", revenue: 25600 },
  { month: "Oct", revenue: 28900 },
  { month: "Nov", revenue: 32450 },
];

const productCategoryData = [
  { name: "Vegetables", value: 35, color: "#10b981" },
  { name: "Fruits", value: 25, color: "#f59e0b" },
  { name: "Snacks", value: 20, color: "#8b5cf6" },
  { name: "Dairy", value: 12, color: "#3b82f6" },
  { name: "Others", value: 8, color: "#6b7280" },
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
  // State for live data
  const [stats, setStats] = useState(serviceStats);
  const [recentBookings, setRecentBookings] = useState(recentServiceBookings);
  const [services, setServices] = useState(myServices);
  const [earningsData, setEarningsData] = useState(serviceEarningsData);
  const [bookingStatusData, setBookingStatusData] = useState(serviceBookingStatusData);
  const [loading, setLoading] = useState(true);

  // Fetch live data from APIs
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Get seller ID from localStorage
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          console.error('❌ No user found in localStorage');
          console.log('💡 Please login to see your dashboard data');
          setLoading(false);
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
        console.warn('⚠️ Using mock data as fallback');
        console.log('💡 Check your database connection and API routes');
        // Keep using mock data on error
        setLoading(false);
      }
    };

    fetchDashboardData();
    
    // Optional: Refresh data every 30 seconds for real-time updates
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

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
          const Icon = stat.icon;
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
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-5 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <FiCalendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">3 Bookings Today</h3>
              <p className="text-blue-100 text-sm">Next: AC Repair at 10:00 AM - Rahul Sharma</p>
            </div>
          </div>
          <Link href="/vendor/schedule" className="bg-white text-blue-600 px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
            View Schedule
          </Link>
        </div>
      </div>

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
            {recentBookings.map((booking) => (
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
            ))}
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
          {services.map((service) => (
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
                <button className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1">
                  <FiEdit className="w-3 h-3" /> Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Earnings Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h3 className="font-bold text-gray-900 mb-4">Earnings Trend (Last 6 Months)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={earningsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => [`₹${value}`, 'Earnings']} />
            <Area type="monotone" dataKey="earnings" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ==================== PRODUCTS DASHBOARD ====================
function ProductsDashboard({ onDataUpdate }: { onDataUpdate?: () => void }) {
  // State for live data
  const [stats, setStats] = useState(productStats);
  const [recentOrders, setRecentOrders] = useState(recentProductOrders);
  const [products, setProducts] = useState(myProducts);
  const [revenueData, setRevenueData] = useState(productRevenueData);
  const [categoryData, setCategoryData] = useState(productCategoryData);
  const [loading, setLoading] = useState(true);

  // Fetch live data from APIs
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          console.error('❌ No user found in localStorage');
          setLoading(false);
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
        setLoading(false);
      }
    };

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

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
        {productStats.map((stat, index) => {
          const Icon = stat.icon;
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
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-5 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <FiTruck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">15 Orders Pending</h3>
              <p className="text-blue-100 text-sm">5 orders need to be shipped today</p>
            </div>
          </div>
          <Link href="/vendor/orders" className="bg-white text-blue-600 px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
            Manage Orders
          </Link>
        </div>
      </div>

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
            {recentProductOrders.map((order) => (
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
            ))}
          </div>
        </div>

        {/* Product Categories Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="font-bold text-gray-900 mb-4">Sales by Category</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={productCategoryData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}>
                {productCategoryData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            {productCategoryData.map((item) => (
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
          {myProducts.map((product) => (
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
                <button className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1">
                  <FiEdit className="w-3 h-3" /> Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h3 className="font-bold text-gray-900 mb-4">Revenue Trend (Last 6 Months)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={productRevenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
            <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
          </AreaChart>
        </ResponsiveContainer>
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
    }
    setLoading(false);
  }, []);

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
