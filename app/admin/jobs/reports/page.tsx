"use client";

import { useState } from "react";
import {
  FiDownload,
  FiCalendar,
  FiTrendingUp,
  FiBriefcase,
  FiUsers,
  FiCheckCircle,
  FiBarChart2,
  FiPieChart,
} from "react-icons/fi";

const reportTypes = [
  {
    id: 1,
    name: "Job Postings Report",
    description: "Overview of all job postings, status, and performance metrics",
    icon: FiBriefcase,
    color: "purple",
    lastGenerated: "Nov 26, 2025",
  },
  {
    id: 2,
    name: "Applications Report",
    description: "Detailed analysis of job applications and conversion rates",
    icon: FiUsers,
    color: "blue",
    lastGenerated: "Nov 26, 2025",
  },
  {
    id: 3,
    name: "Hiring Report",
    description: "Summary of successful hires and time-to-hire metrics",
    icon: FiCheckCircle,
    color: "green",
    lastGenerated: "Nov 25, 2025",
  },
  {
    id: 4,
    name: "Company Performance",
    description: "Performance metrics for companies posting jobs",
    icon: FiBarChart2,
    color: "orange",
    lastGenerated: "Nov 24, 2025",
  },
  {
    id: 5,
    name: "Category Analysis",
    description: "Job distribution and trends by category",
    icon: FiPieChart,
    color: "pink",
    lastGenerated: "Nov 23, 2025",
  },
  {
    id: 6,
    name: "Recruitment Trends",
    description: "Monthly and quarterly recruitment trend analysis",
    icon: FiTrendingUp,
    color: "indigo",
    lastGenerated: "Nov 22, 2025",
  },
];

const quickStats = [
  { label: "Total Jobs This Month", value: "245", change: "+18%" },
  { label: "Total Applications", value: "4,892", change: "+32%" },
  { label: "Successful Hires", value: "89", change: "+15%" },
  { label: "Avg Time to Hire", value: "12 days", change: "-8%" },
];

export default function JobReportsPage() {
  const [dateRange, setDateRange] = useState("last30");

  const getColorClasses = (color: string) => {
    const colors: { [key: string]: { bg: string; text: string; iconBg: string } } = {
      purple: { bg: "bg-purple-50", text: "text-purple-600", iconBg: "bg-purple-100" },
      blue: { bg: "bg-blue-50", text: "text-blue-600", iconBg: "bg-blue-100" },
      green: { bg: "bg-green-50", text: "text-green-600", iconBg: "bg-green-100" },
      orange: { bg: "bg-orange-50", text: "text-orange-600", iconBg: "bg-orange-100" },
      pink: { bg: "bg-pink-50", text: "text-pink-600", iconBg: "bg-pink-100" },
      indigo: { bg: "bg-indigo-50", text: "text-indigo-600", iconBg: "bg-indigo-100" },
    };
    return colors[color] || colors.purple;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Reports</h1>
          <p className="text-gray-600 mt-1">Generate and download recruitment reports.</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none cursor-pointer"
          >
            <option value="last7">Last 7 Days</option>
            <option value="last30">Last 30 Days</option>
            <option value="last90">Last 90 Days</option>
            <option value="thisYear">This Year</option>
          </select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <span className={`text-sm font-medium ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTypes.map((report) => {
          const colorClasses = getColorClasses(report.color);
          const IconComponent = report.icon;
          return (
            <div
              key={report.id}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 ${colorClasses.iconBg} rounded-xl flex items-center justify-center`}>
                  <IconComponent className={`w-6 h-6 ${colorClasses.text}`} />
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{report.description}</p>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <FiCalendar className="w-3 h-3" />
                  Last: {report.lastGenerated}
                </div>
                <button className={`flex items-center gap-1.5 px-3 py-1.5 ${colorClasses.bg} ${colorClasses.text} text-sm font-medium rounded-lg hover:opacity-80 transition-opacity`}>
                  <FiDownload className="w-4 h-4" />
                  Generate
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recently Generated Reports</h2>
        <div className="space-y-3">
          {[
            { name: "Job Postings Report - November 2025", date: "Nov 26, 2025", size: "2.4 MB" },
            { name: "Applications Report - November 2025", date: "Nov 26, 2025", size: "3.1 MB" },
            { name: "Hiring Report - Q3 2025", date: "Nov 25, 2025", size: "1.8 MB" },
          ].map((report, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{report.name}</p>
                <p className="text-xs text-gray-500">{report.date} • {report.size}</p>
              </div>
              <button className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg">
                <FiDownload className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
