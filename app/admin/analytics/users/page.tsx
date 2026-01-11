import AdminLayout from '@/components/admin/AdminLayout';
import {
  Search,
  Filter,
  Download,
  Eye,
  Edit3,
  MoreHorizontal,
  Users,
  TrendingUp,
  TrendingDown,
  UserCheck,
  UserPlus,
  Activity,
  Calendar,
  MapPin,
  Star,
  Clock,
  ShoppingBag,
  BriefcaseIcon,
  Target,
  Zap,
  BarChart3
} from 'lucide-react';

export default function UserAnalyticsPage() {
  const userSegments = [
    {
      id: 1,
      segment: 'Active Service Users',
      totalUsers: 12547,
      growth: '+18.2%',
      trend: 'up',
      avgOrderValue: '₹2,450',
      frequency: '2.3 orders/month',
      satisfaction: 4.6,
      topLocations: ['Mumbai', 'Delhi', 'Bangalore'],
      ageGroup: '25-35',
      retention: '78%'
    },
    {
      id: 2,
      segment: 'Job Seekers',
      totalUsers: 8934,
      growth: '+24.7%',
      trend: 'up',
      avgOrderValue: 'N/A',
      frequency: '5.2 applications/month',
      satisfaction: 4.2,
      topLocations: ['Bangalore', 'Pune', 'Hyderabad'],
      ageGroup: '22-32',
      retention: '65%'
    },
    {
      id: 3,
      segment: 'Service Providers',
      totalUsers: 3456,
      growth: '+15.8%',
      trend: 'up',
      avgOrderValue: '₹1,850',
      frequency: '8.7 services/month',
      satisfaction: 4.4,
      topLocations: ['Mumbai', 'Chennai', 'Delhi'],
      ageGroup: '28-40',
      retention: '82%'
    },
    {
      id: 4,
      segment: 'Employers/Companies',
      totalUsers: 1234,
      growth: '+12.3%',
      trend: 'up',
      avgOrderValue: '₹15,600',
      frequency: '1.8 job posts/month',
      satisfaction: 4.3,
      topLocations: ['Mumbai', 'Bangalore', 'Gurgaon'],
      ageGroup: 'Company',
      retention: '89%'
    },
    {
      id: 5,
      segment: 'Inactive Users',
      totalUsers: 5623,
      growth: '-8.4%',
      trend: 'down',
      avgOrderValue: '₹0',
      frequency: '0 orders/month',
      satisfaction: 3.8,
      topLocations: ['Various', 'Mumbai', 'Delhi'],
      ageGroup: 'Mixed',
      retention: '15%'
    }
  ];

  const userMetrics = [
    {
      category: 'Registration Sources',
      data: [
        { name: 'Organic Search', users: 45234, percentage: 42.3 },
        { name: 'Social Media', users: 28976, percentage: 27.1 },
        { name: 'Referrals', users: 15678, percentage: 14.7 },
        { name: 'Direct Traffic', users: 12456, percentage: 11.6 },
        { name: 'Paid Ads', users: 4567, percentage: 4.3 }
      ]
    },
    {
      category: 'User Activity Levels',
      data: [
        { name: 'Daily Active', users: 23456, percentage: 21.9 },
        { name: 'Weekly Active', users: 45678, percentage: 42.7 },
        { name: 'Monthly Active', users: 67890, percentage: 63.5 },
        { name: 'Occasional', users: 34567, percentage: 32.3 },
        { name: 'Dormant', users: 8765, percentage: 8.2 }
      ]
    }
  ];

  const demographicData = [
    { ageGroup: '18-25', users: 18567, percentage: 17.4, growth: '+22.1%' },
    { ageGroup: '26-35', users: 34567, percentage: 32.3, growth: '+18.9%' },
    { ageGroup: '36-45', users: 28934, percentage: 27.1, growth: '+15.2%' },
    { ageGroup: '46-55', users: 15678, percentage: 14.7, growth: '+12.8%' },
    { ageGroup: '55+', users: 8934, percentage: 8.5, growth: '+8.3%' }
  ];

  const locationData = [
    { city: 'Mumbai', users: 28567, percentage: 26.7, growth: '+19.2%' },
    { city: 'Bangalore', users: 23456, percentage: 21.9, growth: '+24.1%' },
    { city: 'Delhi', users: 19834, percentage: 18.6, growth: '+16.8%' },
    { city: 'Chennai', users: 12456, percentage: 11.6, growth: '+14.5%' },
    { city: 'Pune', users: 9876, percentage: 9.2, growth: '+22.7%' },
    { city: 'Others', users: 12567, percentage: 12.0, growth: '+18.3%' }
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
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold">User Analytics & Insights</h1>
          <p className="text-primary-100 mt-2">Comprehensive user behavior analysis, demographics, and engagement metrics</p>
        </div>

        {/* Key User Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">106,794</p>
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
                <p className="text-sm font-medium text-gray-500">Monthly Active Users</p>
                <p className="text-2xl font-bold text-gray-900">67,890</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="text-green-500 h-4 w-4 mr-1" />
              <span className="text-green-600 font-medium">+22.4%</span>
              <span className="text-gray-500 ml-1">engagement up</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">New Registrations</p>
                <p className="text-2xl font-bold text-gray-900">5,247</p>
              </div>
              <div className="p-3 bg-primary-50 rounded-full">
                <UserPlus className="h-6 w-6 text-primary-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="text-green-500 h-4 w-4 mr-1" />
              <span className="text-green-600 font-medium">+15.7%</span>
              <span className="text-gray-500 ml-1">this month</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">User Retention Rate</p>
                <p className="text-2xl font-bold text-gray-900">73.5%</p>
              </div>
              <div className="p-3 bg-primary-50 rounded-full">
                <Target className="h-6 w-6 text-primary-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="text-green-500 h-4 w-4 mr-1" />
              <span className="text-green-600 font-medium">+3.2%</span>
              <span className="text-gray-500 ml-1">improvement</span>
            </div>
          </div>
        </div>

        {/* User Segments Analysis */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">User Segment Analysis</h3>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Segment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Users & Growth</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Engagement Metrics</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Demographics</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {userSegments.map((segment) => (
                  <tr key={segment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{segment.segment}</div>
                        <div className="text-sm text-gray-500">{segment.totalUsers.toLocaleString()} users</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-bold text-gray-900 flex items-center">
                          {getTrendIcon(segment.trend)}
                          <span className={`ml-2 ${getTrendColor(segment.trend)}`}>{segment.growth}</span>
                        </div>
                        <div className="text-sm text-gray-500">Growth rate</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm text-gray-900">{segment.frequency}</div>
                        <div className="text-sm text-gray-500">Avg. frequency</div>
                        {segment.avgOrderValue !== 'N/A' && (
                          <div className="text-sm text-green-600 font-medium">{segment.avgOrderValue}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm text-gray-900">Age: {segment.ageGroup}</div>
                        <div className="text-sm text-gray-500">Top: {segment.topLocations.slice(0, 2).join(', ')}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm text-yellow-600 flex items-center">
                          <Star className="h-3 w-3 mr-1" />
                          {segment.satisfaction}
                        </div>
                        <div className="text-sm text-primary-600">Retention: {segment.retention}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-primary-600 hover:text-primary-900">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-primary-600 hover:text-primary-900">
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

        {/* Demographics & Location Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Age Demographics */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Age Demographics</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {demographicData.map((demo, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{demo.ageGroup}</span>
                        <span className="text-sm text-gray-900">{demo.users.toLocaleString()}</span>
                      </div>
                      <div className="mt-1 flex items-center justify-between">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-4">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{ width: `${demo.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-green-600 font-medium">{demo.growth}</span>
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
              <div className="space-y-4">
                {locationData.map((location, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {location.city}
                        </span>
                        <span className="text-sm text-gray-900">{location.users.toLocaleString()}</span>
                      </div>
                      <div className="mt-1 flex items-center justify-between">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-4">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{ width: `${location.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-green-600 font-medium">{location.growth}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* User Activity & Acquisition */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Registration Sources */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">User Acquisition Sources</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {userMetrics[0].data.map((source, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-700">{source.name}</div>
                    <div className="flex items-center space-x-3">
                      <div className="text-sm text-gray-900">{source.users.toLocaleString()}</div>
                      <div className="text-sm text-primary-600 font-medium">{source.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* User Activity Levels */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">User Activity Levels</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {userMetrics[1].data.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-700 flex items-center">
                      <Activity className="h-3 w-3 mr-1" />
                      {activity.name}
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-sm text-gray-900">{activity.users.toLocaleString()}</div>
                      <div className="text-sm text-green-600 font-medium">{activity.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* User Journey Insights */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">User Journey & Behavior Insights</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">4.2 min</div>
                <div className="text-sm text-gray-600">Avg. Session Duration</div>
                <div className="text-xs text-green-600">+12.5% vs last month</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">2.8</div>
                <div className="text-sm text-gray-600">Pages per Session</div>
                <div className="text-xs text-green-600">+8.3% vs last month</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">34.2%</div>
                <div className="text-sm text-gray-600">Bounce Rate</div>
                <div className="text-xs text-red-600">-5.7% vs last month</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
