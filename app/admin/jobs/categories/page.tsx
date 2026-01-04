'use client';

import { useState, useEffect } from 'react';
import AddCategoryModal from '@/components/admin/modals/AddCategoryModal';
import ConfirmDialog from '@/components/admin/modals/ConfirmDialog';
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
  id: number;
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

const initialJobCategories: JobCategory[] = [
  {
    id: 1,
    name: 'Technology',
    description: 'Software development, IT support, cybersecurity, and tech-related positions',
    totalJobs: 456,
    activeJobs: 234,
    totalApplications: 5678,
    avgSalary: '₹12.5 LPA',
    popularSkills: ['React', 'Node.js', 'Python', 'Java'],
    growth: '+18.2%',
    trend: 'up',
    status: 'Active',
    createdDate: '2024-01-15',
    lastUpdated: '2024-11-20',
    subcategories: 12,
    icon: '💻',
    color: '#3B82F6'
  },
  {
    id: 2,
    name: 'Marketing & Sales',
    description: 'Digital marketing, sales executives, brand management, and promotional roles',
    totalJobs: 234,
    activeJobs: 156,
    totalApplications: 3456,
    avgSalary: '₹8.5 LPA',
    popularSkills: ['Digital Marketing', 'SEO', 'Content Writing', 'Sales'],
    growth: '+12.8%',
    trend: 'up',
    status: 'Active',
    createdDate: '2024-01-20',
    lastUpdated: '2024-11-18',
    subcategories: 8,
    icon: '📈',
    color: '#10B981'
  },
  {
    id: 3,
    name: 'Healthcare',
    description: 'Medical professionals, nurses, healthcare administration, and wellness roles',
    totalJobs: 189,
    activeJobs: 123,
    totalApplications: 2345,
    avgSalary: '₹9.8 LPA',
    popularSkills: ['Patient Care', 'Medical Knowledge', 'Healthcare Management'],
    growth: '+22.1%',
    trend: 'up',
    status: 'Active',
    createdDate: '2024-02-01',
    lastUpdated: '2024-11-22',
    subcategories: 6,
    icon: '🏥',
    color: '#EF4444'
  },
  {
    id: 4,
    name: 'Finance & Banking',
    description: 'Financial analysts, banking professionals, accounting, and investment roles',
    totalJobs: 167,
    activeJobs: 89,
    totalApplications: 1987,
    avgSalary: '₹11.2 LPA',
    popularSkills: ['Financial Analysis', 'Accounting', 'Risk Management', 'Excel'],
    growth: '+8.7%',
    trend: 'up',
    status: 'Active',
    createdDate: '2024-01-25',
    lastUpdated: '2024-11-19',
    subcategories: 9,
    icon: '💰',
    color: '#F59E0B'
  },
  {
    id: 5,
    name: 'Education',
    description: 'Teaching positions, curriculum development, educational administration',
    totalJobs: 145,
    activeJobs: 67,
    totalApplications: 1567,
    avgSalary: '₹6.5 LPA',
    popularSkills: ['Teaching', 'Curriculum Design', 'Student Management'],
    growth: '-3.2%',
    trend: 'down',
    status: 'Active',
    createdDate: '2024-02-10',
    lastUpdated: '2024-11-15',
    subcategories: 5,
    icon: '🎓',
    color: '#8B5CF6'
  },
  {
    id: 6,
    name: 'Manufacturing',
    description: 'Production, quality control, supply chain, and industrial operations',
    totalJobs: 123,
    activeJobs: 78,
    totalApplications: 1234,
    avgSalary: '₹7.8 LPA',
    popularSkills: ['Quality Control', 'Production Planning', 'Lean Manufacturing'],
    growth: '+5.4%',
    trend: 'up',
    status: 'Active',
    createdDate: '2024-02-15',
    lastUpdated: '2024-11-21',
    subcategories: 7,
    icon: '🏭',
    color: '#06B6D4'
  }
];

