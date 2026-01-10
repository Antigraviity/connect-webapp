"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft, FiSave, FiX, FiUpload, FiCheckCircle, FiAlertCircle, FiTrash2 } from "react-icons/fi";
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

interface Service {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  price: number;
  discountPrice?: number;
  duration: number;
  categoryId: string;
  subCategoryId?: string;
  images: string;
  tags?: string;
  status: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export default function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [service, setService] = useState<Service | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  // Existing images from database
  const [existingImages, setExistingImages] = useState<string[]>([]);
  // New images to upload
  const [newImages, setNewImages] = useState<File[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    shortDescription: "",
    description: "",
    price: "",
    discountPrice: "",
    duration: "",
    categoryId: "",
    subCategoryId: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    tags: [] as string[],
    tagInput: "",
    status: "APPROVED",
  });

  // Fetch service and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch service
        const serviceRes = await fetch(`/api/services/${id}`);
        const serviceData = await serviceRes.json();

        if (!serviceData.success) {
          showNotification("error", "Service not found");
          return;
        }

        const svc = serviceData.data;
        setService(svc);

        // Parse tags
        let tags: string[] = [];
        try {
          tags = JSON.parse(svc.tags || "[]");
        } catch {
          tags = [];
        }

        // Parse existing images
        let images: string[] = [];
        try {
          images = JSON.parse(svc.images || "[]");
        } catch {
          images = [];
        }
        setExistingImages(images);

        // Set form data
        setFormData({
          title: svc.title || "",
          shortDescription: svc.shortDescription || "",
          description: svc.description || "",
          price: svc.price?.toString() || "",
          discountPrice: svc.discountPrice?.toString() || "",
          duration: svc.duration?.toString() || "",
          categoryId: svc.categoryId || "",
          subCategoryId: svc.subCategoryId || "",
          address: svc.address || "",
          city: svc.city || "",
          state: svc.state || "",
          zipCode: svc.zipCode || "",
          tags,
          tagInput: "",
          status: svc.status || "APPROVED",
        });

        // Fetch categories
        const catRes = await fetch("/api/categories");
        const catData = await catRes.json();
        if (catData.success) {
          setCategories(catData.categories);
        }
      } catch (error) {
        console.error("Error fetching service:", error);
        showNotification("error", "Failed to load service");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const showNotification = (type: "success" | "error" | "info", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
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

  // Handle new image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalImages = existingImages.length + newImages.length + files.length;

    if (totalImages <= 5) {
      setNewImages([...newImages, ...files]);
    } else {
      showNotification("error", "Maximum 5 images allowed");
    }
  };

  // Remove existing image
  const removeExistingImage = (index: number) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  // Remove new image
  const removeNewImage = (index: number) => {
    setNewImages(newImages.filter((_, i) => i !== index));
  };

  // Upload new images to server
  const uploadImages = async (files: File[]): Promise<string[]> => {
    const imageUrls: string[] = [];

    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'services');

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (data.success && data.file?.url) {
          console.log('✅ Image uploaded:', data.file.url);
          imageUrls.push(data.file.url);
        } else {
          // Fallback to base64
          const reader = new FileReader();
          const base64 = await new Promise<string>((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
          imageUrls.push(base64);
        }
      } catch (error) {
        console.error('Upload error:', error);
        // Fallback to base64
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title || formData.title.length < 5) {
      showNotification("error", "Title must be at least 5 characters");
      return;
    }
    if (!formData.description || formData.description.length < 20) {
      showNotification("error", "Description must be at least 20 characters");
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      showNotification("error", "Please enter a valid price");
      return;
    }

    setSaving(true);

    try {
      // Upload new images if any
      let allImages = [...existingImages];

      if (newImages.length > 0) {
        setUploadingImages(true);
        showNotification("info", "Uploading images...");
        const uploadedUrls = await uploadImages(newImages);
        allImages = [...allImages, ...uploadedUrls];
        setUploadingImages(false);
      }

      const response = await fetch(`/api/services/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          shortDescription: formData.shortDescription,
          price: parseFloat(formData.price),
          discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : null,
          duration: parseInt(formData.duration) || 60,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          tags: JSON.stringify(formData.tags),
          images: JSON.stringify(allImages), // Store as JSON string for API
          status: formData.status,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showNotification("success", "Service updated successfully!");
        setTimeout(() => router.push("/vendor/services"), 1500);
      } else {
        showNotification("error", data.message || "Failed to update service");
      }
    } catch (error) {
      console.error("Error updating service:", error);
      showNotification("error", "Failed to update service");
    } finally {
      setSaving(false);
      setUploadingImages(false);
    }
  };

  const selectedCategory = categories.find((c) => c.id === formData.categoryId);
  const totalImages = existingImages.length + newImages.length;

  if (authLoading || loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" color="vendor" label="Loading..." />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Service Not Found</h3>
          <p className="text-gray-600 mb-4">The service you're looking for doesn't exist.</p>
          <Link
            href="/vendor/services"
            className="inline-block px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700"
          >
            Back to Services
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Notification */}
      {notification && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${notification.type === "success"
            ? "bg-green-50 border border-green-200"
            : notification.type === "error"
              ? "bg-red-50 border border-red-200"
              : "bg-emerald-50 border border-emerald-200"
            }`}
        >
          {notification.type === "success" ? (
            <FiCheckCircle className="w-5 h-5 text-green-600" />
          ) : notification.type === "error" ? (
            <FiAlertCircle className="w-5 h-5 text-red-600" />
          ) : (
            <FiAlertCircle className="w-5 h-5 text-emerald-600" />
          )}
          <span
            className={`text-sm font-medium ${notification.type === "success"
              ? "text-green-800"
              : notification.type === "error"
                ? "text-red-800"
                : "text-emerald-800"
              }`}
          >
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

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/vendor/services"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Service</h1>
          <p className="text-gray-600">Update your service details</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Images Section */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Service Images</h2>

          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Current Images ({existingImages.length})</p>
              <div className="grid grid-cols-5 gap-4">
                {existingImages.map((url, index) => (
                  <div key={`existing-${index}`} className="relative group">
                    <img
                      src={url}
                      alt={`Service image ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Images Preview */}
          {newImages.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">New Images to Upload ({newImages.length})</p>
              <div className="grid grid-cols-5 gap-4">
                {newImages.map((file, index) => (
                  <div key={`new-${index}`} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`New image ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border-2 border-green-300"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                    <span className="absolute bottom-1 left-1 bg-green-500 text-white text-xs px-1 rounded">
                      New
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Button */}
          {totalImages < 5 && (
            <div className="border-dashed border-gray-300 rounded-lg p-6">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <FiUpload className="w-10 h-10 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  Click to upload images ({totalImages}/5)
                </p>
              </label>
            </div>
          )}

          {totalImages >= 5 && (
            <p className="text-sm text-orange-600 text-center">
              Maximum 5 images reached. Remove existing images to add new ones.
            </p>
          )}
        </div>

        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent"
                placeholder="e.g., Professional AC Repair"
              />
            </div>

            {/* Category & SubCategory */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData({ ...formData, categoryId: e.target.value, subCategoryId: "" })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sub-Category
                </label>
                <select
                  value={formData.subCategoryId}
                  onChange={(e) => setFormData({ ...formData, subCategoryId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent"
                  disabled={!formData.categoryId}
                >
                  <option value="">Select Sub-Category</option>
                  {selectedCategory?.subCategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Short Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Short Description
              </label>
              <textarea
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                rows={2}
                maxLength={150}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Brief description (max 150 characters)"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.shortDescription.length}/150 characters
              </p>
            </div>

            {/* Full Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Description * (Min 20 characters)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={5}
                className={`w-full px-4 py-2 border rounded-lg outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent ${formData.description.length > 0 && formData.description.length < 20
                  ? "border-orange-300"
                  : "border-gray-300"
                  }`}
                placeholder="Detailed description of your service"
              />
              <p
                className={`text-xs mt-1 ${formData.description.length > 0 && formData.description.length < 20
                  ? "text-orange-600"
                  : "text-gray-500"
                  }`}
              >
                {formData.description.length}/20 minimum characters
                {formData.description.length > 0 && formData.description.length < 20 && (
                  <span> - Need {20 - formData.description.length} more</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing & Duration</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (₹) *
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent"
                placeholder="499"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Price (₹)
              </label>
              <input
                type="number"
                value={formData.discountPrice}
                onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent"
                placeholder="399"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent"
                placeholder="60"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Location</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Street address"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="City"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="State"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="600001"
                  maxLength={6}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tags</h2>

          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={formData.tagInput}
              onChange={(e) => setFormData({ ...formData, tagInput: e.target.value })}
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Add tags (press Enter)"
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 shadow-sm hover:shadow-md transition-all"
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
                <button type="button" onClick={() => removeTag(tag)} className="hover:text-emerald-900">
                  <FiX className="w-4 h-4" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Status */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Status</h2>

          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="APPROVED">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="PENDING">Pending</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link
            href="/vendor/services"
            className="px-6 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving || uploadingImages}
            className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm hover:shadow-md transition-all"
          >
            {saving || uploadingImages ? (
              <>
                <LoadingSpinner size="sm" color="white" />
                {uploadingImages ? "Uploading..." : "Saving..."}
              </>
            ) : (
              <>
                <FiSave className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
