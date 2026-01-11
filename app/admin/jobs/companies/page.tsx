"use client";

import { useState, useEffect } from "react";
import {
  FiSearch,
  FiPlus,
  FiEye,
  FiEdit2,
  FiMapPin,
  FiBriefcase,
  FiUsers,
  FiCheckCircle,
  FiStar,
  FiX,
  FiMail,
  FiGlobe,
  FiPhone,
  FiHome,
  FiFileText,
} from "react-icons/fi";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface Company {
  id: string;
  name: string;
  industry: string;
  email: string;
  phone: string;
  website: string;
  location: string;
  address: string;
  size: string;
  activeJobs: number;
  totalApplications: number;
  hires: number;
  rating: number;
  status: string;
  verified: boolean;
  joinDate: string;
  description: string;
  logo: string;
}

const initialCompaniesData: Company[] = [
  {
    id: "CMP-001",
    name: "TechCorp Solutions",
    industry: "Information Technology",
    email: "hr@techcorp.com",
    phone: "+91 9876543210",
    website: "www.techcorp.com",
    location: "Bangalore",
    address: "123 Tech Park, Whitefield, Bangalore 560066",
    size: "500-1000",
    activeJobs: 24,
    totalApplications: 487,
    hires: 32,
    rating: 4.8,
    status: "ACTIVE",
    verified: true,
    joinDate: "Jan 2024",
    description: "Leading IT solutions provider specializing in enterprise software development and cloud services.",
    logo: "T",
  },
  {
    id: "CMP-002",
    name: "InnovateLabs",
    industry: "Software Development",
    email: "careers@innovatelabs.com",
    phone: "+91 9876543211",
    website: "www.innovatelabs.com",
    location: "Pune",
    address: "456 Innovation Hub, Hinjewadi, Pune 411057",
    size: "100-500",
    activeJobs: 18,
    totalApplications: 356,
    hires: 28,
    rating: 4.7,
    status: "ACTIVE",
    verified: true,
    joinDate: "Feb 2024",
    description: "Innovative software development company focused on cutting-edge technologies and digital transformation.",
    logo: "I",
  },
  {
    id: "CMP-003",
    name: "DesignHub Inc",
    industry: "Design & Creative",
    email: "jobs@designhub.com",
    phone: "+91 9876543212",
    website: "www.designhub.com",
    location: "Mumbai",
    address: "789 Creative Tower, Andheri, Mumbai 400053",
    size: "50-100",
    activeJobs: 12,
    totalApplications: 234,
    hires: 15,
    rating: 4.6,
    status: "ACTIVE",
    verified: true,
    joinDate: "Mar 2024",
    description: "Award-winning design agency offering UI/UX, branding, and creative solutions.",
    logo: "D",
  },
  {
    id: "CMP-004",
    name: "DataDriven Co",
    industry: "Data Analytics",
    email: "hr@datadriven.com",
    phone: "+91 9876543213",
    website: "www.datadriven.com",
    location: "Hyderabad",
    address: "321 Data Center, HITEC City, Hyderabad 500081",
    size: "100-500",
    activeJobs: 8,
    totalApplications: 189,
    hires: 12,
    rating: 4.5,
    status: "ACTIVE",
    verified: false,
    joinDate: "Apr 2024",
    description: "Data analytics and business intelligence company helping businesses make data-driven decisions.",
    logo: "D",
  },
  {
    id: "CMP-005",
    name: "GrowthMax Agency",
    industry: "Marketing",
    email: "careers@growthmax.com",
    phone: "+91 9876543214",
    website: "www.growthmax.com",
    location: "Delhi NCR",
    address: "555 Marketing Plaza, Gurgaon 122001",
    size: "50-100",
    activeJobs: 6,
    totalApplications: 145,
    hires: 8,
    rating: 4.4,
    status: "PENDING",
    verified: false,
    joinDate: "Nov 2024",
    description: "Full-service digital marketing agency specializing in growth hacking and brand building.",
    logo: "G",
  },
];

const industries = [
  "Information Technology",
  "Software Development",
  "Design & Creative",
  "Data Analytics",
  "Marketing",
  "Finance",
  "Healthcare",
  "E-commerce",
  "Education",
  "Manufacturing",
];

const companySizes = ["1-10", "11-50", "50-100", "100-500", "500-1000", "1000-5000", "5000+"];

const locations = ["Bangalore", "Mumbai", "Delhi NCR", "Hyderabad", "Pune", "Chennai", "Kolkata", "Ahmedabad"];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return { bg: "bg-green-100", text: "text-green-700", border: "border-green-200" };
    case "PENDING":
      return { bg: "bg-amber-50", text: "text-amber-800" };
    case "SUSPENDED":
      return { bg: "bg-red-50", text: "text-red-800" };
    default:
      return { bg: "bg-gray-50", text: "text-gray-800" };
  }
};

