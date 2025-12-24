import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  BriefcaseIcon,
  Users,
  Building2,
  Calendar,
  DollarSign,
  Clock,
  MapPin,
  Eye,
  Download,
  Filter,
  Target,
  UserCheck,
  FileText
} from 'lucide-react';

export default function JobsAnalyticsPage() {
  const jobCategories = [
    { name: 'Technology', jobs: 456, applications: 5678, hires: 89, growth: '+18.2%', trend: 'up', avgSalary: '₹12.5 LPA' },
    { name: 'Marketing & Sales', jobs: 234, applications: 3456, hires: 67, growth: '+12.8%', trend: 'up', avgSalary: '₹8.5 LPA' },
    { name: 'Healthcare', jobs: 189, applications: 2345, hires: 45, growth: '+22.1%', trend: 'up', avgSalary: '₹9.8 LPA' },
    { name: 'Finance & Banking', jobs: 167, applications: 1987, hires: 38, growth: '+8.7%', trend: 'up', avgSalary: '₹11.2 LPA' },
    { name: 'Education', jobs: 145, applications: 1567, hires: 23, growth: '-3.2%', trend: 'down', avgSalary: '₹6.5 LPA' },
    { name: 'Manufacturing', jobs: 123, applications: 1234, hires: 19, growth: '+5.4%', trend: 'up', avgSalary: '₹7.8 LPA' }
  ];

  const topCompanies = [
    { name: 'Tech Solutions Inc.', jobs: 45, applications: 567, hires: 23, successRate: 4.1, location: 'Mumbai' },
    { name: 'Global Marketing Co.', jobs: 32, applications: 423, hires: 18, successRate: 4.3, location: 'Delhi' },
    { name: 'Innovation Hub', jobs: 28, applications: 389, hires: 15, successRate: 3.9, location: 'Bangalore' },
    { name: 'HealthCare Plus', jobs: 24, applications: 298, hires: 12, successRate: 4.0, location: 'Chennai' },
    { name: 'FinanceMax Ltd.', jobs: 19, applications: 234, hires: 9, successRate: 3.8, location: 'Pune' }
  ];

  const monthlyJobData = [
    { month: 'Jan', newJobs: 89, applications: 1247, hires: 156, avgSalary: 9.2 },
    { month: 'Feb', newJobs: 102, applications: 1389, hires: 174, avgSalary: 9.4 },
    { month: 'Mar', newJobs: 118, applications: 1456, hires: 182, avgSalary: 9.6 },
    { month: 'Apr', newJobs: 134, applications: 1523, hires: 190, avgSalary: 9.8 },
    { month: 'May', newJobs: 145, applications: 1678, hires: 209, avgSalary: 10.1 },
    { month: 'Jun', newJobs: 167, applications: 1834, hires: 229, avgSalary: 10.3 },
    { month: 'Jul', newJobs: 178, applications: 1945, hires: 243, avgSalary: 10.5 },
    { month: 'Aug', newJobs: 189, applications: 2012, hires: 251, avgSalary: 10.7 },
    { month: 'Sep', newJobs: 201, applications: 2156, hires: 269, avgSalary: 10.9 },
    { month: 'Oct', newJobs: 218, applications: 2289, hires: 286, avgSalary: 11.2 },
    { month: 'Nov', newJobs: 234, applications: 2387, hires: 298, avgSalary: 11.4 }
  ];

  const topSkills = [
    { skill: 'JavaScript', demand: 89, growth: '+15.3%' },
    { skill: 'Python', demand: 76, growth: '+22.1%' },
    { skill: 'React', demand: 68, growth: '+18.7%' },
    { skill: 'Digital Marketing', demand: 54, growth: '+12.4%' },
    { skill: 'Data Analysis', demand: 45, growth: '+28.9%' },
    { skill: 'Project Management', demand: 42, growth: '+8.2%' },
    { skill: 'SQL', demand: 38, growth: '+14.6%' },
    { skill: 'Node.js', demand: 34, growth: '+19.3%' }
  ];

  return (
    <div className="p-6 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold">Jobs Analytics</h1>
          <p className="text-green-100 mt-2">Comprehensive analytics and insights for job market trends and performance</p>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Jobs Posted</p>
                <p className="text-2xl font-bold text-gray-900">1,589</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <BriefcaseIcon className="h-6 w-6 text-green-600" />
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
                <p className="text-sm font-medium text-gray-500">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">16,267</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
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
                <p className="text-sm font-medium text-gray-500">Successful Hires</p>
                <p className="text-2xl font-bold text-gray-900">892</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <UserCheck className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="text-green-500 h-4 w-4 mr-1" />
              <span className="text-green-600 font-medium">+15.8%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Avg. Salary Offered</p>
                <p className="text-2xl font-bold text-gray-900">₹9.8 LPA</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-full">
                <DollarSign className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="text-green-500 h-4 w-4 mr-1" />
              <span className="text-green-600 font-medium">+12.5%</span>
              <span className="text-gray-500 ml-1">increase</span>
            </div>
          </div>
        </div>

        {/* Job Categories Performance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Job Categories Performance</h3>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jobs Posted</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applications</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hires</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Salary</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Growth</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {jobCategories.map((category, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{category.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{category.jobs}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-blue-600">{category.applications.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-green-600">{category.hires}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-purple-600">{category.avgSalary}</div>
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

        {/* Top Companies */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Top Hiring Companies</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jobs Posted</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applications</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hires</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Success Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topCompanies.map((company, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{company.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{company.jobs}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-blue-600">{company.applications}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-green-600">{company.hires}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-purple-600">{company.successRate}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-3 w-3 mr-1" />
                        {company.location}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="text-green-600 hover:text-green-900">
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Job Trends */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Monthly Job Posting Trends</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {monthlyJobData.slice(-6).map((month, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-700">{month.month}</div>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-green-600 font-medium">+{month.newJobs} jobs</div>
                      <div className="text-sm text-blue-600">{month.applications} apps</div>
                      <div className="text-sm text-purple-600">{month.hires} hires</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Skills in Demand */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Top Skills in Demand</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {topSkills.map((skill, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-700">{skill.skill}</div>
                    <div className="flex items-center space-x-2">
                      <div className="text-sm text-gray-900">{skill.demand} jobs</div>
                      <div className="text-sm text-green-600">({skill.growth})</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Application to Hire Ratio</p>
                <p className="text-2xl font-bold text-gray-900">18:1</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingDown className="text-green-500 h-4 w-4 mr-1" />
              <span className="text-green-600 font-medium">-2.1</span>
              <span className="text-gray-500 ml-1">improvement</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Avg. Time to Hire</p>
                <p className="text-2xl font-bold text-gray-900">21 days</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingDown className="text-green-500 h-4 w-4 mr-1" />
              <span className="text-green-600 font-medium">-3 days</span>
              <span className="text-gray-500 ml-1">faster</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Job Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900">85.6%</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="text-green-500 h-4 w-4 mr-1" />
              <span className="text-green-600 font-medium">+5.2%</span>
              <span className="text-gray-500 ml-1">improvement</span>
            </div>
          </div>
        </div>
    </div>
  );
}
