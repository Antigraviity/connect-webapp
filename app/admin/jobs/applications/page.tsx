'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Download,
  Eye,
  Edit3,
  MoreHorizontal,
  BriefcaseIcon,
  User,
  Calendar,
  MapPin,
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  Mail,
  Phone,
  GraduationCap,
  DollarSign
} from 'lucide-react';
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function JobApplicationsPage() {
  const [loading, setLoading] = useState(true);
  const [liveStats, setLiveStats] = useState({
    totalApplications: 0,
    todayApplications: 0,
    interviewsScheduled: 0,
    successRate: '0%'
  });
  const [statusBreakdown, setStatusBreakdown] = useState({
    applied: 0,
    underReview: 0,
    interviewScheduled: 0,
    selected: 0,
    rejected: 0,
    withdrawn: 0
  });
  const [applications, setApplications] = useState<any[]>([]);

  // Fetch live applications data
  useEffect(() => {
    const fetchApplicationsData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/jobs/applications');
        const data = await response.json();

        console.log('✅ Applications API Response:', data);

        if (data.success) {
          setLiveStats(data.stats);
          setStatusBreakdown(data.statusBreakdown);
          setApplications(data.applications || []);
        }
      } catch (error) {
        console.error('❌ Error fetching applications:', error);
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationsData();
  }, []);

  const mockApplications = [
    {
      id: 1,
      applicationRef: 'JA001247',
      jobTitle: 'Senior React Developer',
      company: 'Tech Solutions Inc.',
      applicantName: 'Rohit Sharma',
      applicantEmail: 'rohit.s@email.com',
      applicantPhone: '+91 9876543210',
      experience: '5 years',
      education: 'B.Tech Computer Science',
      expectedSalary: '₹12,00,000',
      currentSalary: '₹9,00,000',
      location: 'Mumbai, Maharashtra',
      appliedDate: '2024-11-20',
      status: 'Interview Scheduled',
      interviewDate: '2024-11-25',
      resumeUrl: '/resumes/rohit-sharma.pdf',
      skills: ['React', 'Node.js', 'MongoDB', 'JavaScript'],
      coverLetter: 'I am excited to apply for this position...'
    },
    {
      id: 2,
      applicationRef: 'JA001248',
      jobTitle: 'Digital Marketing Manager',
      company: 'Global Marketing Co.',
      applicantName: 'Priya Patel',
      applicantEmail: 'priya.p@email.com',
      applicantPhone: '+91 8765432109',
      experience: '7 years',
      education: 'MBA Marketing',
      expectedSalary: '₹15,00,000',
      currentSalary: '₹12,00,000',
      location: 'Delhi, Delhi',
      appliedDate: '2024-11-18',
      status: 'Under Review',
      interviewDate: null,
      resumeUrl: '/resumes/priya-patel.pdf',
      skills: ['Digital Marketing', 'SEO', 'SEM', 'Analytics'],
      coverLetter: 'With 7 years of experience in digital marketing...'
    },
    {
      id: 3,
      applicationRef: 'JA001249',
      jobTitle: 'Data Scientist',
      company: 'Analytics Pro Ltd.',
      applicantName: 'Amit Kumar',
      applicantEmail: 'amit.k@email.com',
      applicantPhone: '+91 7654321098',
      experience: '4 years',
      education: 'M.Tech Data Science',
      expectedSalary: '₹18,00,000',
      currentSalary: '₹14,00,000',
      location: 'Bangalore, Karnataka',
      appliedDate: '2024-11-22',
      status: 'Selected',
      interviewDate: '2024-11-24',
      resumeUrl: '/resumes/amit-kumar.pdf',
      skills: ['Python', 'Machine Learning', 'SQL', 'TensorFlow'],
      coverLetter: 'I am passionate about data science...'
    },
    {
      id: 4,
      applicationRef: 'JA001250',
      jobTitle: 'Product Manager',
      company: 'Innovation Hub',
      applicantName: 'Neha Singh',
      applicantEmail: 'neha.s@email.com',
      applicantPhone: '+91 6543210987',
      experience: '6 years',
      education: 'MBA Product Management',
      expectedSalary: '₹20,00,000',
      currentSalary: '₹16,00,000',
      location: 'Chennai, Tamil Nadu',
      appliedDate: '2024-11-19',
      status: 'Rejected',
      interviewDate: null,
      resumeUrl: '/resumes/neha-singh.pdf',
      skills: ['Product Strategy', 'Agile', 'User Research', 'Analytics'],
      coverLetter: 'I have extensive experience in product management...'
    }
  ];

  // Use live data if available, otherwise show empty message
  const displayApplications = applications.length > 0 ? applications : mockApplications.slice(0, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Applied':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-admin-50 text-admin-700"><FileText className="w-3 h-3 mr-1" />Applied</span>;
      case 'Under Review':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700"><Clock className="w-3 h-3 mr-1" />Under Review</span>;
      case 'Interview Scheduled':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-admin-100 text-admin-800"><Calendar className="w-3 h-3 mr-1" />Interview Scheduled</span>;
      case 'Selected':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Selected</span>;
      case 'Rejected':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</span>;
      case 'Withdrawn':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"><AlertCircle className="w-3 h-3 mr-1" />Withdrawn</span>;
      default:
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Unknown</span>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 flex flex-col items-center">
            <LoadingSpinner size="lg" color="admin" />
            <p className="text-gray-700 font-medium">Loading applications...</p>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900">Job Applications Management</h1>
        <p className="text-gray-600 mt-1">Track and manage all job applications and candidate interactions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900">{liveStats.totalApplications.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-admin-50 rounded-full">
              <FileText className="h-6 w-6 text-admin-600" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm">
            <span className="text-green-600 font-medium">+23.1%</span>
            <span className="text-gray-500 ml-1">from last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Today's Applications</p>
              <p className="text-2xl font-bold text-gray-900">{liveStats.todayApplications}</p>
            </div>
            <div className="p-3 bg-admin-50 rounded-full">
              <Clock className="h-6 w-6 text-admin-600" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm">
            <span className="text-green-600 font-medium">+18.5%</span>
            <span className="text-gray-500 ml-1">from yesterday</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Interviews Scheduled</p>
              <p className="text-2xl font-bold text-gray-900">{liveStats.interviewsScheduled}</p>
            </div>
            <div className="p-3 bg-admin-50 rounded-full">
              <Calendar className="h-6 w-6 text-admin-600" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm">
            <span className="text-green-600 font-medium">+15.2%</span>
            <span className="text-gray-500 ml-1">from last week</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">{liveStats.successRate}</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-full">
              <CheckCircle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm">
            <span className="text-green-600 font-medium">+2.1%</span>
            <span className="text-gray-500 ml-1">from last month</span>
          </div>
        </div>
      </div>

      {/* Application Status Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Application Status Overview</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-admin-600">{statusBreakdown.applied.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Applied</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">{statusBreakdown.underReview.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Under Review</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-admin-600">{statusBreakdown.interviewScheduled.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Interview Scheduled</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{statusBreakdown.selected.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Selected</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{statusBreakdown.rejected.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Rejected</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{statusBreakdown.withdrawn.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Withdrawn</div>
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
                placeholder="Search applications..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-500 focus:border-transparent w-64"
              />
            </div>
            <select className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-admin-500 focus:border-transparent">
              <option>All Status</option>
              <option>Applied</option>
              <option>Under Review</option>
              <option>Interview Scheduled</option>
              <option>Selected</option>
              <option>Rejected</option>
            </select>
            <select className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-admin-500 focus:border-transparent">
              <option>All Companies</option>
              <option>Tech Solutions Inc.</option>
              <option>Global Marketing Co.</option>
              <option>Analytics Pro Ltd.</option>
            </select>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">All Applications ({applications.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience & Education</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salary</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayApplications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No applications found</h3>
                    <p className="mt-1 text-sm text-gray-500">Applications will appear here when candidates apply for jobs.</p>
                  </td>
                </tr>
              ) : (
                displayApplications.map((application) => (
                  <tr key={application.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-admin-400 to-admin-500 flex items-center justify-center text-white font-semibold">
                          {application.applicantName.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{application.applicantName}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {application.applicantEmail}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {application.applicantPhone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{application.jobTitle}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Building2 className="h-3 w-3 mr-1" />
                          {application.company}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {application.location}
                        </div>
                        <div className="text-xs text-gray-400">Applied: {application.appliedDate}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">{application.experience} Experience</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <GraduationCap className="h-3 w-3 mr-1" />
                          {application.education}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {application.skills.slice(0, 3).map((skill: string) => (
                            <span key={skill} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              {skill}
                            </span>
                          ))}
                          {application.skills.length > 3 && (
                            <span className="text-xs text-gray-400">+{application.skills.length - 3} more</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">Expected: {application.expectedSalary}</div>
                        <div className="text-sm text-gray-500">Current: {application.currentSalary}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {getStatusBadge(application.status)}
                        {application.interviewDate && (
                          <div className="text-xs text-gray-500">
                            Interview: {application.interviewDate}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-admin-600 hover:text-admin-800">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-admin-600 hover:text-admin-800">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button className="text-admin-600 hover:text-admin-800">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="bg-white px-6 py-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of{' '}
            <span className="font-medium">4,892</span> results
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              Previous
            </button>
            <button className="px-3 py-2 bg-admin-600 text-white rounded-md text-sm font-medium hover:bg-admin-700">
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
