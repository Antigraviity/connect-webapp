'use client';

import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import ProcessPayoutsModal from '@/components/admin/modals/ProcessPayoutsModal';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit3, 
  MoreHorizontal,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Wallet,
  CreditCard,
  CheckCircle,
  Clock,
  AlertTriangle,
  Banknote,
  ArrowUpRight,
  ArrowDownLeft,
  Building2,
  User
} from 'lucide-react';

export default function EarningsPage() {
  const [isProcessPayoutsModalOpen, setIsProcessPayoutsModalOpen] = useState(false);
  
  const earnings = [
    {
      id: 1,
      providerId: 'PRV-001234',
      providerName: 'Sarah Johnson',
      businessName: 'CleanPro Services',
      category: 'Home Services',
      totalEarned: '₹2,45,600',
      pendingAmount: '₹12,500',
      withdrawnAmount: '₹2,33,100',
      platformFee: '₹24,560',
      grossEarnings: '₹2,70,160',
      completedOrders: 156,
      lastWithdrawal: '2024-11-20',
      nextPayout: '2024-11-30',
      accountStatus: 'Active',
      withdrawalMethod: 'Bank Transfer',
      rating: 4.8,
      joinedDate: '2024-01-15',
      kycStatus: 'Verified'
    },
    {
      id: 2,
      providerId: 'PRV-001235',
      providerName: 'Mike Rodriguez',
      businessName: 'Rodriguez Plumbing',
      category: 'Home Maintenance',
      totalEarned: '₹1,67,800',
      pendingAmount: '₹8,900',
      withdrawnAmount: '₹1,58,900',
      platformFee: '₹16,780',
      grossEarnings: '₹1,84,580',
      completedOrders: 89,
      lastWithdrawal: '2024-11-18',
      nextPayout: '2024-11-28',
      accountStatus: 'Active',
      withdrawalMethod: 'UPI',
      rating: 4.6,
      joinedDate: '2024-02-01',
      kycStatus: 'Verified'
    },
    {
      id: 3,
      providerId: 'PRV-001236',
      providerName: 'Alex Thompson',
      businessName: 'Thompson Electricals',
      category: 'Home Maintenance',
      totalEarned: '₹4,67,200',
      pendingAmount: '₹23,400',
      withdrawnAmount: '₹4,43,800',
      platformFee: '₹46,720',
      grossEarnings: '₹5,13,920',
      completedOrders: 234,
      lastWithdrawal: '2024-11-22',
      nextPayout: '2024-12-02',
      accountStatus: 'Active',
      withdrawalMethod: 'Bank Transfer',
      rating: 4.7,
      joinedDate: '2024-01-20',
      kycStatus: 'Verified'
    },
    {
      id: 4,
      providerId: 'PRV-001237',
      providerName: 'David Kumar',
      businessName: 'Kumar AC Services',
      category: 'Appliance Repair',
      totalEarned: '₹89,400',
      pendingAmount: '₹15,600',
      withdrawnAmount: '₹73,800',
      platformFee: '₹8,940',
      grossEarnings: '₹98,340',
      completedOrders: 45,
      lastWithdrawal: '2024-11-15',
      nextPayout: '2024-11-25',
      accountStatus: 'Under Review',
      withdrawalMethod: 'Bank Transfer',
      rating: 4.2,
      joinedDate: '2024-03-10',
      kycStatus: 'Pending'
    }
  ];

  const handleProcessPayouts = (payoutData: any) => {
    console.log('Processing payouts with config:', payoutData);
    
    // Simulate payout processing
    setTimeout(() => {
      alert(`Payout batch ${payoutData.payoutId} has been ${payoutData.status === 'Pending Approval' ? 'queued for approval' : 'processed successfully'}!\n\nDetails:\n- Provider Count: ${payoutData.providerCount}\n- Total Amount: ₹${(payoutData.totalAmount / 100000).toFixed(1)}L\n- Status: ${payoutData.status}`);
    }, 500);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />ACTIVE</span>;
      case 'Under Review':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />UNDER REVIEW</span>;
      case 'Suspended':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"><AlertTriangle className="w-3 h-3 mr-1" />SUSPENDED</span>;
      default:
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">UNKNOWN</span>;
    }
  };

  const getKycStatusBadge = (status: string) => {
    switch (status) {
      case 'Verified':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />VERIFIED</span>;
      case 'Pending':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />PENDING</span>;
      case 'Rejected':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"><AlertTriangle className="w-3 h-3 mr-1" />REJECTED</span>;
      default:
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">NOT SUBMITTED</span>;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'Bank Transfer':
        return <Banknote className="h-4 w-4 text-green-500" />;
      case 'UPI':
        return <Wallet className="h-4 w-4 text-purple-500" />;
      case 'Wallet':
        return <CreditCard className="h-4 w-4 text-blue-500" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-green-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold">Provider Earnings Management</h1>
          <p className="text-emerald-100 mt-2">Monitor and manage service provider earnings, payouts, and financial accounts</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Provider Earnings</p>
                <p className="text-2xl font-bold text-gray-900">₹89,47,800</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-full">
                <DollarSign className="h-6 w-6 text-emerald-600" />
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
                <p className="text-sm font-medium text-gray-500">Pending Payouts</p>
                <p className="text-2xl font-bold text-gray-900">₹5,47,300</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-yellow-600 font-medium">867</span>
              <span className="text-gray-500 ml-1">providers awaiting payout</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Platform Commission</p>
                <p className="text-2xl font-bold text-gray-900">₹8,94,780</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <Wallet className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-blue-600 font-medium">10%</span>
              <span className="text-gray-500 ml-1">average commission</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Providers</p>
                <p className="text-2xl font-bold text-gray-900">847</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="text-green-500 h-4 w-4 mr-1" />
              <span className="text-green-600 font-medium">+45</span>
              <span className="text-gray-500 ml-1">new this month</span>
            </div>
          </div>
        </div>

        {/* Earnings Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Earnings by Category</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-xl font-bold text-emerald-600">₹32.5L</div>
                <div className="text-sm text-gray-600">Home Services</div>
                <div className="text-xs text-green-600">+22.1%</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600">₹28.7L</div>
                <div className="text-sm text-gray-600">Maintenance</div>
                <div className="text-xs text-green-600">+18.5%</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-purple-600">₹15.2L</div>
                <div className="text-sm text-gray-600">Appliance Repair</div>
                <div className="text-xs text-green-600">+12.3%</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-orange-600">₹8.9L</div>
                <div className="text-sm text-gray-600">Electronics</div>
                <div className="text-xs text-red-600">-3.2%</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-pink-600">₹6.2L</div>
                <div className="text-sm text-gray-600">Beauty & Wellness</div>
                <div className="text-xs text-green-600">+35.7%</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-indigo-600">₹4.1L</div>
                <div className="text-sm text-gray-600">Others</div>
                <div className="text-xs text-green-600">+8.9%</div>
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
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-80"
                />
              </div>
              <select className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                <option>All Categories</option>
                <option>Home Services</option>
                <option>Home Maintenance</option>
                <option>Appliance Repair</option>
                <option>Electronics Repair</option>
                <option>Beauty & Wellness</option>
              </select>
              <select className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                <option>All Status</option>
                <option>Active</option>
                <option>Under Review</option>
                <option>Suspended</option>
              </select>
              <select className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                <option>All KYC Status</option>
                <option>Verified</option>
                <option>Pending</option>
                <option>Rejected</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
              <button 
                onClick={() => setIsProcessPayoutsModalOpen(true)}
                className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-md hover:bg-emerald-700"
              >
                Process Payouts
              </button>
            </div>
          </div>
        </div>

        {/* Earnings Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business Info</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Earnings Breakdown</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payout Info</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {earnings.map((provider) => (
                  <tr key={provider.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 flex items-center justify-center text-white font-semibold text-lg">
                          {provider.providerName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{provider.providerName}</div>
                          <div className="text-sm text-gray-500">{provider.providerId}</div>
                          <div className="text-xs text-gray-400">Joined: {provider.joinedDate}</div>
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
                        <div className="text-sm text-yellow-600 flex items-center">
                          ⭐ {provider.rating}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-bold text-gray-900">Total: {provider.totalEarned}</div>
                        <div className="text-sm text-yellow-600">Pending: {provider.pendingAmount}</div>
                        <div className="text-sm text-green-600">Withdrawn: {provider.withdrawnAmount}</div>
                        <div className="text-xs text-gray-500">Platform Fee: {provider.platformFee}</div>
                        <div className="text-xs text-blue-600">Gross: {provider.grossEarnings}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm text-gray-900 flex items-center">
                          {getPaymentMethodIcon(provider.withdrawalMethod)}
                          <span className="ml-2">{provider.withdrawalMethod}</span>
                        </div>
                        <div className="text-sm text-gray-500">Last: {provider.lastWithdrawal}</div>
                        <div className="text-sm text-blue-600">Next: {provider.nextPayout}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm text-gray-900">{provider.completedOrders} orders</div>
                        <div className="text-sm text-green-600">
                          ₹{Math.round(parseFloat(provider.totalEarned.replace('₹', '').replace(',', '')) / provider.completedOrders)} avg/order
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-2">
                        {getStatusBadge(provider.accountStatus)}
                        {getKycStatusBadge(provider.kycStatus)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-emerald-600 hover:text-emerald-900">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-blue-600 hover:text-blue-900">
                          <Wallet className="h-4 w-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <Download className="h-4 w-4" />
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
              Showing <span className="font-medium">1</span> to <span className="font-medium">{earnings.length}</span> of{' '}
              <span className="font-medium">847</span> results
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                Previous
              </button>
              <button className="px-3 py-2 bg-emerald-600 text-white rounded-md text-sm font-medium hover:bg-emerald-700">
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

      {/* Process Payouts Modal */}
      <ProcessPayoutsModal
        isOpen={isProcessPayoutsModalOpen}
        onClose={() => setIsProcessPayoutsModalOpen(false)}
        onProcess={handleProcessPayouts}
      />
    </AdminLayout>
  );
}
