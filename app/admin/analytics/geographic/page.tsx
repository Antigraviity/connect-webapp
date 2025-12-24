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
    <div className="p-6 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold">Geographic Analytics & Market Intelligence</h1>
          <p className="text-purple-100 mt-2">Regional market analysis, city-wise performance, and geographic expansion insights</p>
        </div>

        {/* Key Geographic Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Markets</p>
                <p className="text-2xl font-bold text-gray-900">47 Cities</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <Globe className="h-6 w-6 text-purple-600" />
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
              <div className="p-3 bg-blue-50 rounded-full">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-blue-600 font-medium">Tier-1 & 2</span>
              <span className="text-gray-500 ml-1">cities covered</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Top Performing City</p>
                <p className="text-2xl font-bold text-gray-900">Mumbai</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-full">
                <Star className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-orange-600 font-medium">26.7%</span>
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
                <button className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
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
                {cityData.map((city) => (
                  <tr key={city.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center text-white font-semibold text-sm">
                          <MapPin className="h-4 w-4" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{city.city}</div>
                          <div className="text-sm text-gray-500">{city.state}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-bold text-gray-900">{city.totalUsers.toLocaleString()} total</div>
                        <div className="text-sm text-blue-600">{city.activeUsers.toLocaleString()} active</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-xs text-purple-600">{city.serviceProviders} providers</div>
                        <div className="text-xs text-green-600">{city.jobSeekers.toLocaleString()} job seekers</div>
                        <div className="text-xs text-orange-600">{city.employers} employers</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-bold text-gray-900">{city.revenue}</div>
                        <div className="flex items-center">
                          {getTrendIcon(city.trend)}
                          <span className={`ml-1 text-sm font-medium ${getTrendColor(city.trend)}`}>
                            {city.growth}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm text-green-600">AOV: {city.avgOrderValue}</div>
                        <div className="text-sm text-blue-600">Completion: {city.serviceCompletionRate}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {city.topCategories.map((category, index) => (
                          <div key={index} className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                            {category}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full" 
                            style={{ width: city.marketShare }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600">{city.marketShare}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-purple-600 hover:text-purple-900">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-blue-600 hover:text-blue-900">
                          <BarChart3 className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
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
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">State-wise Performance</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {statePerformance.map((state, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{state.state}</div>
                          <div className="text-xs text-gray-500">{state.cities.join(', ')}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-purple-600">{state.revenue}</div>
                          <div className="text-xs text-green-600">{state.growth}</div>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-gray-600">{state.totalUsers.toLocaleString()} users</span>
                        <span className="text-xs text-blue-600 font-medium">Share: {state.marketShare}</span>
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
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{region.region}</div>
                          <div className="text-xs text-purple-600">{region.dominantServices}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-gray-900">{region.avgIncome}</div>
                          <div className="text-xs text-green-600">{region.growth}</div>
                        </div>
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        {region.cities} cities covered
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
                <div key={index} className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{metric.value}</div>
                  <div className="text-sm text-gray-600 font-medium">{metric.metric}</div>
                  <div className="mt-2 text-xs text-green-600 font-medium">{metric.growth}</div>
                  <div className="mt-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: metric.percentage }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{metric.percentage}</div>
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
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-xl font-bold text-green-600">High Priority</div>
                <div className="text-sm text-gray-600 mt-2">8 Tier-2 Cities</div>
                <div className="text-xs text-gray-500 mt-1">
                  Lucknow, Jaipur, Kochi, Bhubaneswar, Indore, Nagpur, Chandigarh, Ahmedabad
                </div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-xl font-bold text-yellow-600">Medium Priority</div>
                <div className="text-sm text-gray-600 mt-2">12 Tier-3 Cities</div>
                <div className="text-xs text-gray-500 mt-1">
                  Emerging markets with growing digital adoption
                </div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-xl font-bold text-blue-600">Future Opportunity</div>
                <div className="text-sm text-gray-600 mt-2">Rural Markets</div>
                <div className="text-xs text-gray-500 mt-1">
                  Long-term potential with infrastructure development
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Market Intelligence Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Market Intelligence Summary</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">₹2,847</div>
                <div className="text-sm text-gray-600">Avg. City Revenue</div>
                <div className="text-xs text-green-600">+19.2% growth</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">2.3M</div>
                <div className="text-sm text-gray-600">Total Addressable Users</div>
                <div className="text-xs text-blue-600">Across all markets</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">91.7%</div>
                <div className="text-sm text-gray-600">Avg. Service Quality</div>
                <div className="text-xs text-green-600">Across all cities</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">32.8%</div>
                <div className="text-sm text-gray-600">Expansion Potential</div>
                <div className="text-xs text-orange-600">Untapped markets</div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}
