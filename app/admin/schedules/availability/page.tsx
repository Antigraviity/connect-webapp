import AdminLayout from '@/components/admin/AdminLayout';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit3, 
  MoreHorizontal,
  Calendar,
  Clock,
  User,
  Phone,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  CalendarDays,
  Building2,
  MapPin,
  Star,
  Activity,
  Zap,
  Coffee
} from 'lucide-react';

export default function AvailabilityPage() {
  const providerAvailability = [
    {
      id: 1,
      providerId: 'PRV-001234',
      providerName: 'Sarah Johnson',
      businessName: 'CleanPro Services',
      category: 'Home Services',
      phone: '+91 9876543210',
      email: 'sarah@cleanpro.com',
      location: 'Mumbai, Maharashtra',
      rating: 4.8,
      totalServices: 156,
      currentStatus: 'Available',
      nextAvailable: null,
      workingHours: {
        monday: '9:00 AM - 6:00 PM',
        tuesday: '9:00 AM - 6:00 PM',
        wednesday: '9:00 AM - 6:00 PM',
        thursday: '9:00 AM - 6:00 PM',
        friday: '9:00 AM - 6:00 PM',
        saturday: '10:00 AM - 4:00 PM',
        sunday: 'Closed'
      },
      todaySchedule: [
        { time: '10:00 AM - 1:00 PM', service: 'Home Cleaning', customer: 'Rahul Sharma' },
        { time: '3:00 PM - 5:00 PM', service: 'Deep Cleaning', customer: 'Priya Patel' }
      ],
      weeklyUtilization: 78,
      lastUpdated: '2024-11-23 09:30 AM',
      autoAccept: true
    },
    {
      id: 2,
      providerId: 'PRV-001235',
      providerName: 'Mike Rodriguez',
      businessName: 'Rodriguez Plumbing',
      category: 'Home Maintenance',
      phone: '+91 7654321098',
      email: 'mike@rodriguezplumbing.com',
      location: 'Delhi, Delhi',
      rating: 4.6,
      totalServices: 89,
      currentStatus: 'Busy',
      nextAvailable: '2024-11-23 2:00 PM',
      workingHours: {
        monday: '8:00 AM - 7:00 PM',
        tuesday: '8:00 AM - 7:00 PM',
        wednesday: '8:00 AM - 7:00 PM',
        thursday: '8:00 AM - 7:00 PM',
        friday: '8:00 AM - 7:00 PM',
        saturday: '9:00 AM - 5:00 PM',
        sunday: 'Emergency Only'
      },
      todaySchedule: [
        { time: '9:00 AM - 11:00 AM', service: 'Pipe Repair', customer: 'Amit Kumar' },
        { time: '12:00 PM - 2:00 PM', service: 'Bathroom Installation', customer: 'Neha Singh' }
      ],
      weeklyUtilization: 92,
      lastUpdated: '2024-11-23 10:15 AM',
      autoAccept: false
    },
    {
      id: 3,
      providerId: 'PRV-001236',
      providerName: 'Alex Thompson',
      businessName: 'Thompson Electricals',
      category: 'Home Maintenance',
      phone: '+91 5432109876',
      email: 'alex@thompsonelectricals.com',
      location: 'Bangalore, Karnataka',
      rating: 4.7,
      totalServices: 234,
      currentStatus: 'Available',
      nextAvailable: null,
      workingHours: {
        monday: '9:00 AM - 6:00 PM',
        tuesday: '9:00 AM - 6:00 PM',
        wednesday: '9:00 AM - 6:00 PM',
        thursday: '9:00 AM - 6:00 PM',
        friday: '9:00 AM - 6:00 PM',
        saturday: '10:00 AM - 3:00 PM',
        sunday: 'Closed'
      },
      todaySchedule: [
        { time: '11:00 AM - 2:00 PM', service: 'Wiring Installation', customer: 'Kavya Menon' }
      ],
      weeklyUtilization: 65,
      lastUpdated: '2024-11-23 08:45 AM',
      autoAccept: true
    },
    {
      id: 4,
      providerId: 'PRV-001237',
      providerName: 'David Kumar',
      businessName: 'Kumar AC Services',
      category: 'Appliance Repair',
      phone: '+91 3210987654',
      email: 'david@kumarac.com',
      location: 'Chennai, Tamil Nadu',
      rating: 4.2,
      totalServices: 45,
      currentStatus: 'Offline',
      nextAvailable: '2024-11-24 9:00 AM',
      workingHours: {
        monday: '10:00 AM - 7:00 PM',
        tuesday: '10:00 AM - 7:00 PM',
        wednesday: '10:00 AM - 7:00 PM',
        thursday: '10:00 AM - 7:00 PM',
        friday: '10:00 AM - 7:00 PM',
        saturday: '10:00 AM - 5:00 PM',
        sunday: 'Closed'
      },
      todaySchedule: [],
      weeklyUtilization: 45,
      lastUpdated: '2024-11-22 6:00 PM',
      autoAccept: false
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Available':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />AVAILABLE</span>;
      case 'Busy':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />BUSY</span>;
      case 'Offline':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />OFFLINE</span>;
      case 'Break':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800"><Coffee className="w-3 h-3 mr-1" />ON BREAK</span>;
      default:
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">UNKNOWN</span>;
    }
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 80) return 'text-red-600';
    if (utilization >= 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getUtilizationBg = (utilization: number) => {
    if (utilization >= 80) return 'bg-red-100';
    if (utilization >= 60) return 'bg-yellow-100';
    return 'bg-green-100';
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-green-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold">Provider Availability Management</h1>
          <p className="text-teal-100 mt-2">Monitor and manage service provider availability, schedules, and capacity</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Available Providers</p>
                <p className="text-2xl font-bold text-gray-900">423</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-green-600 font-medium">67.2%</span>
              <span className="text-gray-500 ml-1">of total providers</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Busy Providers</p>
                <p className="text-2xl font-bold text-gray-900">156</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-yellow-600 font-medium">24.8%</span>
              <span className="text-gray-500 ml-1">currently servicing</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Average Utilization</p>
                <p className="text-2xl font-bold text-gray-900">72.5%</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="text-green-500 h-4 w-4 mr-1" />
              <span className="text-green-600 font-medium">+5.2%</span>
              <span className="text-gray-500 ml-1">from last week</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Peak Hours Today</p>
                <p className="text-2xl font-bold text-gray-900">2-5 PM</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-purple-600 font-medium">89%</span>
              <span className="text-gray-500 ml-1">utilization</span>
            </div>
          </div>
        </div>

        {/* Availability Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Provider Status Distribution</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">423</div>
                <div className="text-sm text-gray-600 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Available
                </div>
                <div className="text-xs text-green-600">67.2%</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-yellow-600">156</div>
                <div className="text-sm text-gray-600 flex items-center justify-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Busy
                </div>
                <div className="text-xs text-yellow-600">24.8%</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-orange-600">34</div>
                <div className="text-sm text-gray-600 flex items-center justify-center">
                  <Coffee className="h-4 w-4 mr-1" />
                  On Break
                </div>
                <div className="text-xs text-orange-600">5.4%</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-red-600">16</div>
                <div className="text-sm text-gray-600 flex items-center justify-center">
                  <XCircle className="h-4 w-4 mr-1" />
                  Offline
                </div>
                <div className="text-xs text-red-600">2.6%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search by provider name or business..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent w-80"
                />
              </div>
              <select className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                <option>All Categories</option>
                <option>Home Services</option>
                <option>Home Maintenance</option>
                <option>Appliance Repair</option>
                <option>Electronics Repair</option>
                <option>Beauty & Wellness</option>
              </select>
              <select className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                <option>All Status</option>
                <option>Available</option>
                <option>Busy</option>
                <option>On Break</option>
                <option>Offline</option>
              </select>
              <select className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                <option>All Locations</option>
                <option>Mumbai</option>
                <option>Delhi</option>
                <option>Bangalore</option>
                <option>Chennai</option>
                <option>Pune</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
              <button className="inline-flex items-center px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-md hover:bg-teal-700">
                <Calendar className="h-4 w-4 mr-2" />
                Capacity View
              </button>
            </div>
          </div>
        </div>

        {/* Provider Availability Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business Info</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Today's Schedule</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilization</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Working Hours</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {providerAvailability.map((provider) => (
                  <tr key={provider.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-teal-500 to-green-600 flex items-center justify-center text-white font-semibold text-lg">
                          {provider.providerName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{provider.providerName}</div>
                          <div className="text-sm text-gray-500">{provider.providerId}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {provider.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 flex items-center">
                          <Building2 className="h-3 w-3 mr-1" />
                          {provider.businessName}
                        </div>
                        <div className="text-sm text-gray-500">{provider.category}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {provider.location}
                        </div>
                        <div className="text-sm text-yellow-600 flex items-center">
                          <Star className="h-3 w-3 mr-1" />
                          {provider.rating} ({provider.totalServices} services)
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        {getStatusBadge(provider.currentStatus)}
                        {provider.nextAvailable && (
                          <div className="text-xs text-blue-600">
                            Next: {provider.nextAvailable}
                          </div>
                        )}
                        <div className="text-xs text-gray-500">
                          Updated: {provider.lastUpdated}
                        </div>
                        <div className="text-xs">
                          {provider.autoAccept ? (
                            <span className="text-green-600">Auto-accept ON</span>
                          ) : (
                            <span className="text-orange-600">Manual approval</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {provider.todaySchedule.length > 0 ? (
                          provider.todaySchedule.map((appointment, index) => (
                            <div key={index} className="text-xs">
                              <div className="font-medium text-blue-600">{appointment.time}</div>
                              <div className="text-gray-600">{appointment.service}</div>
                              <div className="text-gray-500">{appointment.customer}</div>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-gray-500">No appointments</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className={`text-sm font-bold ${getUtilizationColor(provider.weeklyUtilization)}`}>
                          {provider.weeklyUtilization}%
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className={`h-2 rounded-full ${getUtilizationBg(provider.weeklyUtilization)} ${getUtilizationColor(provider.weeklyUtilization).replace('text-', 'bg-').replace('-600', '-400')}`}
                            style={{ width: `${provider.weeklyUtilization}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Weekly capacity</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs space-y-1">
                        <div><span className="font-medium">Mon-Fri:</span> {provider.workingHours.monday}</div>
                        <div><span className="font-medium">Sat:</span> {provider.workingHours.saturday}</div>
                        <div><span className="font-medium">Sun:</span> {provider.workingHours.sunday}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-teal-600 hover:text-teal-900">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-blue-600 hover:text-blue-900">
                          <Calendar className="h-4 w-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <Edit3 className="h-4 w-4" />
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

        {/* Pagination */}
        <div className="bg-white px-6 py-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to <span className="font-medium">{providerAvailability.length}</span> of{' '}
              <span className="font-medium">629</span> results
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                Previous
              </button>
              <button className="px-3 py-2 bg-teal-600 text-white rounded-md text-sm font-medium hover:bg-teal-700">
                1
              </button>
              <button className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                2
              </button>
              <button className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                3
              </button>
              <button className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
