import AdminLayout from '@/components/admin/AdminLayout';
import {
  Search,
  Filter,
  Download,
  Eye,
  Edit3,
  MoreHorizontal,
  BriefcaseIcon,
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  Calendar,
  DollarSign,
  Target,
  Clock,
  MapPin,
  Star,
  UserCheck,
  FileText,
  BarChart3,
  Activity
} from 'lucide-react';

export default function JobAnalyticsPage() {
  const jobCategories = [
    {
      id: 1,
      category: 'Technology',
      totalJobs: 1456,
      activeJobs: 892,
      applications: 18567,
      hires: 234,
      avgSalary: '₹12.5 LPA',
      growth: '+22.4%',
      trend: 'up',
      topSkills: ['JavaScript', 'Python', 'React'],
      avgTimeToHire: '18 days',
      successRate: '12.6%'
    },
    {
      id: 2,
      category: 'Marketing & Sales',
      totalJobs: 987,
      activeJobs: 623,
      applications: 12456,
      hires: 189,
      avgSalary: '₹8.5 LPA',
      growth: '+18.7%',
      trend: 'up',
      topSkills: ['Digital Marketing', 'SEO', 'Analytics'],
      avgTimeToHire: '15 days',
      successRate: '15.2%'
    },
    {
      id: 3,
      category: 'Finance & Banking',
      totalJobs: 756,
      activeJobs: 445,
      applications: 9834,
      hires: 145,
      avgSalary: '₹11.2 LPA',
      growth: '+12.8%',
      trend: 'up',
      topSkills: ['Financial Analysis', 'Excel', 'Risk Management'],
      avgTimeToHire: '22 days',
      successRate: '14.7%'
    },
    {
      id: 4,
      category: 'Healthcare',
      totalJobs: 634,
      activeJobs: 378,
      applications: 7892,
      hires: 123,
      avgSalary: '₹9.8 LPA',
      growth: '+25.1%',
      trend: 'up',
      topSkills: ['Patient Care', 'Medical Knowledge', 'Communication'],
      avgTimeToHire: '20 days',
      successRate: '15.6%'
    },
    {
      id: 5,
      category: 'Education',
      totalJobs: 523,
      activeJobs: 234,
      applications: 6789,
      hires: 98,
      avgSalary: '₹6.5 LPA',
      growth: '-3.2%',
      trend: 'down',
      topSkills: ['Teaching', 'Curriculum Development', 'Student Management'],
      avgTimeToHire: '25 days',
      successRate: '14.4%'
    },
    {
      id: 6,
      category: 'Manufacturing',
      totalJobs: 445,
      activeJobs: 267,
      applications: 5623,
      hires: 87,
      avgSalary: '₹7.8 LPA',
      growth: '+8.9%',
      trend: 'up',
      topSkills: ['Operations', 'Quality Control', 'Safety'],
      avgTimeToHire: '19 days',
      successRate: '15.5%'
    }
  ];

  const topCompanies = [
    {
      id: 1,
      company: 'Tech Solutions Inc.',
      jobsPosted: 156,
      applications: 4567,
      hires: 67,
      successRate: '14.7%',
      avgSalary: '₹14.2 LPA',
      location: 'Mumbai',
      growth: '+28.5%',
      rating: 4.3
    },
    {
      id: 2,
      company: 'Global Marketing Co.',
      jobsPosted: 123,
      applications: 3456,
      hires: 52,
      successRate: '15.0%',
      avgSalary: '₹9.8 LPA',
      location: 'Delhi',
      growth: '+22.1%',
      rating: 4.1
    },
    {
      id: 3,
      company: 'Innovation Hub',
      jobsPosted: 98,
      applications: 2834,
      hires: 43,
      successRate: '15.2%',
      avgSalary: '₹16.5 LPA',
      location: 'Bangalore',
      growth: '+31.7%',
      rating: 4.5
    },
    {
      id: 4,
      company: 'HealthCare Plus',
      jobsPosted: 87,
      applications: 2234,
      hires: 38,
      successRate: '17.0%',
      avgSalary: '₹10.8 LPA',
      location: 'Chennai',
      growth: '+19.8%',
      rating: 4.2
    },
    {
      id: 5,
      company: 'FinanceMax Ltd.',
      jobsPosted: 76,
      applications: 1987,
      hires: 31,
      successRate: '15.6%',
      avgSalary: '₹12.3 LPA',
      location: 'Pune',
      growth: '+15.4%',
      rating: 4.0
    }
  ];

  const skillDemand = [
    { skill: 'JavaScript', jobs: 567, growth: '+24.5%', avgSalary: '₹11.8 LPA' },
    { skill: 'Python', jobs: 445, growth: '+32.1%', avgSalary: '₹13.2 LPA' },
    { skill: 'Digital Marketing', jobs: 389, growth: '+18.7%', avgSalary: '₹8.5 LPA' },
    { skill: 'Data Analysis', jobs: 334, growth: '+41.2%', avgSalary: '₹12.5 LPA' },
    { skill: 'React', jobs: 298, growth: '+28.9%', avgSalary: '₹12.1 LPA' },
    { skill: 'Project Management', jobs: 267, growth: '+15.3%', avgSalary: '₹10.8 LPA' },
    { skill: 'SQL', jobs: 234, growth: '+22.6%', avgSalary: '₹9.8 LPA' },
    { skill: 'Node.js', jobs: 198, growth: '+35.4%', avgSalary: '₹11.5 LPA' }
  ];

  const salaryTrends = [
    { range: '₹3-6 LPA', jobs: 1234, percentage: 28.5, growth: '+12.3%' },
    { range: '₹6-10 LPA', jobs: 1567, percentage: 36.2, growth: '+18.7%' },
    { range: '₹10-15 LPA', jobs: 967, percentage: 22.3, growth: '+22.1%' },
    { range: '₹15-20 LPA', jobs: 345, percentage: 8.0, growth: '+28.5%' },
    { range: '₹20+ LPA', jobs: 218, percentage: 5.0, growth: '+35.2%' }
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
          <h1 className="text-2xl font-bold">Job Market Analytics</h1>
          <p className="text-primary-100 mt-2">Comprehensive job market insights, hiring trends, and employment analytics</p>
        </div>

        {/* Key Job Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Jobs Posted</p>
                <p className="text-2xl font-bold text-gray-900">4,801</p>
              </div>
              <div className="p-3 bg-primary-50 rounded-full">
                <BriefcaseIcon className="h-6 w-6 text-primary-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="text-green-500 h-4 w-4 mr-1" />
              <span className="text-green-600 font-medium">+19.2%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Job Listings</p>
                <p className="text-2xl font-bold text-gray-900">2,839</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-green-600 font-medium">59.1%</span>
              <span className="text-gray-500 ml-1">of total jobs</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">61,161</p>
              </div>
              <div className="p-3 bg-primary-50 rounded-full">
                <Users className="h-6 w-6 text-primary-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="text-green-500 h-4 w-4 mr-1" />
              <span className="text-green-600 font-medium">+24.8%</span>
              <span className="text-gray-500 ml-1">applications up</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Successful Hires</p>
                <p className="text-2xl font-bold text-gray-900">975</p>
              </div>
              <div className="p-3 bg-primary-50 rounded-full">
                <UserCheck className="h-6 w-6 text-primary-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-primary-600 font-medium">15.9%</span>
              <span className="text-gray-500 ml-1">success rate</span>
            </div>
          </div>
        </div>

        {/* Job Category Performance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Job Category Performance</h3>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Volume</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applications & Hires</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Market Metrics</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Top Skills</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {jobCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{category.category}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          {getTrendIcon(category.trend)}
                          <span className={`ml-1 ${getTrendColor(category.trend)}`}>{category.growth}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-bold text-gray-900">{category.totalJobs.toLocaleString()} total</div>
                        <div className="text-sm text-primary-600">{category.activeJobs.toLocaleString()} active</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm text-primary-600">{category.applications.toLocaleString()} applications</div>
                        <div className="text-sm text-green-600">{category.hires} hires</div>
                        <div className="text-sm text-primary-600">Success: {category.successRate}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{category.avgSalary}</div>
                        <div className="text-sm text-gray-500">{category.avgTimeToHire}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {category.topSkills.map((skill, index) => (
                          <div key={index} className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded">
                            {skill}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{ width: `${(category.activeJobs / category.totalJobs) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600">
                          {Math.round((category.activeJobs / category.totalJobs) * 100)}%
                        </span>
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

        {/* Top Companies & Skills Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Hiring Companies */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Top Hiring Companies</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {topCompanies.map((company, index) => (
                  <div key={company.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold text-xs">
                            <Building2 className="h-4 w-4" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{company.company}</div>
                            <div className="text-xs text-gray-500 flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {company.location}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-primary-600">{company.jobsPosted} jobs</div>
                          <div className="text-xs text-green-600">{company.growth}</div>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs text-gray-600">
                        <span>{company.applications.toLocaleString()} applications</span>
                        <span>{company.hires} hires ({company.successRate})</span>
                        <span className="flex items-center">
                          <Star className="h-3 w-3 mr-1 text-yellow-400" />
                          {company.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Skills in Demand */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Skills in High Demand</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {skillDemand.map((skill, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{skill.skill}</span>
                        <span className="text-sm text-gray-900">{skill.jobs} jobs</span>
                      </div>
                      <div className="mt-1 flex items-center justify-between">
                        <div className="w-2/3 bg-gray-200 rounded-full h-2 mr-4">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{ width: `${(skill.jobs / 567) * 100}%` }}
                          ></div>
                        </div>
                        <div className="flex items-center space-x-2 text-xs">
                          <span className="text-green-600 font-medium">{skill.growth}</span>
                          <span className="text-gray-500">{skill.avgSalary}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Salary Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Salary Distribution Analysis</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {salaryTrends.map((salary, index) => (
                <div key={index} className="text-center">
                  <div className="text-lg font-bold text-primary-600">{salary.jobs}</div>
                  <div className="text-sm text-gray-600">{salary.range}</div>
                  <div className="text-xs text-gray-500">{salary.percentage}% of jobs</div>
                  <div className="text-xs text-green-600 font-medium">{salary.growth}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Market Insights */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Job Market Insights</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">19.2 days</div>
                <div className="text-sm text-gray-600">Avg. Time to Hire</div>
                <div className="text-xs text-green-600">-2.1 days vs last month</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">12.7</div>
                <div className="text-sm text-gray-600">Applications per Job</div>
                <div className="text-xs text-green-600">+1.8 vs last month</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">15.9%</div>
                <div className="text-sm text-gray-600">Overall Success Rate</div>
                <div className="text-xs text-green-600">+1.2% vs last month</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">₹10.4 LPA</div>
                <div className="text-sm text-gray-600">Avg. Salary Offered</div>
                <div className="text-xs text-green-600">+8.7% vs last month</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
