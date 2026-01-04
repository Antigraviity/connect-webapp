"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FiBriefcase,
  FiUsers,
  FiFileText,
  FiCalendar,
  FiTrendingUp,
  FiTrendingDown,
  FiClock,
  FiAlertCircle,
  FiMapPin,
  FiPlus,
  FiAward,
  FiTarget,
  FiUserCheck,
  FiUserPlus,
  FiX,
  FiLayers,
} from "react-icons/fi";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import {
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
} from "recharts";

// Job Category Interface
interface JobCategory {
  id: string;
  name: string;
  value: number;
  color: string;
  description?: string;
  subCategories?: string[];
  status: "ACTIVE" | "INACTIVE";
}

// Live Data Hook - Will be used in component
function useDashboardData() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/jobs/dashboard');
      const data = await response.json();
      if (data.success) {
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  return { dashboardData, loading, refetch: fetchDashboardData };
}

// Mock Data (fallback)
const jobStats = [
  { label: "Active Jobs", value: "1,589", change: "+22.8%", changeType: "increase", icon: FiBriefcase, color: "bg-admin-600" },
  { label: "Total Companies", value: "1,245", change: "+15.3%", changeType: "increase", icon: FiUsers, color: "bg-admin-600" },
  { label: "Applications", value: "4,892", change: "+32.5%", changeType: "increase", icon: FiFileText, color: "bg-admin-600" },
  { label: "Interviews", value: "487", change: "+18.2%", changeType: "increase", icon: FiCalendar, color: "bg-admin-600" },
];

const applicationTrendData = [
  { month: "Jun", applications: 2890, hires: 145, interviews: 320 },
  { month: "Jul", applications: 3200, hires: 168, interviews: 380 },
  { month: "Aug", applications: 3450, hires: 182, interviews: 420 },
  { month: "Sep", applications: 3890, hires: 195, interviews: 460 },
  { month: "Oct", applications: 4320, hires: 218, interviews: 510 },
  { month: "Nov", applications: 4892, hires: 245, interviews: 487 },
];

const initialJobCategoryData: JobCategory[] = [
  { id: "CAT-001", name: "IT & Software", value: 580, color: "#64748b", description: "Software development, IT support, and technology roles", subCategories: ["Frontend Developer", "Backend Developer", "DevOps", "QA Engineer"], status: "ACTIVE" },
  { id: "CAT-002", name: "Marketing", value: 320, color: "#475569", description: "Digital marketing, content, and brand management", subCategories: ["Digital Marketing", "Content Writer", "SEO Specialist", "Brand Manager"], status: "ACTIVE" },
  { id: "CAT-003", name: "Sales", value: 280, color: "#334155", description: "Sales and business development roles", subCategories: ["Sales Executive", "Business Development", "Account Manager"], status: "ACTIVE" },
  { id: "CAT-004", name: "Finance", value: 220, color: "#1e293b", description: "Financial planning, accounting, and analysis", subCategories: ["Accountant", "Financial Analyst", "Tax Consultant"], status: "ACTIVE" },
  { id: "CAT-005", name: "HR", value: 120, color: "#0f172a", description: "Human resources and talent acquisition", subCategories: ["HR Manager", "Recruiter", "Training Coordinator"], status: "ACTIVE" },
  { id: "CAT-006", name: "Others", value: 69, color: "#6b7280", description: "Other job categories", status: "ACTIVE" },
];

// Colors for auto-assignment (Steel/Charcoal shades)
const categoryColors = ["#64748b", "#475569", "#334155", "#1e293b", "#0f172a", "#334155", "#475569", "#64748b", "#1e293b", "#6b7280"];

const workModeDistribution = [
  { mode: "Remote", count: 620, percentage: 39 },
  { mode: "Hybrid", count: 540, percentage: 34 },
  { mode: "On-site", count: 429, percentage: 27 },
];

