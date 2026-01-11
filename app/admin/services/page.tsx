"use client";

import { useState, useEffect } from "react";
import {
  FiPackage,
  FiSearch,
  FiPlus,
  FiMoreVertical,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiStar,
  FiMapPin,
  FiCalendar,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiDownload,
  FiGrid,
  FiList,
  FiDollarSign,
  FiUsers,
  FiX,
  FiPhone,
  FiMail,
  FiTag,
  FiUpload,
} from "react-icons/fi";
import LoadingSpinner from "@/components/common/LoadingSpinner";

// Service interface
interface Service {
  id: string;
  name: string;
  vendor: string;
  vendorId: string;
  category: string;
  price: string;
  minPrice: number;
  maxPrice: number;
  rating: number;
  reviews: number;
  bookings: number;
  location: string;
  status: string;
  featured: boolean;
  createdAt: string;
  description: string;
  duration: string;
  vendorEmail: string;
  vendorPhone: string;
}

const categories = [
  "All Categories",
  "Home Cleaning",
  "AC Repair",
  "Plumbing",
  "Electrical",
  "Painting",
  "Pest Control",
  "Carpentry",
  "Appliance Repair",
];

// Categories with sub-categories (matching vendor dashboard)
const categoriesWithSubCategories: Record<string, string[]> = {
  "Home Cleaning": ["Regular Cleaning", "Deep Cleaning", "Move-in/Move-out Cleaning", "Kitchen Cleaning", "Bathroom Cleaning"],
  "AC Repair": ["AC Installation", "AC Servicing", "AC Gas Refill", "AC Repair", "AC Uninstallation"],
  "Plumbing": ["Pipe Fitting", "Leak Repair", "Tap Installation", "Drainage Cleaning", "Water Tank Repair"],
  "Electrical": ["Wiring", "Switch Installation", "Fan Installation", "MCB Repair", "Inverter Installation"],
  "Painting": ["Interior Painting", "Exterior Painting", "Texture Painting", "Waterproofing", "Wood Polishing"],
  "Pest Control": ["Cockroach Control", "Termite Control", "Bed Bug Control", "Rodent Control", "Mosquito Control"],
  "Carpentry": ["Furniture Repair", "Door Repair", "Cabinet Making", "Wood Work", "Furniture Assembly"],
  "Appliance Repair": ["Washing Machine Repair", "Refrigerator Repair", "Microwave Repair", "TV Repair", "Geyser Repair"],
};

// Mock vendors data for dropdown
const vendorsData = [
  { id: "VND-001", name: "CleanPro Services", email: "contact@cleanpro.com", phone: "+91 98765 43210" },
  { id: "VND-002", name: "CoolTech Services", email: "support@cooltech.com", phone: "+91 98765 12345" },
  { id: "VND-003", name: "FixIt Plumbers", email: "info@fixitplumbers.com", phone: "+91 99887 65432" },
  { id: "VND-004", name: "PowerFix Electric", email: "support@powerfix.com", phone: "+91 98123 45678" },
  { id: "VND-005", name: "ColorMaster Paints", email: "hello@colormaster.com", phone: "+91 87654 32109" },
  { id: "VND-006", name: "BugFree Solutions", email: "care@bugfree.com", phone: "+91 76543 21098" },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "ACTIVE":
    case "APPROVED":
      return { bg: "bg-green-100", text: "text-green-700" };
    case "PENDING":
      return { bg: "bg-amber-50", text: "text-amber-700" };
    case "INACTIVE":
      return { bg: "bg-gray-100", text: "text-gray-800" };
    case "SUSPENDED":
    case "REJECTED":
      return { bg: "bg-red-50", text: "text-red-700" };
    default:
      return { bg: "bg-gray-100", text: "text-gray-800" };
  }
};

