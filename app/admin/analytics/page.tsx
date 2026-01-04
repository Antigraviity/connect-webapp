"use client";

import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  LineChart,
  Users,
  ShoppingBag,
  BriefcaseIcon,
  DollarSign,
  Calendar,
  MapPin,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Filter
} from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-admin-600 to-admin-800 rounded-lg p-6 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Platform Analytics Overview</h1>
            <p className="text-admin-100 mt-2">Comprehensive insights and performance metrics across all platform activities</p>
          </div>
          <div className="flex items-center space-x-2">
            <select className="bg-white/10 border border-white/20 rounded-md px-3 py-2 text-sm text-white">
              <option>Last 30 Days</option>
              <option>Last 7 Days</option>
              <option>Last 3 Months</option>
              <option>Last Year</option>
            </select>
            <button className="inline-flex items-center px-4 py-2 bg-white/10 border border-white/20 rounded-md text-sm font-medium text-white hover:bg-white/20">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹8,45,230</p>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm">
            <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
            <span className="text-green-600 font-medium">+22.8%</span>
            <span className="text-gray-500 ml-1">from last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Platform Users</p>
              <p className="text-2xl font-bold text-gray-900">12,845</p>
            </div>
            <div className="p-3 bg-admin-50 rounded-full">
              <Users className="h-6 w-6 text-admin-600" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm">
            <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
            <span className="text-green-600 font-medium">+8.2%</span>
            <span className="text-gray-500 ml-1">from last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Services</p>
              <p className="text-2xl font-bold text-gray-900">3,247</p>
            </div>
            <div className="p-3 bg-admin-50 rounded-full">
              <ShoppingBag className="h-6 w-6 text-admin-600" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm">
            <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
            <span className="text-green-600 font-medium">+12.5%</span>
            <span className="text-gray-500 ml-1">from last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Job Placements</p>
              <p className="text-2xl font-bold text-gray-900">1,589</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-full">
              <BriefcaseIcon className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm">
            <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
            <span className="text-green-600 font-medium">+15.3%</span>
            <span className="text-gray-500 ml-1">from last month</span>
          </div>
        </div>
      </div>

      {/* Revenue and Growth Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <LineChart className="h-5 w-5 mr-2" />
              Revenue Trends (Last 6 Months)
            </h3>
          </div>
          <div className="p-6">
            <div className="h-64 flex items-end justify-between space-x-2">
              <div className="flex flex-col items-center">
                <div className="w-8 bg-gradient-to-t from-admin-500 to-admin-300 rounded-t" style={{ height: '120px' }}></div>
                <span className="text-xs text-gray-500 mt-2">Jun</span>
                <span className="text-xs text-gray-400">₹6.2L</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-8 bg-gradient-to-t from-admin-500 to-admin-300 rounded-t" style={{ height: '140px' }}></div>
                <span className="text-xs text-gray-500 mt-2">Jul</span>
                <span className="text-xs text-gray-400">₹6.8L</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-8 bg-gradient-to-t from-admin-500 to-admin-300 rounded-t" style={{ height: '160px' }}></div>
                <span className="text-xs text-gray-500 mt-2">Aug</span>
                <span className="text-xs text-gray-400">₹7.1L</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-8 bg-gradient-to-t from-admin-500 to-admin-300 rounded-t" style={{ height: '180px' }}></div>
                <span className="text-xs text-gray-500 mt-2">Sep</span>
                <span className="text-xs text-gray-400">₹7.5L</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-8 bg-gradient-to-t from-admin-500 to-admin-300 rounded-t" style={{ height: '200px' }}></div>
                <span className="text-xs text-gray-500 mt-2">Oct</span>
                <span className="text-xs text-gray-400">₹8.0L</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-8 bg-gradient-to-t from-green-500 to-green-300 rounded-t" style={{ height: '220px' }}></div>
                <span className="text-xs text-gray-500 mt-2">Nov</span>
                <span className="text-xs text-gray-400">₹8.5L</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              Revenue Distribution by Category
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-admin-600 rounded-full mr-3"></div>
                  <span className="text-sm font-medium text-gray-700">Service Bookings</span>
                </div>
                <span className="text-sm font-bold text-gray-900">65.2% (₹5.5L)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-admin-600 h-2 rounded-full" style={{ width: '65.2%' }}></div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium text-gray-700">Job Placements</span>
                </div>
                <span className="text-sm font-bold text-gray-900">24.8% (₹2.1L)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '24.8%' }}></div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-admin-400 rounded-full mr-3"></div>
                  <span className="text-sm font-medium text-gray-700">Subscriptions</span>
                </div>
                <span className="text-sm font-bold text-gray-900">7.5% (₹0.6L)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-admin-400 h-2 rounded-full" style={{ width: '7.5%' }}></div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium text-gray-700">Others</span>
                </div>
                <span className="text-sm font-bold text-gray-900">2.5% (₹0.2L)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '2.5%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Engagement and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">User Activity Today</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Users</span>
              <span className="text-sm font-semibold text-admin-600">5,847</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">New Registrations</span>
              <span className="text-sm font-semibold text-green-600">89</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Service Bookings</span>
              <span className="text-sm font-semibold text-admin-600">156</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Job Applications</span>
              <span className="text-sm font-semibold text-orange-600">234</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Service Completion Rate</span>
                <span className="text-sm font-bold text-green-600">94.2%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '94.2%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">User Satisfaction</span>
                <span className="text-sm font-bold text-admin-600">4.8/5</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-admin-600 h-2 rounded-full" style={{ width: '96%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Platform Uptime</span>
                <span className="text-sm font-bold text-admin-600">99.9%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-admin-500 h-2 rounded-full" style={{ width: '99.9%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Quick Stats</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-admin-500 mr-2" />
              <div>
                <div className="text-sm font-medium text-gray-900">Avg Response Time</div>
                <div className="text-xs text-gray-500">2.5 hours</div>
              </div>
            </div>

            <div className="flex items-center">
              <MapPin className="h-4 w-4 text-green-500 mr-2" />
              <div>
                <div className="text-sm font-medium text-gray-900">Top Location</div>
                <div className="text-xs text-gray-500">Mumbai (18.5%)</div>
              </div>
            </div>

            <div className="flex items-center">
              <Calendar className="h-4 w-4 text-admin-500 mr-2" />
              <div>
                <div className="text-sm font-medium text-gray-900">Peak Hours</div>
                <div className="text-xs text-gray-500">6 PM - 9 PM</div>
              </div>
            </div>

            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 text-orange-500 mr-2" />
              <div>
                <div className="text-sm font-medium text-gray-900">Growth Rate</div>
                <div className="text-xs text-gray-500">+15.3% monthly</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold text-gray-900">User Analytics</h4>
              <p className="text-sm text-gray-500 mt-1">Detailed user behavior and demographics</p>
            </div>
            <Users className="h-8 w-8 text-admin-500" />
          </div>
          <div className="mt-4 flex items-center text-sm text-admin-600 font-medium">
            View Details
            <ArrowUpRight className="h-4 w-4 ml-1" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold text-gray-900">Service Analytics</h4>
              <p className="text-sm text-gray-500 mt-1">Service performance and booking trends</p>
            </div>
            <ShoppingBag className="h-8 w-8 text-green-500" />
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600 font-medium">
            View Details
            <ArrowUpRight className="h-4 w-4 ml-1" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold text-gray-900">Job Analytics</h4>
              <p className="text-sm text-gray-500 mt-1">Job posting and application insights</p>
            </div>
            <BriefcaseIcon className="h-8 w-8 text-admin-500" />
          </div>
          <div className="mt-4 flex items-center text-sm text-admin-600 font-medium">
            View Details
            <ArrowUpRight className="h-4 w-4 ml-1" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold text-gray-900">Financial Reports</h4>
              <p className="text-sm text-gray-500 mt-1">Revenue analysis and financial metrics</p>
            </div>
            <DollarSign className="h-8 w-8 text-orange-500" />
          </div>
          <div className="mt-4 flex items-center text-sm text-orange-600 font-medium">
            View Details
            <ArrowUpRight className="h-4 w-4 ml-1" />
          </div>
        </div>
      </div>
    </div>
  );
}