const recentApplications = [
  { id: "APP-5678", candidate: "Rahul Sharma", job: "Senior React Developer", company: "TechCorp Solutions", matchScore: 92, status: "SHORTLISTED", time: "10 minutes ago" },
  { id: "APP-5679", candidate: "Priya Patel", job: "UI/UX Designer", company: "DesignHub Inc", matchScore: 88, status: "INTERVIEW", time: "25 minutes ago" },
  { id: "APP-5680", candidate: "Amit Kumar", job: "Product Manager", company: "InnovateLabs", matchScore: 95, status: "PENDING", time: "45 minutes ago" },
  { id: "APP-5681", candidate: "Sneha Reddy", job: "Data Analyst", company: "DataDriven Co", matchScore: 90, status: "HIRED", time: "1 hour ago" },
  { id: "APP-5682", candidate: "Vikram Singh", job: "Backend Developer", company: "CloudTech Systems", matchScore: 75, status: "REJECTED", time: "2 hours ago" },
];

const topCompanies = [
  { name: "TechCorp Solutions", industry: "IT & Software", activeJobs: 24, applications: 487, hires: 32, rating: 4.8 },
  { name: "InnovateLabs", industry: "Technology", activeJobs: 18, applications: 356, hires: 28, rating: 4.7 },
  { name: "DesignHub Inc", industry: "Design", activeJobs: 12, applications: 234, hires: 18, rating: 4.9 },
  { name: "DataDriven Co", industry: "Analytics", activeJobs: 15, applications: 289, hires: 22, rating: 4.6 },
];

const pendingApprovals = [
  { id: "JOB-001", title: "Senior Software Engineer", company: "NewTech Startup", salary: "₹18-25 LPA", location: "Bangalore", submitted: "2 hours ago" },
  { id: "JOB-002", title: "Marketing Lead", company: "GrowthMax Agency", salary: "₹12-18 LPA", location: "Mumbai", submitted: "3 hours ago" },
  { id: "JOB-003", title: "Finance Manager", company: "FinanceFirst Corp", salary: "₹15-22 LPA", location: "Delhi NCR", submitted: "4 hours ago" },
];

const upcomingInterviews = [
  { candidate: "Rahul Sharma", job: "Senior React Developer", company: "TechCorp", time: "Today, 2:00 PM", type: "Technical" },
  { candidate: "Priya Patel", job: "UI/UX Designer", company: "DesignHub", time: "Today, 4:30 PM", type: "Portfolio Review" },
  { candidate: "Amit Kumar", job: "Product Manager", company: "InnovateLabs", time: "Tomorrow, 11:00 AM", type: "HR Round" },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "SHORTLISTED": return "bg-admin-50 text-admin-700";
    case "INTERVIEW": return "bg-admin-100 text-admin-800";
    case "PENDING": return "bg-amber-50 text-amber-700";
    case "HIRED": return "bg-admin-600 text-white";
    case "REJECTED": return "bg-red-50 text-red-700";
    default: return "bg-gray-100 text-gray-800";
  }
};

const getMatchScoreColor = (score: number) => {
  if (score >= 90) return "text-admin-700 bg-admin-50";
  if (score >= 75) return "text-admin-600 bg-admin-50";
  if (score >= 60) return "text-amber-600 bg-amber-50";
  return "text-red-600 bg-red-50";
};