// Add Company Modal Component
function AddCompanyModal({ isOpen, onClose, onAdd }: { isOpen: boolean; onClose: () => void; onAdd: (company: Company) => void }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "", industry: "", email: "", phone: "", website: "", location: "", address: "", size: "", description: "", status: "ACTIVE", verified: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = "Company name is required";
      if (!formData.industry) newErrors.industry = "Industry is required";
      if (!formData.size) newErrors.size = "Company size is required";
    } else if (step === 2) {
      if (!formData.email.trim()) newErrors.email = "Email is required";
      if (!formData.phone.trim()) newErrors.phone = "Phone is required";
      if (!formData.location) newErrors.location = "Location is required";
    } else if (step === 3) {
      if (!formData.description.trim()) newErrors.description = "Description is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => { if (validateStep(currentStep)) setCurrentStep((prev) => prev + 1); };
  const handleBack = () => setCurrentStep((prev) => prev - 1);

  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    setIsSubmitting(true);

    try {
      console.log('📤 Submitting company to API...');

      const response = await fetch('/api/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log('📥 API Response:', data);

      if (data.success && data.company) {
        console.log('✅ Company created successfully!');
        onAdd(data.company);
        alert('✅ Company created and saved to database!');
        resetAndClose();
      } else {
        console.error('❌ API Error:', data);
        alert('❌ Error: ' + (data.message || 'Failed to create company'));
      }
    } catch (error) {
      console.error('❌ Network Error:', error);
      alert('❌ Failed to create company. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setFormData({ name: "", industry: "", email: "", phone: "", website: "", location: "", address: "", size: "", description: "", status: "ACTIVE", verified: false });
    setErrors({});
    setCurrentStep(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={resetAndClose} />
        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 backdrop-blur rounded-lg"><FiPlus className="w-5 h-5 text-white" /></div>
                <div><h3 className="text-lg font-semibold text-white">Add New Company</h3><p className="text-sm text-primary-100">Register a new company on the platform</p></div>
              </div>
              <button onClick={resetAndClose} className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg"><FiX className="w-5 h-5" /></button>
            </div>
          </div>

          {/* Step Indicator */}
          <div className="px-6 pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${currentStep >= 1 ? "bg-primary-600 border-primary-600 text-white" : "border-gray-300 text-gray-400"}`}>
                  <FiHome className="w-5 h-5" />
                </div>
                <div className="ml-3 hidden sm:block"><p className={`text-sm font-medium ${currentStep >= 1 ? "text-primary-600" : "text-gray-500"}`}>Company Info</p></div>
                <div className={`w-12 sm:w-24 h-1 mx-4 rounded ${currentStep > 1 ? "bg-primary-600" : "bg-gray-200"}`} />
              </div>
              <div className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${currentStep >= 2 ? "bg-primary-600 border-primary-600 text-white" : "border-gray-300 text-gray-400"}`}>
                  <FiMail className="w-5 h-5" />
                </div>
                <div className="ml-3 hidden sm:block"><p className={`text-sm font-medium ${currentStep >= 2 ? "text-primary-600" : "text-gray-500"}`}>Contact Details</p></div>
                <div className={`w-12 sm:w-24 h-1 mx-4 rounded ${currentStep > 2 ? "bg-primary-600" : "bg-gray-200"}`} />
              </div>
              <div className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${currentStep >= 3 ? "bg-primary-600 border-primary-600 text-white" : "border-gray-300 text-gray-400"}`}>
                  <FiFileText className="w-5 h-5" />
                </div>
                <div className="ml-3 hidden sm:block"><p className={`text-sm font-medium ${currentStep >= 3 ? "text-primary-600" : "text-gray-500"}`}>Description</p></div>
              </div>
            </div>
          </div>

          <div className="px-6 py-6">
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g., TechCorp Solutions"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.name ? "border-red-500" : "border-gray-300"}`} />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Industry *</label>
                    <select name="industry" value={formData.industry} onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.industry ? "border-red-500" : "border-gray-300"}`}>
                      <option value="">Select Industry</option>
                      {industries.map((ind) => (<option key={ind} value={ind}>{ind}</option>))}
                    </select>
                    {errors.industry && <p className="text-red-500 text-xs mt-1">{errors.industry}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Size *</label>
                    <select name="size" value={formData.size} onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.size ? "border-red-500" : "border-gray-300"}`}>
                      <option value="">Select Size</option>
                      {companySizes.map((size) => (<option key={size} value={size}>{size} employees</option>))}
                    </select>
                    {errors.size && <p className="text-red-500 text-xs mt-1">{errors.size}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <div className="relative">
                    <FiGlobe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input type="text" name="website" value={formData.website} onChange={handleInputChange} placeholder="www.example.com"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="hr@company.com"
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.email ? "border-red-500" : "border-gray-300"}`} />
                    </div>
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                    <div className="relative">
                      <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+91 9876543210"
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.phone ? "border-red-500" : "border-gray-300"}`} />
                    </div>
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                  <select name="location" value={formData.location} onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.location ? "border-red-500" : "border-gray-300"}`}>
                    <option value="">Select Location</option>
                    {locations.map((loc) => (<option key={loc} value={loc}>{loc}</option>))}
                  </select>
                  {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
                  <textarea name="address" value={formData.address} onChange={handleInputChange} rows={2} placeholder="Enter complete office address"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Description *</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} rows={4}
                    placeholder="Describe the company, its mission, and what makes it unique..."
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.description ? "border-red-500" : "border-gray-300"}`} />
                  {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Initial Status</label>
                  <select name="status" value={formData.status} onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                    <option value="ACTIVE">Active</option>
                    <option value="PENDING">Pending Review</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
                  <input type="checkbox" name="verified" checked={formData.verified} onChange={handleInputChange}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
                  <FiCheckCircle className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-700">Mark as Verified Company</span>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-between">
            <button onClick={currentStep === 1 ? resetAndClose : handleBack}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              {currentStep === 1 ? "Cancel" : "Back"}
            </button>
            {currentStep < 3 ? (
              <button onClick={handleNext} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700">Next</button>
            ) : (
              <button onClick={handleSubmit} disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 flex items-center gap-2 disabled:bg-primary-400 disabled:cursor-not-allowed">
                {isSubmitting ? (<><LoadingSpinner size="sm" color="white" />Adding...</>) : (<><FiCheckCircle className="w-4 h-4" />Add Company</>)}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// View Company Modal
function ViewCompanyModal({ isOpen, onClose, company }: { isOpen: boolean; onClose: () => void; company: Company | null }) {
  if (!isOpen || !company) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center text-white text-2xl font-bold">{company.logo}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-white">{company.name}</h3>
                    {company.verified && <FiCheckCircle className="w-5 h-5 text-blue-300" />}
                  </div>
                  <p className="text-sm text-primary-100">{company.industry}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg"><FiX className="w-5 h-5" /></button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-primary-50 rounded-lg p-4 text-center">
                <FiBriefcase className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-primary-600">{company.activeJobs}</p>
                <p className="text-xs text-gray-500">Active Jobs</p>
              </div>
              <div className="bg-primary-50 rounded-lg p-4 text-center">
                <FiUsers className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-primary-600">{company.hires}</p>
                <p className="text-xs text-gray-500">Total Hires</p>
              </div>
              <div className="bg-primary-50 rounded-lg p-4 text-center">
                <FiFileText className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-primary-600">{company.totalApplications}</p>
                <p className="text-xs text-gray-500">Applications</p>
              </div>
              <div className="bg-primary-50 rounded-lg p-4 text-center">
                <FiStar className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-primary-600">{company.rating || "N/A"}</p>
                <p className="text-xs text-gray-500">Rating</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">About Company</h4>
              <p className="text-gray-700">{company.description}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Contact Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm"><FiMail className="w-4 h-4 text-gray-400" /><span className="text-gray-600">{company.email}</span></div>
                <div className="flex items-center gap-2 text-sm"><FiPhone className="w-4 h-4 text-gray-400" /><span className="text-gray-600">{company.phone}</span></div>
                <div className="flex items-center gap-2 text-sm"><FiGlobe className="w-4 h-4 text-gray-400" /><span className="text-gray-600">{company.website}</span></div>
                <div className="flex items-center gap-2 text-sm"><FiMapPin className="w-4 h-4 text-gray-400" /><span className="text-gray-600">{company.location}</span></div>
              </div>
              {company.address && (<div className="mt-3 pt-3 border-t border-gray-200"><p className="text-sm text-gray-600">{company.address}</p></div>)}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
              <div className="text-center"><p className="text-xs text-gray-500">Company Size</p><p className="text-sm font-medium text-gray-900">{company.size} employees</p></div>
              <div className="text-center"><p className="text-xs text-gray-500">Joined</p><p className="text-sm font-medium text-gray-900">{company.joinDate}</p></div>
              <div className="text-center"><p className="text-xs text-gray-500">Status</p><span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${getStatusBadge(company.status).bg} ${getStatusBadge(company.status).text}`}>{company.status}</span></div>
              <div className="text-center"><p className="text-xs text-gray-500">Verified</p><p className="text-sm font-medium text-gray-900">{company.verified ? "Yes ✓" : "No"}</p></div>
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

// Edit Company Modal
function EditCompanyModal({ isOpen, onClose, company, onSave }: { isOpen: boolean; onClose: () => void; company: Company | null; onSave: (company: Company) => void }) {
  const [formData, setFormData] = useState({
    name: company?.name || "", industry: company?.industry || "", email: company?.email || "", phone: company?.phone || "",
    website: company?.website || "", location: company?.location || "", address: company?.address || "", size: company?.size || "",
    description: company?.description || "", status: company?.status || "ACTIVE", verified: company?.verified || false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !company) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Company name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    onSave({
      ...company, name: formData.name, industry: formData.industry, email: formData.email, phone: formData.phone,
      website: formData.website, location: formData.location, address: formData.address, size: formData.size,
      description: formData.description, status: formData.status, verified: formData.verified, logo: formData.name.charAt(0).toUpperCase(),
    });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 backdrop-blur rounded-lg"><FiEdit2 className="w-5 h-5 text-white" /></div>
                <div><h3 className="text-lg font-semibold text-white">Edit Company</h3><p className="text-sm text-primary-100">Update company details</p></div>
              </div>
              <button onClick={onClose} className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg"><FiX className="w-5 h-5" /></button>
            </div>
          </div>

          <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.name ? "border-red-500" : "border-gray-300"}`} />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                <select name="industry" value={formData.industry} onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                  {industries.map((ind) => (<option key={ind} value={ind}>{ind}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Size</label>
                <select name="size" value={formData.size} onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                  {companySizes.map((size) => (<option key={size} value={size}>{size}</option>))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.email ? "border-red-500" : "border-gray-300"}`} />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <select name="location" value={formData.location} onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                {locations.map((loc) => (<option key={loc} value={loc}>{loc}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                  <option value="ACTIVE">Active</option><option value="PENDING">Pending</option><option value="SUSPENDED">Suspended</option>
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg cursor-pointer">
                  <input type="checkbox" name="verified" checked={formData.verified} onChange={handleInputChange}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
                  <FiCheckCircle className="w-4 h-4 text-blue-500" /><span className="text-sm text-gray-700">Verified</span>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button onClick={handleSubmit} disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:bg-primary-400 disabled:cursor-not-allowed flex items-center gap-2">
              {isSubmitting ? (<><LoadingSpinner size="sm" color="white" />Saving...</>) : (<><FiCheckCircle className="w-4 h-4" />Save Changes</>)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [liveStats, setLiveStats] = useState({
    totalCompanies: 0,
    activeCompanies: 0,
    totalActiveJobs: 0,
    totalHires: 0
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewModal, setViewModal] = useState<{ isOpen: boolean; company: Company | null }>({ isOpen: false, company: null });
  const [editModal, setEditModal] = useState<{ isOpen: boolean; company: Company | null }>({ isOpen: false, company: null });

  // Fetch live companies data from jobs endpoint
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        console.log('🔄 Fetching jobs to extract company data...');
        const response = await fetch('/api/jobs');

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ Jobs data received:', data);

        if (data.success && data.jobs) {
          // Extract unique companies from jobs
          const companiesMap = new Map<string, any>();

          data.jobs.forEach((job: any) => {
            const companyId = job.employerId;
            const companyName = job.companyName || job.employer?.name || 'Unknown';

            if (!companiesMap.has(companyId)) {
              companiesMap.set(companyId, {
                id: companyId,
                name: companyName,
                industry: 'Technology',
                email: job.employer?.email || 'N/A',
                phone: 'N/A',
                website: 'N/A',
                location: job.city || job.location || 'India',
                address: 'N/A',
                size: '1-10',
                activeJobs: 0,
                totalApplications: 0,
                hires: 0,
                rating: 0,
                status: 'ACTIVE',
                verified: job.employer?.verified || false,
                joinDate: new Date(job.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                description: 'Company registered on the platform',
                logo: companyName.charAt(0).toUpperCase(),
              });
            }

            // Update stats for this company
            const company = companiesMap.get(companyId);
            if (job.status === 'ACTIVE') {
              company.activeJobs++;
            }
            company.totalApplications += job._count?.applications || 0;
          });

          const companiesList = Array.from(companiesMap.values());
          setCompanies(companiesList);

          // Calculate stats
          const stats = {
            totalCompanies: companiesList.length,
            activeCompanies: companiesList.filter(c => c.status === 'ACTIVE').length,
            totalActiveJobs: companiesList.reduce((sum, c) => sum + c.activeJobs, 0),
            totalHires: companiesList.reduce((sum, c) => sum + c.hires, 0),
          };
          setLiveStats(stats);

          console.log(`✅ Extracted ${companiesList.length} companies from jobs`);
        } else {
          console.error('❌ API returned success: false');
          setCompanies([]);
        }
      } catch (error) {
        console.error('❌ Error fetching companies:', error);
        setCompanies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase()) || company.industry.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || company.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: liveStats.totalCompanies || companies.length,
    active: liveStats.activeCompanies || companies.filter((c) => c.status === "ACTIVE").length,
    totalJobs: liveStats.totalActiveJobs || companies.reduce((sum, c) => sum + c.activeJobs, 0),
    totalHires: liveStats.totalHires || companies.reduce((sum, c) => sum + c.hires, 0),
  };

  const handleAddCompany = (newCompany: Company) => setCompanies((prev) => [newCompany, ...prev]);
  const handleEditCompany = (updatedCompany: Company) => setCompanies((prev) => prev.map((c) => (c.id === updatedCompany.id ? updatedCompany : c)));

  return (
    <div className="p-6 space-y-6">
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 flex flex-col items-center">
            <LoadingSpinner size="lg" color="primary" />
            <p className="text-gray-700 font-medium">Loading companies...</p>
          </div>
        </div>
      )}
      <AddCompanyModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onAdd={handleAddCompany} />
      <ViewCompanyModal isOpen={viewModal.isOpen} onClose={() => setViewModal({ isOpen: false, company: null })} company={viewModal.company} />
      <EditCompanyModal isOpen={editModal.isOpen} onClose={() => setEditModal({ isOpen: false, company: null })} company={editModal.company} onSave={handleEditCompany} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full border border-green-200">LIVE DATA</span>
          </div>
          <p className="text-gray-600 mt-1">View companies posting jobs on the platform.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center"><FiBriefcase className="w-5 h-5 text-primary-600" /></div>
            <div><p className="text-2xl font-bold text-gray-900">{stats.total}</p><p className="text-xs text-gray-500">Total Companies</p></div>
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
            <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center"><FiBriefcase className="w-5 h-5 text-primary-600" /></div>
            <div><p className="text-2xl font-bold text-gray-900">{stats.totalJobs}</p><p className="text-xs text-gray-500">Active Jobs</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center"><FiUsers className="w-5 h-5 text-primary-600" /></div>
            <div><p className="text-2xl font-bold text-gray-900">{stats.totalHires}</p><p className="text-xs text-gray-500">Total Hires</p></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="text" placeholder="Search companies..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none cursor-pointer">
            <option value="all">All Status</option>
            <option value="ACTIVE">Active</option><option value="PENDING">Pending</option><option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Company</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Industry</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Jobs</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Hires</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Rating</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCompanies.map((company) => {
                const statusBadge = getStatusBadge(company.status);
                return (
                  <tr key={company.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600 font-semibold">{company.logo}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">{company.name}</p>
                            {company.verified && <FiCheckCircle className="w-4 h-4 text-blue-500" title="Verified" />}
                          </div>
                          <p className="text-xs text-gray-500">{company.size} employees</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><span className="px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full">{company.industry}</span></td>
                    <td className="px-6 py-4"><div className="flex items-center gap-1 text-sm text-gray-600"><FiMapPin className="w-3.5 h-3.5" />{company.location}</div></td>
                    <td className="px-6 py-4"><p className="text-sm font-medium text-gray-900">{company.activeJobs}</p><p className="text-xs text-gray-500">{company.totalApplications} apps</p></td>
                    <td className="px-6 py-4 text-sm font-bold text-primary-600">{company.hires}</td>
                    <td className="px-6 py-4"><div className="flex items-center gap-1"><FiStar className="w-4 h-4 text-yellow-400 fill-current" /><span className="text-sm font-medium">{company.rating || "N/A"}</span></div></td>
                    <td className="px-6 py-4"><span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusBadge.bg} ${statusBadge.text}`}>{company.status}</span></td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        <button onClick={() => setViewModal({ isOpen: true, company })} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg" title="View Details"><FiEye className="w-4 h-4" /></button>
                        <button onClick={() => setEditModal({ isOpen: true, company })} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg" title="Edit Company"><FiEdit2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">Showing {filteredCompanies.length} of {companies.length} companies</p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm">1</button>
            <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
