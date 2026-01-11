'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AddRoleSpecificUserModal from '@/components/admin/modals/AddRoleSpecificUserModal';
import ViewUserModal from '@/components/admin/modals/ViewUserModal';
import ConfirmDialog from '@/components/admin/modals/ConfirmDialog';
import LoadingSpinner from "@/components/common/LoadingSpinner";
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
  CreditCard,
  Users,
  CheckCircle,
  ShoppingCart,
  DollarSign,
  TrendingUp
} from 'lucide-react';

// Role specific users page logic

export default function BuyersPage() {
  const [buyers, setBuyers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [verificationFilter, setVerificationFilter] = useState('All Verification');

  const [loading, setLoading] = useState(true);
  // Modal states
  const [isAddBuyerModalOpen, setIsAddBuyerModalOpen] = useState(false);
  const [isViewBuyerModalOpen, setIsViewBuyerModalOpen] = useState(false);
  const [selectedBuyer, setSelectedBuyer] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean, buyer: any }>({
    isOpen: false,
    buyer: null
  });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchBuyers();
  }, []);

  const fetchBuyers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users?role=BUYER');
      const data = await response.json();
      if (data.success) {
        // Map API users to dashboard format
        const mappedBuyers = data.users.map((user: any) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone || 'N/A',
          location: user.city && user.state ? `${user.city}, ${user.state}` : 'Not Specified',
          verified: user.verified || false,
          active: user.active ?? true,
          joinedDate: user.createdAt,
          totalBookings: 0, // Need bookings API for real data
          completedBookings: 0,
          cancelledBookings: 0,
          totalSpent: 0,
          avgSpent: 0,
          rating: 4.5, // Mock for now
          wallet: 0,
          lastActivity: user.updatedAt,
          lastService: 'None',
          paymentMethod: 'Not Set',
          favorites: 0,
          avatar: user.name.substring(0, 2).toUpperCase()
        }));
        setBuyers(mappedBuyers);
      }
    } catch (error) {
      console.error('Error fetching buyers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBuyers = buyers.filter(buyer => {
    const matchesSearch = buyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      buyer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      buyer.phone.includes(searchTerm);

    const matchesStatus = statusFilter === 'All Status' ||
      (statusFilter === 'Active' && buyer.active) ||
      (statusFilter === 'Inactive' && !buyer.active);

    const matchesVerification = verificationFilter === 'All Verification' ||
      (verificationFilter === 'Verified' && buyer.verified) ||
      (verificationFilter === 'Unverified' && !buyer.verified);

    return matchesSearch && matchesStatus && matchesVerification;
  });

  const handleAddBuyer = (buyerData: any) => {
    const newBuyer = {
      ...buyerData,
      id: Date.now().toString(),
      totalBookings: 0,
      completedBookings: 0,
      cancelledBookings: 0,
      totalSpent: 0,
      avgSpent: 0,
      rating: 0,
      wallet: 0,
      lastActivity: new Date().toISOString().split('T')[0],
      lastService: 'None',
      paymentMethod: 'Not Set',
      favorites: 0,
      avatar: buyerData.name.substring(0, 2).toUpperCase()
    };
    setBuyers(prev => [...prev, newBuyer]);
    console.log('Buyer added successfully:', newBuyer);
  };

  const handleViewBuyer = (buyer: any) => {
    setSelectedBuyer(buyer);
    setIsViewBuyerModalOpen(true);
  };

  const handleEditBuyer = (buyer: any) => {
    console.log('Edit buyer:', buyer);
    handleViewBuyer(buyer);
  };

  const handleDeleteBuyer = async () => {
    if (!deleteConfirm.buyer) return;

    setIsDeleting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setBuyers(prev => prev.filter(buyer => buyer.id !== deleteConfirm.buyer.id));
      setDeleteConfirm({ isOpen: false, buyer: null });
      console.log('Buyer deleted successfully');
    } catch (error) {
      console.error('Error deleting buyer:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportBuyers = () => {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Location', 'Total Bookings', 'Total Spent', 'Rating', 'Status', 'Verified', 'Joined Date'],
      ...filteredBuyers.map(buyer => [
        buyer.name, buyer.email, buyer.phone, buyer.location,
        buyer.totalBookings.toString(), buyer.totalSpent.toString(),
        buyer.rating.toString(), buyer.active ? 'Active' : 'Inactive',
        buyer.verified ? 'Yes' : 'No', new Date(buyer.joinedDate).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `buyers-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleRefreshData = () => {
    fetchBuyers();
  };

  // Calculate statistics
  const stats = {
    totalBuyers: buyers.length,
    activeBuyers: buyers.filter(b => b.active).length,
    totalBookings: buyers.reduce((sum, b) => sum + b.totalBookings, 0),
    totalRevenue: buyers.reduce((sum, b) => sum + b.totalSpent, 0),
    avgRating: buyers.length > 0 ? (buyers.reduce((sum, b) => sum + b.rating, 0) / buyers.length) : 0
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Buyer Management</h1>
              <p className="text-primary-100 mt-2">Manage customers who book services</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-primary-200">Total Buyers</div>
              <div className="text-3xl font-bold">{stats.totalBuyers}</div>
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
                <p className="text-sm font-medium text-gray-500">Total Buyers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBuyers}</p>
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
                <p className="text-2xl font-bold text-primary-900">{stats.activeBuyers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-primary-50 rounded-full">
                <ShoppingCart className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                <p className="text-2xl font-bold text-primary-900">{stats.totalBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-primary-200 rounded-full">
                <DollarSign className="h-6 w-6 text-primary-800" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-primary-900">₹{stats.totalRevenue.toLocaleString()}</p>
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
                onClick={handleExportBuyers}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Buyers
              </button>
              <button
                onClick={() => setIsAddBuyerModalOpen(true)}
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Buyer
              </button>
            </div>
          </div>
        </div>

        {/* Buyers Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">All Buyers ({filteredBuyers.length})</h3>
          </div>
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <LoadingSpinner size="sm" color="admin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location & Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking Stats</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spending & Rating</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBuyers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        No buyers found.
                      </td>
                    </tr>
                  ) : (
                    filteredBuyers.map((buyer) => (
                      <tr key={buyer.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-start">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-primary-600 to-primary-800 flex items-center justify-center text-white font-semibold mr-4">
                              {buyer.avatar}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 flex items-center">
                                {buyer.name}
                                {buyer.verified && <CheckCircle className="h-4 w-4 text-green-500 ml-2" />}
                              </div>
                              <div className="text-sm text-gray-500">{buyer.email}</div>
                              <div className="text-xs text-gray-400">Joined: {new Date(buyer.joinedDate).toLocaleDateString()}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-gray-900 flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {buyer.location}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {buyer.phone}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{buyer.totalBookings} total bookings</div>
                            <div className="text-sm text-primary-600">{buyer.completedBookings} completed</div>
                            <div className="text-sm text-red-600">{buyer.cancelledBookings} cancelled</div>
                            <div className="text-xs text-primary-500">♡ {buyer.favorites} favorites</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">₹{buyer.totalSpent.toLocaleString()}</div>
                            <div className="text-sm text-gray-500">Avg: ₹{buyer.avgSpent.toLocaleString()}</div>
                            <div className="flex items-center">
                              <Star className="h-3 w-3 text-yellow-400 mr-1" />
                              <span className="text-sm text-slate-700">{buyer.rating}/5</span>
                            </div>
                            <div className="text-xs text-gray-400">Wallet: ₹{buyer.wallet}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-gray-900">{new Date(buyer.lastActivity).toLocaleDateString()}</div>
                            <div className="text-sm text-gray-500">Last: {buyer.lastService}</div>
                            <div className="text-xs text-gray-400">Payment: {buyer.paymentMethod}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${buyer.active ? 'bg-primary-600 text-white' : 'bg-red-50 text-red-700'
                              }`}>
                              {buyer.active ? 'ACTIVE' : 'INACTIVE'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewBuyer(buyer)}
                              className="text-primary-600 hover:text-primary-800 p-1 rounded hover:bg-primary-50"
                              title="View Buyer"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEditBuyer(buyer)}
                              className="text-primary-600 hover:text-primary-800 p-1 rounded hover:bg-primary-50"
                              title="Edit Buyer"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm({ isOpen: true, buyer })}
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                              title="Delete Buyer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="bg-white px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredBuyers.length}</span> of{' '}
                <span className="font-medium">{filteredBuyers.length}</span> results
              </div>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  Previous
                </button>
                <button className="px-3 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700">
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
        isOpen={isAddBuyerModalOpen}
        onClose={() => setIsAddBuyerModalOpen(false)}
        onSave={handleAddBuyer}
        userType="BUYER"
      />

      <ViewUserModal
        isOpen={isViewBuyerModalOpen}
        onClose={() => setIsViewBuyerModalOpen(false)}
        user={selectedBuyer}
        onEdit={handleEditBuyer}
      />

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, buyer: null })}
        onConfirm={handleDeleteBuyer}
        title="Delete Buyer"
        message={`Are you sure you want to delete ${deleteConfirm.buyer?.name}? This action cannot be undone and will affect all associated bookings and data.`}
        confirmText="Delete"
        type="danger"
        isLoading={isDeleting}
      />
    </AdminLayout>
  );
}
