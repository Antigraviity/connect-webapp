'use client';

import { useState, useEffect } from 'react';
import AddCategoryModal from '@/components/admin/modals/AddCategoryModal';
import ConfirmDialog from '@/components/admin/modals/ConfirmDialog';

// Stub components for missing modals
const ViewCategoryModal = ({ isOpen, onClose, category }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        <h2 className="text-xl font-bold mb-4">Category Details: {category?.name}</h2>
        <div className="space-y-4">
          <div><p className="text-sm text-gray-500">Description</p><p className="font-medium">{category?.description}</p></div>
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-sm text-gray-500">Total Jobs</p><p className="font-medium">{category?.totalJobs}</p></div>
            <div><p className="text-sm text-gray-500">Active Jobs</p><p className="font-medium">{category?.activeJobs}</p></div>
          </div>
          <div><p className="text-sm text-gray-500">Popular Skills</p><div className="flex flex-wrap gap-2 mt-1">{category?.popularSkills?.map((s: string) => <span key={s} className="px-2 py-1 bg-gray-100 rounded-md text-sm">{s}</span>)}</div></div>
        </div>
      </div>
    </div>
  );
};

const EditCategoryModal = ({ isOpen, onClose, category, onSave }: any) => {
  const [formData, setFormData] = useState(category || {});
  useEffect(() => { if (category) setFormData(category); }, [category]);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        <h2 className="text-xl font-bold mb-4">Edit Category</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Category Name</label>
            <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} />
          </div>
          <button onClick={() => onSave(formData)} className="w-full py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

const AnalyticsModal = ({ isOpen, onClose, category }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        <h2 className="text-xl font-bold mb-4">Analytics: {category?.name}</h2>
        <div className="p-8 text-center text-gray-500"><BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-20" /><p>Advanced analytics for this category are coming soon.</p></div>
      </div>
    </div>
  );
};
import {
  Search,
  Filter,
  Download,
  Eye,
  Edit3,
  Plus,
  Folder,
  BriefcaseIcon,
  Users,
  TrendingUp,
  TrendingDown,
  Star,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3,
  RefreshCw,
  Trash2,
  X,
  Calendar,
  MapPin,
  DollarSign,
  Activity,
  Clock,
  Tag
} from 'lucide-react';
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface JobCategory {
  id: string;
  name: string;
  description: string;
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  avgSalary: string;
  popularSkills: string[];
  growth: string;
  trend: string;
  status: string;
  createdDate: string;
  lastUpdated: string;
  subcategories: number;
  icon: string;
  color: string;
}

