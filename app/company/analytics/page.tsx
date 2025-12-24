"use client";

import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const applicationFlowData = [
  { month: "Jun", received: 120, shortlisted: 45, interviewed: 28, hired: 12 },
  { month: "Jul", received: 150, shortlisted: 62, interviewed: 35, hired: 15 },
  { month: "Aug", received: 135, shortlisted: 58, interviewed: 32, hired: 14 },
  { month: "Sep", received: 180, shortlisted: 78, interviewed: 42, hired: 18 },
  { month: "Oct", received: 195, shortlisted: 85, interviewed: 48, hired: 20 },
  { month: "Nov", received: 210, shortlisted: 92, interviewed: 52, hired: 22 },
];

const conversionRateData = [
  { stage: "Applied", rate: 100, count: 487 },
  { stage: "Shortlisted", rate: 35, count: 170 },
  { stage: "Interview", rate: 18, count: 88 },
  { stage: "Hired", rate: 8, count: 39 },
];

const timeToHireData = [
  { department: "Engineering", days: 28 },
  { department: "Design", days: 24 },
  { department: "Product", days: 32 },
  { department: "Marketing", days: 26 },
  { department: "Sales", days: 22 },
];

const sourceData = [
  { source: "Direct Apply", applications: 145, hired: 12 },
  { source: "Job Portal", applications: 132, hired: 10 },
  { source: "LinkedIn", applications: 98, hired: 8 },
  { source: "Referrals", applications: 76, hired: 7 },
  { source: "Others", applications: 36, hired: 2 },
];

export default function CompanyAnalyticsPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics & Insights</h1>
        <p className="text-gray-600 mt-1">
          Track your hiring performance and optimize your recruitment process
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">
              Application Conversion Rate
            </h3>
            <FiTrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">8.0%</p>
          <p className="text-sm text-green-600 mt-1">+1.2% from last month</p>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">
              Average Time to Hire
            </h3>
            <FiTrendingDown className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">26 days</p>
          <p className="text-sm text-red-600 mt-1">+3 days from last month</p>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">
              Offer Acceptance Rate
            </h3>
            <FiTrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">85%</p>
          <p className="text-sm text-green-600 mt-1">+5% from last month</p>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Cost per Hire</h3>
            <FiTrendingDown className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">₹45K</p>
          <p className="text-sm text-green-600 mt-1">-₹5K from last month</p>
        </div>
      </div>

      {/* Application Flow */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Application Flow (Last 6 Months)
        </h2>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={applicationFlowData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="received"
              stackId="1"
              stroke="#3b82f6"
              fill="#3b82f6"
              name="Received"
            />
            <Area
              type="monotone"
              dataKey="shortlisted"
              stackId="1"
              stroke="#8b5cf6"
              fill="#8b5cf6"
              name="Shortlisted"
            />
            <Area
              type="monotone"
              dataKey="interviewed"
              stackId="1"
              stroke="#f59e0b"
              fill="#f59e0b"
              name="Interviewed"
            />
            <Area
              type="monotone"
              dataKey="hired"
              stackId="1"
              stroke="#10b981"
              fill="#10b981"
              name="Hired"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Conversion Funnel and Time to Hire */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Funnel */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Hiring Funnel & Conversion Rates
          </h2>
          <div className="space-y-4">
            {conversionRateData.map((stage, index) => (
              <div key={stage.stage}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {stage.stage}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {stage.count} ({stage.rate}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-8">
                  <div
                    className={`h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold ${
                      index === 0
                        ? "bg-primary-500"
                        : index === 1
                        ? "bg-purple-500"
                        : index === 2
                        ? "bg-orange-500"
                        : "bg-green-500"
                    }`}
                    style={{ width: `${stage.rate}%` }}
                  >
                    {stage.rate}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Time to Hire by Department */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Average Time to Hire (by Department)
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={timeToHireData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="department" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="days" fill="#3b82f6" name="Days" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Application Sources */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Application Sources & Quality
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={sourceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="source" />
            <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
            <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
            <Tooltip />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="applications"
              fill="#3b82f6"
              name="Applications"
            />
            <Bar yAxisId="right" dataKey="hired" fill="#10b981" name="Hired" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-md border border-blue-200 p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-2">
            💡 Top Insight
          </h3>
          <p className="text-blue-800">
            Your conversion rate from shortlist to interview is 51%, which is 12%
            higher than the industry average. Keep up the great screening process!
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-md border border-orange-200 p-6">
          <h3 className="text-lg font-bold text-orange-900 mb-2">
            ⚠️ Area for Improvement
          </h3>
          <p className="text-orange-800">
            Time to hire has increased by 3 days this month. Consider streamlining
            your interview scheduling process to reduce candidate drop-off.
          </p>
        </div>
      </div>
    </div>
  );
}
