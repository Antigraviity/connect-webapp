"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiUpload, FiX, FiChevronLeft, FiChevronRight, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useAuth } from "@/lib/useAuth";

interface Category {
  id: string;
  name: string;
  slug: string;
  subCategories: {
    id: string;
    name: string;
    slug: string;
  }[];
}

interface FieldErrors {
  title?: string;
  categoryId?: string;
  subCategoryId?: string;
  shortDescription?: string;
  fullDescription?: string;
  price?: string;
  duration?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export default function AddServicePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);
  const [limitReached, setLimitReached] = useState(false);

  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    title: "",
    categoryId: "",
    subCategoryId: "",
    shortDescription: "",
    images: [] as File[],

    // Step 2: Details
    fullDescription: "",
    attributes: [{ key: "", value: "" }],
    tags: [] as string[],
    tagInput: "",

    // Step 3: Pricing & Location
    price: "",
    discountPrice: "",
    duration: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    serviceRadius: "",

    // Step 4: Schedule
    schedule: [
      { day: "Monday", available: true, startTime: "09:00", endTime: "18:00" },
      { day: "Tuesday", available: true, startTime: "09:00", endTime: "18:00" },
      { day: "Wednesday", available: true, startTime: "09:00", endTime: "18:00" },
      { day: "Thursday", available: true, startTime: "09:00", endTime: "18:00" },
      { day: "Friday", available: true, startTime: "09:00", endTime: "18:00" },
      { day: "Saturday", available: false, startTime: "09:00", endTime: "18:00" },
      { day: "Sunday", available: false, startTime: "09:00", endTime: "18:00" },
    ],
  });

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Check authentication and load vendor schedule
  useEffect(() => {
    if (!authLoading && !user) {
      showNotification('error', 'Please login to add services');
      setTimeout(() => router.push('/auth/login'), 2000);
    } else if (user) {
      // Load vendor's saved schedule
      fetchVendorSchedule(user.id);
    }
  }, [authLoading, user, router]);

  // Fetch vendor's saved schedule
  const fetchVendorSchedule = async (userId: string) => {
    try {
      console.log('📅 Fetching vendor schedule for:', userId);
      const response = await fetch(`/api/vendor/schedule?userId=${userId}`);
      const data = await response.json();

      console.log('📅 API Response:', data);

      if (data.success && data.schedule) {
        // Convert saved schedule format to form format
        const convertedSchedule = data.schedule.map((day: any) => ({
          day: day.day,
          available: day.enabled,
          startTime: day.startTime,
          endTime: day.endTime,
        }));

        console.log('📅 Converted schedule:', convertedSchedule);

        setFormData(prev => ({
          ...prev,
          schedule: convertedSchedule
        }));
        console.log('📅 Schedule loaded successfully!');
      } else {
        console.log('📅 Using default schedule - no saved schedule found');
      }
    } catch (error) {
      console.error('❌ Failed to load vendor schedule:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      console.log('📥 Fetching categories...');
      setLoading(true);

      const response = await fetch('/api/categories');
      const data = await response.json();

      console.log('📊 Categories API response:', data);

      if (data.success && data.categories) {
        console.log(`✅ Loaded ${data.categories.length} categories:`, data.categories);
        setCategories(data.categories);
      } else {
        console.error('❌ Failed to load categories:', data.message);
        showNotification('error', data.message || 'Failed to load categories');
      }
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      showNotification('error', 'Failed to load categories. Please refresh the page.');
    } finally {
      // setLoading(false); 
      // Wait, there's no setLoading(false) here? Ah, I should add it if it's missing or use the existing one.
      // Actually, line 153 has it.
      setLoading(false);
    }
  };

  const showNotification = (type: "success" | "error" | "info", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Clear field error when user starts typing
  const clearFieldError = (field: keyof FieldErrors) => {
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (formData.images.length + files.length <= 5) {
      setFormData({ ...formData, images: [...formData.images, ...files] });
    } else {
      showNotification('error', 'Maximum 5 images allowed');
    }
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  const addAttribute = () => {
    setFormData({
      ...formData,
      attributes: [...formData.attributes, { key: "", value: "" }],
    });
  };

  const updateAttribute = (index: number, field: string, value: string) => {
    const newAttributes = [...formData.attributes];
    newAttributes[index] = { ...newAttributes[index], [field]: value };
    setFormData({ ...formData, attributes: newAttributes });
  };

  const removeAttribute = (index: number) => {
    const newAttributes = formData.attributes.filter((_, i) => i !== index);
    setFormData({ ...formData, attributes: newAttributes });
  };

  const addTag = () => {
    if (formData.tagInput.trim() && !formData.tags.includes(formData.tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, formData.tagInput.trim()],
        tagInput: "",
      });
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  const toggleDayAvailability = (index: number) => {
    const newSchedule = [...formData.schedule];
    newSchedule[index].available = !newSchedule[index].available;
    setFormData({ ...formData, schedule: newSchedule });
  };

  const updateScheduleTime = (index: number, field: string, value: string) => {
    const newSchedule = [...formData.schedule];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    setFormData({ ...formData, schedule: newSchedule });
  };

  // Validate Step 1
  const validateStep1 = (): boolean => {
    const errors: FieldErrors = {};
    let isValid = true;

    if (!formData.title.trim()) {
      errors.title = 'Service title is required';
      isValid = false;
    } else if (formData.title.length < 5) {
      errors.title = 'Title must be at least 5 characters';
      isValid = false;
    }

    if (!formData.categoryId) {
      errors.categoryId = 'Please select a category';
      isValid = false;
    }

    if (!formData.shortDescription.trim()) {
      errors.shortDescription = 'Short description is required';
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  // Validate Step 2
  const validateStep2 = (): boolean => {
    const errors: FieldErrors = {};
    let isValid = true;

    if (!formData.fullDescription.trim()) {
      errors.fullDescription = 'Full description is required';
      isValid = false;
    } else if (formData.fullDescription.length < 20) {
      errors.fullDescription = `Description must be at least 20 characters (${formData.fullDescription.length}/20)`;
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  // Validate Step 3
  const validateStep3 = (): boolean => {
    const errors: FieldErrors = {};
    let isValid = true;

    if (!formData.price.trim()) {
      errors.price = 'Price is required';
      isValid = false;
    } else if (parseFloat(formData.price) <= 0) {
      errors.price = 'Price must be greater than 0';
      isValid = false;
    }

    if (!formData.duration.trim()) {
      errors.duration = 'Duration is required';
      isValid = false;
    } else if (parseInt(formData.duration) <= 0) {
      errors.duration = 'Duration must be greater than 0';
      isValid = false;
    }

    if (!formData.city.trim()) {
      errors.city = 'City is required';
      isValid = false;
    }

    if (!formData.state.trim()) {
      errors.state = 'State is required';
      isValid = false;
    }

    if (!formData.zipCode.trim()) {
      errors.zipCode = 'PIN code is required';
      isValid = false;
    } else if (formData.zipCode.length !== 6) {
      errors.zipCode = 'PIN code must be 6 digits';
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const nextStep = () => {
    // Clear previous errors
    setFieldErrors({});

    // Validate current step before proceeding
    if (currentStep === 1) {
      if (!validateStep1()) {
        showNotification('error', 'Please fill in all required fields');
        return;
      }
    }
    if (currentStep === 2) {
      if (!validateStep2()) {
        showNotification('error', 'Please fill in all required fields');
        return;
      }
    }
    if (currentStep === 3) {
      if (!validateStep3()) {
        showNotification('error', 'Please fill in all required fields');
        return;
      }
    }

    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setFieldErrors({});
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const uploadImages = async (files: File[]): Promise<string[]> => {
    const imageUrls: string[] = [];

    for (const file of files) {
      try {
        // Create FormData for upload
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'services');

        // Upload to server
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (data.success && data.file?.url) {
          console.log('✅ Image uploaded:', data.file.url);
          imageUrls.push(data.file.url);
        } else {
          console.error('❌ Upload failed:', data.message);
          // Fallback to base64 if upload fails
          const reader = new FileReader();
          const base64 = await new Promise<string>((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
          imageUrls.push(base64);
        }
      } catch (error) {
        console.error('❌ Upload error:', error);
        // Fallback to base64 on error
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        imageUrls.push(base64);
      }
    }

    return imageUrls;
  };

  const handleSubmit = async () => {
    try {
      if (!user) {
        showNotification('error', 'You must be logged in to create a service');
        return;
      }

      // Validate all steps before submitting
      if (!validateStep1()) {
        setCurrentStep(1);
        showNotification('error', 'Please complete Step 1: Basic Information');
        return;
      }
      if (!validateStep2()) {
        setCurrentStep(2);
        showNotification('error', 'Please complete Step 2: Service Details');
        return;
      }
      if (!validateStep3()) {
        setCurrentStep(3);
        showNotification('error', 'Please complete Step 3: Pricing & Location');
        return;
      }

      setSubmitting(true);

      console.log('🚀 Starting service submission...', { user: user.id });

      // Upload images
      let imageUrls: string[] = [];
      if (formData.images.length > 0) {
        showNotification('info', 'Uploading images...');
        imageUrls = await uploadImages(formData.images);
        console.log('📸 Images uploaded:', imageUrls.length);
      }

      // Prepare service data
      const serviceData = {
        title: formData.title,
        description: formData.fullDescription,
        shortDescription: formData.shortDescription,
        price: parseFloat(formData.price),
        discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : undefined,
        duration: parseInt(formData.duration),
        categoryId: formData.categoryId,
        subCategoryId: formData.subCategoryId || undefined,
        sellerId: user.id,
        images: imageUrls,
        tags: formData.tags,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: "India",
        zipCode: formData.zipCode,
        serviceRadius: formData.serviceRadius ? parseInt(formData.serviceRadius) : undefined,
        type: 'SERVICE', // Explicitly set type to SERVICE
      };

      console.log('📝 Submitting service data:', JSON.stringify(serviceData, null, 2));

      // Submit to API
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceData),
      });

      const data = await response.json();

      console.log('📡 API Response:', data);

      if (data.success) {
        showNotification('success', 'Service published successfully! Your service is now live.');
        console.log('✅ Service created with ID:', data.service.id);
        setTimeout(() => {
          router.push('/vendor/services');
        }, 2000);
      } else {
        // Handle validation errors with more user-friendly messages
        let errorMessage = data.message || 'Failed to create service';

        // Check for limit reached error
        if (data.code === 'LIMIT_REACHED' || errorMessage.includes('Plan limit reached')) {
          setLimitReached(true);
          showNotification('error', errorMessage);
          window.scrollTo(0, 0); // Scroll to top to see the banner
          return;
        }

        if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
          const firstError = data.errors[0];
          errorMessage = firstError.message || errorMessage;
        }
        showNotification('error', errorMessage);
        console.error('❌ API Error:', data);
      }
    } catch (error) {
      console.error('❌ Service submission error:', error);
      showNotification('error', 'An error occurred while creating the service');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCategory = categories.find(c => c.id === formData.categoryId);

  // Helper component for field error display
  const FieldError = ({ error }: { error?: string }) => {
    if (!error) return null;
    return (
      <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
        <FiAlertCircle className="w-4 h-4" />
        {error}
      </p>
    );
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" color="vendor" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Notification */}
      {notification && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${notification.type === 'success' ? 'bg-green-50 border border-green-200' :
          notification.type === 'error' ? 'bg-red-50 border border-red-200' :
            'bg-emerald-50 border border-emerald-200'
          }`}>
          {notification.type === 'success' ? (
            <FiCheckCircle className="w-5 h-5 text-green-600" />
          ) : notification.type === 'error' ? (
            <FiAlertCircle className="w-5 h-5 text-red-600" />
          ) : (
            <FiAlertCircle className="w-5 h-5 text-emerald-600" />
          )}
          <span className={`text-sm font-medium ${notification.type === 'success' ? 'text-green-800' :
            notification.type === 'error' ? 'text-red-800' :
              'text-emerald-800'
            }`}>
            {notification.message}
          </span>
          <button
            onClick={() => setNotification(null)}
            className="ml-auto text-gray-400 hover:text-gray-600"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Limit Reached Banner */}
      {limitReached && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-red-800">Plan Limit Reached</h4>
            <p className="text-sm text-red-700">
              You have reached the maximum number of listings for your current plan.
            </p>
            <button
              onClick={() => router.push('/vendor/subscription')}
              className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
            >
              Upgrade Plan &rarr;
            </button>
          </div>
          <button onClick={() => setLimitReached(false)} className="text-red-600 hover:text-red-800">
            <FiX className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${currentStep >= step
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-200 text-gray-600"
                  }`}
              >
                {step}
              </div>
              {step < 4 && (
                <div
                  className={`flex-1 h-1 mx-2 ${currentStep > step ? "bg-emerald-600" : "bg-gray-200"
                    }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-sm">
          <span className={currentStep >= 1 ? "text-emerald-600 font-medium" : "text-gray-600"}>
            Basic Info
          </span>
          <span className={currentStep >= 2 ? "text-emerald-600 font-medium" : "text-gray-600"}>
            Details
          </span>
          <span className={currentStep >= 3 ? "text-emerald-600 font-medium" : "text-gray-600"}>
            Pricing & Location
          </span>
          <span className={currentStep >= 4 ? "text-emerald-600 font-medium" : "text-gray-600"}>
            Schedule
          </span>
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value });
                  clearFieldError('title');
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${fieldErrors.title ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                placeholder="e.g., Professional AC Repair & Maintenance"
              />
              <FieldError error={fieldErrors.title} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => {
                    console.log('Category selected:', e.target.value);
                    setFormData({ ...formData, categoryId: e.target.value, subCategoryId: "" });
                    clearFieldError('categoryId');
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${fieldErrors.categoryId ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <FieldError error={fieldErrors.categoryId} />
                {categories.length === 0 && !fieldErrors.categoryId && (
                  <p className="text-xs text-orange-600 mt-1">
                    {loading ? 'Loading categories...' : 'No categories available. Please contact admin.'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sub-Category
                </label>
                <select
                  value={formData.subCategoryId}
                  onChange={(e) => {
                    console.log('Sub-category selected:', e.target.value);
                    setFormData({ ...formData, subCategoryId: e.target.value });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  disabled={!formData.categoryId}
                >
                  <option value="">Select Sub-Category</option>
                  {selectedCategory?.subCategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
                {formData.categoryId && selectedCategory?.subCategories.length === 0 && (
                  <p className="text-xs text-orange-600 mt-1">
                    No sub-categories available for this category
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Short Description <span className="text-red-500">*</span> <span className="font-normal text-gray-500">(Max 150 characters)</span>
              </label>
              <textarea
                value={formData.shortDescription}
                onChange={(e) => {
                  setFormData({ ...formData, shortDescription: e.target.value });
                  clearFieldError('shortDescription');
                }}
                maxLength={150}
                rows={3}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${fieldErrors.shortDescription ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                placeholder="Brief description of your service"
              />
              <div className="flex justify-between items-center mt-1">
                <FieldError error={fieldErrors.shortDescription} />
                <p className="text-sm text-gray-500">
                  {formData.shortDescription.length}/150 characters
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Images (Max 5)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                  disabled={formData.images.length >= 5}
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <FiUpload className="w-12 h-12 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    Click to upload images (Max 5)
                  </p>
                </label>
              </div>

              {/* Image Preview */}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-5 gap-4 mt-4">
                  {formData.images.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Details */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Service Details</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Description <span className="text-red-500">*</span> <span className="font-normal text-gray-500">(Min 20 characters)</span>
              </label>
              <textarea
                value={formData.fullDescription}
                onChange={(e) => {
                  setFormData({ ...formData, fullDescription: e.target.value });
                  clearFieldError('fullDescription');
                }}
                rows={6}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${fieldErrors.fullDescription ? 'border-red-500 bg-red-50' :
                  formData.fullDescription.length > 0 && formData.fullDescription.length < 20
                    ? 'border-orange-300'
                    : 'border-gray-300'
                  }`}
                placeholder="Detailed description of your service, what's included, and what makes it special"
              />
              <div className="flex justify-between items-center mt-1">
                <FieldError error={fieldErrors.fullDescription} />
                <p className={`text-sm ${formData.fullDescription.length > 0 && formData.fullDescription.length < 20
                  ? 'text-orange-600'
                  : 'text-gray-500'
                  }`}>
                  {formData.fullDescription.length}/20 minimum
                  {formData.fullDescription.length > 0 && formData.fullDescription.length < 20 && (
                    <span> (need {20 - formData.fullDescription.length} more)</span>
                  )}
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Service Attributes
                </label>
                <button
                  onClick={addAttribute}
                  className="text-sm text-emerald-600 font-medium hover:text-emerald-700"
                >
                  + Add Attribute
                </button>
              </div>
              <div className="space-y-2">
                {formData.attributes.map((attr, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={attr.key}
                      onChange={(e) =>
                        updateAttribute(index, "key", e.target.value)
                      }
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Attribute name (e.g., Warranty)"
                    />
                    <input
                      type="text"
                      value={attr.value}
                      onChange={(e) =>
                        updateAttribute(index, "value", e.target.value)
                      }
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Value (e.g., 1 Year)"
                    />
                    {formData.attributes.length > 1 && (
                      <button
                        onClick={() => removeAttribute(index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <FiX className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={formData.tagInput}
                  onChange={(e) =>
                    setFormData({ ...formData, tagInput: e.target.value })
                  }
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Add tags (press Enter)"
                />
                <button
                  onClick={addTag}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="hover:text-emerald-900"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Pricing & Location */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Pricing & Location</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Regular Price (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => {
                    setFormData({ ...formData, price: e.target.value });
                    clearFieldError('price');
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${fieldErrors.price ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  placeholder="999"
                />
                <FieldError error={fieldErrors.price} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Price (₹)
                </label>
                <input
                  type="number"
                  value={formData.discountPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, discountPrice: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="799"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => {
                    setFormData({ ...formData, duration: e.target.value });
                    clearFieldError('duration');
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${fieldErrors.duration ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  placeholder="60"
                />
                <FieldError error={fieldErrors.duration} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Address
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Street address, building, apartment"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => {
                    setFormData({ ...formData, city: e.target.value });
                    clearFieldError('city');
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${fieldErrors.city ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  placeholder="City"
                />
                <FieldError error={fieldErrors.city} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => {
                    setFormData({ ...formData, state: e.target.value });
                    clearFieldError('state');
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${fieldErrors.state ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  placeholder="State"
                />
                <FieldError error={fieldErrors.state} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PIN Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    if (val.length <= 6) {
                      setFormData({ ...formData, zipCode: val });
                      clearFieldError('zipCode');
                    }
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${fieldErrors.zipCode ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  placeholder="600001"
                  maxLength={6}
                />
                <FieldError error={fieldErrors.zipCode} />
                {!fieldErrors.zipCode && (
                  <p className="text-xs text-gray-500 mt-1">
                    Services will appear for this pincode on the booking page
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Radius (km)
              </label>
              <input
                type="number"
                value={formData.serviceRadius}
                onChange={(e) =>
                  setFormData({ ...formData, serviceRadius: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="10"
              />
              <p className="text-sm text-gray-500 mt-1">
                How far are you willing to travel for this service?
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Schedule */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">
              Set Your Availability
            </h2>
            <p className="text-gray-600">
              Define when customers can book this service
            </p>

            <div className="space-y-3">
              {formData.schedule.map((day, index) => (
                <div
                  key={day.day}
                  className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg"
                >
                  <button
                    onClick={() => toggleDayAvailability(index)}
                    className="flex-shrink-0"
                  >
                    {day.available ? (
                      <div className="w-12 h-6 bg-emerald-600 rounded-full relative">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                      </div>
                    ) : (
                      <div className="w-12 h-6 bg-gray-300 rounded-full relative">
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full" />
                      </div>
                    )}
                  </button>

                  <div className="w-24">
                    <span
                      className={`font-medium ${day.available ? "text-gray-900" : "text-gray-400"
                        }`}
                    >
                      {day.day}
                    </span>
                  </div>

                  {day.available ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="time"
                        value={day.startTime}
                        onChange={(e) =>
                          updateScheduleTime(index, "startTime", e.target.value)
                        }
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                      <span className="text-gray-500">to</span>
                      <input
                        type="time"
                        value={day.endTime}
                        onChange={(e) =>
                          updateScheduleTime(index, "endTime", e.target.value)
                        }
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                  ) : (
                    <div className="flex-1">
                      <span className="text-gray-400">Unavailable</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-6 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiChevronLeft />
            Previous
          </button>

          {currentStep < 4 ? (
            <button
              onClick={nextStep}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-semibold hover:from-emerald-600 hover:to-teal-700 shadow-md hover:shadow-lg transition-all"
            >
              Next
              <FiChevronRight />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-semibold hover:from-emerald-600 hover:to-teal-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <LoadingSpinner size="sm" color="white" />
                  Publishing...
                </>
              ) : (
                'Publish Service'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
