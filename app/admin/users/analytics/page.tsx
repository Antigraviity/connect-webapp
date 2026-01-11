'use client';

import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  UserPlus,
  UserX,
  User,
  Calendar,
  MapPin,
  Clock,
  Star,
  ShoppingBag,
  BriefcaseIcon,
  Eye,
  Download,
  Filter
} from 'lucide-react';

export default function UsersAnalyticsPage() {
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [userTypeFilter, setUserTypeFilter] = useState('All Types');
  const [locationFilter, setLocationFilter] = useState('All Locations');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const userCategories = [
    { type: 'Buyers/Customers', total: 4567, active: 3890, growth: '+18.2%', trend: 'up', newThisMonth: 234 },
    { type: 'Service Providers', total: 847, active: 756, growth: '+12.8%', trend: 'up', newThisMonth: 45 },
    { type: 'Employers', total: 342, active: 298, growth: '+15.3%', trend: 'up', newThisMonth: 28 },
    { type: 'Job Seekers', total: 2156, active: 1823, growth: '+22.1%', trend: 'up', newThisMonth: 167 }
  ];

  const topUsers = [
    { name: 'Rahul Sharma', type: 'Buyer', bookings: 12, spent: '₹25,400', rating: 4.8, location: 'Mumbai' },
    { name: 'Sarah Johnson', type: 'Service Provider', services: 8, earned: '₹2,45,600', rating: 4.9, location: 'Delhi' },
    { name: 'Tech Solutions Inc.', type: 'Employer', jobs: 12, hired: 23, spent: '₹45,600', location: 'Bangalore' },
    { name: 'Priya Patel', type: 'Buyer', bookings: 8, spent: '₹15,600', rating: 4.6, location: 'Chennai' },
    { name: 'Mike Rodriguez', type: 'Service Provider', services: 5, earned: '₹1,67,800', rating: 4.7, location: 'Pune' }
  ];

  const monthlyUserData = [
    { month: 'Jan', newUsers: 234, activeUsers: 1247, churnRate: 5.2 },
    { month: 'Feb', newUsers: 289, activeUsers: 1389, churnRate: 4.8 },
    { month: 'Mar', newUsers: 345, activeUsers: 1456, churnRate: 4.3 },
    { month: 'Apr', newUsers: 423, activeUsers: 1523, churnRate: 3.9 },
    { month: 'May', newUsers: 456, activeUsers: 1678, churnRate: 3.5 },
    { month: 'Jun', newUsers: 512, activeUsers: 1834, churnRate: 3.2 },
    { month: 'Jul', newUsers: 578, activeUsers: 1945, churnRate: 2.9 },
    { month: 'Aug', newUsers: 623, activeUsers: 2012, churnRate: 2.7 },
    { month: 'Sep', newUsers: 689, activeUsers: 2156, churnRate: 2.4 },
    { month: 'Oct', newUsers: 734, activeUsers: 2289, churnRate: 2.1 },
    { month: 'Nov', newUsers: 789, activeUsers: 2387, churnRate: 1.9 }
  ];

  const locationData = [
    { city: 'Mumbai', users: 1567, percentage: 18.5 },
    { city: 'Delhi', users: 1234, percentage: 14.6 },
    { city: 'Bangalore', users: 1089, percentage: 12.9 },
    { city: 'Chennai', users: 892, percentage: 10.5 },
    { city: 'Pune', users: 756, percentage: 8.9 },
    { city: 'Hyderabad', users: 634, percentage: 7.5 },
    { city: 'Kolkata', users: 567, percentage: 6.7 },
    { city: 'Others', users: 1773, percentage: 20.9 }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg p-6 text-white shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">User Analytics</h1>
              <p className="text-primary-100 mt-2">Comprehensive analytics and insights for all platform users</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-white/10 border border-white/20 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <option className="text-gray-900">Today</option>
                <option className="text-gray-900">Yesterday</option>
                <option className="text-gray-900">Last 7 Days</option>
                <option className="text-gray-900">Last 30 Days</option>
                <option className="text-gray-900">Last 90 Days</option>
                <option className="text-gray-900">Custom Range</option>
              </select>
              <button
                onClick={() => setShowMoreFilters(!showMoreFilters)}
                className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${showMoreFilters ? 'bg-white text-primary-700' : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
              >
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </button>
            </div>
          </div>
        </div>

        {/* Global Expanded Filters */}
        {showMoreFilters && (
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 animate-in fade-in slide-in-from-top-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Primary User Type</label>
                <select
                  value={userTypeFilter}
                  onChange={(e) => setUserTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option>All Types</option>
                  <option>Buyer/Customer</option>
                  <option>Service Provider</option>
                  <option>Employer</option>
                  <option>Job Seeker</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Location / Region</label>
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option>All Locations</option>
                  <option>Mumbai</option>
                  <option>Delhi</option>
                  <option>Bangalore</option>
                  <option>Chennai</option>
                  <option>Pune</option>
                </select>
              </div>
              {dateRange === 'Custom Range' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>
                </>
              )}
              <div className="lg:col-span-4 flex justify-end space-x-3 mt-2">
                <button
                  onClick={() => {
                    setUserTypeFilter('All Types');
                    setLocationFilter('All Locations');
                    setDateRange('Last 30 Days');
                    setStartDate('');
                    setEndDate('');
                  }}
                  className="px-4 py-2 text-sm text-gray-500 hover:text-primary-600 font-medium transition-colors"
                >
                  Reset Defaults
                </button>
                <button
                  onClick={() => setShowMoreFilters(false)}
                  className="px-6 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">8,512</p>
              </div>
              <div className="p-3 bg-primary-50 rounded-full">
                <Users className="h-6 w-6 text-primary-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="text-green-500 h-4 w-4 mr-1" />
              <span className="text-green-600 font-medium">+18.2%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">6,767</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="text-green-500 h-4 w-4 mr-1" />
              <span className="text-green-600 font-medium">+15.8%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">New Users This Month</p>
                <p className="text-2xl font-bold text-gray-900">474</p>
              </div>
              <div className="p-3 bg-primary-50 rounded-full">
                <UserPlus className="h-6 w-6 text-primary-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="text-green-500 h-4 w-4 mr-1" />
              <span className="text-green-600 font-medium">+22.5%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">User Retention Rate</p>
                <p className="text-2xl font-bold text-gray-900">94.8%</p>
              </div>
              <div className="p-3 bg-primary-50 rounded-full">
                <Star className="h-6 w-6 text-primary-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="text-green-500 h-4 w-4 mr-1" />
              <span className="text-green-600 font-medium">+2.3%</span>
              <span className="text-gray-500 ml-1">improvement</span>
            </div>
          </div>
        </div>

        {/* User Categories Performance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">User Categories Performance</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowMoreFilters(true)}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </button>
                <button className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Users</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active Users</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">New This Month</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Growth</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {userCategories.filter(cat => {
                  if (userTypeFilter === 'All Types') return true;
                  if (userTypeFilter === 'Buyer/Customer' && cat.type === 'Buyers/Customers') return true;
                  if (userTypeFilter === 'Service Provider' && cat.type === 'Service Providers') return true;
                  if (userTypeFilter === 'Employer' && cat.type === 'Employers') return true;
                  if (userTypeFilter === 'Job Seeker' && cat.type === 'Job Seekers') return true;
                  return false;
                }).map((category, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{category.type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{category.total.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600">{category.active.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-primary-600">+{category.newThisMonth}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${category.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {category.growth}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {category.trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Users */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Top Performing Users</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topUsers.filter(user => {
                  if (userTypeFilter === 'All Types') return true;
                  if (userTypeFilter === 'Buyer/Customer' && user.type === 'Buyer') return true;
                  if (userTypeFilter === 'Service Provider' && user.type === 'Service Provider') return true;
                  if (userTypeFilter === 'Employer' && user.type === 'Employer') return true;
                  return false;
                }).map((user, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary-600 to-primary-800 flex items-center justify-center text-white font-semibold text-sm">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${user.type === 'Buyer' ? 'bg-blue-100 text-blue-800' :
                        user.type === 'Service Provider' ? 'bg-green-100 text-green-800' :
                          user.type === 'Employer' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                        }`}>
                        {user.type === 'Buyer' && <ShoppingBag className="w-3 h-3 mr-1" />}
                        {user.type === 'Service Provider' && <User className="w-3 h-3 mr-1" />}
                        {user.type === 'Employer' && <BriefcaseIcon className="w-3 h-3 mr-1" />}
                        {user.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {user.bookings && `${user.bookings} bookings`}
                        {user.services && `${user.services} services`}
                        {user.jobs && `${user.jobs} jobs posted`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        {user.spent && <div className="font-medium text-green-600">{user.spent} spent</div>}
                        {user.earned && <div className="font-medium text-green-600">{user.earned} earned</div>}
                        {user.hired && <div className="text-primary-600">{user.hired} hired</div>}
                        {user.rating && (
                          <div className="flex items-center">
                            <Star className="h-3 w-3 text-primary-400 mr-1" />
                            <span className="text-gray-900">{user.rating}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-3 w-3 mr-1" />
                        {user.location}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="text-primary-600 hover:text-primary-800">
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly User Growth */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Monthly User Growth</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {monthlyUserData.slice(-6).map((month, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-700">{month.month}</div>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-gray-900">
                        <span className="text-primary-600 font-medium">+{month.newUsers}</span> new
                      </div>
                      <div className="text-sm text-primary-600">
                        {month.activeUsers.toLocaleString()} active
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Geographic Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Geographic Distribution</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {locationData.filter(loc => locationFilter === 'All Locations' || loc.city === locationFilter).map((location, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-700">{location.city}</div>
                    <div className="flex items-center space-x-2">
                      <div className="text-sm text-gray-900">{location.users.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">({location.percentage}%)</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* User Engagement Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Avg. Session Duration</p>
                <p className="text-2xl font-bold text-gray-900">12.4 min</p>
              </div>
              <div className="p-3 bg-primary-50 rounded-full">
                <Clock className="h-6 w-6 text-primary-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="text-green-500 h-4 w-4 mr-1" />
              <span className="text-green-600 font-medium">+2.1 min</span>
              <span className="text-gray-500 ml-1">improvement</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Avg. Monthly Activity</p>
                <p className="text-2xl font-bold text-gray-900">8.7 actions</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="text-green-500 h-4 w-4 mr-1" />
              <span className="text-green-600 font-medium">+1.3</span>
              <span className="text-gray-500 ml-1">increase</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Churn Rate</p>
                <p className="text-2xl font-bold text-gray-900">1.9%</p>
              </div>
              <div className="p-3 bg-red-50 rounded-full">
                <UserX className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingDown className="text-green-500 h-4 w-4 mr-1" />
              <span className="text-green-600 font-medium">-0.8%</span>
              <span className="text-gray-500 ml-1">improvement</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
