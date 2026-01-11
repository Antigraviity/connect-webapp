'use client';

import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  Search,
  Filter,
  Download,
  Eye,
  Edit3,
  MoreHorizontal,
  MapPin,
  TrendingUp,
  TrendingDown,
  Users,
  BriefcaseIcon,
  DollarSign,
  Target,
  Building2,
  Activity,
  Star,
  BarChart3,
  Globe,
  Navigation
} from 'lucide-react';

export default function GeographicAnalyticsPage() {
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [stateFilter, setStateFilter] = useState('All States');
  const [cityFilter, setCityFilter] = useState('All Cities');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const cityData = [
    {
      id: 1,
      city: 'Mumbai',
      state: 'Maharashtra',
      totalUsers: 28567,
      activeUsers: 18945,
      serviceProviders: 2134,
      jobSeekers: 8934,
      employers: 567,
      revenue: '₹34,56,800',
      growth: '+22.4%',
      trend: 'up',
      topCategories: ['Technology', 'Finance', 'Healthcare'],
      avgOrderValue: '₹2,890',
      serviceCompletionRate: '92.4%',
      marketShare: '26.7%'
    },
    {
      id: 2,
      city: 'Bangalore',
      state: 'Karnataka',
      totalUsers: 24568,
      activeUsers: 16834,
      serviceProviders: 1987,
      jobSeekers: 9567,
      employers: 789,
      revenue: '₹29,87,600',
      growth: '+28.9%',
      trend: 'up',
      topCategories: ['Technology', 'Marketing', 'Design'],
      avgOrderValue: '₹3,156',
      serviceCompletionRate: '94.2%',
      marketShare: '23.0%'
    },
    {
      id: 3,
      city: 'Delhi',
      state: 'Delhi',
      totalUsers: 21456,
      activeUsers: 14567,
      serviceProviders: 1654,
      jobSeekers: 7234,
      employers: 432,
      revenue: '₹24,67,400',
      growth: '+18.7%',
      trend: 'up',
      topCategories: ['Government', 'Education', 'Services'],
      avgOrderValue: '₹2,345',
      serviceCompletionRate: '89.8%',
      marketShare: '20.1%'
    },
    {
      id: 4,
      city: 'Chennai',
      state: 'Tamil Nadu',
      totalUsers: 16789,
      activeUsers: 11234,
      serviceProviders: 1287,
      jobSeekers: 5678,
      employers: 298,
      revenue: '₹18,45,200',
      growth: '+15.2%',
      trend: 'up',
      topCategories: ['Healthcare', 'Manufacturing', 'IT Services'],
      avgOrderValue: '₹2,234',
      serviceCompletionRate: '91.6%',
      marketShare: '15.7%'
    },
    {
      id: 5,
      city: 'Pune',
      state: 'Maharashtra',
      totalUsers: 13456,
      activeUsers: 9234,
      serviceProviders: 1098,
      jobSeekers: 4567,
      employers: 234,
      revenue: '₹15,67,800',
      growth: '+25.6%',
      trend: 'up',
      topCategories: ['Automotive', 'IT', 'Education'],
      avgOrderValue: '₹2,567',
      serviceCompletionRate: '93.1%',
      marketShare: '12.6%'
    },
    {
      id: 6,
      city: 'Hyderabad',
      state: 'Telangana',
      totalUsers: 11234,
      activeUsers: 7892,
      serviceProviders: 934,
      jobSeekers: 3789,
      employers: 189,
      revenue: '₹13,89,400',
      growth: '+31.2%',
      trend: 'up',
      topCategories: ['Technology', 'Pharmaceuticals', 'Biotech'],
      avgOrderValue: '₹2,789',
      serviceCompletionRate: '90.8%',
      marketShare: '10.5%'
    }
  ];

  const statePerformance = [
    {
      state: 'Maharashtra',
      cities: ['Mumbai', 'Pune', 'Nagpur'],
      totalUsers: 45234,
      revenue: '₹52,34,600',
      growth: '+23.1%',
      marketShare: '42.3%'
    },
    {
      state: 'Karnataka',
      cities: ['Bangalore', 'Mysore', 'Mangalore'],
      totalUsers: 28967,
      revenue: '₹34,56,800',
      growth: '+27.8%',
      marketShare: '27.1%'
    },
    {
      state: 'Delhi',
      cities: ['New Delhi', 'Gurgaon', 'Noida'],
      totalUsers: 24567,
      revenue: '₹29,87,400',
      growth: '+19.5%',
      marketShare: '23.0%'
    },
    {
      state: 'Tamil Nadu',
      cities: ['Chennai', 'Coimbatore', 'Madurai'],
      totalUsers: 19876,
      revenue: '₹23,45,600',
      growth: '+16.7%',
      marketShare: '18.6%'
    },
    {
      state: 'Telangana',
      cities: ['Hyderabad', 'Warangal'],
      totalUsers: 12345,
      revenue: '₹15,67,800',
      growth: '+29.4%',
      marketShare: '11.5%'
    }
  ];

  const regionalInsights = [
    {
      region: 'Western India',
      cities: 6,
      dominantServices: 'Finance & Technology',
      avgIncome: '₹3,456',
      growth: '+24.5%'
    },
    {
      region: 'Southern India',
      cities: 8,
      dominantServices: 'IT & Healthcare',
      avgIncome: '₹2,987',
      growth: '+21.8%'
    },
    {
      region: 'Northern India',
      cities: 5,
      dominantServices: 'Government & Education',
      avgIncome: '₹2,234',
      growth: '+18.2%'
    },
    {
      region: 'Eastern India',
      cities: 3,
      dominantServices: 'Manufacturing & Services',
      avgIncome: '₹1,987',
      growth: '+12.4%'
    }
  ];

  const penetrationMetrics = [
    { metric: 'Urban Coverage', value: '47 cities', growth: '+8 cities', percentage: '89.2%' },
    { metric: 'Tier-1 Penetration', value: '12 cities', growth: 'Complete', percentage: '100%' },
    { metric: 'Tier-2 Penetration', value: '24 cities', growth: '+6 cities', percentage: '67.3%' },
    { metric: 'Tier-3 Penetration', value: '11 cities', growth: '+2 cities', percentage: '23.8%' }
  ];

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    );
  };

  const getTrendColor = (trend: string) => {
    return trend === 'up' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg p-6 text-white shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Geographic Analytics & Market Intelligence</h1>
              <p className="text-primary-100 mt-2">Regional market analysis, city-wise performance, and geographic expansion insights</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-white/10 border border-white/20 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <option className="text-gray-900">Today</option>
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
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">State</label>
                <select
                  value={stateFilter}
                  onChange={(e) => {
                    setStateFilter(e.target.value);
                    setCityFilter('All Cities'); // Reset city when state changes
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option>All States</option>
                  <option>Maharashtra</option>
                  <option>Karnataka</option>
                  <option>Delhi</option>
                  <option>Tamil Nadu</option>
                  <option>Telangana</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">City</label>
                <select
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option>All Cities</option>
                  {stateFilter === 'Maharashtra' && (
                    <>
                      <option>Mumbai</option>
                      <option>Pune</option>
                    </>
                  )}
                  {stateFilter === 'Karnataka' && <option>Bangalore</option>}
                  {stateFilter === 'Delhi' && <option>Delhi</option>}
                  {stateFilter === 'Tamil Nadu' && <option>Chennai</option>}
                  {stateFilter === 'Telangana' && <option>Hyderabad</option>}
                  {stateFilter === 'All States' && (
                    <>
                      <option>Mumbai</option>
                      <option>Bangalore</option>
                      <option>Delhi</option>
                      <option>Chennai</option>
                      <option>Pune</option>
                      <option>Hyderabad</option>
                    </>
                  )}
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
                    setStateFilter('All States');
                    setCityFilter('All Cities');
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

        {/* Key Geographic Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Markets</p>
                <p className="text-2xl font-bold text-gray-900">47 Cities</p>
              </div>
              <div className="p-3 bg-primary-50 rounded-full">
                <Globe className="h-6 w-6 text-primary-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="text-green-500 h-4 w-4 mr-1" />
              <span className="text-green-600 font-medium">+8 cities</span>
              <span className="text-gray-500 ml-1">this quarter</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Geographic Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹1,37,48,800</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="text-green-500 h-4 w-4 mr-1" />
              <span className="text-green-600 font-medium">+23.4%</span>
              <span className="text-gray-500 ml-1">YoY growth</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Market Penetration</p>
                <p className="text-2xl font-bold text-gray-900">68.2%</p>
              </div>
              <div className="p-3 bg-primary-50 rounded-full">
                <Target className="h-6 w-6 text-primary-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-primary-600 font-medium">Tier-1 & 2</span>
              <span className="text-gray-500 ml-1">cities covered</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Top Performing City</p>
                <p className="text-2xl font-bold text-gray-900">Mumbai</p>
              </div>
              <div className="p-3 bg-primary-50 rounded-full">
                <Star className="h-6 w-6 text-primary-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-primary-600 font-medium">26.7%</span>
              <span className="text-gray-500 ml-1">market share</span>
            </div>
          </div>
        </div>

        {/* City-wise Performance Analysis */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">City-wise Performance Analysis</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowMoreFilters(true)}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <Filter className="h-4 w-4 mr-2 text-primary-600" />
                  Filter
                </button>
                <button className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                  <Download className="h-4 w-4 mr-2 text-primary-600" />
                  Export
                </button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City & State</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Base</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Market Segments</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue & Growth</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance Metrics</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Top Categories</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Market Share</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cityData
                  .filter(city => (stateFilter === 'All States' || city.state === stateFilter) && (cityFilter === 'All Cities' || city.city === cityFilter))
                  .map((city) => (
                    <tr key={city.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-primary-500 to-primary-700 flex items-center justify-center text-white font-semibold shadow-sm">
                            <MapPin className="h-4 w-4" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-bold text-gray-900">{city.city}</div>
                            <div className="text-xs text-gray-500">{city.state}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-bold text-gray-900">{city.totalUsers.toLocaleString()}</div>
                          <div className="text-xs text-primary-600 font-medium">{city.activeUsers.toLocaleString()} active</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-[10px] bg-primary-50 text-primary-700 px-1.5 py-0.5 rounded border border-primary-100 inline-block mr-1">{city.serviceProviders} vend</div>
                          <div className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded border border-green-100 inline-block mr-1">{city.jobSeekers.toLocaleString()} seek</div>
                          <div className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100 inline-block">{city.employers} emp</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-bold text-gray-900">{city.revenue}</div>
                          <div className="flex items-center">
                            {getTrendIcon(city.trend)}
                            <span className={`ml-1 text-xs font-bold ${getTrendColor(city.trend)}`}>
                              {city.growth}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-xs text-gray-600">AOV: <span className="font-bold text-gray-900">{city.avgOrderValue}</span></div>
                          <div className="text-xs text-primary-600 font-medium">{city.serviceCompletionRate} Comp.</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {city.topCategories.map((category, index) => (
                            <div key={index} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                              {category}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-full max-w-[60px] bg-gray-200 rounded-full h-1.5 mr-2">
                            <div
                              className="bg-primary-600 h-1.5 rounded-full"
                              style={{ width: city.marketShare }}
                            ></div>
                          </div>
                          <span className="text-[10px] font-bold text-gray-600">{city.marketShare}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button className="text-primary-600 hover:text-primary-900 transition-colors">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="text-primary-600 hover:text-primary-900 transition-colors">
                            <BarChart3 className="h-4 w-4" />
                          </button>
                          <button className="text-gray-400 hover:text-gray-600">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* State Performance & Regional Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* State Performance */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 text-white bg-gradient-to-r from-primary-600 to-primary-700 rounded-t-lg">
              <h3 className="text-lg font-semibold">State-wise Performance</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {statePerformance
                  .filter(state => stateFilter === 'All States' || state.state === stateFilter)
                  .map((state, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-100">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-bold text-gray-900">{state.state}</div>
                            <div className="text-xs text-gray-500">{state.cities.join(', ')}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-primary-600">{state.revenue}</div>
                            <div className="text-xs text-green-600 font-bold">{state.growth}</div>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-xs text-gray-600">{state.totalUsers.toLocaleString()} users</span>
                          <div className="flex items-center">
                            <span className="text-[10px] text-gray-400 mr-2 uppercase tracking-tighter font-semibold">Market Share</span>
                            <span className="text-sm text-primary-600 font-black">{state.marketShare}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Regional Insights */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Regional Market Insights</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {regionalInsights.map((region, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:shadow-sm transition-shadow">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-bold text-gray-900">{region.region}</div>
                          <div className="text-xs text-primary-600 font-medium">{region.dominantServices}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-gray-900">{region.avgIncome}/AOV</div>
                          <div className="text-xs text-green-600 font-bold">{region.growth}</div>
                        </div>
                      </div>
                      <div className="mt-2 text-[10px] text-gray-400 font-semibold uppercase">
                        {region.cities} cities covered in this region
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Market Penetration Analysis */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Market Penetration Analysis</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {penetrationMetrics.map((metric, index) => (
                <div key={index} className="text-center p-6 bg-gradient-to-br from-primary-50 to-white rounded-lg border border-primary-100 shadow-sm">
                  <div className="text-2xl font-black text-primary-700">{metric.value}</div>
                  <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">{metric.metric}</div>
                  <div className="mt-3 text-xs text-green-600 font-black bg-green-50 px-2 py-1 rounded-full inline-block">{metric.growth}</div>
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-primary-600 h-1.5 rounded-full shadow-sm"
                        style={{ width: metric.percentage }}
                      ></div>
                    </div>
                    <div className="text-[10px] text-primary-700 font-bold mt-2">{metric.percentage} coverage</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Geographic Expansion Opportunities */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Geographic Expansion Opportunities</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-green-50 rounded-lg border border-green-100">
                <div className="text-xl font-black text-green-700">High Priority</div>
                <div className="text-sm font-bold text-gray-700 mt-2">8 Tier-2 Cities</div>
                <div className="text-[11px] text-gray-500 mt-2 leading-relaxed">
                  Lucknow, Jaipur, Kochi, Bhubaneswar, Indore, Nagpur, Chandigarh, Ahmedabad
                </div>
              </div>
              <div className="text-center p-6 bg-amber-50 rounded-lg border border-amber-100">
                <div className="text-xl font-black text-amber-700">Medium Priority</div>
                <div className="text-sm font-bold text-gray-700 mt-2">12 Tier-3 Cities</div>
                <div className="text-[11px] text-gray-500 mt-2 leading-relaxed">
                  Emerging markets with growing digital adoption and service demand
                </div>
              </div>
              <div className="text-center p-6 bg-primary-50 rounded-lg border border-primary-100">
                <div className="text-xl font-black text-primary-700">Future Opportunity</div>
                <div className="text-sm font-bold text-gray-700 mt-2">Rural Markets</div>
                <div className="text-[11px] text-gray-500 mt-2 leading-relaxed">
                  Long-term potential with infrastructure and connectivity development
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Market Intelligence Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">Market Intelligence Summary</h3>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl font-black text-primary-600">₹2,847</div>
                <div className="text-sm font-bold text-gray-600 mt-1">Avg. City Revenue</div>
                <div className="text-xs text-green-600 font-bold mt-1">+19.2% growth</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-primary-600">2.3M</div>
                <div className="text-sm font-bold text-gray-600 mt-1">Addressable Users</div>
                <div className="text-xs text-primary-600 font-medium mt-1">Total market potential</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-green-600">91.7%</div>
                <div className="text-sm font-bold text-gray-600 mt-1">Service Quality</div>
                <div className="text-xs text-green-500 font-bold mt-1">Cross-market average</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-primary-600">32.8%</div>
                <div className="text-sm font-bold text-gray-600 mt-1">Expansion Potential</div>
                <div className="text-xs text-primary-600 font-medium mt-1">Available untapped share</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
