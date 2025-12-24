'use client';

import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AddCategoryModal from '@/components/admin/modals/AddCategoryModal';
import ConfirmDialog from '@/components/admin/modals/ConfirmDialog';
import { 
  Search,
  Plus,
  Download,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Star,
  Folder,
  FolderOpen,
  Package,
  TrendingUp,
  BarChart3,
  Users,
  ShoppingBag,
  CheckCircle,
  AlertTriangle,
  Hash,
  Calendar
} from 'lucide-react';

// Mock categories data
const initialCategories = [
  {
    id: '1',
    name: 'Home Services',
    description: 'Professional home-based services including cleaning, maintenance, and household assistance',
    parentId: null,
    subcategories: [
      { id: '11', name: 'Cleaning Services', serviceCount: 45, active: true },
      { id: '12', name: 'Cooking Services', serviceCount: 23, active: true },
      { id: '13', name: 'Laundry Services', serviceCount: 18, active: true },
      { id: '14', name: 'Grocery Shopping', serviceCount: 12, active: false }
    ],
    serviceCount: 98,
    providerCount: 67,
    totalBookings: 1250,
    avgRating: 4.6,
    featured: true,
    active: true,
    createdDate: '2024-01-15',
    lastUpdate: '2024-11-20',
    icon: 'home'
  },
  {
    id: '2',
    name: 'Home Maintenance',
    description: 'Technical and repair services for residential properties',
    parentId: null,
    subcategories: [
      { id: '21', name: 'Plumbing', serviceCount: 34, active: true },
      { id: '22', name: 'Electrical Work', serviceCount: 28, active: true },
      { id: '23', name: 'AC Repair', serviceCount: 22, active: true },
      { id: '24', name: 'Painting', serviceCount: 19, active: true },
      { id: '25', name: 'Carpentry', serviceCount: 15, active: true }
    ],
    serviceCount: 118,
    providerCount: 89,
    totalBookings: 2150,
    avgRating: 4.4,
    featured: true,
    active: true,
    createdDate: '2024-01-10',
    lastUpdate: '2024-11-22',
    icon: 'wrench'
  },
  {
    id: '3',
    name: 'Beauty & Wellness',
    description: 'Personal care, beauty treatments, and wellness services',
    parentId: null,
    subcategories: [
      { id: '31', name: 'Hair Styling', serviceCount: 42, active: true },
      { id: '32', name: 'Makeup Services', serviceCount: 38, active: true },
      { id: '33', name: 'Spa Services', serviceCount: 25, active: true },
      { id: '34', name: 'Massage Therapy', serviceCount: 20, active: true }
    ],
    serviceCount: 125,
    providerCount: 78,
    totalBookings: 890,
    avgRating: 4.8,
    featured: true,
    active: true,
    createdDate: '2024-02-01',
    lastUpdate: '2024-11-18',
    icon: 'sparkles'
  },
  {
    id: '4',
    name: 'Technology Services',
    description: 'IT support, device repair, and technical assistance',
    parentId: null,
    subcategories: [
      { id: '41', name: 'Computer Repair', serviceCount: 15, active: true },
      { id: '42', name: 'Phone Repair', serviceCount: 12, active: true },
      { id: '43', name: 'Web Development', serviceCount: 8, active: false },
      { id: '44', name: 'IT Support', serviceCount: 6, active: true }
    ],
    serviceCount: 41,
    providerCount: 32,
    totalBookings: 385,
    avgRating: 4.3,
    featured: false,
    active: true,
    createdDate: '2024-02-15',
    lastUpdate: '2024-11-15',
    icon: 'laptop'
  },
  {
    id: '5',
    name: 'Education & Training',
    description: 'Learning, tutoring, and skill development services',
    parentId: null,
    subcategories: [
      { id: '51', name: 'Academic Tutoring', serviceCount: 25, active: true },
      { id: '52', name: 'Music Lessons', serviceCount: 18, active: true },
      { id: '53', name: 'Language Classes', serviceCount: 14, active: true }
    ],
    serviceCount: 57,
    providerCount: 45,
    totalBookings: 670,
    avgRating: 4.7,
    featured: false,
    active: true,
    createdDate: '2024-03-01',
    lastUpdate: '2024-11-10',
    icon: 'book'
  }
];