// View Details Modal Component
function ViewDetailsModal({ service, isOpen, onClose }: { service: Service | null; isOpen: boolean; onClose: () => void }) {
  if (!isOpen || !service) return null;
  const statusBadge = getStatusBadge(service.status);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                <p className="text-sm text-gray-500">{service.id}</p>
              </div>
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <FiX className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-6">
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusBadge.bg} ${statusBadge.text}`}>{service.status}</span>
              {service.featured && (
                <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full flex items-center gap-1">
                  <FiStar className="w-3 h-3" /> Featured
                </span>
              )}
            </div>
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Description</h4>
              <p className="text-gray-600">{service.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-500 mb-1"><FiTag className="w-4 h-4" /><span className="text-xs font-medium">Category</span></div>
                <p className="font-semibold text-gray-900">{service.category}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-500 mb-1"><FiDollarSign className="w-4 h-4" /><span className="text-xs font-medium">Price Range</span></div>
                <p className="font-semibold text-gray-900">{service.price}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-500 mb-1"><FiClock className="w-4 h-4" /><span className="text-xs font-medium">Duration</span></div>
                <p className="font-semibold text-gray-900">{service.duration}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-500 mb-1"><FiMapPin className="w-4 h-4" /><span className="text-xs font-medium">Location</span></div>
                <p className="font-semibold text-gray-900">{service.location}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-amber-50 rounded-lg">
                <div className="flex items-center justify-center gap-1 text-amber-600 mb-1"><FiStar className="w-5 h-5 fill-current" /><span className="text-2xl font-bold">{service.rating}</span></div>
                <p className="text-xs text-amber-700">Rating</p>
              </div>
              <div className="text-center p-4 bg-primary-50 rounded-lg">
                <p className="text-2xl font-bold text-primary-600">{service.reviews}</p>
                <p className="text-xs text-primary-700">Reviews</p>
              </div>
              <div className="text-center p-4 bg-primary-100 rounded-lg">
                <p className="text-2xl font-bold text-primary-800">{service.bookings}</p>
                <p className="text-xs text-primary-600">Bookings</p>
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Vendor Information</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center"><FiUsers className="w-5 h-5 text-primary-600" /></div>
                  <div><p className="font-semibold text-gray-900">{service.vendor}</p><p className="text-xs text-gray-500">{service.vendorId}</p></div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600"><FiMail className="w-4 h-4" /><span>{service.vendorEmail}</span></div>
                <div className="flex items-center gap-2 text-sm text-gray-600"><FiPhone className="w-4 h-4" /><span>{service.vendorPhone}</span></div>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500 flex items-center gap-2"><FiCalendar className="w-4 h-4" /><span>Created on {service.createdAt}</span></div>
          </div>
          <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add Service Modal Component - SIMPLIFIED VERSION
function AddServiceModal({ isOpen, onClose, onAdd }: { isOpen: boolean; onClose: () => void; onAdd: (newService: Service) => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Add New Service</h3>
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <FiX className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="px-6 py-6">
            <p className="text-gray-600 mb-4">Please use the vendor dashboard to add new services. This ensures all service details are properly configured.</p>
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <p className="text-sm text-primary-800">
                <strong>Tip:</strong> Vendors can add services from their dashboard at /vendor/services
              </p>
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-4 flex justify-end">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Edit Service Modal Component
function EditServiceModal({ service, isOpen, onClose, onSave }: { service: Service | null; isOpen: boolean; onClose: () => void; onSave: (updatedService: Service) => void }) {
  const [formData, setFormData] = useState({ name: "", description: "", category: "Home Cleaning", status: "ACTIVE", minPrice: 0, maxPrice: 0, duration: "", location: "", featured: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isOpen && service && formData.name !== service.name) {
    setFormData({ name: service.name, description: service.description, category: service.category, status: service.status, minPrice: service.minPrice, maxPrice: service.maxPrice, duration: service.duration, location: service.location, featured: service.featured });
  }

  if (!isOpen || !service) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === "minPrice" || name === "maxPrice" ? Number(value) : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.checked }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name?.trim()) newErrors.name = "Service name is required";
    if (!formData.description?.trim()) newErrors.description = "Description is required";
    if (!formData.minPrice || formData.minPrice <= 0) newErrors.minPrice = "Valid minimum price is required";
    if (!formData.maxPrice || formData.maxPrice <= 0) newErrors.maxPrice = "Valid maximum price is required";
    if (formData.minPrice && formData.maxPrice && formData.minPrice > formData.maxPrice) newErrors.maxPrice = "Max price must be greater than min price";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    const updatedService: Service = { ...service, name: formData.name, description: formData.description, category: formData.category, status: formData.status, minPrice: formData.minPrice, maxPrice: formData.maxPrice, duration: formData.duration, location: formData.location, featured: formData.featured, price: `₹${formData.minPrice.toLocaleString()} - ₹${formData.maxPrice.toLocaleString()}` };
    onSave(updatedService);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-50 rounded-lg"><FiEdit2 className="w-5 h-5 text-primary-600" /></div>
                <div><h3 className="text-lg font-semibold text-gray-900">Edit Service</h3><p className="text-sm text-gray-500">{service.id}</p></div>
              </div>
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"><FiX className="w-5 h-5" /></button>
            </div>
          </div>
          <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.name ? "border-red-500" : "border-gray-300"}`} />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.description ? "border-red-500" : "border-gray-300"}`} />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                    {categories.filter((c) => c !== "All Categories").map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select name="status" value={formData.status} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                    <option value="ACTIVE">Active</option>
                    <option value="APPROVED">Approved</option>
                    <option value="PENDING">Pending</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Price (₹) *</label>
                  <input type="number" name="minPrice" value={formData.minPrice} onChange={handleInputChange} className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.minPrice ? "border-red-500" : "border-gray-300"}`} />
                  {errors.minPrice && <p className="text-red-500 text-xs mt-1">{errors.minPrice}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Price (₹) *</label>
                  <input type="number" name="maxPrice" value={formData.maxPrice} onChange={handleInputChange} className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.maxPrice ? "border-red-500" : "border-gray-300"}`} />
                  {errors.maxPrice && <p className="text-red-500 text-xs mt-1">{errors.maxPrice}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                  <input type="text" name="duration" value={formData.duration} onChange={handleInputChange} placeholder="e.g., 2-3 hours" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input type="text" name="location" value={formData.location} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-primary-50 rounded-lg">
                <input type="checkbox" name="featured" id="editFeatured" checked={formData.featured} onChange={handleCheckboxChange} className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <label htmlFor="editFeatured" className="flex-1">
                  <span className="font-medium text-gray-900">Mark as Featured</span>
                  <p className="text-xs text-gray-500">Featured services appear prominently on the platform</p>
                </label>
                <FiStar className="w-5 h-5 text-primary-500" />
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Vendor Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-500">Vendor:</span><span className="ml-2 text-gray-900">{service.vendor}</span></div>
                  <div><span className="text-gray-500">Vendor ID:</span><span className="ml-2 text-gray-900">{service.vendorId}</span></div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button onClick={handleSubmit} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 flex items-center gap-2 disabled:bg-primary-400 disabled:cursor-not-allowed">
              {isSubmitting ? (<><LoadingSpinner size="sm" color="white" />Saving...</>) : (<><FiCheckCircle className="w-4 h-4" />Save Changes</>)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ServicesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All Categories");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Fetch services from API
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/services/all');
      const data = await response.json();

      if (data.success) {
        setServices(data.services);
      } else {
        setError(data.message || 'Failed to fetch services');
      }
    } catch (err) {
      setError('Network error: Could not fetch services. Make sure the server is running.');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter((service) => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) || service.vendor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "All Categories" || service.category === filterCategory;
    const matchesStatus = filterStatus === "all" || service.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const stats = {
    total: services.length,
    active: services.filter((s) => s.status === "ACTIVE" || s.status === "APPROVED").length,
    pending: services.filter((s) => s.status === "PENDING").length,
    featured: services.filter((s) => s.featured).length
  };

  const toggleSelectAll = () => {
    if (selectedServices.length === filteredServices.length) setSelectedServices([]);
    else setSelectedServices(filteredServices.map((s) => s.id));
  };

  const handleViewDetails = (service: Service) => { setSelectedService(service); setViewModalOpen(true); setShowActionMenu(null); };
  const handleEditService = (service: Service) => { setSelectedService(service); setEditModalOpen(true); setShowActionMenu(null); };
  const handleSaveService = (updatedService: Service) => { setServices((prev) => prev.map((s) => (s.id === updatedService.id ? updatedService : s))); };
  const handleToggleFeatured = (serviceId: string) => { setServices((prev) => prev.map((s) => (s.id === serviceId ? { ...s, featured: !s.featured } : s))); setShowActionMenu(null); };
  const handleToggleStatus = (serviceId: string, newStatus: string) => { setServices((prev) => prev.map((s) => (s.id === serviceId ? { ...s, status: newStatus } : s))); setShowActionMenu(null); };
  const handleDeleteService = (serviceId: string) => { if (confirm("Are you sure you want to delete this service?")) { setServices((prev) => prev.filter((s) => s.id !== serviceId)); setShowActionMenu(null); } };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <LoadingSpinner size="lg" color="primary" />
            <p className="text-gray-600">Loading live services data...</p>
            <p className="text-sm text-gray-500 mt-2">Fetching from database...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3 text-red-800 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <FiPackage className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">Error Loading Services</h3>
              <p className="text-sm">{error}</p>
            </div>
          </div>
          <div className="space-y-2 text-sm text-red-700">
            <p><strong>Troubleshooting steps:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Make sure your development server is running (npm run dev)</li>
              <li>Check your database connection in .env file</li>
              <li>Verify the API endpoint is accessible at /api/admin/services/all</li>
            </ul>
          </div>
          <button
            onClick={fetchServices}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <ViewDetailsModal service={selectedService} isOpen={viewModalOpen} onClose={() => setViewModalOpen(false)} />
      <EditServiceModal service={selectedService} isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} onSave={handleSaveService} />
      <AddServiceModal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} onAdd={(newService) => setServices((prev) => [newService, ...prev])} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">All Services</h1>
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full border border-green-200">LIVE DATA</span>
          </div>
          <p className="text-gray-600 mt-1">
            {services.length === 0
              ? "No services found. Start by adding services through vendors."
              : "Manage all services listed on the platform - showing live data from database."
            }
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"><FiDownload className="w-4 h-4" />Export</button>
          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-2 bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700 text-sm font-semibold transition-colors"
          ><FiPlus className="w-4 h-4" />Add Service</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center"><FiPackage className="w-5 h-5 text-primary-600" /></div>
            <div><p className="text-2xl font-bold text-gray-900">{stats.total}</p><p className="text-xs text-gray-500">Total Services</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center"><FiCheckCircle className="w-5 h-5 text-primary-600" /></div>
            <div><p className="text-2xl font-bold text-gray-900">{stats.active}</p><p className="text-xs text-gray-500">Active</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center"><FiClock className="w-5 h-5 text-amber-600" /></div>
            <div><p className="text-2xl font-bold text-gray-900">{stats.pending}</p><p className="text-xs text-gray-500">Pending</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center"><FiStar className="w-5 h-5 text-primary-600" /></div>
            <div><p className="text-2xl font-bold text-gray-900">{stats.featured}</p><p className="text-xs text-gray-500">Featured</p></div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="text" placeholder="Search services or vendors..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" />
          </div>
          <div className="flex flex-wrap gap-3">
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none cursor-pointer">
              {categories.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none cursor-pointer">
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="APPROVED">Approved</option>
              <option value="PENDING">Pending</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button onClick={() => setViewMode("table")} className={`p-2.5 ${viewMode === "table" ? "bg-primary-50 text-primary-600" : "text-gray-500 hover:bg-gray-50"}`}><FiList className="w-5 h-5" /></button>
              <button onClick={() => setViewMode("grid")} className={`p-2.5 ${viewMode === "grid" ? "bg-primary-50 text-primary-600" : "text-gray-500 hover:bg-gray-50"}`}><FiGrid className="w-5 h-5" /></button>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedServices.length > 0 && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 flex items-center justify-between">
          <span className="text-sm font-medium text-primary-700">{selectedServices.length} service(s) selected</span>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700">Approve</button>
            <button className="px-3 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700">Feature</button>
            <button className="px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700">Suspend</button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredServices.length === 0 && (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12 text-center">
          <FiPackage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {services.length === 0 ? "No Services in Database" : "No Services Found"}
          </h3>
          <p className="text-gray-600 mb-6">
            {services.length === 0
              ? "Your database is empty. Get started by having vendors add their services."
              : "Try adjusting your search or filters to find services."
            }
          </p>
          {services.length === 0 && (
            <div className="space-y-3">
              <button
                onClick={() => setAddModalOpen(true)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-semibold transition-colors"
              >
                Add First Service
              </button>
            </div>
          )}
        </div>
      )}

      {/* Services List */}
      {viewMode === "table" && filteredServices.length > 0 && (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left"><input type="checkbox" checked={selectedServices.length === filteredServices.length && filteredServices.length > 0} onChange={toggleSelectAll} className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" /></th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Service</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Vendor</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Bookings</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredServices.map((service) => {
                  const statusBadge = getStatusBadge(service.status);
                  return (
                    <tr key={service.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4"><input type="checkbox" checked={selectedServices.includes(service.id)} onChange={() => setSelectedServices((prev) => prev.includes(service.id) ? prev.filter((id) => id !== service.id) : [...prev, service.id])} className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" /></td>
                      <td className="px-6 py-4">
                        <div><p className="font-medium text-gray-900">{service.name}</p>{service.featured && <span className="text-xs text-primary-600 font-medium">⭐ Featured</span>}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div><p className="text-sm text-gray-900">{service.vendor}</p><p className="text-xs text-gray-500 flex items-center gap-1"><FiMapPin className="w-3 h-3" />{service.location}</p></div>
                      </td>
                      <td className="px-6 py-4"><span className="px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full">{service.category}</span></td>
                      <td className="px-6 py-4"><p className="text-sm font-medium text-gray-900">{service.price}</p></td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1"><FiStar className="w-4 h-4 text-yellow-400 fill-current" /><span className="text-sm font-medium text-gray-900">{service.rating}</span><span className="text-xs text-gray-500">({service.reviews})</span></div>
                      </td>
                      <td className="px-6 py-4"><p className="text-sm font-medium text-gray-900">{service.bookings}</p></td>
                      <td className="px-6 py-4"><span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusBadge.bg} ${statusBadge.text}`}>{service.status}</span></td>
                      <td className="px-6 py-4">
                        <div className="relative">
                          <button onClick={() => setShowActionMenu(showActionMenu === service.id ? null : service.id)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"><FiMoreVertical className="w-4 h-4" /></button>
                          {showActionMenu === service.id && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                              <button onClick={() => handleViewDetails(service)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><FiEye className="w-4 h-4" />View Details</button>
                              <button onClick={() => handleEditService(service)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><FiEdit2 className="w-4 h-4" />Edit Service</button>
                              <button onClick={() => handleToggleFeatured(service.id)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-primary-600 hover:bg-primary-50"><FiStar className="w-4 h-4" />{service.featured ? "Remove Featured" : "Mark Featured"}</button>
                              <hr className="my-1" />
                              {service.status === "ACTIVE" || service.status === "APPROVED" ? (
                                <button onClick={() => handleToggleStatus(service.id, "SUSPENDED")} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-yellow-600 hover:bg-yellow-50"><FiXCircle className="w-4 h-4" />Suspend</button>
                              ) : (
                                <button onClick={() => handleToggleStatus(service.id, "APPROVED")} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-primary-600 hover:bg-primary-50"><FiCheckCircle className="w-4 h-4" />Activate</button>
                              )}
                              <button onClick={() => handleDeleteService(service.id)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"><FiTrash2 className="w-4 h-4" />Delete</button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">Showing {filteredServices.length} of {services.length} services (live data)</p>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50" disabled>Previous</button>
              <button className="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm">1</button>
              <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Next</button>
            </div>
          </div>
        </div>
      )}

      {/* Grid View */}
      {viewMode === "grid" && filteredServices.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => {
            const statusBadge = getStatusBadge(service.status);
            return (
              <div key={service.id} className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {service.featured && <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">Featured</span>}
                    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${statusBadge.bg} ${statusBadge.text}`}>{service.status}</span>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{service.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{service.vendor}</p>
                <div className="flex items-center gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-1 text-yellow-500"><FiStar className="w-4 h-4 fill-current" /><span className="font-medium text-gray-900">{service.rating}</span><span className="text-xs text-gray-500">({service.reviews})</span></div>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-500">{service.bookings} bookings</span>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <p className="font-bold text-primary-600">{service.price}</p>
                  <div className="flex gap-1">
                    <button onClick={() => handleViewDetails(service)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"><FiEye className="w-4 h-4" /></button>
                    <button onClick={() => handleEditService(service)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"><FiEdit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteService(service.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><FiTrash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
