"use client";

import { useState, useEffect } from "react";
import {
  FiUsers,
  FiSearch,
  FiPlus,
  FiEye,
  FiEdit2,
  FiStar,
  FiMapPin,
  FiPackage,
  FiDollarSign,
  FiCheckCircle,
  FiX,
  FiMail,
  FiPhone,
  FiCalendar,
  FiShoppingBag,
  FiFileText,
  FiUpload,
  FiUser,
  FiBriefcase,
} from "react-icons/fi";

// Seller interface
interface Seller {
  id: string;
  name: string;
  email: string;
  location: string;
  products: number;
  orders: number;
  revenue: string | number;
  rating: number;
  status: "ACTIVE" | "INACTIVE" | "PENDING";
  verified?: boolean;
  joinedDate?: string;
  // Optional fields for detailed view
  owner?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  businessType?: string;
  gstNumber?: string;
  panNumber?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  categories?: string[];
  description?: string;
  numericRevenue?: number;
  joinDate?: string;
}

// Initial sellers data
const initialSellersData: Seller[] = [
  {
    id: "SLR-001",
    name: "Biryani House",
    owner: "Mohammed Ali",
    email: "contact@biryanihouse.com",
    phone: "+91 98765 43210",
    location: "Chennai",
    address: "123, Anna Nagar Main Road",
    city: "Chennai",
    state: "Tamil Nadu",
    pincode: "600040",
    products: 12,
    orders: 1256,
    revenue: "₹3,75,000",
    numericRevenue: 375000,
    rating: 4.7,
    status: "ACTIVE",
    joinDate: "Aug 2024",
    businessType: "Restaurant",
    gstNumber: "33AABCU9603R1ZX",
    categories: ["Food", "Non-Veg"],
    description: "Authentic Hyderabadi biryani and North Indian cuisine.",
  },
  {
    id: "SLR-002",
    name: "Amma's Kitchen",
    owner: "Lakshmi Devi",
    email: "ammas.kitchen@email.com",
    phone: "+91 98765 43211",
    location: "Chennai",
    address: "45, T Nagar",
    city: "Chennai",
    state: "Tamil Nadu",
    pincode: "600017",
    products: 8,
    orders: 890,
    revenue: "₹1,06,800",
    numericRevenue: 106800,
    rating: 4.9,
    status: "ACTIVE",
    joinDate: "Sep 2024",
    businessType: "Home Kitchen",
    categories: ["Snacks", "Traditional"],
    description: "Traditional South Indian snacks made with love.",
  },
  {
    id: "SLR-003",
    name: "Kerala Delights",
    owner: "Rajesh Kumar",
    email: "kerala.delights@email.com",
    phone: "+91 98765 43212",
    location: "Chennai",
    address: "78, Mylapore",
    city: "Chennai",
    state: "Tamil Nadu",
    pincode: "600004",
    products: 6,
    orders: 678,
    revenue: "₹1,01,700",
    numericRevenue: 101700,
    rating: 4.8,
    status: "ACTIVE",
    joinDate: "Jul 2024",
    businessType: "Home Kitchen",
    categories: ["Snacks", "Chips"],
    description: "Authentic Kerala snacks and chips.",
  },
  {
    id: "SLR-004",
    name: "Farm Fresh",
    owner: "Suresh Reddy",
    email: "farmfresh@email.com",
    phone: "+91 98765 43213",
    location: "Bangalore",
    address: "22, Koramangala",
    city: "Bangalore",
    state: "Karnataka",
    pincode: "560034",
    products: 25,
    orders: 456,
    revenue: "₹2,05,200",
    numericRevenue: 205200,
    rating: 4.5,
    status: "ACTIVE",
    joinDate: "Oct 2024",
    businessType: "Farm",
    categories: ["Vegetables", "Organic"],
    description: "Fresh organic vegetables directly from our farm.",
  },
  {
    id: "SLR-005",
    name: "Fruit Valley",
    owner: "Anita Sharma",
    email: "fruitvalley@email.com",
    phone: "+91 98765 43214",
    location: "Mumbai",
    address: "56, Bandra West",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400050",
    products: 15,
    orders: 234,
    revenue: "₹1,59,120",
    numericRevenue: 159120,
    rating: 4.6,
    status: "INACTIVE",
    joinDate: "Nov 2024",
    businessType: "Distributor",
    categories: ["Fruits", "Seasonal"],
    description: "Premium quality fruits from across India.",
  },
];

