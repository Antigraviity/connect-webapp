'use client';

import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AddRoleSpecificUserModal from '@/components/admin/modals/AddRoleSpecificUserModal';
import ViewUserModal from '@/components/admin/modals/ViewUserModal';
import ConfirmDialog from '@/components/admin/modals/ConfirmDialog';
import {
  Search,
  Download,
  UserPlus,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Star,
  MapPin,
  Phone,
  Calendar,
  Briefcase,
  Users,
  CheckCircle,
  Building,
  DollarSign,
  TrendingUp
} from 'lucide-react';

// Mock employer data
const initialEmployers = [
  {
    id: '1',
    name: 'Tech Solutions Pvt Ltd',
    contactPerson: 'Amit Sharma',
    email: 'amit.sharma@techsolutions.com',
    phone: '+91 9876543210',
    location: 'Bangalore, Karnataka',
    industry: 'Technology',
    companySize: '50-100',
    verified: true,
    active: true,
    joinedDate: '2024-01-10',
    totalJobs: 15,
    activeJobs: 8,
    totalHires: 23,
    pendingApplications: 45,
    totalSpent: 125000,
    avgSalary: 85000,
    website: 'www.techsolutions.com',
    description: 'Leading software development company',
    avatar: 'TS'
  },
  {
    id: '2',
    name: 'Creative Design Studio',
    contactPerson: 'Priya Patel',
    email: 'priya@creativedesign.com',
    phone: '+91 9876543211',
    location: 'Mumbai, Maharashtra',
    industry: 'Design & Creative',
    companySize: '10-50',
    verified: true,
    active: true,
    joinedDate: '2024-02-05',
    totalJobs: 8,
    activeJobs: 5,
    totalHires: 12,
    pendingApplications: 28,
    totalSpent: 76000,
    avgSalary: 65000,
    website: 'www.creativedesign.com',
    description: 'Premium design and branding agency',
    avatar: 'CD'
  },
  {
    id: '3',
    name: 'HealthCare Plus',
    contactPerson: 'Dr. Rajesh Kumar',
    email: 'hr@healthcareplus.com',
    phone: '+91 9876543212',
    location: 'Delhi, India',
    industry: 'Healthcare',
    companySize: '100-500',
    verified: false,
    active: true,
    joinedDate: '2024-01-25',
    totalJobs: 20,
    activeJobs: 12,
    totalHires: 35,
    pendingApplications: 67,
    totalSpent: 245000,
    avgSalary: 95000,
    website: 'www.healthcareplus.com',
    description: 'Multi-specialty healthcare provider',
    avatar: 'HC'
  }
];

