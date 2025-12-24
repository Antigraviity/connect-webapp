import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit3, 
  MoreHorizontal,
  BriefcaseIcon,
  Users,
  Building2,
  Calendar,
  DollarSign,
  Star,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  TrendingUp,
  UserCheck,
  FileText
} from 'lucide-react';

export default function JobOrdersPage() {
  const jobOrders = [
    {
      id: 1,
      orderId: 'ORD-JOB-001234',
      jobTitle: 'Senior React Developer',
      company: 'Tech Solutions Inc.',
      companyContact: 'Rajesh Kumar',
      companyPhone: '+91 9876543210',
      companyEmail: 'hr@techsolutions.com',
      location: 'Mumbai, Maharashtra',
      orderDate: '2024-11-20',
      jobPostedDate: '2024-11-22',
      expiryDate: '2024-12-22',
      amount: '₹15,000',
      platformFee: '₹1,500',
      companyPaid: '₹13,500',
      status: 'Active',
      paymentStatus: 'Paid',
      paymentMethod: 'Bank Transfer',
      applications: 45,
      views: 234,
      hired: 1,
      category: 'Technology',
      jobType: 'Full-time',
      experience: '3-5 years',
      salary: '₹8-12 LPA'
    },
    {
      id: 2,
      orderId: 'ORD-JOB-001235',
      jobTitle: 'Digital Marketing Manager',
      company: 'Global Marketing Co.',
      companyContact: 'Priya Sharma',
      companyPhone: '+91 8765432109',
      companyEmail: 'careers@globalmarketing.com',
      location: 'Delhi, Delhi',
      orderDate: '2024-11-19',
      jobPostedDate: '2024-11-20',
      expiryDate: '2024-12-20',
      amount: '₹12,000',
      platformFee: '₹1,200',
      companyPaid: '₹10,800',
      status: 'Active',
      paymentStatus: 'Paid',
      paymentMethod: 'UPI',
      applications: 32,
      views: 187,
      hired: 0,
      category: 'Marketing',
      jobType: 'Full-time',
      experience: '2-4 years',
      salary: '₹6-10 LPA'
    },
    {
      id: 3,
      orderId: 'ORD-JOB-001236',
      jobTitle: 'Data Scientist',
      company: 'Innovation Hub',
      companyContact: 'Amit Patel',
      companyPhone: '+91 7654321098',
      companyEmail: 'jobs@innovationhub.com',
      location: 'Bangalore, Karnataka',
      orderDate: '2024-11-18',
      jobPostedDate: '2024-11-19',
      expiryDate: '2024-12-19',
      amount: '₹18,000',
      platformFee: '₹1,800',
      companyPaid: '₹16,200',
      status: 'Expired',
      paymentStatus: 'Paid',
      paymentMethod: 'Credit Card',
      applications: 67,
      views: 312,
      hired: 2,
      category: 'Technology',
      jobType: 'Full-time',
      experience: '4-6 years',
      salary: '₹12-18 LPA'
    },
    {
      id: 4,
      orderId: 'ORD-JOB-001237',
      jobTitle: 'HR Executive',
      company: 'StartupXYZ',
      companyContact: 'Neha Singh',
      companyPhone: '+91 6543210987',
      companyEmail: 'talent@startupxyz.com',
      location: 'Pune, Maharashtra',
      orderDate: '2024-11-17',
      jobPostedDate: '2024-11-18',
      expiryDate: '2024-12-18',
      amount: '₹8,000',
      platformFee: '₹800',
      companyPaid: '₹7,200',
      status: 'Cancelled',
      paymentStatus: 'Refunded',
      paymentMethod: 'UPI',
      applications: 23,
      views: 98,
      hired: 0,
      category: 'Human Resources',
      jobType: 'Full-time',
      experience: '1-3 years',
      salary: '₹4-6 LPA'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />ACTIVE</span>;
      case 'Expired':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />EXPIRED</span>;
      case 'Paused':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800"><AlertTriangle className="w-3 h-3 mr-1" />PAUSED</span>;
      case 'Cancelled':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />CANCELLED</span>;
      default:
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">UNKNOWN</span>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />PAID</span>;
      case 'Pending':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />PENDING</span>;
      case 'Failed':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />FAILED</span>;
      case 'Refunded':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800"><AlertTriangle className="w-3 h-3 mr-1" />REFUNDED</span>;
      default:
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">UNKNOWN</span>;
    }
  };

  return (
    <div className="p-6 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold">Job Orders Management</h1>
          <p className="text-purple-100 mt-2">Monitor and manage all job posting orders and payments</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Job Orders</p>
                <p className="text-2xl font-bold text-gray-900">1,589</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <BriefcaseIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="text-green-500 h-4 w-4 mr-1" />
              <span className="text-green-600 font-medium">+22.4%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Job Posts</p>
                <p className="text-2xl font-bold text-gray-900">1,247</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-green-600 font-medium">78.5%</span>
              <span className="text-gray-500 ml-1">active rate</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹23,47,800</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="text-green-500 h-4 w-4 mr-1" />
              <span className="text-green-600 font-medium">+28.7%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Average Order Value</p>
                <p className="text-2xl font-bold text-gray-900">₹14,782</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-full">
                <Star className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="text-green-500 h-4 w-4 mr-1" />
              <span className="text-green-600 font-medium">+12.3%</span>
              <span className="text-gray-500 ml-1">increase</span>
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
                  placeholder="Search by order ID, company, or job title..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-80"
                />
              </div>
              <select className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                <option>All Categories</option>
                <option>Technology</option>
                <option>Marketing</option>
                <option>Finance</option>
                <option>Healthcare</option>
                <option>Human Resources</option>
              </select>
              <select className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                <option>All Status</option>
                <option>Active</option>
                <option>Expired</option>
                <option>Paused</option>
                <option>Cancelled</option>
              </select>
              <select className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                <option>All Payments</option>
                <option>Paid</option>
                <option>Pending</option>
                <option>Failed</option>
                <option>Refunded</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Download className="h-4 w-4 mr-2" />
                Export Orders
              </button>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job & Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Performance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {jobOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{order.orderId}</div>
                        <div className="text-sm text-gray-500">{order.category}</div>
                        <div className="text-xs text-gray-400">Ordered: {order.orderDate}</div>
                        <div className="text-xs text-gray-400">Posted: {order.jobPostedDate}</div>
                        <div className="text-xs text-red-600">Expires: {order.expiryDate}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{order.jobTitle}</div>
                        <div className="text-sm text-blue-600 flex items-center">
                          <Building2 className="h-3 w-3 mr-1" />
                          {order.company}
                        </div>
                        <div className="text-sm text-gray-500">{order.jobType} • {order.experience}</div>
                        <div className="text-sm text-green-600 font-medium">{order.salary}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {order.location}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{order.companyContact}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {order.companyPhone}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {order.companyEmail}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm text-blue-600 flex items-center">
                          <Eye className="h-3 w-3 mr-1" />
                          {order.views} views
                        </div>
                        <div className="text-sm text-purple-600 flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {order.applications} applications
                        </div>
                        <div className="text-sm text-green-600 flex items-center">
                          <UserCheck className="h-3 w-3 mr-1" />
                          {order.hired} hired
                        </div>
                        {order.applications > 0 && (
                          <div className="text-xs text-gray-500">
                            {((order.hired / order.applications) * 100).toFixed(1)}% success rate
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-bold text-gray-900">{order.amount}</div>
                        <div className="text-xs text-gray-500">Platform: {order.platformFee}</div>
                        <div className="text-xs text-green-600">Company: {order.companyPaid}</div>
                        <div className="text-sm text-blue-600 flex items-center mt-1">
                          <CreditCard className="h-3 w-3 mr-1" />
                          {order.paymentMethod}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-2">
                        {getStatusBadge(order.status)}
                        {getPaymentStatusBadge(order.paymentStatus)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-purple-600 hover:text-purple-900">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-blue-600 hover:text-blue-900">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <FileText className="h-4 w-4" />
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
              Showing <span className="font-medium">1</span> to <span className="font-medium">{jobOrders.length}</span> of{' '}
              <span className="font-medium">1,589</span> results
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                Previous
              </button>
              <button className="px-3 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700">
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
  );
}