const businessTypes = ["Restaurant", "Home Kitchen", "Farm", "Distributor", "Retailer", "Manufacturer"];
const productCategories = ["Food", "Snacks", "Vegetables", "Fruits", "Dairy & Eggs", "Street Food", "Beverages"];

// View Details Modal
function ViewDetailsModal({ seller, isOpen, onClose }: { seller: Seller | null; isOpen: boolean; onClose: () => void }) {
  if (!isOpen || !seller) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center text-3xl font-bold text-white">
                  {seller.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{seller.name}</h3>
                  <p className="text-sm text-orange-100">{seller.id} • {seller.owner}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg"><FiX className="w-5 h-5" /></button>
            </div>
          </div>

          <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
            {/* Status and Rating */}
            <div className="flex items-center gap-3 mb-6">
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${seller.status === "ACTIVE" ? "bg-green-100 text-green-800" : seller.status === "PENDING" ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"}`}>
                {seller.status}
              </span>
              <div className="flex items-center gap-1 px-3 py-1 bg-yellow-50 rounded-full">
                <FiStar className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm font-medium text-yellow-700">{seller.rating}</span>
              </div>
              {seller.businessType && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">{seller.businessType}</span>
              )}
            </div>

            {/* Description */}
            {seller.description && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">About</h4>
                <p className="text-gray-600">{seller.description}</p>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <FiPackage className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-blue-600">{seller.products}</p>
                <p className="text-xs text-blue-700">Products</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <FiShoppingBag className="w-6 h-6 text-green-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-green-600">{seller.orders}</p>
                <p className="text-xs text-green-700">Orders</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <FiDollarSign className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-purple-600">{seller.revenue}</p>
                <p className="text-xs text-purple-700">Revenue</p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Contact Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FiMail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900">{seller.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FiPhone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-medium text-gray-900">{seller.phone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Address</h4>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <FiMapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-900">{seller.address || "N/A"}</p>
                    <p className="text-sm text-gray-600">{seller.city}, {seller.state} - {seller.pincode}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Categories */}
            {seller.categories && seller.categories.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Product Categories</h4>
                <div className="flex flex-wrap gap-2">
                  {seller.categories.map((cat) => (
                    <span key={cat} className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full">{cat}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Business Details */}
            {(seller.gstNumber || seller.panNumber) && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Business Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  {seller.gstNumber && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">GST Number</p>
                      <p className="text-sm font-medium text-gray-900">{seller.gstNumber}</p>
                    </div>
                  )}
                  {seller.panNumber && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">PAN Number</p>
                      <p className="text-sm font-medium text-gray-900">{seller.panNumber}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Join Date */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FiCalendar className="w-4 h-4" />
              <span>Joined on {seller.joinDate}</span>
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

// Add Seller Modal (3-step form)
function AddSellerModal({ isOpen, onClose, onAdd }: { isOpen: boolean; onClose: () => void; onAdd: (seller: Seller) => void }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Personal Info
    name: "", owner: "", email: "", phone: "",
    // Step 2: Business Info
    businessType: "", description: "", address: "", city: "", state: "", pincode: "", categories: [] as string[],
    // Step 3: Documents
    gstNumber: "", panNumber: "", bankName: "", accountNumber: "", ifscCode: "", status: "PENDING" as "ACTIVE" | "INACTIVE" | "PENDING",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "pincode") {
      let val = value.replace(/\D/g, "");
      if (val.length > 6) val = val.slice(0, 6);
      setFormData((prev) => ({ ...prev, [name]: val }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleCategoryToggle = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Business name is required";
    if (!formData.owner.trim()) newErrors.owner = "Owner name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.businessType) newErrors.businessType = "Business type is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.pincode || formData.pincode.length !== 6) newErrors.pincode = "Valid 6-digit pincode is required";
    if (formData.categories.length === 0) newErrors.categories = "Select at least one category";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};
    // GST and PAN are optional but validate format if provided
    if (formData.gstNumber && formData.gstNumber.length < 15) newErrors.gstNumber = "Invalid GST number";
    if (formData.panNumber && formData.panNumber.length !== 10) newErrors.panNumber = "PAN must be 10 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) setCurrentStep(2);
    else if (currentStep === 2 && validateStep2()) setCurrentStep(3);
  };

  const handleBack = () => setCurrentStep((prev) => Math.max(1, prev - 1));

  const handleSubmit = async () => {
    if (!validateStep3()) return;
    setIsSubmitting(true);

    try {
      // Call API to create seller in database
      const response = await fetch('/api/admin/products/sellers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          address: formData.address,
          businessType: formData.businessType,
          description: formData.description,
          gstNumber: formData.gstNumber,
          panNumber: formData.panNumber,
          status: formData.status,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Show success message with temporary password
        alert(`Seller created successfully!\n\nTemporary Password: ${data.temporaryPassword}\n\nPlease save this password and share it with the seller.`);
        
        // Add to local state and refresh
        onAdd(data.seller);
        resetForm();
        onClose();
      } else {
        alert(`Failed to create seller: ${data.message}`);
      }
    } catch (error) {
      console.error('Error creating seller:', error);
      alert('Failed to create seller. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", owner: "", email: "", phone: "", businessType: "", description: "", address: "", city: "", state: "", pincode: "", categories: [], gstNumber: "", panNumber: "", bankName: "", accountNumber: "", ifscCode: "", status: "PENDING" });
    setCurrentStep(1);
    setErrors({});
  };

  const resetAndClose = () => { resetForm(); onClose(); };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={resetAndClose} />
        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 backdrop-blur rounded-lg"><FiPlus className="w-5 h-5 text-white" /></div>
                <div><h3 className="text-lg font-semibold text-white">Add New Seller</h3><p className="text-sm text-orange-100">Register a new seller on the platform</p></div>
              </div>
              <button onClick={resetAndClose} className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg"><FiX className="w-5 h-5" /></button>
            </div>
          </div>

          {/* Step Indicators */}
          <div className="px-6 pt-6">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${currentStep >= step ? "bg-orange-600 text-white" : "bg-gray-200 text-gray-500"}`}>
                    {step === 1 ? <FiUser className="w-5 h-5" /> : step === 2 ? <FiBriefcase className="w-5 h-5" /> : <FiFileText className="w-5 h-5" />}
                  </div>
                  {step < 3 && <div className={`flex-1 h-1 mx-2 ${currentStep > step ? "bg-orange-600" : "bg-gray-200"}`} />}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs">
              <span className={currentStep >= 1 ? "text-orange-600 font-medium" : "text-gray-500"}>Personal Info</span>
              <span className={currentStep >= 2 ? "text-orange-600 font-medium" : "text-gray-500"}>Business Info</span>
              <span className={currentStep >= 3 ? "text-orange-600 font-medium" : "text-gray-500"}>Documents</span>
            </div>
          </div>

          <div className="px-6 py-6 max-h-[55vh] overflow-y-auto">
            {/* Step 1: Personal Info */}
            {currentStep === 1 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g., Biryani House" className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${errors.name ? "border-red-500" : "border-gray-300"}`} />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name *</label>
                  <input type="text" name="owner" value={formData.owner} onChange={handleInputChange} placeholder="e.g., Mohammed Ali" className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${errors.owner ? "border-red-500" : "border-gray-300"}`} />
                  {errors.owner && <p className="text-red-500 text-xs mt-1">{errors.owner}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="seller@email.com" className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${errors.email ? "border-red-500" : "border-gray-300"}`} />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+91 98765 43210" className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${errors.phone ? "border-red-500" : "border-gray-300"}`} />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Business Info */}
            {currentStep === 2 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Type *</label>
                  <select name="businessType" value={formData.businessType} onChange={handleInputChange} className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${errors.businessType ? "border-red-500" : "border-gray-300"}`}>
                    <option value="">Select Business Type</option>
                    {businessTypes.map((type) => (<option key={type} value={type}>{type}</option>))}
                  </select>
                  {errors.businessType && <p className="text-red-500 text-xs mt-1">{errors.businessType}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} placeholder="Brief description of your business" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
                  <input type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="Street address" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="Chennai" className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${errors.city ? "border-red-500" : "border-gray-300"}`} />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                    <input type="text" name="state" value={formData.state} onChange={handleInputChange} placeholder="Tamil Nadu" className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${errors.state ? "border-red-500" : "border-gray-300"}`} />
                    {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                    <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} placeholder="600001" className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${errors.pincode ? "border-red-500" : "border-gray-300"}`} />
                    {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Categories *</label>
                  <div className="flex flex-wrap gap-2">
                    {productCategories.map((cat) => (
                      <button key={cat} type="button" onClick={() => handleCategoryToggle(cat)} className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${formData.categories.includes(cat) ? "bg-orange-600 text-white border-orange-600" : "bg-white text-gray-700 border-gray-300 hover:border-orange-400"}`}>
                        {cat}
                      </button>
                    ))}
                  </div>
                  {errors.categories && <p className="text-red-500 text-xs mt-1">{errors.categories}</p>}
                </div>
              </div>
            )}

            {/* Step 3: Documents */}
            {currentStep === 3 && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                    <input type="text" name="gstNumber" value={formData.gstNumber} onChange={handleInputChange} placeholder="22AAAAA0000A1Z5" className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${errors.gstNumber ? "border-red-500" : "border-gray-300"}`} />
                    {errors.gstNumber && <p className="text-red-500 text-xs mt-1">{errors.gstNumber}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number</label>
                    <input type="text" name="panNumber" value={formData.panNumber} onChange={handleInputChange} placeholder="ABCDE1234F" maxLength={10} className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent uppercase ${errors.panNumber ? "border-red-500" : "border-gray-300"}`} />
                    {errors.panNumber && <p className="text-red-500 text-xs mt-1">{errors.panNumber}</p>}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Bank Details (Optional)</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <input type="text" name="bankName" value={formData.bankName} onChange={handleInputChange} placeholder="Bank Name" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleInputChange} placeholder="Account Number" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                      <input type="text" name="ifscCode" value={formData.ifscCode} onChange={handleInputChange} placeholder="IFSC Code" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent uppercase" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Initial Status</label>
                  <select name="status" value={formData.status} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                    <option value="ACTIVE">Active</option>
                    <option value="PENDING">Pending Review</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-between">
            {currentStep > 1 ? (
              <button onClick={handleBack} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Previous</button>
            ) : (
              <button onClick={resetAndClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            )}
            {currentStep < 3 ? (
              <button onClick={handleNext} className="px-6 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700">Next</button>
            ) : (
              <button onClick={handleSubmit} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 flex items-center gap-2 disabled:bg-orange-400 disabled:cursor-not-allowed">
                {isSubmitting ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Registering...</>) : "Register Seller"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Edit Seller Modal
function EditSellerModal({ seller, isOpen, onClose, onSave }: { seller: Seller | null; isOpen: boolean; onClose: () => void; onSave: (seller: Seller) => void }) {
  const [formData, setFormData] = useState({
    name: "", owner: "", email: "", phone: "", businessType: "", description: "", address: "", city: "", state: "", pincode: "", categories: [] as string[], gstNumber: "", panNumber: "", status: "ACTIVE" as "ACTIVE" | "INACTIVE" | "PENDING",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isOpen && seller && formData.name !== seller.name) {
    setFormData({
      name: seller.name || "",
      owner: seller.owner || "",
      email: seller.email || "",
      phone: seller.phone || "",
      businessType: seller.businessType || "",
      description: seller.description || "",
      address: seller.address || "",
      city: seller.city || "",
      state: seller.state || "",
      pincode: seller.pincode || "",
      categories: seller.categories || [],
      gstNumber: seller.gstNumber || "",
      panNumber: seller.panNumber || "",
      status: seller.status || "ACTIVE",
    });
  }

  if (!isOpen || !seller) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "pincode") {
      let val = value.replace(/\D/g, "");
      if (val.length > 6) val = val.slice(0, 6);
      setFormData((prev) => ({ ...prev, [name]: val }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleCategoryToggle = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Business name is required";
    if (!formData.owner.trim()) newErrors.owner = "Owner name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      // Call API to update seller in database
      const response = await fetch('/api/admin/products/sellers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: seller.id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          address: formData.address,
          businessType: formData.businessType,
          description: formData.description,
          gstNumber: formData.gstNumber,
          panNumber: formData.panNumber,
          status: formData.status,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Seller updated successfully!');
        onSave(data.seller);
        onClose();
      } else {
        alert(`Failed to update seller: ${data.message}`);
      }
    } catch (error) {
      console.error('Error updating seller:', error);
      alert('Failed to update seller. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 backdrop-blur rounded-lg"><FiEdit2 className="w-5 h-5 text-white" /></div>
                <div><h3 className="text-lg font-semibold text-white">Edit Seller</h3><p className="text-sm text-blue-100">{seller.id}</p></div>
              </div>
              <button onClick={onClose} className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg"><FiX className="w-5 h-5" /></button>
            </div>
          </div>

          <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.name ? "border-red-500" : "border-gray-300"}`} />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name *</label>
                  <input type="text" name="owner" value={formData.owner} onChange={handleInputChange} className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.owner ? "border-red-500" : "border-gray-300"}`} />
                  {errors.owner && <p className="text-red-500 text-xs mt-1">{errors.owner}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.email ? "border-red-500" : "border-gray-300"}`} />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.phone ? "border-red-500" : "border-gray-300"}`} />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
                  <select name="businessType" value={formData.businessType} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Select Type</option>
                    {businessTypes.map((type) => (<option key={type} value={type}>{type}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select name="status" value={formData.status} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="ACTIVE">Active</option>
                    <option value="PENDING">Pending</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} rows={2} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input type="text" name="state" value={formData.state} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                  <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Categories</label>
                <div className="flex flex-wrap gap-2">
                  {productCategories.map((cat) => (
                    <button key={cat} type="button" onClick={() => handleCategoryToggle(cat)} className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${formData.categories.includes(cat) ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"}`}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                  <input type="text" name="gstNumber" value={formData.gstNumber} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number</label>
                  <input type="text" name="panNumber" value={formData.panNumber} onChange={handleInputChange} maxLength={10} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase" />
                </div>
              </div>
              {/* Stats Info */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Performance Stats</h4>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div><p className="text-xl font-bold text-gray-900">{seller.products}</p><p className="text-xs text-gray-500">Products</p></div>
                  <div><p className="text-xl font-bold text-gray-900">{seller.orders}</p><p className="text-xs text-gray-500">Orders</p></div>
                  <div><p className="text-xl font-bold text-green-600">{seller.revenue}</p><p className="text-xs text-gray-500">Revenue</p></div>
                  <div className="flex items-center justify-center gap-1"><FiStar className="w-4 h-4 text-yellow-500 fill-current" /><p className="text-xl font-bold text-gray-900">{seller.rating}</p></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button onClick={handleSubmit} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:bg-blue-400 disabled:cursor-not-allowed">
              {isSubmitting ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Saving...</>) : (<><FiCheckCircle className="w-4 h-4" />Save Changes</>)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SellersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);

  // Fetch sellers from API
  const fetchSellers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/products/sellers');
      const data = await response.json();
      
      if (data.success) {
        setSellers(data.sellers || []);
      } else {
        console.error('Failed to fetch sellers:', data.message);
      }
    } catch (error) {
      console.error('Error fetching sellers:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchSellers();
  }, []);

  const filteredSellers = sellers.filter((seller) => {
    const matchesSearch = seller.name.toLowerCase().includes(searchQuery.toLowerCase()) || (seller.owner?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesStatus = filterStatus === "all" || seller.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: sellers.length,
    active: sellers.filter((s) => s.status === "ACTIVE").length,
    products: sellers.reduce((sum, s) => sum + s.products, 0),
    revenue: sellers.reduce((sum, s) => sum + (s.numericRevenue || (typeof s.revenue === 'number' ? s.revenue : 0)), 0),
  };

  const formatRevenue = (amount: number) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount}`;
  };

  const handleViewSeller = (seller: Seller) => { setSelectedSeller(seller); setShowViewModal(true); };
  const handleEditSeller = (seller: Seller) => { setSelectedSeller(seller); setShowEditModal(true); };
  const handleSaveSeller = (updatedSeller: Seller) => { setSellers((prev) => prev.map((s) => (s.id === updatedSeller.id ? updatedSeller : s))); };

  return (
    <div className="p-6 space-y-6">
      {/* Modals */}
      <AddSellerModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onAdd={(newSeller) => setSellers((prev) => [newSeller, ...prev])} />
      <ViewDetailsModal seller={selectedSeller} isOpen={showViewModal} onClose={() => setShowViewModal(false)} />
      <EditSellerModal seller={selectedSeller} isOpen={showEditModal} onClose={() => setShowEditModal(false)} onSave={handleSaveSeller} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Sellers</h1>
          <p className="text-gray-600 mt-1">Manage sellers on the marketplace.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm font-semibold">
          <FiPlus className="w-4 h-4" />
          Add Seller
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><FiUsers className="w-5 h-5 text-blue-600" /></div>
            <div><p className="text-2xl font-bold text-gray-900">{stats.total}</p><p className="text-xs text-gray-500">Total Sellers</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center"><FiCheckCircle className="w-5 h-5 text-green-600" /></div>
            <div><p className="text-2xl font-bold text-gray-900">{stats.active}</p><p className="text-xs text-gray-500">Active</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center"><FiPackage className="w-5 h-5 text-orange-600" /></div>
            <div><p className="text-2xl font-bold text-gray-900">{stats.products}</p><p className="text-xs text-gray-500">Products</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center"><FiDollarSign className="w-5 h-5 text-purple-600" /></div>
            <div><p className="text-2xl font-bold text-gray-900">{formatRevenue(stats.revenue)}</p><p className="text-xs text-gray-500">Total Revenue</p></div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="text" placeholder="Search sellers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none" />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none cursor-pointer">
            <option value="all">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* Sellers Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        ) : filteredSellers.length === 0 ? (
          <div className="p-12 text-center">
            <FiUsers className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No sellers found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search or add a new seller</p>
            <button onClick={() => setShowAddModal(true)} className="inline-flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 text-sm font-semibold">
              <FiPlus className="w-4 h-4" />Add Seller
            </button>
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Seller</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Products</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Orders</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Rating</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSellers.map((seller) => (
                <tr key={seller.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-semibold">{seller.name.charAt(0)}</div>
                      <div>
                        <p className="font-medium text-gray-900">{seller.name}</p>
                        <p className="text-xs text-gray-500">{seller.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm text-gray-600"><FiMapPin className="w-3.5 h-3.5" />{seller.location}</div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{seller.products}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{seller.orders}</td>
                  <td className="px-6 py-4 text-sm font-bold text-green-600">₹{seller.revenue.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1"><FiStar className="w-4 h-4 text-yellow-400 fill-current" /><span className="text-sm font-medium">{seller.rating}</span></div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${seller.status === "ACTIVE" ? "bg-green-100 text-green-800" : seller.status === "PENDING" ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"}`}>
                      {seller.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      <button onClick={() => handleViewSeller(seller)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="View Details"><FiEye className="w-4 h-4" /></button>
                      <button onClick={() => handleEditSeller(seller)} className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg" title="Edit Seller"><FiEdit2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  );
}