export default function EmployersPage() {
  const [employers, setEmployers] = useState(initialEmployers);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [verificationFilter, setVerificationFilter] = useState('All Verification');

  // Modal states
  const [isAddEmployerModalOpen, setIsAddEmployerModalOpen] = useState(false);
  const [isViewEmployerModalOpen, setIsViewEmployerModalOpen] = useState(false);
  const [selectedEmployer, setSelectedEmployer] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean, employer: any }>({
    isOpen: false,
    employer: null
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredEmployers = employers.filter(employer => {
    const matchesSearch = employer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employer.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employer.phone.includes(searchTerm);

    const matchesStatus = statusFilter === 'All Status' ||
      (statusFilter === 'Active' && employer.active) ||
      (statusFilter === 'Inactive' && !employer.active);

    const matchesVerification = verificationFilter === 'All Verification' ||
      (verificationFilter === 'Verified' && employer.verified) ||
      (verificationFilter === 'Unverified' && !employer.verified);

    return matchesSearch && matchesStatus && matchesVerification;
  });

  const handleAddEmployer = (employerData: any) => {
    const newEmployer = {
      ...employerData,
      id: Date.now().toString(),
      totalJobs: 0,
      activeJobs: 0,
      totalHires: 0,
      pendingApplications: 0,
      totalSpent: 0,
      avgSalary: 0,
      avatar: employerData.companyName.substring(0, 2).toUpperCase()
    };
    setEmployers(prev => [...prev, newEmployer]);
    console.log('Employer added successfully:', newEmployer);
  };

  const handleViewEmployer = (employer: any) => {
    setSelectedEmployer(employer);
    setIsViewEmployerModalOpen(true);
  };

  const handleEditEmployer = (employer: any) => {
    console.log('Edit employer:', employer);
    handleViewEmployer(employer);
  };

  const handleDeleteEmployer = async () => {
    if (!deleteConfirm.employer) return;

    setIsDeleting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setEmployers(prev => prev.filter(employer => employer.id !== deleteConfirm.employer.id));
      setDeleteConfirm({ isOpen: false, employer: null });
      console.log('Employer deleted successfully');
    } catch (error) {
      console.error('Error deleting employer:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportEmployers = () => {
    const csvContent = [
      ['Company', 'Contact Person', 'Email', 'Phone', 'Location', 'Industry', 'Jobs', 'Hires', 'Total Spent', 'Status'],
      ...filteredEmployers.map(employer => [
        employer.name, employer.contactPerson, employer.email, employer.phone, employer.location,
        employer.industry, employer.totalJobs.toString(), employer.totalHires.toString(),
        employer.totalSpent.toString(), employer.active ? 'Active' : 'Inactive'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `employers-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleRefreshData = () => {
    console.log('Refreshing employer data...');
  };

  // Calculate statistics
  const stats = {
    totalEmployers: employers.length,
    activeEmployers: employers.filter(e => e.active).length,
    totalJobs: employers.reduce((sum, e) => sum + e.totalJobs, 0),
    totalHires: employers.reduce((sum, e) => sum + e.totalHires, 0),
    totalSpent: employers.reduce((sum, e) => sum + e.totalSpent, 0)
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-admin-600 to-admin-800 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Employer Management</h1>
              <p className="text-admin-100 mt-2">Manage companies and hiring organizations</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-admin-200">Total Employers</div>
              <div className="text-3xl font-bold">{stats.totalEmployers}</div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-admin-50 rounded-full">
                <Building className="h-6 w-6 text-admin-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Employers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEmployers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-admin-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-admin-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active</p>
                <p className="text-2xl font-bold text-admin-900">{stats.activeEmployers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-admin-50 rounded-full">
                <Briefcase className="h-6 w-6 text-admin-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Jobs</p>
                <p className="text-2xl font-bold text-admin-900">{stats.totalJobs}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-admin-200 rounded-full">
                <Users className="h-6 w-6 text-admin-800" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Hires</p>
                <p className="text-2xl font-bold text-admin-900">{stats.totalHires}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-amber-50 rounded-full">
                <DollarSign className="h-6 w-6 text-amber-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Spent</p>
                <p className="text-2xl font-bold text-admin-900">₹{stats.totalSpent.toLocaleString()}</p>
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
                  placeholder="Search by company, contact, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-500 focus:border-transparent w-64"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-admin-500"
              >
                <option>All Status</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>

              <select
                value={verificationFilter}
                onChange={(e) => setVerificationFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-admin-500"
              >
                <option>All Verification</option>
                <option>Verified</option>
                <option>Unverified</option>
              </select>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefreshData}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
              <button
                onClick={handleExportEmployers}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Employers
              </button>
              <button
                onClick={() => setIsAddEmployerModalOpen(true)}
                className="inline-flex items-center px-4 py-2 bg-admin-600 text-white text-sm font-medium rounded-md hover:bg-admin-700"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Employer
              </button>
            </div>
          </div>
        </div>

        {/* Employers Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">All Employers ({filteredEmployers.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Info</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Stats</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hiring Stats</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company Info</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmployers.map((employer) => (
                  <tr key={employer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-admin-600 to-admin-800 flex items-center justify-center text-white font-semibold mr-4">
                          {employer.avatar}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 flex items-center">
                            {employer.name}
                            {employer.verified && <CheckCircle className="h-4 w-4 text-green-500 ml-2" />}
                          </div>
                          <div className="text-sm text-gray-500">{employer.contactPerson}</div>
                          <div className="text-xs text-gray-400">Joined: {new Date(employer.joinedDate).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">{employer.email}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {employer.phone}
                        </div>
                        <div className="text-xs text-gray-400 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {employer.location}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{employer.totalJobs} total jobs</div>
                        <div className="text-sm text-admin-600">{employer.activeJobs} active</div>
                        <div className="text-sm text-admin-700">{employer.pendingApplications} applications</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{employer.totalHires} hires</div>
                        <div className="text-sm text-gray-500">₹{employer.totalSpent.toLocaleString()} spent</div>
                        <div className="text-xs text-gray-400">Avg: ₹{employer.avgSalary.toLocaleString()}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{employer.industry}</div>
                        <div className="text-sm text-gray-500">{employer.companySize} employees</div>
                        <div className="text-xs text-admin-600">{employer.website}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${employer.active ? 'bg-admin-600 text-white' : 'bg-red-50 text-red-700'
                        }`}>
                        {employer.active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewEmployer(employer)}
                          className="text-admin-600 hover:text-admin-800 p-1 rounded hover:bg-admin-50"
                          title="View Employer"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditEmployer(employer)}
                          className="text-admin-600 hover:text-admin-800 p-1 rounded hover:bg-admin-50"
                          title="Edit Employer"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ isOpen: true, employer })}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          title="Delete Employer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-white px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredEmployers.length}</span> of{' '}
                <span className="font-medium">{filteredEmployers.length}</span> results
              </div>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  Previous
                </button>
                <button className="px-3 py-2 bg-admin-600 text-white rounded-md text-sm font-medium hover:bg-admin-700">
                  1
                </button>
                <button className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddRoleSpecificUserModal
        isOpen={isAddEmployerModalOpen}
        onClose={() => setIsAddEmployerModalOpen(false)}
        onSave={handleAddEmployer}
        userType="EMPLOYER"
      />

      <ViewUserModal
        isOpen={isViewEmployerModalOpen}
        onClose={() => setIsViewEmployerModalOpen(false)}
        user={selectedEmployer}
        onEdit={handleEditEmployer}
      />

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, employer: null })}
        onConfirm={handleDeleteEmployer}
        title="Delete Employer"
        message={`Are you sure you want to delete ${deleteConfirm.employer?.name}? This action cannot be undone and will affect all associated job postings and applications.`}
        confirmText="Delete"
        type="danger"
        isLoading={isDeleting}
      />
    </AdminLayout>
  );
}
