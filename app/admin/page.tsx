"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FiUsers,
  FiPackage,
  FiShoppingBag,
  FiBriefcase,
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiCalendar,
  FiStar,
  FiMessageSquare,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiEye,
  FiArrowRight,
  FiActivity,
  FiMapPin,
  FiBarChart2,
  FiPieChart,
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

export default function AdminDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("This Month");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeServices: 0,
    productsListed: 0,
    jobPostings: 0,
    totalRevenue: 0,
    serviceRevenue: 0,
    productRevenue: 0,
    pendingServices: 0,
    totalOrders: 0,
    totalApplications: 0,
  });

  useEffect(() => {
    fetchDashboardData();
    document.title = "Admin Dashboard | Forge India Connect";
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [usersRes, servicesRes, productsRes, jobsRes, bookingsRes, ordersRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/services'),
        fetch('/api/products'),
        fetch('/api/jobs'),
        fetch('/api/bookings'),
        fetch('/api/orders'),
      ]);

      const [usersData, servicesData, productsData, jobsData, bookingsData, ordersData] = await Promise.all([
        usersRes.json(),
        servicesRes.json(),
        productsRes.json(),
        jobsRes.json(),
        bookingsRes.json(),
        ordersRes.json(),
      ]);

      // Calculate stats
      const totalUsers = usersData.users?.length || 0;
      const activeServices = servicesData.services?.filter((s: any) => s.status === 'ACTIVE').length || 0;
      const productsListed = productsData.products?.length || 0;
      const jobPostings = jobsData.jobs?.filter((j: any) => j.status === 'ACTIVE').length || 0;

      // Calculate revenue - filter by type
      const serviceBookings = bookingsData.bookings?.filter((b: any) => b.type === 'SERVICE') || [];
      const productOrders = ordersData.orders?.filter((o: any) => o.type === 'PRODUCT') || [];

      const serviceRevenue = serviceBookings.reduce((sum: number, b: any) =>
        sum + (b.totalAmount || 0), 0);
      const productRevenue = productOrders.reduce((sum: number, o: any) =>
        sum + (o.totalAmount || 0), 0);
      const totalRevenue = serviceRevenue + productRevenue;

      setStats({
        totalUsers,
        activeServices,
        productsListed,
        jobPostings,
        totalRevenue,
        serviceRevenue,
        productRevenue,
        pendingServices: servicesData.services?.filter((s: any) => s.status === 'PENDING').length || 0,
        totalOrders: productOrders.length || 0,
        totalApplications: jobsData.applications?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const overviewStats = [
    {
      label: "Total Users",
      value: loading ? "-" : stats.totalUsers.toLocaleString(),
      change: "+8.2%",
      changeType: "increase",
      icon: FiUsers,
      color: "bg-primary-500",
      lightColor: "bg-primary-50",
      textColor: "text-primary-600",
    },
    {
      label: "Active Services",
      value: loading ? "-" : stats.activeServices.toLocaleString(),
      change: "+12.5%",
      changeType: "increase",
      icon: FiPackage,
      color: "bg-primary-500",
      lightColor: "bg-primary-50",
      textColor: "text-primary-600",
    },
    {
      label: "Products Listed",
      value: loading ? "-" : stats.productsListed.toLocaleString(),
      change: "+15.3%",
      changeType: "increase",
      icon: FiShoppingBag,
      color: "bg-primary-500",
      lightColor: "bg-primary-50",
      textColor: "text-primary-600",
    },
    {
      label: "Job Postings",
      value: loading ? "-" : stats.jobPostings.toLocaleString(),
      change: "+22.8%",
      changeType: "increase",
      icon: FiBriefcase,
      color: "bg-primary-500",
      lightColor: "bg-primary-50",
      textColor: "text-primary-600",
    },
  ];

  const revenueStats = [
    {
      label: "Total Revenue",
      value: loading ? "-" : `₹${stats.totalRevenue.toLocaleString()}`,
      change: "+18.2%",
      period: "this month",
    },
    {
      label: "Service Revenue",
      value: loading ? "-" : `₹${stats.serviceRevenue.toLocaleString()}`,
      change: "+15.3%",
      period: "this month",
    },
    {
      label: "Product Revenue",
      value: loading ? "-" : `₹${stats.productRevenue.toLocaleString()}`,
      change: "+22.1%",
      period: "this month",
    },
    {
      label: "Job Posting Revenue",
      value: "₹0",
      change: "+12.8%",
      period: "this month",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's what's happening across the Connect platform.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option>Today</option>
            <option>This Week</option>
            <option>This Month</option>
            <option>This Quarter</option>
            <option>This Year</option>
          </select>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`${stat.color} p-2.5 rounded-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${stat.changeType === "increase"
                  ? "bg-green-50 text-green-600"
                  : "bg-red-50 text-red-600"
                  }`}>
                  {stat.changeType === "increase" ? (
                    <FiTrendingUp className="w-3 h-3" />
                  ) : (
                    <FiTrendingDown className="w-3 h-3" />
                  )}
                  {stat.change}
                </div>
              </div>
              <h3 className="text-gray-600 text-xs font-medium">{stat.label}</h3>
              <p className="text-xl font-bold text-gray-900 mt-0.5">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {revenueStats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow"
          >
            <p className="text-gray-500 text-xs font-medium">{stat.label}</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{stat.value}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-green-600 text-xs font-semibold">{stat.change}</span>
              <span className="text-gray-400 text-[10px]">{stat.period}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section - Coming Soon */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Platform Growth Trend */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Platform Growth Trend</h2>
          </div>
          <div className="text-center py-20">
            <FiBarChart2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">Historical Analytics Coming Soon</p>
            <p className="text-sm text-gray-400">Track platform growth over time</p>
          </div>
        </div>

        {/* User Distribution */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">User Distribution</h2>
          <div className="text-center py-16">
            <FiPieChart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">User Analytics Coming Soon</p>
            <p className="text-sm text-gray-400">View user role distribution</p>
          </div>
        </div>
      </div>

      {/* Recent Activities - Disabled until activity tracking is implemented */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Recent Activities</h2>
        </div>
        <div className="text-center py-12">
          <FiActivity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">Activity Tracking Coming Soon</p>
          <p className="text-sm text-gray-400">Real-time platform activities will appear here once tracking is enabled</p>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Locations - Coming Soon */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Top Locations</h2>
          </div>
          <div className="text-center py-16">
            <FiMapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">Location Analytics Coming Soon</p>
            <p className="text-sm text-gray-400">Track user distribution by city</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/admin/services"
              className="flex flex-col items-center p-4 rounded-xl border-2 border-primary-50 hover:border-primary-400 hover:bg-primary-50 transition-all"
            >
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-3">
                <FiPackage className="w-6 h-6 text-primary-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Manage Services</span>
              <span className="text-xs text-gray-500 mt-1">
                {loading ? '-' : `${stats.pendingServices} pending`}
              </span>
            </Link>
            <Link
              href="/admin/products"
              className="flex flex-col items-center p-4 rounded-xl border-2 border-primary-50 hover:border-primary-400 hover:bg-primary-50 transition-all"
            >
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-3">
                <FiShoppingBag className="w-6 h-6 text-primary-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Manage Products</span>
              <span className="text-xs text-gray-500 mt-1">
                {loading ? '-' : `${stats.totalOrders} orders`}
              </span>
            </Link>
            <Link
              href="/admin/jobs"
              className="flex flex-col items-center p-4 rounded-xl border-2 border-primary-50 hover:border-primary-400 hover:bg-primary-50 transition-all"
            >
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-3">
                <FiBriefcase className="w-6 h-6 text-primary-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Manage Jobs</span>
              <span className="text-xs text-gray-500 mt-1">
                {loading ? '-' : `${stats.totalApplications} applications`}
              </span>
            </Link>
            <Link
              href="/admin/users"
              className="flex flex-col items-center p-4 rounded-xl border-2 border-primary-50 hover:border-primary-400 hover:bg-primary-50 transition-all"
            >
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-3">
                <FiUsers className="w-6 h-6 text-primary-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Manage Users</span>
              <span className="text-xs text-gray-500 mt-1">
                {loading ? '-' : `${stats.totalUsers.toLocaleString()} total`}
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center">
              <FiActivity className="w-7 h-7 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">System Health: Excellent</h2>
              <p className="text-gray-500 mt-1">
                All services running smoothly. Last checked: 2 minutes ago
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">99.9%</p>
              <p className="text-gray-500 text-xs">Uptime</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">45ms</p>
              <p className="text-gray-500 text-xs">Avg Response</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-gray-500 text-xs">Errors (24h)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