export default function JobCategoriesPage() {
  const [jobCategories, setJobCategories] = useState<JobCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [liveStats, setLiveStats] = useState({
    totalCategories: 0,
    totalJobs: 0,
    totalApplications: 0,
    avgSalary: '₹0 LPA'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [sortBy, setSortBy] = useState('Sort by Jobs');
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  // Expanded filter states
  const [minJobs, setMinJobs] = useState('');
  const [maxJobs, setMaxJobs] = useState('');
  const [growthType, setGrowthType] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Category color and icon mappings
  const categoryColors: Record<string, string> = {
    'FULL_TIME': '#3B82F6',
    'PART_TIME': '#10B981',
    'CONTRACT': '#EF4444',
    'INTERNSHIP': '#F59E0B',
    'TEMPORARY': '#8B5CF6',
    'FREELANCE': '#06B6D4'
  };

  const categoryIcons: Record<string, string> = {
    'FULL_TIME': '💼',
    'PART_TIME': '⏰',
    'CONTRACT': '📝',
    'INTERNSHIP': '🎓',
    'TEMPORARY': '⚡',
    'FREELANCE': '🚀'
  };

  const fetchCategoriesData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/jobs/categories');
      const data = await response.json();

      if (data.success) {
        const transformed: JobCategory[] = data.categories.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          description: cat.description || `Jobs in ${cat.name} category`,
          totalJobs: cat.totalJobs || 0,
          activeJobs: cat.activeJobs || 0,
          totalApplications: cat.totalApplications || 0,
          avgSalary: cat.avgSalary || '₹10.0 LPA',
          popularSkills: cat.popularSkills || [],
          growth: cat.growth || '+0%',
          trend: cat.trend || 'up',
          status: cat.status || 'Active',
          createdDate: new Date(cat.createdAt).toISOString().split('T')[0],
          lastUpdated: new Date(cat.updatedAt).toISOString().split('T')[0],
          subcategories: 0,
          icon: cat.icon || '💼',
          color: cat.color || '#3B82F6'
        }));

        setJobCategories(transformed);
        setLiveStats(data.stats);
      }
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch live data from API
  useEffect(() => {
    fetchCategoriesData();
  }, []);

  // Modal states
  const [viewModal, setViewModal] = useState<{ isOpen: boolean; category: JobCategory | null }>({ isOpen: false, category: null });
  const [editModal, setEditModal] = useState<{ isOpen: boolean; category: JobCategory | null }>({ isOpen: false, category: null });
  const [analyticsModal, setAnalyticsModal] = useState<{ isOpen: boolean; category: JobCategory | null }>({ isOpen: false, category: null });
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; category: JobCategory | null }>({ isOpen: false, category: null });
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter and search logic
  const filteredCategories = jobCategories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All Status' || category.status === statusFilter;

    // Expanded filters
    const matchesMinJobs = !minJobs || category.totalJobs >= parseInt(minJobs);
    const matchesMaxJobs = !maxJobs || category.totalJobs <= parseInt(maxJobs);

    const growthVal = parseFloat(category.growth.replace('%', '').replace('+', ''));
    const matchesGrowth = growthType === 'All' ||
      (growthType === 'Positive' && growthVal > 0) ||
      (growthType === 'Negative' && growthVal < 0);

    const catDate = new Date(category.createdDate);
    const matchesStartDate = !startDate || catDate >= new Date(startDate);
    const matchesEndDate = !endDate || catDate <= new Date(endDate);

    return matchesSearch && matchesStatus && matchesMinJobs && matchesMaxJobs && matchesGrowth && matchesStartDate && matchesEndDate;
  });

  // Sort logic
  const sortedCategories = [...filteredCategories].sort((a, b) => {
    switch (sortBy) {
      case 'Most Jobs':
        return b.totalJobs - a.totalJobs;
      case 'Least Jobs':
        return a.totalJobs - b.totalJobs;
      case 'Highest Growth':
        return parseFloat(b.growth.replace('%', '').replace('+', '')) - parseFloat(a.growth.replace('%', '').replace('+', ''));
      case 'Recently Added':
        return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
      default:
        return 0;
    }
  });

  const handleAddCategory = async (categoryData: any) => {
    try {
      const response = await fetch('/api/admin/jobs/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData),
      });
      if (response.ok) {
        fetchCategoriesData();
        setIsAddCategoryModalOpen(false);
      }
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const handleEditCategory = async (updatedCategory: JobCategory) => {
    try {
      const response = await fetch('/api/admin/jobs/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCategory),
      });
      if (response.ok) {
        fetchCategoriesData();
        setEditModal({ isOpen: false, category: null });
      }
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteConfirm.category) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/jobs/categories?id=${deleteConfirm.category.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setJobCategories(prev => prev.filter(cat => cat.id !== deleteConfirm.category!.id));
        setDeleteConfirm({ isOpen: false, category: null });
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportCategories = () => {
    const csvContent = [
      ['Name', 'Description', 'Total Jobs', 'Active Jobs', 'Applications', 'Avg Salary', 'Growth', 'Status', 'Created Date'],
      ...sortedCategories.map(cat => [
        cat.name,
        cat.description,
        cat.totalJobs.toString(),
        cat.activeJobs.toString(),
        cat.totalApplications.toString(),
        cat.avgSalary,
        cat.growth,
        cat.status,
        cat.createdDate
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `job-categories-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200"><CheckCircle className="w-3 h-3 mr-1" />ACTIVE</span>;
      case 'Inactive':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />INACTIVE</span>;
      case 'Pending':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><AlertTriangle className="w-3 h-3 mr-1" />PENDING</span>;
      default:
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">UNKNOWN</span>;
    }
  };

  const totalStats = liveStats;

  return (
    <div className="p-6 space-y-6">
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[150]">
          <div className="flex flex-col items-center gap-3">
            <LoadingSpinner size="lg" color="white" />
            <p className="text-white font-medium">Loading categories...</p>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900">Job Categories Management</h1>
        <p className="text-gray-600 mt-1">Manage and organize job categories and subcategories</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Categories</p>
              <p className="text-2xl font-bold text-gray-900">{totalStats.totalCategories}</p>
            </div>
            <div className="p-3 bg-primary-50 rounded-full">
              <Folder className="h-6 w-6 text-primary-600" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm">
            <TrendingUp className="text-green-500 h-4 w-4 mr-1" />
            <span className="text-green-600 font-medium">+2</span>
            <span className="text-gray-500 ml-1">this month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Jobs</p>
              <p className="text-2xl font-bold text-gray-900">{totalStats.totalJobs.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-primary-50 rounded-full">
              <BriefcaseIcon className="h-6 w-6 text-primary-600" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm">
            <TrendingUp className="text-green-500 h-4 w-4 mr-1" />
            <span className="text-green-600 font-medium">+156</span>
            <span className="text-gray-500 ml-1">this month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900">{totalStats.totalApplications.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-primary-50 rounded-full">
              <Users className="h-6 w-6 text-primary-600" />
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
              <p className="text-sm font-medium text-gray-500">Avg. Salary</p>
              <p className="text-2xl font-bold text-gray-900">{totalStats.avgSalary}</p>
            </div>
            <div className="p-3 bg-primary-50 rounded-full">
              <Star className="h-6 w-6 text-primary-600" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm">
            <TrendingUp className="text-green-500 h-4 w-4 mr-1" />
            <span className="text-green-600 font-medium">+12.5%</span>
            <span className="text-gray-500 ml-1">increase</span>
          </div>
        </div>
      </div>

      {/* Top Categories Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Category Performance Overview</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {jobCategories.slice(0, 6).map((category, index) => (
              <div key={index} className="text-center">
                <div className="text-xl font-bold" style={{ color: category.color }}>{category.totalJobs}</div>
                <div className="text-sm text-gray-600">{category.name}</div>
                <div className={`text-xs ${category.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>{category.growth}</div>
              </div>
            ))}
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
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-64"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
              <option>Pending</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option>Sort by Jobs</option>
              <option>Most Jobs</option>
              <option>Least Jobs</option>
              <option>Highest Growth</option>
              <option>Recently Added</option>
            </select>
            <button
              onClick={() => setShowMoreFilters(!showMoreFilters)}
              className={`inline-flex items-center px-3 py-1.5 border rounded-lg text-sm font-medium transition-colors shadow-sm ${showMoreFilters ? 'bg-primary-50 border-primary-500 text-primary-700' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                }`}
            >
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={fetchCategoriesData}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
            <button
              onClick={handleExportCategories}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            <button
              onClick={() => setIsAddCategoryModalOpen(true)}
              className="inline-flex items-center px-3 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 shadow-sm transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </button>
          </div>
        </div>

        {/* Expanded Filters */}
        {showMoreFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-md border border-gray-100 animate-in fade-in slide-in-from-top-2">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Growth Trend</label>
              <select
                value={growthType}
                onChange={(e) => setGrowthType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              >
                <option>All</option>
                <option>Positive</option>
                <option>Negative</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Created (From)</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Created (To)</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <div className="flex items-end space-x-2">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Job Count Range</label>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minJobs}
                    onChange={(e) => setMinJobs(e.target.value)}
                    className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxJobs}
                    onChange={(e) => setMaxJobs(e.target.value)}
                    className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
              </div>
            </div>
            <div className="lg:col-span-4 flex justify-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('All Status');
                  setSortBy('Sort by Jobs');
                  setGrowthType('All');
                  setStartDate('');
                  setEndDate('');
                  setMinJobs('');
                  setMaxJobs('');
                }}
                className="text-sm text-gray-500 hover:text-primary-600 font-medium transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Statistics</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Popular Skills</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedCategories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div
                        className="h-12 w-12 rounded-lg flex items-center justify-center text-white font-semibold text-lg"
                        style={{ backgroundColor: category.color }}
                      >
                        {category.icon || <Folder className="h-6 w-6" />}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{category.name}</div>
                        <div className="text-sm text-gray-500 max-w-xs">{category.description}</div>
                        <div className="text-xs text-gray-400">
                          {category.subcategories} subcategories • Created: {category.createdDate}
                        </div>
                        <div className="text-xs text-gray-400">Last updated: {category.lastUpdated}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{category.totalJobs} total jobs</div>
                      <div className="text-sm text-green-600">{category.activeJobs} active</div>
                      <div className="text-sm text-primary-600">{category.totalApplications.toLocaleString()} applications</div>
                      <div className="text-sm text-primary-700 font-medium">{category.avgSalary} avg salary</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="flex items-center">
                        {category.trend === 'up' ? (
                          <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                        )}
                        <span className={`text-sm font-medium ${category.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                          {category.growth}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">vs last month</div>
                      <div className="text-sm text-gray-600">
                        {category.totalJobs > 0 ? Math.round((category.activeJobs / category.totalJobs) * 100) : 0}% active rate
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {category.popularSkills.slice(0, 3).map((skill, index) => (
                        <span
                          key={index}
                          className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mr-1"
                        >
                          {skill}
                        </span>
                      ))}
                      {category.popularSkills.length > 3 && (
                        <div className="text-xs text-gray-500">+{category.popularSkills.length - 3} more</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(category.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setViewModal({ isOpen: true, category })}
                        className="text-primary-600 hover:text-primary-800 p-1 rounded hover:bg-primary-50"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setEditModal({ isOpen: true, category })}
                        className="text-primary-600 hover:text-primary-800 p-1 rounded hover:bg-primary-50"
                        title="Edit Category"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setAnalyticsModal({ isOpen: true, category })}
                        className="text-primary-600 hover:text-primary-800 p-1 rounded hover:bg-primary-50"
                        title="View Analytics"
                      >
                        <BarChart3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ isOpen: true, category })}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        title="Delete Category"
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
      </div>

      {/* Pagination */}
      <div className="bg-white px-6 py-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">1</span> to <span className="font-medium">{sortedCategories.length}</span> of{' '}
            <span className="font-medium">{totalStats.totalCategories}</span> results
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              Previous
            </button>
            <button className="px-3 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
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

      {/* Modals */}
      <AddCategoryModal
        isOpen={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
        onSave={handleAddCategory}
        type="job"
      />

      <ViewCategoryModal
        isOpen={viewModal.isOpen}
        onClose={() => setViewModal({ isOpen: false, category: null })}
        category={viewModal.category}
      />

      <EditCategoryModal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, category: null })}
        category={editModal.category}
        onSave={handleEditCategory}
      />

      <AnalyticsModal
        isOpen={analyticsModal.isOpen}
        onClose={() => setAnalyticsModal({ isOpen: false, category: null })}
        category={analyticsModal.category}
      />

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, category: null })}
        onConfirm={handleDeleteCategory}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteConfirm.category?.name}" category? This action cannot be undone and will affect all associated jobs.`}
        confirmText="Delete"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
