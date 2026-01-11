'use client';

import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import GenerateReportModal from '@/components/admin/modals/GenerateReportModal';
import {
  Search,
  Filter,
  Download,
  Eye,
  Edit3,
  MoreHorizontal,
  CreditCard,
  DollarSign,
  Users,
  Calendar,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  Banknote,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';

export default function PaymentsPage() {
  const [isGenerateReportModalOpen, setIsGenerateReportModalOpen] = useState(false);

  const payments = [
    {
      id: 1,
      transactionId: 'TXN-PAY-001234',
      type: 'Service Payment',
      from: 'Rahul Sharma',
      to: 'Sarah Johnson (CleanPro Services)',
      amount: '₹2,500',
      platformFee: '₹250',
      netAmount: '₹2,250',
      paymentMethod: 'UPI',
      gateway: 'Razorpay',
      status: 'Completed',
      date: '2024-11-23',
      time: '14:35:22',
      orderId: 'ORD-SRV-001234',
      description: 'Payment for Professional Home Cleaning',
      refundable: true,
      settlementDate: '2024-11-24',
      gatewayFee: '₹50'
    },
    {
      id: 2,
      transactionId: 'TXN-PAY-001235',
      type: 'Job Posting Fee',
      from: 'Tech Solutions Inc.',
      to: 'Connect Platform',
      amount: '₹15,000',
      platformFee: '₹1,500',
      netAmount: '₹13,500',
      paymentMethod: 'Credit Card',
      gateway: 'Stripe',
      status: 'Completed',
      date: '2024-11-23',
      time: '12:18:45',
      orderId: 'ORD-JOB-001234',
      description: 'Senior React Developer Job Posting',
      refundable: false,
      settlementDate: '2024-11-25',
      gatewayFee: '₹300'
    },
    {
      id: 3,
      transactionId: 'TXN-PAY-001236',
      type: 'Service Payment',
      from: 'Priya Patel',
      to: 'Mike Rodriguez (Rodriguez Plumbing)',
      amount: '₹1,800',
      platformFee: '₹180',
      netAmount: '₹1,620',
      paymentMethod: 'Debit Card',
      gateway: 'Payu',
      status: 'Processing',
      date: '2024-11-23',
      time: '10:22:15',
      orderId: 'ORD-SRV-001235',
      description: 'Payment for Plumbing Repair Service',
      refundable: true,
      settlementDate: null,
      gatewayFee: '₹36'
    },
    {
      id: 4,
      transactionId: 'TXN-PAY-001237',
      type: 'Refund',
      from: 'Connect Platform',
      to: 'Neha Singh',
      amount: '₹2,200',
      platformFee: '-₹220',
      netAmount: '₹2,200',
      paymentMethod: 'UPI',
      gateway: 'Razorpay',
      status: 'Completed',
      date: '2024-11-22',
      time: '16:45:30',
      orderId: 'ORD-SRV-001237',
      description: 'Refund for Cancelled Laptop Repair Service',
      refundable: false,
      settlementDate: '2024-11-23',
      gatewayFee: '₹0'
    }
  ];

  const handleGenerateReport = (reportConfig: any) => {
    console.log('Generating report with config:', reportConfig);

    // Simulate report generation
    const reportData = {
      ...reportConfig,
      fileName: `payment-report-${reportConfig.reportId}.${reportConfig.format}`,
      downloadUrl: `/api/reports/download/${reportConfig.reportId}`,
      status: 'Generated',
      generatedBy: 'Admin User'
    };

    // Simulate download
    setTimeout(() => {
      const blob = new Blob(['Sample Report Content'], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = reportData.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      alert(`Report "${reportData.fileName}" has been generated and downloaded!`);
    }, 1000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />COMPLETED</span>;
      case 'Processing':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"><Clock className="w-3 h-3 mr-1" />PROCESSING</span>;
      case 'Pending':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />PENDING</span>;
      case 'Failed':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />FAILED</span>;
      case 'Refunded':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800"><RefreshCw className="w-3 h-3 mr-1" />REFUNDED</span>;
      default:
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">UNKNOWN</span>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Service Payment':
        return <ArrowUpRight className="h-4 w-4 text-green-500" />;
      case 'Job Posting Fee':
        return <ArrowUpRight className="h-4 w-4 text-primary-500" />;
      case 'Refund':
        return <ArrowDownLeft className="h-4 w-4 text-slate-500" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'UPI':
        return <Wallet className="h-4 w-4 text-primary-500" />;
      case 'Credit Card':
      case 'Debit Card':
        return <CreditCard className="h-4 w-4 text-primary-500" />;
      default:
        return <Banknote className="h-4 w-4 text-green-500" />;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Payments & Transactions</h1>
          <p className="text-gray-500 mt-2">Monitor and manage all payments, transactions, and financial flows</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900">12,547</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
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
                <p className="text-sm font-medium text-gray-500">Total Volume</p>
                <p className="text-2xl font-bold text-gray-900">₹89,47,800</p>
              </div>
              <div className="p-3 bg-primary-50 rounded-full">
                <CreditCard className="h-6 w-6 text-primary-600" />
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
                <p className="text-sm font-medium text-gray-500">Platform Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹8,94,780</p>
              </div>
              <div className="p-3 bg-primary-50 rounded-full">
                <Wallet className="h-6 w-6 text-primary-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="text-green-500 h-4 w-4 mr-1" />
              <span className="text-green-600 font-medium">+15.5%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">96.8%</p>
              </div>
              <div className="p-3 bg-primary-50 rounded-full">
                <CheckCircle className="h-6 w-6 text-primary-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="text-green-500 h-4 w-4 mr-1" />
              <span className="text-green-600 font-medium">+1.2%</span>
              <span className="text-gray-500 ml-1">improvement</span>
            </div>
          </div>
        </div>

        {/* Payment Methods Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Payment Methods Distribution</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-xl font-bold text-primary-600">45.2%</div>
                <div className="text-sm text-gray-600 flex items-center justify-center">
                  <Wallet className="h-4 w-4 mr-1" />
                  UPI
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-primary-600">32.8%</div>
                <div className="text-sm text-gray-600 flex items-center justify-center">
                  <CreditCard className="h-4 w-4 mr-1" />
                  Credit Card
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">18.5%</div>
                <div className="text-sm text-gray-600 flex items-center justify-center">
                  <CreditCard className="h-4 w-4 mr-1" />
                  Debit Card
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-slate-600">3.5%</div>
                <div className="text-sm text-gray-600 flex items-center justify-center">
                  <Banknote className="h-4 w-4 mr-1" />
                  Net Banking
                </div>
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
                  placeholder="Search by transaction ID, user, or amount..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-80"
                />
              </div>
              <select className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
                <option>All Types</option>
                <option>Service Payment</option>
                <option>Job Posting Fee</option>
                <option>Refund</option>
                <option>Withdrawal</option>
              </select>
              <select className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                <option>All Status</option>
                <option>Completed</option>
                <option>Processing</option>
                <option>Pending</option>
                <option>Failed</option>
              </select>
              <select className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
                <option>All Methods</option>
                <option>UPI</option>
                <option>Credit Card</option>
                <option>Debit Card</option>
                <option>Net Banking</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
              <button
                onClick={() => setIsGenerateReportModalOpen(true)}
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
              >
                Generate Report
              </button>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parties</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount Breakdown</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Info</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Settlement</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 flex items-center">
                          {getTypeIcon(payment.type)}
                          <span className="ml-2">{payment.transactionId}</span>
                        </div>
                        <div className="text-sm text-gray-500">{payment.type}</div>
                        <div className="text-xs text-gray-400">{payment.date} at {payment.time}</div>
                        <div className="text-xs text-primary-600">Order: {payment.orderId}</div>
                        <div className="text-xs text-gray-500 mt-1">{payment.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">From: {payment.from}</div>
                        <div className="text-sm text-primary-600">To: {payment.to}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-bold text-gray-900">{payment.amount}</div>
                        <div className="text-xs text-gray-500">Platform Fee: {payment.platformFee}</div>
                        <div className="text-xs text-green-600">Net Amount: {payment.netAmount}</div>
                        <div className="text-xs text-gray-500">Gateway Fee: {payment.gatewayFee}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm text-gray-900 flex items-center">
                          {getPaymentMethodIcon(payment.paymentMethod)}
                          <span className="ml-2">{payment.paymentMethod}</span>
                        </div>
                        <div className="text-sm text-gray-500">via {payment.gateway}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        {payment.settlementDate ? (
                          <div className="text-sm text-green-600">{payment.settlementDate}</div>
                        ) : (
                          <div className="text-sm text-yellow-600">Pending</div>
                        )}
                        {payment.refundable && (
                          <div className="text-xs text-primary-600">Refundable</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-green-600 hover:text-green-900">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-primary-600 hover:text-primary-900">
                          <Download className="h-4 w-4" />
                        </button>
                        {payment.refundable && payment.status === 'Completed' && (
                          <button className="text-primary-600 hover:text-primary-900">
                            <RefreshCw className="h-4 w-4" />
                          </button>
                        )}
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
              Showing <span className="font-medium">1</span> to <span className="font-medium">{payments.length}</span> of{' '}
              <span className="font-medium">12,547</span> results
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50" disabled>
                Previous
              </button>
              <button className="px-3 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold">
                1
              </button>
              {payments.length > 10 && (
                <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  2
                </button>
              )}
              {payments.length > 20 && (
                <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  3
                </button>
              )}
              <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50" disabled={payments.length <= 10}>
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Generate Report Modal */}
      <GenerateReportModal
        isOpen={isGenerateReportModalOpen}
        onClose={() => setIsGenerateReportModalOpen(false)}
        onGenerate={handleGenerateReport}
      />
    </AdminLayout>
  );
}
