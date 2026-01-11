'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
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
  DollarSign,
  X,
  ExternalLink,
  Linkedin
} from 'lucide-react';
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { toast } from 'react-hot-toast';

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
  const searchParams = useSearchParams();
  const jobId = searchParams.get('jobId');

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [companyFilter, setCompanyFilter] = useState('All Companies');
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  // Expanded filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('All Experience');
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');

  // Modal states
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Fetch live applications data
  const fetchApplicationsData = async () => {
    try {
      setLoading(true);
      const url = new URL(window.location.origin + '/api/admin/jobs/applications');
      if (jobId) url.searchParams.append('jobId', jobId);
      if (statusFilter !== 'All Status') url.searchParams.append('status', statusFilter);
      if (companyFilter !== 'All Companies') url.searchParams.append('company', companyFilter);

      const response = await fetch(url.toString());
      const data = await response.json();

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

  useEffect(() => {
    fetchApplicationsData();
  }, [jobId, statusFilter, companyFilter]);

  // Filtering logic (client-side for additional filters)
  const sortedApplications = [...applications].sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime());

  const filteredApplications = sortedApplications.filter(app => {
    // Search query check
    const matchesSearch = !searchQuery ||
      app.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.applicationRef?.toLowerCase().includes(searchQuery.toLowerCase());

    // Experience check
    const matchesExperience = experienceFilter === 'All Experience' || app.experience?.includes(experienceFilter);

    // Date check
    const appDate = new Date(app.appliedDate);
    const matchesStartDate = !startDate || appDate >= new Date(startDate);
    const matchesEndDate = !endDate || appDate <= new Date(endDate);

    // Salary check
    const appSalary = parseInt(app.expectedSalary?.replace(/[^0-9]/g, '') || '0');
    const matchesMinSalary = !minSalary || appSalary >= parseInt(minSalary);
    const matchesMaxSalary = !maxSalary || appSalary <= parseInt(maxSalary);

    return matchesSearch && matchesExperience && matchesStartDate && matchesEndDate && matchesMinSalary && matchesMaxSalary;
  });

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
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedApplication) return;
    try {
      setUpdatingStatus(true);
      const apiStatus = mapUIToAPIStatus(newStatus);
      const response = await fetch('/api/jobs/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: selectedApplication.id,
          status: apiStatus
        })
      });
      const data = await response.json();
      if (data.success) {
        toast.success(`Status updated to ${newStatus}`);
        fetchApplicationsData();
        setShowStatusModal(false);
      } else {
        toast.error(data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Internal server error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const mapUIToAPIStatus = (uiStatus: string) => {
    switch (uiStatus) {
      case 'Applied': return 'PENDING';
      case 'Under Review': return 'REVIEWING';
      case 'Interview Scheduled': return 'INTERVIEW';
      case 'Selected': return 'HIRED';
      case 'Rejected': return 'REJECTED';
      case 'Withdrawn': return 'WITHDRAWN';
      default: return 'PENDING';
    }
  };

  const handleExportApplications = () => {
    const csvContent = [
      ['Ref ID', 'Applicant', 'Email', 'Phone', 'Job Title', 'Company', 'Experience', 'Education', 'Salary', 'Location', 'Status', 'Applied Date'],
      ...filteredApplications.map(app => [
        app.applicationRef || 'N/A',
        app.applicantName,
        app.applicantEmail,
        app.applicantPhone,
        app.jobTitle,
        app.company,
        app.experience,
        app.education,
        app.expectedSalary,
        app.location,
        app.status,
        app.appliedDate
      ])
    ].map(row => row.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `job-applications-export-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[150]">
          <div className="flex flex-col items-center gap-3">
            <LoadingSpinner size="lg" color="white" />
            <p className="text-white font-medium">Loading applications...</p>
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
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search applications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-500 focus:border-transparent w-64"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-admin-500 focus:border-transparent"
              >
                <option>All Status</option>
                <option>Applied</option>
                <option>Under Review</option>
                <option>Interview Scheduled</option>
                <option>Selected</option>
                <option>Rejected</option>
                <option>Withdrawn</option>
              </select>
              <select
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-admin-500 focus:border-transparent"
              >
                <option>All Companies</option>
                {Array.from(new Set(applications.map(app => app.company))).map(company => (
                  <option key={company} value={company}>{company}</option>
                ))}
              </select>
              <button
                onClick={() => setShowMoreFilters(!showMoreFilters)}
                className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium transition-colors ${showMoreFilters ? 'bg-admin-50 border-admin-500 text-admin-700' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                  }`}
              >
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleExportApplications}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>

          {showMoreFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-md border border-gray-100 animate-in fade-in slide-in-from-top-2">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Date Applied (From)</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-admin-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Date Applied (To)</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-admin-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Experience Level</label>
                <select
                  value={experienceFilter}
                  onChange={(e) => setExperienceFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-admin-500 outline-none"
                >
                  <option>All Experience</option>
                  <option>Fresher</option>
                  <option>1-3 years</option>
                  <option>3-5 years</option>
                  <option>5-8 years</option>
                  <option>8+ years</option>
                </select>
              </div>
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Exp. Salary Range</label>
                  <div className="flex items-center space-x-1">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minSalary}
                      onChange={(e) => setMinSalary(e.target.value)}
                      className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-admin-500 outline-none"
                    />
                    <span className="text-gray-400">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxSalary}
                      onChange={(e) => setMaxSalary(e.target.value)}
                      className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-admin-500 outline-none"
                    />
                  </div>
                </div>
              </div>
              <div className="lg:col-span-4 flex justify-end">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('All Status');
                    setCompanyFilter('All Companies');
                    setStartDate('');
                    setEndDate('');
                    setExperienceFilter('All Experience');
                    setMinSalary('');
                    setMaxSalary('');
                  }}
                  className="text-sm text-gray-500 hover:text-admin-600 font-medium transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">All Applications ({filteredApplications.length})</h3>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No applications found</h3>
                    <p className="mt-1 text-sm text-gray-500">Applications will appear here when candidates apply for jobs.</p>
                  </td>
                </tr>
              ) : (
                filteredApplications.map((application) => (
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
                        <div className="text-sm text-gray-900">{application.experience}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <GraduationCap className="h-3 w-3 mr-1" />
                          {application.education}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {application.skills?.slice(0, 3).map((skill: string) => (
                            <span key={skill} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              {skill}
                            </span>
                          ))}
                          {application.skills?.length > 3 && (
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
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            setSelectedApplication(application);
                            setShowViewModal(true);
                          }}
                          className="p-2 text-admin-600 hover:bg-admin-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedApplication(application);
                            setShowStatusModal(true);
                          }}
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Update Status"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg transition-colors">
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

      {/* View Details Modal */}
      {showViewModal && selectedApplication && (
        <div className="fixed inset-0 z-[200] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowViewModal(false)} />
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Application Details</h3>
                <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="px-6 py-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Candidate Profile */}
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 rounded-lg bg-gradient-to-r from-admin-400 to-admin-500 flex items-center justify-center text-white text-2xl font-bold">
                    {selectedApplication.applicantName.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-gray-900">{selectedApplication.applicantName}</h4>
                    <p className="text-sm text-gray-600">{selectedApplication.jobTitle} @ {selectedApplication.company}</p>
                    <div className="flex flex-wrap gap-4 mt-2">
                      <div className="flex items-center text-sm text-gray-500">
                        <Mail className="h-4 w-4 mr-1.5 text-admin-500" />
                        {selectedApplication.applicantEmail}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Phone className="h-4 w-4 mr-1.5 text-admin-500" />
                        {selectedApplication.applicantPhone}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-1.5 text-admin-500" />
                        {selectedApplication.location}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Stats */}
                  <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Experience</span>
                      <span className="font-semibold text-gray-900">{selectedApplication.experience}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Education</span>
                      <span className="font-semibold text-gray-900">{selectedApplication.education}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Expected Salary</span>
                      <span className="font-semibold text-gray-900">{selectedApplication.expectedSalary}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Applied Date</span>
                      <span className="font-semibold text-gray-900">{selectedApplication.appliedDate}</span>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h5 className="text-sm font-semibold text-gray-900 mb-3">Key Skills</h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedApplication.skills?.map((skill: string) => (
                        <span key={skill} className="px-2 py-1 bg-white border border-gray-200 rounded text-xs font-medium text-gray-700">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Cover Letter */}
                {selectedApplication.coverLetter && (
                  <div>
                    <h5 className="text-sm font-semibold text-gray-900 mb-2">Cover Letter Snippet</h5>
                    <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-600 italic">
                      "{selectedApplication.coverLetter.substring(0, 300)}..."
                    </div>
                  </div>
                )}

                {/* Links */}
                <div className="flex gap-3">
                  {selectedApplication.resumeUrl && (
                    <a
                      href={selectedApplication.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-admin-600 text-white rounded-lg hover:bg-admin-700 transition-colors font-medium text-sm"
                    >
                      <FileText className="h-4 w-4" />
                      View Full Resume
                    </a>
                  )}
                  <button className="flex items-center justify-center p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                    <Linkedin className="h-5 w-5" />
                  </button>
                  <button className="flex items-center justify-center p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                    <Mail className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4 flex justify-end">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {showStatusModal && selectedApplication && (
        <div className="fixed inset-0 z-[200] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowStatusModal(false)} />
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
              <div className="bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Update Status</h3>
                <button onClick={() => setShowStatusModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-600 mb-4">
                  Update application status for <span className="font-semibold text-gray-900">{selectedApplication.applicantName}</span>
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {['Applied', 'Under Review', 'Interview Scheduled', 'Selected', 'Rejected', 'Withdrawn'].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleUpdateStatus(status)}
                      disabled={updatingStatus}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all text-left ${selectedApplication.status === status
                        ? 'border-admin-500 bg-admin-50 ring-1 ring-admin-500'
                        : 'border-gray-200 hover:border-admin-200 hover:bg-gray-50'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        {getStatusBadge(status)}
                      </div>
                      {selectedApplication.status === status && <CheckCircle className="h-5 w-5 text-admin-600" />}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                  disabled={updatingStatus}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