// Add Category Modal
function AddCategoryModal({ isOpen, onClose, onAdd, existingCount }: { isOpen: boolean; onClose: () => void; onAdd: (category: JobCategory) => void; existingCount: number }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    subCategories: "",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Category name is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const subCategoriesArray = formData.subCategories
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    // Auto-assign color based on existing count
    const autoColor = categoryColors[existingCount % categoryColors.length];

    const newCategory: JobCategory = {
      id: `CAT-${Date.now().toString().slice(-3)}`,
      name: formData.name,
      description: formData.description,
      subCategories: subCategoriesArray.length > 0 ? subCategoriesArray : undefined,
      color: autoColor,
      value: 0,
      status: formData.status,
    };

    onAdd(newCategory);
    setIsSubmitting(false);
    resetAndClose();
  };

  const resetAndClose = () => {
    setFormData({ name: "", description: "", subCategories: "", status: "ACTIVE" });
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={resetAndClose} />
        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-admin-600 to-admin-800 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 backdrop-blur rounded-lg"><FiPlus className="w-5 h-5 text-white" /></div>
                <div><h3 className="text-lg font-semibold text-white">Add Job Category</h3><p className="text-sm text-admin-100">Create a new job category</p></div>
              </div>
              <button onClick={resetAndClose} className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg"><FiX className="w-5 h-5" /></button>
            </div>
          </div>

          <div className="px-6 py-6">
            <div className="space-y-5">
              {/* Category Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., IT & Software"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-admin-500 focus:border-transparent ${errors.name ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Brief description of this job category..."
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-admin-500 focus:border-transparent ${errors.description ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
              </div>

              {/* Sub-Categories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sub-Categories</label>
                <input
                  type="text"
                  name="subCategories"
                  value={formData.subCategories}
                  onChange={handleInputChange}
                  placeholder="e.g., Frontend Developer, Backend Developer, DevOps"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-admin-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Separate multiple sub-categories with commas</p>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-admin-500 focus:border-transparent"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              {/* Preview */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-2">Preview</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-admin-50">
                    <FiLayers className="w-5 h-5 text-admin-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{formData.name || "Category Name"}</p>
                    <p className="text-xs text-gray-500">{formData.description || "Category description"}</p>
                  </div>
                </div>
                {formData.subCategories && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {formData.subCategories.split(",").filter(s => s.trim()).slice(0, 4).map((sub, i) => (
                      <span key={i} className="px-2 py-0.5 text-xs rounded-full bg-admin-100 text-admin-700">{sub.trim()}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
            <button onClick={resetAndClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-admin-600 rounded-lg hover:bg-admin-700 flex items-center gap-2 disabled:bg-admin-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (<><LoadingSpinner size="sm" color="white" />Adding...</>) : (<><FiPlus className="w-4 h-4" />Add Category</>)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function JobsAdminDashboard() {
  // Fetch live data
  const { dashboardData, loading, refetch } = useDashboardData();

  const [selectedPeriod, setSelectedPeriod] = useState("This Month");
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [jobCategories, setJobCategories] = useState<JobCategory[]>(initialJobCategoryData);

  // Use live data or fallback to mock
  const liveJobStats = [
    { label: "Active Jobs", value: loading ? "..." : (dashboardData?.stats?.activeJobs?.toLocaleString() || "0"), change: "+22.8%", changeType: "increase", icon: FiBriefcase, color: "bg-purple-500" },
    { label: "Total Companies", value: loading ? "..." : (dashboardData?.stats?.totalCompanies?.toLocaleString() || "0"), change: "+15.3%", changeType: "increase", icon: FiUsers, color: "bg-blue-500" },
    { label: "Applications", value: loading ? "..." : (dashboardData?.stats?.applications?.toLocaleString() || "0"), change: "+32.5%", changeType: "increase", icon: FiFileText, color: "bg-green-500" },
    { label: "Interviews", value: loading ? "..." : (dashboardData?.stats?.interviews?.toLocaleString() || "0"), change: "+18.2%", changeType: "increase", icon: FiCalendar, color: "bg-orange-500" },
  ];

  const liveRecentApplications = dashboardData?.recentApplications || recentApplications;
  const liveTopCompanies = dashboardData?.topCompanies || topCompanies;
  const livePendingJobs = dashboardData?.pendingJobs || pendingApprovals;
  const liveUpcomingInterviews = dashboardData?.upcomingInterviews || upcomingInterviews;

  const handleAddCategory = (newCategory: JobCategory) => {
    setJobCategories((prev) => [...prev, newCategory]);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Add Category Modal */}
      <AddCategoryModal isOpen={showAddCategoryModal} onClose={() => setShowAddCategoryModal(false)} onAdd={handleAddCategory} existingCount={jobCategories.length} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jobs Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage job postings, applications, and recruitment activities.</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-admin-500">
            <option>This Week</option>
            <option>This Month</option>
            <option>This Quarter</option>
            <option>This Year</option>
          </select>
          <button onClick={() => setShowAddCategoryModal(true)} className="flex items-center gap-2 bg-admin-600 text-white px-4 py-2 rounded-lg hover:bg-admin-700 transition-colors text-sm font-semibold">
            <FiPlus className="w-4 h-4" />Add Category
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {liveJobStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}><Icon className="w-6 h-6 text-white" /></div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${stat.changeType === "increase" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                  {stat.changeType === "increase" ? <FiTrendingUp className="w-3 h-3" /> : <FiTrendingDown className="w-3 h-3" />}
                  {stat.change}
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium">{stat.label}</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-admin-50 rounded-xl p-4 border border-admin-100">
          <div className="flex items-center gap-2 text-admin-600 mb-2"><FiUserCheck className="w-4 h-4" /><span className="text-xs font-medium">Hired</span></div>
          <p className="text-2xl font-bold text-admin-700">{loading ? "..." : (dashboardData?.breakdown?.hired || 0).toLocaleString()}</p>
          <p className="text-xs text-admin-600">this month</p>
        </div>
        <div className="bg-admin-50 rounded-xl p-4 border border-admin-100">
          <div className="flex items-center gap-2 text-admin-600 mb-2"><FiTarget className="w-4 h-4" /><span className="text-xs font-medium">Shortlisted</span></div>
          <p className="text-2xl font-bold text-admin-700">{loading ? "..." : (dashboardData?.breakdown?.shortlisted || 0).toLocaleString()}</p>
          <p className="text-xs text-admin-600">candidates</p>
        </div>
        <div className="bg-admin-50 rounded-xl p-4 border border-admin-100">
          <div className="flex items-center gap-2 text-admin-600 mb-2"><FiCalendar className="w-4 h-4" /><span className="text-xs font-medium">Interviews</span></div>
          <p className="text-2xl font-bold text-admin-700">{loading ? "..." : (dashboardData?.breakdown?.interviews || 0).toLocaleString()}</p>
          <p className="text-xs text-admin-600">today</p>
        </div>
        <div className="bg-admin-50 rounded-xl p-4 border border-admin-100">
          <div className="flex items-center gap-2 text-admin-600 mb-2"><FiClock className="w-4 h-4" /><span className="text-xs font-medium">Pending</span></div>
          <p className="text-2xl font-bold text-admin-700">{loading ? "..." : (dashboardData?.breakdown?.pending || 0).toLocaleString()}</p>
          <p className="text-xs text-admin-600">applications</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 border border-red-100">
          <div className="flex items-center gap-2 text-red-600 mb-2"><FiAlertCircle className="w-4 h-4" /><span className="text-xs font-medium">Expiring</span></div>
          <p className="text-2xl font-bold text-red-700">{loading ? "..." : (dashboardData?.breakdown?.expiring || 0).toLocaleString()}</p>
          <p className="text-xs text-red-600">jobs this week</p>
        </div>
        <div className="bg-admin-50 rounded-xl p-4 border border-admin-100">
          <div className="flex items-center gap-2 text-admin-600 mb-2"><FiUserPlus className="w-4 h-4" /><span className="text-xs font-medium">New Seekers</span></div>
          <p className="text-2xl font-bold text-admin-700">{loading ? "..." : (dashboardData?.breakdown?.newSeekers || 0).toLocaleString()}</p>
          <p className="text-xs text-admin-600">this week</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Application Trend */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Recruitment Trend</h2>
            <select className="text-sm border border-gray-300 rounded-lg px-3 py-1.5"><option>Last 6 Months</option><option>This Year</option></select>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={applicationTrendData}>
              <defs>
                <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#64748b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#64748b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorHires" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1e293b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#1e293b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="applications" stroke="#64748b" fillOpacity={1} fill="url(#colorApps)" name="Applications" strokeWidth={2} />
              <Area type="monotone" dataKey="hires" stroke="#1e293b" fillOpacity={1} fill="url(#colorHires)" name="Hires" strokeWidth={2} />
              <Line type="monotone" dataKey="interviews" stroke="#94a3b8" name="Interviews" strokeWidth={2} dot={{ fill: "#94a3b8" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Job Categories */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Job Categories</h2>
            <span className="text-xs text-gray-500">{jobCategories.length} categories</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={jobCategories} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2} dataKey="value">
                {jobCategories.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {jobCategories.slice(0, 4).map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-gray-600 truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Work Mode Distribution */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Work Mode Distribution</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {workModeDistribution.map((item, index) => (
            <div key={index} className="relative p-4 rounded-xl bg-gradient-to-br from-admin-50 to-admin-100 border border-admin-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-bold text-gray-900">{item.mode}</span>
                <span className="text-2xl font-bold text-admin-600">{item.percentage}%</span>
              </div>
              <div className="w-full bg-admin-200 rounded-full h-2">
                <div className="bg-admin-600 h-2 rounded-full" style={{ width: `${item.percentage}%` }} />
              </div>
              <p className="text-sm text-gray-600 mt-2">{item.count} jobs</p>
            </div>
          ))}
        </div>
      </div>

      {/* Middle Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Applications */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Recent Applications</h2>
            <Link href="/admin/jobs/applications" className="text-sm text-admin-600 font-semibold hover:text-admin-700">View All →</Link>
          </div>
          <div className="space-y-4">
            {liveRecentApplications.map((app: any) => (
              <div key={app.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-admin-100 rounded-full flex items-center justify-center text-admin-600 font-semibold">{app.candidate.split(" ").map((n: string) => n[0]).join("")}</div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{app.candidate}</p>
                    <p className="text-xs text-gray-500">{app.job} • {app.company}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 text-xs font-bold rounded ${getMatchScoreColor(app.matchScore)}`}>{app.matchScore}%</span>
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(app.status)}`}>{app.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Interviews */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Today's Interviews</h2>
            <Link href="/admin/jobs/interviews" className="text-sm text-purple-600 font-semibold hover:text-purple-700">View All →</Link>
          </div>
          <div className="space-y-4">
            {liveUpcomingInterviews.map((interview: any, index: number) => (
              <div key={index} className="p-3 rounded-lg border border-admin-100 bg-admin-50/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-admin-600">{interview.time}</span>
                  <span className="px-2 py-0.5 bg-admin-100 text-admin-700 text-xs font-medium rounded">{interview.type}</span>
                </div>
                <p className="font-medium text-gray-900 text-sm">{interview.candidate}</p>
                <p className="text-xs text-gray-500">{interview.job} • {interview.company}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Companies */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Top Hiring Companies</h2>
          <Link href="/admin/jobs/companies" className="text-sm text-purple-600 font-semibold hover:text-purple-700">View All Companies →</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {liveTopCompanies.map((company: any, index: number) => (
            <div key={index} className="p-4 rounded-xl bg-gradient-to-br from-admin-50 to-admin-100 border border-admin-100">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-admin-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">{company.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}</div>
                <div className="flex items-center gap-1 text-yellow-500"><FiAward className="w-4 h-4" /><span className="text-sm font-semibold">{company.rating}</span></div>
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">{company.name}</h3>
              <p className="text-xs text-gray-500 mb-3">{company.industry}</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div><p className="text-sm font-bold text-admin-600">{company.activeJobs}</p><p className="text-xs text-gray-500">Jobs</p></div>
                <div><p className="text-sm font-bold text-admin-500">{company.applications}</p><p className="text-xs text-gray-500">Apps</p></div>
                <div><p className="text-sm font-bold text-admin-700">{company.hires}</p><p className="text-xs text-gray-500">Hires</p></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Job Approvals */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Pending Job Approvals</h2>
          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">{livePendingJobs.length} pending</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {livePendingJobs.map((job: any) => (
            <div key={job.id} className="p-4 rounded-lg border border-gray-100 hover:border-admin-200 hover:bg-admin-50/30 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2"><FiMapPin className="w-3.5 h-3.5 text-gray-400" /><span className="text-xs text-gray-500">{job.location}</span></div>
                <span className="text-xs text-gray-400">{job.submitted}</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-1">{job.title}</h3>
              <p className="text-xs text-gray-500 mb-2">{job.company}</p>
              <p className="text-sm font-semibold text-admin-600 mb-3">{job.salary}</p>
              <div className="flex gap-2">
                <button className="flex-1 px-3 py-1.5 bg-admin-600 text-white text-xs font-medium rounded-lg hover:bg-admin-700 transition-colors">Approve</button>
                <button className="flex-1 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors">Review</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
