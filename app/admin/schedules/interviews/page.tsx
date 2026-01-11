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
  TrendingUp,
  Users,
  BriefcaseIcon,
  CalendarDays,
  Video,
  Building2,
  Mail,
  FileText
} from 'lucide-react';

export default function InterviewSchedulesPage() {
  const interviewSchedules = [
    {
      id: 1,
      scheduleId: 'INT-SCH-001234',
      jobTitle: 'Senior React Developer',
      company: 'Tech Solutions Inc.',
      companyContact: 'Rajesh Kumar',
      companyPhone: '+91 9876543210',
      companyEmail: 'hr@techsolutions.com',
      candidate: 'Arjun Patel',
      candidatePhone: '+91 8765432109',
      candidateEmail: 'arjun.patel@email.com',
      scheduledDate: '2024-11-25',
      scheduledTime: '11:00 AM',
      duration: '60 minutes',
      interviewType: 'Video Call',
      meetingLink: 'https://meet.google.com/abc-defg-hij',
      location: null,
      status: 'Scheduled',
      round: 'Technical Round',
      priority: 'High',
      salary: '₹8-12 LPA',
      experience: '3-5 years',
      notes: 'Prepare technical questions on React, Redux, and Node.js',
      createdDate: '2024-11-20',
      lastUpdated: '2024-11-22',
      interviewers: ['Rajesh Kumar', 'Priya Sharma'],
      applicationId: 'APP-001234'
    },
    {
      id: 2,
      scheduleId: 'INT-SCH-001235',
      jobTitle: 'Digital Marketing Manager',
      company: 'Global Marketing Co.',
      companyContact: 'Priya Sharma',
      companyPhone: '+91 7654321098',
      companyEmail: 'careers@globalmarketing.com',
      candidate: 'Sneha Gupta',
      candidatePhone: '+91 6543210987',
      candidateEmail: 'sneha.gupta@email.com',
      scheduledDate: '2024-11-26',
      scheduledTime: '02:30 PM',
      duration: '45 minutes',
      interviewType: 'In-Person',
      meetingLink: null,
      location: 'CP, New Delhi - Conference Room A',
      status: 'Confirmed',
      round: 'HR Round',
      priority: 'Medium',
      salary: '₹6-10 LPA',
      experience: '2-4 years',
      notes: 'Discuss previous marketing campaigns and digital strategy experience',
      createdDate: '2024-11-21',
      lastUpdated: '2024-11-23',
      interviewers: ['Priya Sharma'],
      applicationId: 'APP-001235'
    },
    {
      id: 3,
      scheduleId: 'INT-SCH-001236',
      jobTitle: 'Data Scientist',
      company: 'Innovation Hub',
      companyContact: 'Amit Patel',
      companyPhone: '+91 5432109876',
      companyEmail: 'jobs@innovationhub.com',
      candidate: 'Ravi Kumar',
      candidatePhone: '+91 4321098765',
      candidateEmail: 'ravi.kumar@email.com',
      scheduledDate: '2024-11-24',
      scheduledTime: '10:00 AM',
      duration: '90 minutes',
      interviewType: 'Video Call',
      meetingLink: 'https://zoom.us/j/123456789',
      location: null,
      status: 'Completed',
      round: 'Final Round',
      priority: 'High',
      salary: '₹12-18 LPA',
      experience: '4-6 years',
      notes: 'Present case study on machine learning project',
      createdDate: '2024-11-19',
      lastUpdated: '2024-11-24',
      interviewers: ['Amit Patel', 'Dr. Sarah Johnson', 'Tech Lead'],
      applicationId: 'APP-001236'
    },
    {
      id: 4,
      scheduleId: 'INT-SCH-001237',
      jobTitle: 'UX/UI Designer',
      company: 'Design Studio Pro',
      companyContact: 'Neha Singh',
      companyPhone: '+91 3210987654',
      companyEmail: 'talent@designstudio.com',
      candidate: 'Kavya Menon',
      candidatePhone: '+91 2109876543',
      candidateEmail: 'kavya.menon@email.com',
      scheduledDate: '2024-11-23',
      scheduledTime: '04:00 PM',
      duration: '60 minutes',
      interviewType: 'In-Person',
      meetingLink: null,
      location: 'Koramangala, Bangalore - Design Studio',
      status: 'Cancelled',
      round: 'Portfolio Review',
      priority: 'Medium',
      salary: '₹5-8 LPA',
      experience: '1-3 years',
      notes: 'Candidate cancelled due to family emergency. Need to reschedule.',
      createdDate: '2024-11-18',
      lastUpdated: '2024-11-22',
      interviewers: ['Neha Singh', 'Creative Director'],
      applicationId: 'APP-001237'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"><Calendar className="w-3 h-3 mr-1" />SCHEDULED</span>;
      case 'Confirmed':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />CONFIRMED</span>;
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
      case 'High':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">HIGH</span>;
      case 'Medium':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">MEDIUM</span>;
      case 'Low':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">LOW</span>;
      default:
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">NORMAL</span>;
    }
  };

  const getInterviewTypeIcon = (type: string) => {
    switch (type) {
      case 'Video Call':
        return <Video className="h-4 w-4 text-primary-500" />;
      case 'In-Person':
        return <MapPin className="h-4 w-4 text-green-500" />;
      case 'Phone':
        return <Phone className="h-4 w-4 text-purple-500" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-primary-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold">Interview Schedules Management</h1>
          <p className="text-purple-100 mt-2">Monitor and manage all job interview appointments and schedules</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Interviews</p>
                <p className="text-2xl font-bold text-gray-900">1,847</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <CalendarDays className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="text-green-500 h-4 w-4 mr-1" />
              <span className="text-green-600 font-medium">+24.2%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Today's Interviews</p>
                <p className="text-2xl font-bold text-gray-900">34</p>
              </div>
              <div className="p-3 bg-primary-50 rounded-full">
                <Calendar className="h-6 w-6 text-primary-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-primary-600 font-medium">28</span>
              <span className="text-gray-500 ml-1">confirmed</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Completed Interviews</p>
                <p className="text-2xl font-bold text-gray-900">1,234</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-green-600 font-medium">66.9%</span>
              <span className="text-gray-500 ml-1">completion rate</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Companies</p>
                <p className="text-2xl font-bold text-gray-900">247</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-full">
                <Building2 className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-orange-600 font-medium">156</span>
              <span className="text-gray-500 ml-1">interviews this week</span>
            </div>
          </div>
        </div>

        {/* Interview Types Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Interview Types Distribution</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-xl font-bold text-primary-600">867</div>
                <div className="text-sm text-gray-600 flex items-center justify-center">
                  <Video className="h-4 w-4 mr-1" />
                  Video Calls
                </div>
                <div className="text-xs text-green-600">47.0%</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">623</div>
                <div className="text-sm text-gray-600 flex items-center justify-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  In-Person
                </div>
                <div className="text-xs text-green-600">33.7%</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-purple-600">267</div>
                <div className="text-sm text-gray-600 flex items-center justify-center">
                  <Phone className="h-4 w-4 mr-1" />
                  Phone Calls
                </div>
                <div className="text-xs text-green-600">14.5%</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-orange-600">90</div>
                <div className="text-sm text-gray-600 flex items-center justify-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Others
                </div>
                <div className="text-xs text-primary-600">4.8%</div>
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
                  placeholder="Search by interview ID, candidate, or company..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-80"
                />
              </div>
              <select className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                <option>All Types</option>
                <option>Video Call</option>
                <option>In-Person</option>
                <option>Phone</option>
              </select>
              <select className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                <option>All Status</option>
                <option>Scheduled</option>
                <option>Confirmed</option>
                <option>In Progress</option>
                <option>Completed</option>
                <option>Cancelled</option>
              </select>
              <select className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
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
              <button className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700">
                <Calendar className="h-4 w-4 mr-2" />
                Calendar View
              </button>
            </div>
          </div>
        </div>

        {/* Interview Schedules Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interview Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job & Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate Info</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interview Setup</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {interviewSchedules.map((interview) => (
                  <tr key={interview.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{interview.scheduleId}</div>
                        <div className="text-sm text-purple-600">{interview.round}</div>
                        <div className="text-xs text-gray-400">Created: {interview.createdDate}</div>
                        <div className="text-xs text-primary-600">App ID: {interview.applicationId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{interview.jobTitle}</div>
                        <div className="text-sm text-primary-600 flex items-center">
                          <Building2 className="h-3 w-3 mr-1" />
                          {interview.company}
                        </div>
                        <div className="text-sm text-gray-500">{interview.companyContact}</div>
                        <div className="text-sm text-green-600 font-medium">{interview.salary}</div>
                        <div className="text-xs text-gray-500">{interview.experience}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{interview.candidate}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {interview.candidatePhone}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {interview.candidateEmail}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {interview.scheduledDate}
                        </div>
                        <div className="text-sm text-primary-600 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {interview.scheduledTime}
                        </div>
                        <div className="text-sm text-gray-500">Duration: {interview.duration}</div>
                        <div className="text-xs text-gray-400">
                          Interviewers: {interview.interviewers.length}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm text-gray-900 flex items-center">
                          {getInterviewTypeIcon(interview.interviewType)}
                          <span className="ml-2">{interview.interviewType}</span>
                        </div>
                        {interview.meetingLink && (
                          <div className="text-xs text-primary-600 break-all">
                            {interview.meetingLink}
                          </div>
                        )}
                        {interview.location && (
                          <div className="text-sm text-gray-500 flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {interview.location}
                          </div>
                        )}
                        {interview.notes && (
                          <div className="text-xs text-purple-600 mt-1">
                            Note: {interview.notes}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-2">
                        {getStatusBadge(interview.status)}
                        {getPriorityBadge(interview.priority)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-purple-600 hover:text-purple-900">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-primary-600 hover:text-primary-900">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <Video className="h-4 w-4" />
                        </button>
                        <button className="text-orange-600 hover:text-orange-900">
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
              Showing <span className="font-medium">1</span> to <span className="font-medium">{interviewSchedules.length}</span> of{' '}
              <span className="font-medium">1,847</span> results
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
    </AdminLayout>
  );
}
