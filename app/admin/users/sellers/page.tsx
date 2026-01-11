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
  Package,
  Users,
  CheckCircle,
  Briefcase,
  DollarSign,
  TrendingUp
} from 'lucide-react';

// Mock seller data
const initialSellers = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+91 9876543210',
    location: 'Bangalore, Karnataka',
    businessType: 'Freelancer',
    verified: true,
    active: true,
    joinedDate: '2024-01-20',
    totalServices: 8,
    activeServices: 6,
    totalBookings: 45,
    completedBookings: 42,
    totalEarnings: 85000,
    avgRating: 4.8,
    wallet: 12000,
    lastActivity: '2024-02-25',
    skills: ['Home Cleaning', 'Deep Cleaning', 'Office Cleaning'],
    avatar: 'SJ'
  },
  {
    id: '2',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@email.com',
    phone: '+91 9876543211',
    location: 'Mumbai, Maharashtra',
    businessType: 'Agency',
    verified: true,
    active: true,
    joinedDate: '2024-01-15',
    totalServices: 12,
    activeServices: 10,
    totalBookings: 78,
    completedBookings: 75,
    totalEarnings: 156000,
    avgRating: 4.6,
    wallet: 8500,
    lastActivity: '2024-02-24',
    skills: ['Plumbing', 'Electrical Work', 'AC Repair'],
    avatar: 'RK'
  },
  {
    id: '3',
    name: 'Priya Mehta',
    email: 'priya.mehta@email.com',
    phone: '+91 9876543212',
    location: 'Delhi, India',
    businessType: 'Consultant',
    verified: false,
    active: true,
    joinedDate: '2024-02-01',
    totalServices: 5,
    activeServices: 4,
    totalBookings: 23,
    completedBookings: 20,
    totalEarnings: 45000,
    avgRating: 4.9,
    wallet: 3200,
    lastActivity: '2024-02-23',
    skills: ['Beauty & Spa', 'Massage Therapy', 'Hair Styling'],
    avatar: 'PM'
  }
];

