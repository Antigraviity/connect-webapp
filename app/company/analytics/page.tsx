"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { FiTrendingUp, FiTrendingDown, FiRefreshCw } from "react-icons/fi";
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
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function CompanyAnalyticsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (user?.id) {
      fetchAnalytics();
    }
  }, [user?.id]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/company/analytics?employerId=${user?.id}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (error) {
      console.error("Failed to fetch analytics", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" label="Loading..." className="min-h-[400px]" />;
  }

  if (!data) {
    return (
      <div className="p-6 text-center text-gray-500">
        Failed to load analytics data.
        <button
          onClick={fetchAnalytics}
          className="ml-2 text-company-600 hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  const { metrics, applicationFlow, conversionFunnel, timeToHire, sources } = data;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-2 sm:py-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Analytics & Insights</h1>
          <p className="text-gray-500 font-normal text-xs sm:text-sm mt-1 max-w-xl">
            Track your hiring performance and optimize your recruitment process
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all text-xs sm:text-sm font-bold shadow-sm"
        >
          {loading ? <LoadingSpinner size="sm" color="current" /> : <FiRefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          Refresh
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-start justify-between mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <FiTrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{metrics.conversionRate}%</p>
          <p className="text-[10px] sm:text-xs text-gray-500 font-semibold uppercase tracking-wider">Conversion Rate</p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-start justify-between mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <FiTrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{metrics.avgTimeHire} days</p>
          <p className="text-[10px] sm:text-xs text-gray-500 font-semibold uppercase tracking-wider">Time to Hire</p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-start justify-between mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
              <FiTrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{metrics.offerAcceptance}%</p>
          <p className="text-[10px] sm:text-xs text-gray-500 font-semibold uppercase tracking-wider">Offer Accepted</p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-start justify-between mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <span className="text-xs font-bold text-amber-600">EST.</span>
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{metrics.costPerHire}</p>
          <p className="text-[10px] sm:text-xs text-gray-500 font-semibold uppercase tracking-wider">Cost per Hire</p>
        </div>
      </div>

      {/* Application Flow */}
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-6">
          Application Flow (Last 6 Months)
        </h2>
        <div className="h-[240px] sm:h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={applicationFlow} margin={{ left: -20, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
              />
              <Legend verticalAlign="top" height={36} />
              <Area
                type="monotone"
                dataKey="received"
                stackId="1"
                stroke="#0ea5e9"
                fill="#0ea5e9"
                fillOpacity={0.6}
                name="Received"
              />
              <Area
                type="monotone"
                dataKey="shortlisted"
                stackId="2"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.5}
                name="Shortlisted"
              />
              <Area
                type="monotone"
                dataKey="hired"
                stackId="3"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.8}
                name="Hired"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Conversion Funnel and Time to Hire */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-4 sm:pb-0">
        {/* Conversion Funnel */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-6">
            Hiring Funnel & Conversion Rates
          </h2>
          <div className="space-y-4">
            {conversionFunnel.map((stage: any, index: number) => (
              <div key={stage.stage}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {stage.stage}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {stage.count} ({stage.rate}%)
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-8 overflow-hidden">
                  <div
                    className={`h-full flex items-center justify-center text-white text-xs font-bold transition-all duration-500 ${index === 0
                      ? "bg-gradient-to-r from-company-400 to-company-600"
                      : index === 1
                        ? "bg-gradient-to-r from-purple-400 to-purple-600" // Shortlisted
                        : index === 2
                          ? "bg-gradient-to-r from-amber-400 to-amber-600" // Interview
                          : "bg-gradient-to-r from-green-500 to-green-700" // Hired
                      }`}
                    style={{ width: `${Math.max(stage.rate, 5)}%` }} // Min 5% for visibility
                  >
                    {stage.rate > 0 && `${stage.rate}%`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Time to Hire by Department */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-6">
            Avg Time to Hire (by Job Type)
          </h2>
          <div className="h-[250px] sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeToHire} layout="vertical" margin={{ left: -10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="department"
                  type="category"
                  width={100}
                  tick={{ fontSize: 12 }}
                  interval={0}
                />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar
                  dataKey="days"
                  fill="#0ea5e9"
                  name="Days"
                  radius={[0, 4, 4, 0]}
                  barSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Application Sources */}
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-6">
          Application Sources & Quality
        </h2>
        <div className="h-[280px] sm:h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sources} margin={{ left: -20, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="source" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: 'transparent' }} />
              <Legend />
              <Bar
                dataKey="applications"
                fill="#94a3b8"
                name="Applications"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="hired"
                fill="#0ea5e9"
                name="Hired"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-company-50 to-company-100 rounded-xl shadow-md border border-company-200 p-6">
          <h3 className="text-lg font-bold text-company-900 mb-2">
            💡 Hiring Insight
          </h3>
          <p className="text-company-800 text-sm leading-relaxed">
            Your conversion rate is <strong>{metrics.conversionRate}%</strong>.
            {Number(metrics.conversionRate) > 5
              ? "That's a healthy rate! You are effectively identifying and closing talent."
              : "Review your screening process to ensure you're attracting the right candidates."}
          </p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl shadow-md border border-amber-200 p-6">
          <h3 className="text-lg font-bold text-amber-900 mb-2">
            ⚡ Efficiency Check
          </h3>
          <p className="text-amber-800 text-sm leading-relaxed">
            Average time to hire is <strong>{metrics.avgTimeHire} days</strong>.
            {metrics.avgTimeHire > 30
              ? "Consider streamlining approvals or interview scheduling to reduce time."
              : "Great job keeping the process efficient!"}
          </p>
        </div>
      </div>
    </div>
  );
}