// View Details Modal Component
function ViewCategoryModal({ isOpen, onClose, category }: { isOpen: boolean; onClose: () => void; category: JobCategory | null }) {
  if (!isOpen || !category) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-admin-600 to-admin-800 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl bg-white/20 backdrop-blur">
                  {category.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{category.name}</h3>
                  <p className="text-sm text-admin-100">Category Details</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Description */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Description</h4>
              <p className="text-gray-900">{category.description}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-admin-50 rounded-lg p-4 text-center">
                <BriefcaseIcon className="w-6 h-6 text-admin-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-admin-600">{category.totalJobs}</p>
                <p className="text-xs text-gray-500">Total Jobs</p>
              </div>
              <div className="bg-admin-50 rounded-lg p-4 text-center">
                <CheckCircle className="w-6 h-6 text-admin-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-admin-600">{category.activeJobs}</p>
                <p className="text-xs text-gray-500">Active Jobs</p>
              </div>
              <div className="bg-admin-50 rounded-lg p-4 text-center">
                <Users className="w-6 h-6 text-admin-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-admin-600">{category.totalApplications.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Applications</p>
              </div>
              <div className="bg-admin-50 rounded-lg p-4 text-center">
                <DollarSign className="w-6 h-6 text-admin-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-admin-600">{category.avgSalary}</p>
                <p className="text-xs text-gray-500">Avg Salary</p>
              </div>
            </div>

            {/* Performance */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Performance</h4>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {category.trend === 'up' ? (
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-500" />
                  )}
                  <span className={`text-lg font-semibold ${category.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {category.growth}
                  </span>
                  <span className="text-gray-500">growth</span>
                </div>
                <div className="text-gray-500">•</div>
                <div className="text-gray-600">
                  {category.totalJobs > 0 ? Math.round((category.activeJobs / category.totalJobs) * 100) : 0}% active rate
                </div>
              </div>
            </div>

            {/* Popular Skills */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Popular Skills</h4>
              <div className="flex flex-wrap gap-2">
                {category.popularSkills.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-admin-50 text-admin-700 rounded-full text-sm font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Meta Info */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>Created: {category.createdDate}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>Updated: {category.lastUpdated}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Folder className="w-4 h-4" />
                <span>{category.subcategories} subcategories</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Tag className="w-4 h-4 text-gray-500" />
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${category.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                  {category.status}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-4 flex justify-end">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Edit Category Modal Component
function EditCategoryModal({ isOpen, onClose, category, onSave }: { isOpen: boolean; onClose: () => void; category: JobCategory | null; onSave: (data: any) => void }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'Active',
    subcategories: 0
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useState(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description,
        status: category.status,
        subcategories: category.subcategories
      });
    }
  });

  if (!isOpen || !category) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Category name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    onSave({
      ...category,
      name: formData.name,
      description: formData.description,
      status: formData.status,
      subcategories: formData.subcategories,
      lastUpdated: new Date().toISOString().split('T')[0]
    });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-admin-600 to-admin-800 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 backdrop-blur rounded-lg">
                  <Edit3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Edit Category</h3>
                  <p className="text-sm text-admin-100">Update category details</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-admin-500 focus:border-transparent ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter category name"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-admin-500 focus:border-transparent ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter category description"
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-admin-500 focus:border-transparent"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subcategories</label>
                <input
                  type="number"
                  name="subcategories"
                  value={formData.subcategories}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-admin-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-admin-600 rounded-lg hover:bg-admin-700 disabled:bg-admin-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <><LoadingSpinner size="sm" color="white" />Saving...</>
              ) : (
                <><CheckCircle className="w-4 h-4" />Save Changes</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Analytics Modal Component
function AnalyticsModal({ isOpen, onClose, category }: { isOpen: boolean; onClose: () => void; category: JobCategory | null }) {
  if (!isOpen || !category) return null;

  const monthlyData = [
    { month: 'Jul', jobs: 45, applications: 567 },
    { month: 'Aug', jobs: 52, applications: 634 },
    { month: 'Sep', jobs: 48, applications: 589 },
    { month: 'Oct', jobs: 61, applications: 712 },
    { month: 'Nov', jobs: 58, applications: 689 },
    { month: 'Dec', jobs: 67, applications: 798 },
  ];

  const maxJobs = Math.max(...monthlyData.map(d => d.jobs));
  const maxApps = Math.max(...monthlyData.map(d => d.applications));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-admin-600 to-admin-800 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 backdrop-blur rounded-lg">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{category.name} Analytics</h3>
                  <p className="text-sm text-admin-100">Performance metrics and trends</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-admin-50 to-admin-100 rounded-lg p-4">
                <p className="text-sm text-admin-600 font-medium">Total Jobs</p>
                <p className="text-2xl font-bold text-admin-700">{category.totalJobs}</p>
                <p className="text-xs text-admin-500 mt-1">{category.growth} vs last month</p>
              </div>
              <div className="bg-gradient-to-br from-admin-50 to-admin-100 rounded-lg p-4">
                <p className="text-sm text-admin-600 font-medium">Active Rate</p>
                <p className="text-2xl font-bold text-admin-700">
                  {category.totalJobs > 0 ? Math.round((category.activeJobs / category.totalJobs) * 100) : 0}%
                </p>
                <p className="text-xs text-admin-500 mt-1">{category.activeJobs} active jobs</p>
              </div>
              <div className="bg-gradient-to-br from-admin-50 to-admin-100 rounded-lg p-4">
                <p className="text-sm text-admin-600 font-medium">Applications</p>
                <p className="text-2xl font-bold text-admin-700">{category.totalApplications.toLocaleString()}</p>
                <p className="text-xs text-admin-500 mt-1">Total received</p>
              </div>
              <div className="bg-gradient-to-br from-admin-50 to-admin-100 rounded-lg p-4">
                <p className="text-sm text-admin-600 font-medium">Avg Salary</p>
                <p className="text-2xl font-bold text-admin-700">{category.avgSalary}</p>
                <p className="text-xs text-admin-500 mt-1">Market average</p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Jobs Trend */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-4">Jobs Posted (Last 6 Months)</h4>
                <div className="flex items-end justify-between h-32 gap-2">
                  {monthlyData.map((data, index) => (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div
                        className="w-full bg-admin-500 rounded-t-sm transition-all hover:bg-admin-600"
                        style={{ height: `${(data.jobs / maxJobs) * 100}%` }}
                      ></div>
                      <span className="text-xs text-gray-500 mt-2">{data.month}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Applications Trend */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-4">Applications (Last 6 Months)</h4>
                <div className="flex items-end justify-between h-32 gap-2">
                  {monthlyData.map((data, index) => (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div
                        className="w-full bg-admin-400 rounded-t-sm transition-all hover:bg-admin-500"
                        style={{ height: `${(data.applications / maxApps) * 100}%` }}
                      ></div>
                      <span className="text-xs text-gray-500 mt-2">{data.month}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Skills */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-4">Top Skills in Demand</h4>
              <div className="space-y-3">
                {category.popularSkills.map((skill, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-sm text-gray-700 w-32">{skill}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-admin-600 h-2 rounded-full"
                        style={{ width: `${100 - (index * 15)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500 w-12">{100 - (index * 15)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
            <p className="text-sm text-gray-500">Data updated: {category.lastUpdated}</p>
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
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

      console.log('✅ Categories API Response:', data);

      if (data.success) {
        // Transform categories to match interface
        const transformed: JobCategory[] = data.categories.map((cat: any, index: number) => ({
          id: index + 1,
          name: cat.name,
          description: `Jobs in ${cat.name} category`,
          totalJobs: cat.totalJobs,
          activeJobs: cat.activeJobs,
          totalApplications: cat.totalApplications,
          avgSalary: cat.avgSalary,
          popularSkills: [],
          growth: cat.growth,
          trend: cat.trend,
          status: 'Active',
          createdDate: '2024-01-01',
          lastUpdated: new Date().toISOString().split('T')[0],
          subcategories: 0,
          icon: categoryIcons[cat.name] || '📁',
          color: categoryColors[cat.name] || '#6B7280'
        }));

        setJobCategories(transformed);
        setLiveStats(data.stats);
      }
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      setJobCategories([]);
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
    return matchesSearch && matchesStatus;
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

  const handleAddCategory = (categoryData: any) => {
    setJobCategories(prev => [...prev, {
      ...categoryData,
      id: Date.now(),
      totalJobs: 0,
      activeJobs: 0,
      totalApplications: 0,
      avgSalary: '₹0 LPA',
      popularSkills: [],
      growth: '+0%',
      trend: 'up',
      lastUpdated: new Date().toISOString().split('T')[0],
      subcategories: 0
    }]);
  };

  const handleEditCategory = (updatedCategory: JobCategory) => {
    setJobCategories(prev => prev.map(cat =>
      cat.id === updatedCategory.id ? updatedCategory : cat
    ));
  };

  const handleDeleteCategory = async () => {
    if (!deleteConfirm.category) return;

    setIsDeleting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setJobCategories(prev => prev.filter(cat => cat.id !== deleteConfirm.category!.id));
      setDeleteConfirm({ isOpen: false, category: null });
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
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />ACTIVE</span>;
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 flex flex-col items-center">
            <LoadingSpinner size="lg" color="admin" />
            <p className="text-gray-700 font-medium">Loading categories...</p>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="bg-gradient-to-r from-admin-600 to-admin-800 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold">Job Categories Management</h1>
        <p className="text-admin-100 mt-2">Manage and organize job categories and subcategories</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Categories</p>
              <p className="text-2xl font-bold text-gray-900">{totalStats.totalCategories}</p>
            </div>
            <div className="p-3 bg-admin-50 rounded-full">
              <Folder className="h-6 w-6 text-admin-600" />
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
            <div className="p-3 bg-admin-50 rounded-full">
              <BriefcaseIcon className="h-6 w-6 text-admin-600" />
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
            <div className="p-3 bg-admin-50 rounded-full">
              <Users className="h-6 w-6 text-admin-600" />
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
            <div className="p-3 bg-admin-50 rounded-full">
              <Star className="h-6 w-6 text-admin-600" />
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
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-500 focus:border-transparent w-64"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-admin-500 focus:border-transparent"
            >
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
              <option>Pending</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option>Sort by Jobs</option>
              <option>Most Jobs</option>
              <option>Least Jobs</option>
              <option>Highest Growth</option>
              <option>Recently Added</option>
            </select>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={fetchCategoriesData}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
            <button
              onClick={handleExportCategories}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            <button
              onClick={() => setIsAddCategoryModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-admin-600 text-white text-sm font-medium rounded-md hover:bg-admin-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </button>
          </div>
        </div>
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
                      <div className="text-sm text-admin-600">{category.totalApplications.toLocaleString()} applications</div>
                      <div className="text-sm text-admin-700 font-medium">{category.avgSalary} avg salary</div>
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
                        className="text-admin-600 hover:text-admin-800 p-1 rounded hover:bg-admin-50"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setEditModal({ isOpen: true, category })}
                        className="text-admin-600 hover:text-admin-800 p-1 rounded hover:bg-admin-50"
                        title="Edit Category"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setAnalyticsModal({ isOpen: true, category })}
                        className="text-admin-600 hover:text-admin-800 p-1 rounded hover:bg-admin-50"
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