export default function SellersPage() {
  const [sellers, setSellers] = useState(initialSellers);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [verificationFilter, setVerificationFilter] = useState('All Verification');

  // Modal states
  const [isAddSellerModalOpen, setIsAddSellerModalOpen] = useState(false);
  const [isViewSellerModalOpen, setIsViewSellerModalOpen] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean, seller: any }>({
    isOpen: false,
    seller: null
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredSellers = sellers.filter(seller => {
    const matchesSearch = seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.phone.includes(searchTerm);

    const matchesStatus = statusFilter === 'All Status' ||
      (statusFilter === 'Active' && seller.active) ||
      (statusFilter === 'Inactive' && !seller.active);

    const matchesVerification = verificationFilter === 'All Verification' ||
      (verificationFilter === 'Verified' && seller.verified) ||
      (verificationFilter === 'Unverified' && !seller.verified);

    return matchesSearch && matchesStatus && matchesVerification;
  });

  const handleAddSeller = (sellerData: any) => {
    const newSeller = {
      ...sellerData,
      id: Date.now().toString(),
      totalServices: 0,
      activeServices: 0,
      totalBookings: 0,
      completedBookings: 0,
      totalEarnings: 0,
      avgRating: 0,
      wallet: 0,
      lastActivity: new Date().toISOString().split('T')[0],
      avatar: sellerData.name.substring(0, 2).toUpperCase()
    };
    setSellers(prev => [...prev, newSeller]);
    console.log('Seller added successfully:', newSeller);
  };

  const handleViewSeller = (seller: any) => {
    setSelectedSeller(seller);
    setIsViewSellerModalOpen(true);
  };

  const handleEditSeller = (seller: any) => {
    console.log('Edit seller:', seller);
    handleViewSeller(seller);
  };

  const handleDeleteSeller = async () => {
    if (!deleteConfirm.seller) return;

    setIsDeleting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSellers(prev => prev.filter(seller => seller.id !== deleteConfirm.seller.id));
      setDeleteConfirm({ isOpen: false, seller: null });
      console.log('Seller deleted successfully');
    } catch (error) {
      console.error('Error deleting seller:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportSellers = () => {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Location', 'Business Type', 'Services', 'Bookings', 'Earnings', 'Rating', 'Status'],
      ...filteredSellers.map(seller => [
        seller.name, seller.email, seller.phone, seller.location, seller.businessType,
        seller.totalServices.toString(), seller.totalBookings.toString(),
        seller.totalEarnings.toString(), seller.avgRating.toString(),
        seller.active ? 'Active' : 'Inactive'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sellers-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleRefreshData = () => {
    console.log('Refreshing seller data...');
  };

  // Calculate statistics
  const stats = {
    totalSellers: sellers.length,
    activeSellers: sellers.filter(s => s.active).length,
    totalServices: sellers.reduce((sum, s) => sum + s.totalServices, 0),
    totalEarnings: sellers.reduce((sum, s) => sum + s.totalEarnings, 0),
    avgRating: sellers.length > 0 ? (sellers.reduce((sum, s) => sum + s.avgRating, 0) / sellers.length) : 0
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Seller Management</h1>
              <p className="text-primary-100 mt-2">Manage service providers and vendors</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-primary-200">Total Sellers</div>
              <div className="text-3xl font-bold">{stats.totalSellers}</div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-primary-50 rounded-full">
                <Users className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Sellers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSellers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active</p>
                <p className="text-2xl font-bold text-primary-900">{stats.activeSellers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-primary-50 rounded-full">
                <Package className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Services</p>
                <p className="text-2xl font-bold text-primary-900">{stats.totalServices}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-primary-200 rounded-full">
                <DollarSign className="h-6 w-6 text-primary-800" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Earnings</p>
                <p className="text-2xl font-bold text-primary-900">₹{stats.totalEarnings.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-primary-50 rounded-full">
                <Star className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg Rating</p>
                <p className="text-2xl font-bold text-primary-900">{stats.avgRating.toFixed(1)}</p>
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
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-64"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option>All Status</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>

              <select
                value={verificationFilter}
                onChange={(e) => setVerificationFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                onClick={handleExportSellers}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Sellers
              </button>
              <button
                onClick={() => setIsAddSellerModalOpen(true)}
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Seller
              </button>
            </div>
          </div>
        </div>

        {/* Sellers Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">All Sellers ({filteredSellers.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business Info</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Services & Bookings</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Earnings & Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skills</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSellers.map((seller) => (
                  <tr key={seller.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-primary-600 to-primary-800 flex items-center justify-center text-white font-semibold mr-4">
                          {seller.avatar}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 flex items-center">
                            {seller.name}
                            {seller.verified && <CheckCircle className="h-4 w-4 text-green-500 ml-2" />}
                          </div>
                          <div className="text-sm text-gray-500">{seller.email}</div>
                          <div className="text-xs text-gray-400 flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {seller.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{seller.businessType}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {seller.location}
                        </div>
                        <div className="text-xs text-gray-400">Joined: {new Date(seller.joinedDate).toLocaleDateString()}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{seller.totalServices} services</div>
                        <div className="text-sm text-primary-600">{seller.activeServices} active</div>
                        <div className="text-sm text-primary-700">{seller.totalBookings} bookings</div>
                        <div className="text-xs text-gray-400">{seller.completedBookings} completed</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">₹{seller.totalEarnings.toLocaleString()}</div>
                        <div className="flex items-center">
                          <Star className="h-3 w-3 text-yellow-400 mr-1" />
                          <span className="text-sm text-slate-600">{seller.avgRating}/5</span>
                        </div>
                        <div className="text-xs text-gray-400">Wallet: ₹{seller.wallet}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs">
                        {seller.skills?.slice(0, 2).map((skill, index) => (
                          <span key={index} className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded-full mr-1 mb-1">
                            {skill}
                          </span>
                        ))}
                        {seller.skills?.length > 2 && (
                          <span className="text-gray-500">+{seller.skills.length - 2} more</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${seller.active ? 'bg-primary-600 text-white' : 'bg-red-50 text-red-700'
                        }`}>
                        {seller.active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewSeller(seller)}
                          className="text-primary-600 hover:text-primary-800 p-1 rounded hover:bg-primary-50"
                          title="View Seller"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditSeller(seller)}
                          className="text-primary-600 hover:text-primary-800 p-1 rounded hover:bg-primary-50"
                          title="Edit Seller"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ isOpen: true, seller })}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          title="Delete Seller"
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
                Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredSellers.length}</span> of{' '}
                <span className="font-medium">{filteredSellers.length}</span> results
              </div>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50" disabled>
                  Previous
                </button>
                <button className="px-3 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">
                  1
                </button>
                {filteredSellers.length > 10 && (
                  <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    2
                  </button>
                )}
                {filteredSellers.length > 20 && (
                  <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    3
                  </button>
                )}
                <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50" disabled={filteredSellers.length <= 10}>
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddRoleSpecificUserModal
        isOpen={isAddSellerModalOpen}
        onClose={() => setIsAddSellerModalOpen(false)}
        onSave={handleAddSeller}
        userType="SELLER"
      />

      <ViewUserModal
        isOpen={isViewSellerModalOpen}
        onClose={() => setIsViewSellerModalOpen(false)}
        user={selectedSeller}
        onEdit={handleEditSeller}
      />

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, seller: null })}
        onConfirm={handleDeleteSeller}
        title="Delete Seller"
        message={`Are you sure you want to delete ${deleteConfirm.seller?.name}? This action cannot be undone and will affect all associated services and bookings.`}
        confirmText="Delete"
        type="danger"
        isLoading={isDeleting}
      />
    </AdminLayout>
  );
}
