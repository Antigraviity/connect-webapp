import AdminLayout from '@/components/admin/AdminLayout';
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
  CreditCard,
  Wallet,
  PieChart,
  BarChart3,
  Target,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  Banknote,
  Building2,
  Users
} from 'lucide-react';

export default function FinancialAnalyticsPage() {
  const revenueStreams = [
    {
      id: 1,
      stream: 'Service Commission',
      revenue: '₹45,67,800',
      percentage: 52.3,
      growth: '+18.2%',
      trend: 'up',
      transactions: 12547,
      avgTransaction: '₹364',
      monthlyGrowth: ['+12%', '+15%', '+18%', '+18%']
    },
    {
      id: 2,
      stream: 'Job Posting Fees',
      revenue: '₹28,94,600',
      percentage: 33.1,
      growth: '+22.8%',
      trend: 'up',
      transactions: 1589,
      avgTransaction: '₹18,225',
      monthlyGrowth: ['+18%', '+20%', '+23%', '+23%']
    },
    {
      id: 3,
      stream: 'Premium Subscriptions',
      revenue: '₹8,45,200',
      percentage: 9.7,
      growth: '+15.7%',
      trend: 'up',
      transactions: 892,
      avgTransaction: '₹9,472',
      monthlyGrowth: ['+10%', '+13%', '+16%', '+16%']
    },
    {
      id: 4,
      stream: 'Featured Listings',
      revenue: '₹2,89,400',
      percentage: 3.3,
      growth: '+8.9%',
      trend: 'up',
      transactions: 234,
      avgTransaction: '₹12,368',
      monthlyGrowth: ['+5%', '+7%', '+9%', '+9%']
    },
    {
      id: 5,
      stream: 'Advertisement Revenue',
      revenue: '₹1,38,600',
      percentage: 1.6,
      growth: '+12.4%',
      trend: 'up',
      transactions: 156,
      avgTransaction: '₹8,885',
      monthlyGrowth: ['+8%', '+10%', '+12%', '+12%']
    }
  ];

  const expenseBreakdown = [
    {
      id: 1,
      category: 'Provider Payouts',
      amount: '₹68,45,700',
      percentage: 67.8,
      growth: '+16.5%',
      trend: 'up',
      description: 'Service provider earnings'
    },
    {
      id: 2,
      category: 'Technology & Infrastructure',
      amount: '₹8,92,300',
      percentage: 8.8,
      growth: '+12.1%',
      trend: 'up',
      description: 'Servers, development, maintenance'
    },
    {
      id: 3,
      category: 'Marketing & Advertising',
      amount: '₹6,73,800',
      percentage: 6.7,
      growth: '+22.4%',
      trend: 'up',
      description: 'User acquisition and branding'
    },
    {
      id: 4,
      category: 'Payment Gateway Fees',
      amount: '₹4,56,200',
      percentage: 4.5,
      growth: '+18.8%',
      trend: 'up',
      description: 'Transaction processing costs'
    },
    {
      id: 5,
      category: 'Operations & Support',
      amount: '₹3,84,500',
      percentage: 3.8,
      growth: '+8.7%',
      trend: 'up',
      description: 'Customer service and operations'
    },
    {
      id: 6,
      category: 'Legal & Compliance',
      amount: '₹2,67,400',
      percentage: 2.6,
      growth: '+5.3%',
      trend: 'up',
      description: 'Legal fees and compliance costs'
    },
    {
      id: 7,
      category: 'Other Expenses',
      amount: '₹5,89,600',
      percentage: 5.8,
      growth: '+7.9%',
      trend: 'up',
      description: 'Miscellaneous operational costs'
    }
  ];

  const monthlyFinancials = [
    { month: 'Jan', revenue: '₹7.2L', expenses: '₹6.1L', profit: '₹1.1L', margin: '15.3%' },
    { month: 'Feb', revenue: '₹7.8L', expenses: '₹6.5L', profit: '₹1.3L', margin: '16.7%' },
    { month: 'Mar', revenue: '₹8.4L', expenses: '₹6.9L', profit: '₹1.5L', margin: '17.9%' },
    { month: 'Apr', revenue: '₹8.9L', expenses: '₹7.2L', profit: '₹1.7L', margin: '19.1%' },
    { month: 'May', revenue: '₹9.2L', expenses: '₹7.4L', profit: '₹1.8L', margin: '19.6%' },
    { month: 'Jun', revenue: '₹9.6L', expenses: '₹7.7L', profit: '₹1.9L', margin: '19.8%' },
    { month: 'Jul', revenue: '₹10.1L', expenses: '₹8.0L', profit: '₹2.1L', margin: '20.8%' },
    { month: 'Aug', revenue: '₹10.5L', expenses: '₹8.2L', profit: '₹2.3L', margin: '21.9%' },
    { month: 'Sep', revenue: '₹11.2L', expenses: '₹8.6L', profit: '₹2.6L', margin: '23.2%' },
    { month: 'Oct', revenue: '₹11.8L', expenses: '₹8.9L', profit: '₹2.9L', margin: '24.6%' },
    { month: 'Nov', revenue: '₹12.3L', expenses: '₹9.1L', profit: '₹3.2L', margin: '26.0%' }
  ];

  const kpis = [
    {
      metric: 'Customer Acquisition Cost (CAC)',
      value: '₹485',
      change: '-12.5%',
      trend: 'down',
      description: 'Cost to acquire new user'
    },
    {
      metric: 'Customer Lifetime Value (CLV)',
      value: '₹8,450',
      change: '+18.7%',
      trend: 'up',
      description: 'Average user lifetime value'
    },
    {
      metric: 'CLV/CAC Ratio',
      value: '17.4x',
      change: '+35.8%',
      trend: 'up',
      description: 'Return on acquisition investment'
    },
    {
      metric: 'Average Revenue Per User (ARPU)',
      value: '₹892',
      change: '+14.2%',
      trend: 'up',
      description: 'Monthly revenue per user'
    }
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
          <h1 className="text-2xl font-bold">Financial Analytics Dashboard</h1>
          <p className="text-primary-100 mt-2">Comprehensive financial performance analysis, revenue tracking, and profitability primary-hts</p>
        </div>

        {/* Key Financial Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹87,35,600</p>
              </div>
              <div className="p-3 bg-primary-50 rounded-full">
                <DollarSign className="h-6 w-6 text-primary-600" />
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
                <p className="text-sm font-medium text-gray-500">Total Expenses</p>
                <p className="text-2xl font-bold text-gray-900">₹1,01,09,500</p>
              </div>
              <div className="p-3 bg-red-50 rounded-full">
                <CreditCard className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="text-red-500 h-4 w-4 mr-1" />
              <span className="text-red-600 font-medium">+15.7%</span>
              <span className="text-gray-500 ml-1">operational costs</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Net Profit</p>
                <p className="text-2xl font-bold text-gray-900">₹22,68,400</p>
              </div>
              <div className="p-3 bg-primary-50 rounded-full">
                <Wallet className="h-6 w-6 text-primary-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="text-green-500 h-4 w-4 mr-1" />
              <span className="text-green-600 font-medium">+26.0%</span>
              <span className="text-gray-500 ml-1">profit margin</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Profit Margin</p>
                <p className="text-2xl font-bold text-gray-900">26.0%</p>
              </div>
              <div className="p-3 bg-primary-50 rounded-full">
                <Target className="h-6 w-6 text-primary-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="text-green-500 h-4 w-4 mr-1" />
              <span className="text-green-600 font-medium">+4.2%</span>
              <span className="text-gray-500 ml-1">margin improvement</span>
            </div>
          </div>
        </div>

        {/* Revenue Streams Analysis */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Revenue Streams Analysis</h3>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue Stream</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue & Share</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transactions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Growth Trend</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Progress</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {revenueStreams.map((stream) => (
                  <tr key={stream.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{stream.stream}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <ArrowUpRight className="h-3 w-3 mr-1" />
                          Primary revenue source
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-bold text-gray-900">{stream.revenue}</div>
                        <div className="text-sm text-primary-600">{stream.percentage}% of total</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm text-gray-900">{stream.transactions.toLocaleString()} transactions</div>
                        <div className="text-sm text-green-600 font-medium">{stream.avgTransaction} avg</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {getTrendIcon(stream.trend)}
                        <span className={`ml-2 text-sm font-medium ${getTrendColor(stream.trend)}`}>
                          {stream.growth}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {stream.monthlyGrowth.map((growth, index) => (
                          <div key={index} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            {growth}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{ width: `${stream.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600">{stream.percentage}%</span>
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

        {/* Monthly Financial Trends & Expense Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trends */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Monthly Financial Trends</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {monthlyFinancials.slice(-6).map((month, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{month.month}</span>
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="text-primary-600 font-medium">{month.revenue}</div>
                          <div className="text-red-600">{month.expenses}</div>
                          <div className="text-primary-600 font-bold">{month.profit}</div>
                        </div>
                      </div>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-xs text-gray-500">Revenue • Expenses • Profit</span>
                        <span className="text-xs text-primary-600 font-medium">Margin: {month.margin}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Expense Breakdown */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Expense Breakdown</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {expenseBreakdown.map((expense, index) => (
                  <div key={expense.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{expense.category}</span>
                        <span className="text-sm text-gray-900">{expense.amount}</span>
                      </div>
                      <div className="mt-1 flex items-center justify-between">
                        <div className="w-3/4 bg-gray-200 rounded-full h-2 mr-4">
                          <div
                            className="bg-red-500 h-2 rounded-full"
                            style={{ width: `${expense.percentage}%` }}
                          ></div>
                        </div>
                        <div className="flex items-center space-x-2 text-xs">
                          <span className="text-gray-600">{expense.percentage}%</span>
                          <span className="text-green-600">{expense.growth}</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{expense.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Key Financial Performance Indicators</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {kpis.map((kpi, index) => (
                <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{kpi.value}</div>
                  <div className="text-sm text-gray-600 font-medium">{kpi.metric}</div>
                  <div className="mt-2 flex items-center justify-center">
                    {getTrendIcon(kpi.trend)}
                    <span className={`ml-1 text-sm font-medium ${getTrendColor(kpi.trend)}`}>
                      {kpi.change}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{kpi.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Financial Health Indicators */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Financial Health Indicators</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">92.4%</div>
                <div className="text-sm text-gray-600">Revenue Growth Rate</div>
                <div className="text-xs text-green-600">+8.2% vs target</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">4.2x</div>
                <div className="text-sm text-gray-600">Cash Flow Ratio</div>
                <div className="text-xs text-primary-600">Healthy liquidity</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">89.2%</div>
                <div className="text-sm text-gray-600">Gross Margin</div>
                <div className="text-xs text-primary-600">Strong profitability</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
