"use client";

import { useState, useEffect } from "react";
import {
  FiDownload,
  FiCalendar,
  FiFileText,
  FiTrendingUp,
  FiUsers,
  FiDollarSign,
  FiPackage,
  FiBriefcase,
  FiBarChart2,
  FiShoppingBag,
} from "react-icons/fi";

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("last30");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalUsers: 0,
    totalServices: 0,
    totalProducts: 0,
    totalJobs: 0,
    totalBookings: 0,
    totalOrders: 0,
    totalApplications: 0,
  });

  useEffect(() => {
    fetchReportStats();
  }, []);

  const fetchReportStats = async () => {
    try {
      setLoading(true);
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

      const totalRevenue = 
        (bookingsData.bookings?.reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0) || 0) +
        (ordersData.orders?.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0) || 0);

      setStats({
        totalRevenue,
        totalUsers: usersData.users?.length || 0,
        totalServices: servicesData.services?.length || 0,
        totalProducts: productsData.products?.length || 0,
        totalJobs: jobsData.jobs?.length || 0,
        totalBookings: bookingsData.bookings?.length || 0,
        totalOrders: ordersData.orders?.length || 0,
        totalApplications: jobsData.applications?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching report stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const reportCategories = [
    {
      id: 1,
      name: "Revenue Reports",
      description: "Financial summaries, bookings, orders, and payment analytics",
      icon: FiDollarSign,
      color: "green",
      reports: [
        { name: "Monthly Revenue", value: loading ? "-" : `₹${stats.totalRevenue.toLocaleString()}` },
        { name: "Service Bookings", value: loading ? "-" : stats.totalBookings.toString() },
        { name: "Product Orders", value: loading ? "-" : stats.totalOrders.toString() },
        { name: "Payment Analytics", value: "View Details" },
      ],
    },
    {
      id: 2,
      name: "User Reports",
      description: "User growth, buyer/seller/employer metrics and analysis",
      icon: FiUsers,
      color: "blue",
      reports: [
        { name: "Total Users", value: loading ? "-" : stats.totalUsers.toString() },
        { name: "User Growth", value: "View Trends" },
        { name: "User Demographics", value: "View Analysis" },
        { name: "Retention Analysis", value: "View Report" },
      ],
    },
    {
      id: 3,
      name: "Service Reports",
      description: "Service performance, booking trends, and vendor analytics",
      icon: FiPackage,
      color: "purple",
      reports: [
        { name: "Total Services", value: loading ? "-" : stats.totalServices.toString() },
        { name: "Booking Summary", value: loading ? "-" : stats.totalBookings.toString() },
        { name: "Vendor Performance", value: "View Report" },
        { name: "Category Analysis", value: "View Breakdown" },
      ],
    },
    {
      id: 4,
      name: "Product Reports",
      description: "Product sales, order trends, and seller analytics",
      icon: FiPackage,
      color: "orange",
      reports: [
        { name: "Total Products", value: loading ? "-" : stats.totalProducts.toString() },
        { name: "Order Summary", value: loading ? "-" : stats.totalOrders.toString() },
        { name: "Seller Performance", value: "View Report" },
        { name: "Product Trends", value: "View Analysis" },
      ],
    },
    {
      id: 5,
      name: "Job Reports",
      description: "Job posting analytics, applications, and employer metrics",
      icon: FiBriefcase,
      color: "indigo",
      reports: [
        { name: "Total Jobs Posted", value: loading ? "-" : stats.totalJobs.toString() },
        { name: "Job Applications", value: loading ? "-" : stats.totalApplications.toString() },
        { name: "Employer Activity", value: "View Report" },
        { name: "Hiring Metrics", value: "View Analysis" },
      ],
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: { [key: string]: { bg: string; text: string; iconBg: string; border: string } } = {
      green: { bg: "bg-green-50", text: "text-green-600", iconBg: "bg-green-100", border: "border-green-200" },
      blue: { bg: "bg-blue-50", text: "text-blue-600", iconBg: "bg-blue-100", border: "border-blue-200" },
      purple: { bg: "bg-purple-50", text: "text-purple-600", iconBg: "bg-purple-100", border: "border-purple-200" },
      orange: { bg: "bg-orange-50", text: "text-orange-600", iconBg: "bg-orange-100", border: "border-orange-200" },
      indigo: { bg: "bg-indigo-50", text: "text-indigo-600", iconBg: "bg-indigo-100", border: "border-indigo-200" },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Reports</h1>
          <p className="text-gray-600 mt-1">Generate and download comprehensive platform reports.</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none cursor-pointer"
          >
            <option value="last7">Last 7 Days</option>
            <option value="last30">Last 30 Days</option>
            <option value="last90">Last 90 Days</option>
            <option value="thisYear">This Year</option>
          </select>
          <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-semibold">
            <FiFileText className="w-4 h-4" />
            Custom Report
          </button>
        </div>
      </div>

      {/* Report Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportCategories.map((category) => {
          const colorClasses = getColorClasses(category.color);
          const IconComponent = category.icon;
          return (
            <div
              key={category.id}
              className={`bg-white rounded-xl shadow-md border ${colorClasses.border} p-6 hover:shadow-lg transition-shadow`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-12 h-12 ${colorClasses.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <IconComponent className={`w-6 h-6 ${colorClasses.text}`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                  <p className="text-sm text-gray-500">{category.description}</p>
                </div>
              </div>

              <div className="space-y-2">
                {category.reports.map((report, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 text-sm hover:bg-gray-50 rounded-lg transition-colors border border-gray-100"
                  >
                    <span className="font-medium text-gray-700">{report.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{report.value}</span>
                      <FiDownload className="w-4 h-4 text-gray-400 hover:text-indigo-600 cursor-pointer" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Reports - Coming Soon */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recently Generated Reports</h2>
        </div>
        <div className="text-center py-16">
          <FiFileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">Report Generation Coming Soon</p>
          <p className="text-sm text-gray-400">Downloadable reports will be available once report generation is enabled</p>
        </div>
      </div>
    </div>
  );
}
