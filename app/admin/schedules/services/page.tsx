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
  MapPin,
  User,
  Phone,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Star,
  TrendingUp,
  Users,
  ShoppingBag,
  CalendarDays
} from 'lucide-react';

export default function ServiceSchedulesPage() {
  const serviceSchedules = [
    {
      id: 1,
      scheduleId: 'SCH-SRV-001234',
      serviceName: 'Professional Home Cleaning',
      serviceProvider: 'Sarah Johnson',
      providerPhone: '+91 9876543210',
      customer: 'Rahul Sharma',
      customerPhone: '+91 8765432109',
      bookingDate: '2024-11-20',
      scheduledDate: '2024-11-25',
      scheduledTime: '10:00 AM',
      estimatedDuration: '3 hours',
      location: 'Bandra West, Mumbai',
      fullAddress: '201, Sunrise Apartments, Bandra West, Mumbai - 400050',
      status: 'Confirmed',
      priority: 'Normal',
      serviceAmount: '₹2,500',
      paymentStatus: 'Paid',
      category: 'Home Services',
      rating: null,
      notes: 'Please bring all cleaning supplies. Customer has 2 cats.',
      createdDate: '2024-11-20',
      lastUpdated: '2024-11-22'
    },
    {
      id: 2,
      scheduleId: 'SCH-SRV-001235',
      serviceName: 'Plumbing Repair',
      serviceProvider: 'Mike Rodriguez',
      providerPhone: '+91 7654321098',
      customer: 'Priya Patel',
      customerPhone: '+91 6543210987',
      bookingDate: '2024-11-21',
      scheduledDate: '2024-11-24',
      scheduledTime: '02:00 PM',
      estimatedDuration: '2 hours',
      location: 'CP, New Delhi',
      fullAddress: '15, Main Market, Connaught Place, New Delhi - 110001',
      status: 'In Progress',
      priority: 'Urgent',
      serviceAmount: '₹1,800',
      paymentStatus: 'Paid',
      category: 'Home Maintenance',
      rating: null,
      notes: 'Kitchen sink leak repair. Spare parts may be needed.',
      createdDate: '2024-11-21',
      lastUpdated: '2024-11-24'
    },
    {
      id: 3,
      scheduleId: 'SCH-SRV-001236',
      serviceName: 'AC Installation & Repair',
      serviceProvider: 'Alex Thompson',
      providerPhone: '+91 5432109876',
      customer: 'Amit Kumar',
      customerPhone: '+91 4321098765',
      bookingDate: '2024-11-19',
      scheduledDate: '2024-11-23',
      scheduledTime: '11:30 AM',
      estimatedDuration: '4 hours',
      location: 'Koramangala, Bangalore',
      fullAddress: '45, 5th Block, Koramangala, Bangalore - 560095',
      status: 'Completed',
      priority: 'Normal',
      serviceAmount: '₹3,200',
      paymentStatus: 'Paid',
      category: 'Appliance Repair',
      rating: 4.7,
      notes: 'New AC installation in bedroom. Power point available.',
      createdDate: '2024-11-19',
      lastUpdated: '2024-11-23'
    },
    {
      id: 4,
      scheduleId: 'SCH-SRV-001237',
      serviceName: 'Laptop Repair Service',
      serviceProvider: 'David Kumar',
      providerPhone: '+91 3210987654',
      customer: 'Neha Singh',
      customerPhone: '+91 2109876543',
      bookingDate: '2024-11-18',
      scheduledDate: '2024-11-22',
      scheduledTime: '04:00 PM',
      estimatedDuration: '1.5 hours',
      location: 'Anna Nagar, Chennai',
      fullAddress: '78, 2nd Avenue, Anna Nagar, Chennai - 600040',
      status: 'Cancelled',
      priority: 'Normal',
      serviceAmount: '₹2,200',
      paymentStatus: 'Refunded',
      category: 'Electronics Repair',
      rating: null,
      notes: 'Screen replacement required. Customer cancelled due to emergency.',
      createdDate: '2024-11-18',
      lastUpdated: '2024-11-21'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"><Calendar className="w-3 h-3 mr-1" />CONFIRMED</span>;
      case 'In Progress':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />IN PROGRESS</span>;
      case 'Completed':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />COMPLETED</span>;
      case 'Cancelled':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />CANCELLED</span>;
      case 'Rescheduled':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800"><AlertTriangle className="w-3 h-3 mr-1" />RESCHEDULED</span>;
      default:
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">UNKNOWN</span>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">URGENT</span>;
      case 'High':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">HIGH</span>;
      case 'Normal':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">NORMAL</span>;
      case 'Low':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">LOW</span>;
      default:
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">NORMAL</span>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />PAID</span>;
      case 'Pending':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />PENDING</span>;
      case 'Refunded':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800"><AlertTriangle className="w-3 h-3 mr-1" />REFUNDED</span>;
      default:
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">UNKNOWN</span>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold">Service Schedules Management</h1>
          <p className="text-primary-100 mt-2">Monitor and manage all service appointments and schedules</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Schedules</p>
                <p className="text-2xl font-bold text-gray-900">3,247</p>
              </div>
              <div className="p-3 bg-primary-50 rounded-full">
                <CalendarDays className="h-6 w-6 text-primary-600" />
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
                <p className="text-sm font-medium text-gray-500">Today's Appointments</p>
                <p className="text-2xl font-bold text-gray-900">127</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-green-600 font-medium">89</span>
              <span className="text-gray-500 ml-1">confirmed</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Completed Services</p>
                <p className="text-2xl font-bold text-gray-900">2,891</p>
              </div>
              <div className="p-3 bg-primary-50 rounded-full">
                <CheckCircle className="h-6 w-6 text-primary-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-primary-600 font-medium">89.0%</span>
              <span className="text-gray-500 ml-1">completion rate</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Providers</p>
                <p className="text-2xl font-bold text-gray-900">756</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-full">
                <Users className="h-6 w-6 text-slate-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-slate-600 font-medium">423</span>
              <span className="text-gray-500 ml-1">scheduled today</span>
            </div>
          </div>
        </div>

        {/* Status Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Schedule Status Overview</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-xl font-bold text-primary-600">1,234</div>
                <div className="text-sm text-gray-600">Confirmed</div>
                <div className="text-xs text-green-600">+12.3%</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-yellow-600">234</div>
                <div className="text-sm text-gray-600">In Progress</div>
                <div className="text-xs text-primary-600">Real-time</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">1,567</div>
                <div className="text-sm text-gray-600">Completed</div>
                <div className="text-xs text-green-600">+18.9%</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-red-600">156</div>
                <div className="text-sm text-gray-600">Cancelled</div>
                <div className="text-xs text-red-600">4.8%</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-slate-600">56</div>
                <div className="text-sm text-gray-600">Rescheduled</div>
                <div className="text-xs text-slate-600">1.7%</div>
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
                  placeholder="Search by schedule ID, customer, or provider..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-80"
                />
              </div>
              <select className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                <option>All Categories</option>
                <option>Home Services</option>
                <option>Home Maintenance</option>
                <option>Appliance Repair</option>
                <option>Electronics Repair</option>
                <option>Beauty & Wellness</option>
              </select>
              <select className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                <option>All Status</option>
                <option>Confirmed</option>
                <option>In Progress</option>
                <option>Completed</option>
                <option>Cancelled</option>
                <option>Rescheduled</option>
              </select>
              <select className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                <option>All Dates</option>
                <option>Today</option>
                <option>Tomorrow</option>
                <option>This Week</option>
                <option>Next Week</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
              <button className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700">
                <Calendar className="h-4 w-4 mr-2" />
                Calendar View
              </button>
            </div>
          </div>
        </div>

        {/* Schedules Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service & Provider</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Info</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Appointment Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {serviceSchedules.map((schedule) => (
                  <tr key={schedule.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{schedule.scheduleId}</div>
                        <div className="text-sm text-gray-500">{schedule.category}</div>
                        <div className="text-xs text-gray-400">Created: {schedule.createdDate}</div>
                        <div className="text-xs text-primary-600">Updated: {schedule.lastUpdated}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{schedule.serviceName}</div>
                        <div className="text-sm text-primary-600 flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {schedule.serviceProvider}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {schedule.providerPhone}
                        </div>
                        <div className="text-sm text-green-600 font-medium">{schedule.serviceAmount}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{schedule.customer}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {schedule.customerPhone}
                        </div>
                        {schedule.rating && (
                          <div className="flex items-center mt-1">
                            <Star className="h-3 w-3 text-yellow-400 mr-1" />
                            <span className="text-sm text-gray-600">{schedule.rating}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {schedule.scheduledDate}
                        </div>
                        <div className="text-sm text-primary-600 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {schedule.scheduledTime}
                        </div>
                        <div className="text-sm text-gray-500">Duration: {schedule.estimatedDuration}</div>
                        <div className="text-xs text-gray-400">Booked: {schedule.bookingDate}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {schedule.location}
                        </div>
                        <div className="text-xs text-gray-500 max-w-xs">{schedule.fullAddress}</div>
                        {schedule.notes && (
                          <div className="text-xs text-primary-600 mt-1 max-w-xs">
                            Note: {schedule.notes}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-2">
                        {getStatusBadge(schedule.status)}
                        {getPriorityBadge(schedule.priority)}
                        {getPaymentStatusBadge(schedule.paymentStatus)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-primary-600 hover:text-primary-900">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button className="text-primary-600 hover:text-primary-900">
                          <Calendar className="h-4 w-4" />
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
              Showing <span className="font-medium">1</span> to <span className="font-medium">{serviceSchedules.length}</span> of{' '}
              <span className="font-medium">3,247</span> results
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                Previous
              </button>
              <button className="px-3 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700">
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
