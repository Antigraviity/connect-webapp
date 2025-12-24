import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  ShoppingBag,
  Users,
  Star,
  Calendar,
  DollarSign,
  Clock,
  MapPin,
  Eye,
  Download,
  Filter
} from 'lucide-react';

export default function ServicesAnalyticsPage() {
  const serviceCategories = [
    { name: 'Home Services', bookings: 1247, revenue: '₹15,67,800', growth: '+18.2%', trend: 'up', providers: 89 },
    { name: 'Home Maintenance', bookings: 892, revenue: '₹11,23,400', growth: '+12.8%', trend: 'up', providers: 67 },
    { name: 'Appliance Repair', bookings: 634, revenue: '₹8,45,200', growth: '-5.3%', trend: 'down', providers: 45 },
    { name: 'Beauty & Wellness', bookings: 567, revenue: '₹7,89,300', growth: '+22.1%', trend: 'up', providers: 34 },
    { name: 'Automotive', bookings: 445, revenue: '₹6,78,900', growth: '+8.7%', trend: 'up', providers: 28 },
    { name: 'Others', bookings: 389, revenue: '₹5,34,100', growth: '+15.4%', trend: 'up', providers: 42 }
  ];

  const topServices = [
    { name: 'Professional Home Cleaning', bookings: 456, rating: 4.8, revenue: '₹5,47,200', provider: 'CleanPro Services' },
    { name: 'Plumbing Repair Services', bookings: 378, rating: 4.6, revenue: '₹4,53,600', provider: 'Rodriguez Plumbing' },
    { name: 'Electrical Work & Installation', bookings: 345, rating: 4.7, revenue: '₹4,14,000', provider: 'Thompson Electricals' },
    { name: 'AC Repair & Maintenance', bookings: 289, rating: 4.5, revenue: '₹3,46,800', provider: 'Kumar AC Services' },
    { name: 'Laptop Repair Service', bookings: 234, rating: 4.4, revenue: '₹2,80,800', provider: 'Tech Fix Solutions' }
  ];

  const monthlyData = [
    { month: 'Jan', bookings: 1247, revenue: 156780, providers: 45 },
    { month: 'Feb', bookings: 1389, revenue: 174250, providers: 52 },
    { month: 'Mar', bookings: 1456, revenue: 182340, providers: 58 },
    { month: 'Apr', bookings: 1523, revenue: 190870, providers: 64 },
    { month: 'May', bookings: 1678, revenue: 209750, providers: 71 },
    { month: 'Jun', bookings: 1834, revenue: 229250, providers: 78 },
    { month: 'Jul', bookings: 1945, revenue: 243125, providers: 84 },
    { month: 'Aug', bookings: 2012, revenue: 251500, providers: 89 },
    { month: 'Sep', bookings: 2156, revenue: 269500, providers: 95 },
    { month: 'Oct', bookings: 2289, revenue: 286125, providers: 102 },
    { month: 'Nov', bookings: 2387, revenue: 298375, providers: 108 }
  ];

  return (
    <div className="p-6 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold">Services Analytics</h1>
          <p className="text-blue-100 mt-2">Comprehensive analytics and insights for all services on the platform</p>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Services</p>
                <p className="text-2xl font-bold text-gray-900">3,247</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="text-green-500 h-4 w-4 mr-1" />
              <span className="text-green-600 font-medium">+12.5%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">24,567</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <Calendar className="h-6 w-6 text-green-600" />
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
                <p className="text-sm font-medium text-gray-500">Revenue Generated</p>
                <p className="text-2xl font-bold text-gray-900">₹55,38,700</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="text-green-500 h-4 w-4 mr-1" />
              <span className="text-green-600 font-medium">+22.8%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Providers</p>
                <p className="text-2xl font-bold text-gray-900">847</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-full">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="text-green-500 h-4 w-4 mr-1" />
              <span className="text-green-600 font-medium">+15.3%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </div>
        </div>

        {/* Service Categories Performance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Service Categories Performance</h3>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Bookings</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Providers</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Growth</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {serviceCategories.map((category, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{category.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{category.bookings.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600">{category.revenue}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{category.providers}</div>
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

        {/* Top Performing Services */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Top Performing Services</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bookings</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topServices.map((service, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{service.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{service.provider}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{service.bookings}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="text-sm text-gray-900">{service.rating}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600">{service.revenue}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Booking Trends */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Monthly Booking Trends</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {monthlyData.slice(-6).map((month, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-700">{month.month}</div>
                    <div className="text-sm text-gray-900">{month.bookings.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Revenue Trends */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Monthly Revenue Trends</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {monthlyData.slice(-6).map((month, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-700">{month.month}</div>
                    <div className="text-sm font-medium text-green-600">₹{(month.revenue / 1000).toFixed(0)}K</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Avg. Service Rating</p>
                <p className="text-2xl font-bold text-gray-900">4.7</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-full">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="text-green-500 h-4 w-4 mr-1" />
              <span className="text-green-600 font-medium">+0.3</span>
              <span className="text-gray-500 ml-1">improvement</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900">94.2%</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="text-green-500 h-4 w-4 mr-1" />
              <span className="text-green-600 font-medium">+2.1%</span>
              <span className="text-gray-500 ml-1">improvement</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Avg. Response Time</p>
                <p className="text-2xl font-bold text-gray-900">2.3h</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingDown className="text-green-500 h-4 w-4 mr-1" />
              <span className="text-green-600 font-medium">-0.5h</span>
              <span className="text-gray-500 ml-1">faster</span>
            </div>
          </div>
        </div>
    </div>
  );
}