export default function ServiceCategoriesPage() {
  const [categories, setCategories] = useState(initialCategories);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['1', '2']);

  // Modal states
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{isOpen: boolean, category: any}>({
    isOpen: false,
    category: null
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All Status' || 
                         (statusFilter === 'Active' && category.active) ||
                         (statusFilter === 'Inactive' && !category.active) ||
                         (statusFilter === 'Featured' && category.featured);
    
    return matchesSearch && matchesStatus;
  });

  const handleAddCategory = (categoryData: any) => {
    const newCategory = {
      ...categoryData,
      id: Date.now().toString(),
      subcategories: [],
      serviceCount: 0,
      providerCount: 0,
      totalBookings: 0,
      avgRating: 0,
      createdDate: new Date().toISOString().split('T')[0],
      lastUpdate: new Date().toISOString().split('T')[0],
      icon: 'folder'
    };
    setCategories(prev => [...prev, newCategory]);
    console.log('Category added successfully:', newCategory);
  };

  const handleEditCategory = (category: any) => {
    setSelectedCategory(category);
    setIsEditModalOpen(true);
  };

  const handleUpdateCategory = (updatedData: any) => {
    setCategories(prev => prev.map(cat => 
      cat.id === selectedCategory.id 
        ? { ...cat, ...updatedData, lastUpdate: new Date().toISOString().split('T')[0] }
        : cat
    ));
    setIsEditModalOpen(false);
    setSelectedCategory(null);
    console.log('Category updated successfully');
  };

  const handleDeleteCategory = async () => {
    if (!deleteConfirm.category) return;
    
    setIsDeleting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCategories(prev => prev.filter(cat => cat.id !== deleteConfirm.category.id));
      setDeleteConfirm({ isOpen: false, category: null });
      console.log('Category deleted successfully');
    } catch (error) {
      console.error('Error deleting category:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = (category: any) => {
    const newStatus = !category.active;
    setCategories(prev => prev.map(cat => 
      cat.id === category.id 
        ? { ...cat, active: newStatus, lastUpdate: new Date().toISOString().split('T')[0] }
        : cat
    ));
    console.log(`Category ${newStatus ? 'activated' : 'deactivated'}`);
  };

  const handleToggleFeatured = (category: any) => {
    const newFeatured = !category.featured;
    setCategories(prev => prev.map(cat => 
      cat.id === category.id 
        ? { ...cat, featured: newFeatured, lastUpdate: new Date().toISOString().split('T')[0] }
        : cat
    ));
    console.log(`Category ${newFeatured ? 'featured' : 'unfeatured'}`);
  };

  const toggleExpanded = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleExportCategories = () => {
    const csvContent = [
      ['Name', 'Description', 'Services', 'Providers', 'Bookings', 'Rating', 'Status', 'Featured', 'Created Date'],
      ...filteredCategories.map(category => [
        category.name, category.description, category.serviceCount.toString(),
        category.providerCount.toString(), category.totalBookings.toString(),
        category.avgRating.toString(), category.active ? 'Active' : 'Inactive',
        category.featured ? 'Yes' : 'No', category.createdDate
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `service-categories-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleRefreshData = () => {
    console.log('Refreshing category data...');
  };

  // Calculate statistics
  const stats = {
    totalCategories: categories.length,
    activeCategories: categories.filter(c => c.active).length,
    totalServices: categories.reduce((sum, c) => sum + c.serviceCount, 0),
    featuredCategories: categories.filter(c => c.featured).length,
    totalBookings: categories.reduce((sum, c) => sum + c.totalBookings, 0),
    avgRating: categories.length > 0 ? (categories.reduce((sum, c) => sum + c.avgRating, 0) / categories.length) : 0
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Service Categories</h1>
              <p className="text-green-100 mt-2">Manage service categories and subcategories</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-green-200">Total Categories</div>
              <div className="text-3xl font-bold">{stats.totalCategories}</div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Categories</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCategories}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <Folder className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="text-green-500 h-4 w-4 mr-1" />
              <span className="text-green-600 font-medium">+8.2%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Categories</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeCategories}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="text-green-500 h-4 w-4 mr-1" />
              <span className="text-green-600 font-medium">+5.1%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Services</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalServices}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <ShoppingBag className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="text-green-500 h-4 w-4 mr-1" />
              <span className="text-green-600 font-medium">+15.3%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Featured Categories</p>
                <p className="text-2xl font-bold text-gray-900">{stats.featuredCategories}</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-full">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <Star className="text-yellow-500 h-4 w-4 mr-1" />
              <span className="text-yellow-600 font-medium">{((stats.featuredCategories / stats.totalCategories) * 100).toFixed(1)}%</span>
              <span className="text-gray-500 ml-1">featured</span>
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
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-64"
                />
              </div>
              
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option>All Status</option>
                <option>Active</option>
                <option>Inactive</option>
                <option>Featured</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefreshData}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
              <button
                onClick={handleExportCategories}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
              <button
                onClick={() => setIsAddCategoryModalOpen(true)}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </button>
            </div>
          </div>
        </div>

        {/* Categories Grid/List */}
        <div className="grid grid-cols-1 gap-6">
          {filteredCategories.map((category) => {
            const isExpanded = expandedCategories.includes(category.id);
            return (
              <div key={category.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Category Header */}
                <div 
                  className="p-6 cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleExpanded(category.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg text-white">
                        {isExpanded ? <FolderOpen className="h-6 w-6" /> : <Folder className="h-6 w-6" />}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                          {category.featured && <Star className="h-4 w-4 text-yellow-500" />}
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            category.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {category.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                          <span>{category.serviceCount} services</span>
                          <span>{category.providerCount} providers</span>
                          <span>{category.totalBookings} bookings</span>
                          <div className="flex items-center">
                            <Star className="h-3 w-3 text-yellow-400 mr-1" />
                            <span>{category.avgRating.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {/* Quick Stats */}
                      <div className="hidden lg:flex items-center space-x-6 text-sm text-gray-500">
                        <div className="text-center">
                          <div className="font-semibold text-gray-900">{category.serviceCount}</div>
                          <div>Services</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-gray-900">{category.totalBookings}</div>
                          <div>Bookings</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-gray-900 flex items-center">
                            <Star className="h-3 w-3 text-yellow-400 mr-1" />
                            {category.avgRating.toFixed(1)}
                          </div>
                          <div>Rating</div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditCategory(category);
                          }}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="Edit Category"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFeatured(category);
                          }}
                          className="text-yellow-600 hover:text-yellow-900 p-1 rounded hover:bg-yellow-50"
                          title={category.featured ? "Remove from featured" : "Add to featured"}
                        >
                          <Star className={`h-4 w-4 ${category.featured ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStatus(category);
                          }}
                          className={`p-1 rounded ${
                            category.active 
                              ? 'text-red-600 hover:text-red-900 hover:bg-red-50' 
                              : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                          }`}
                          title={category.active ? 'Deactivate' : 'Activate'}
                        >
                          {category.active ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirm({ isOpen: true, category });
                          }}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          title="Delete Category"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Subcategories */}
                {isExpanded && category.subcategories.length > 0 && (
                  <div className="border-t border-gray-200 bg-gray-50 p-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Subcategories</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {category.subcategories.map((sub) => (
                        <div key={sub.id} className="bg-white p-4 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-medium text-gray-900">{sub.name}</h5>
                              <p className="text-sm text-gray-500">{sub.serviceCount} services</p>
                            </div>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              sub.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {sub.active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      <AddCategoryModal
        isOpen={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
        onSave={handleAddCategory}
        type="service"
      />

      <AddCategoryModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedCategory(null);
        }}
        onSave={handleUpdateCategory}
        type="service"
        initialData={selectedCategory}
        isEdit={true}
      />

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, category: null })}
        onConfirm={handleDeleteCategory}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteConfirm.category?.name}"? This action cannot be undone and will affect all services in this category.`}
        confirmText="Delete"
        type="danger"
        isLoading={isDeleting}
      />
    </AdminLayout>
  );
}
