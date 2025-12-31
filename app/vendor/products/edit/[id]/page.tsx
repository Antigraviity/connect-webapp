"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FiArrowLeft,
  FiUpload,
  FiX,
  FiSave,
  FiInfo,
  FiDollarSign,
  FiPackage,
  FiTag,
  FiImage,
  FiAlertCircle,
  FiCheckCircle,
  FiMapPin,
  FiTrash2,
  FiNavigation,
  FiHome,
} from "react-icons/fi";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);

  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    originalPrice: "",
    stock: "",
    tags: "",
    isFeatured: false,
    status: "APPROVED",
    // Shop details
    shopName: "",
    // Location fields
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
    latitude: "",
    longitude: "",
  });

  // Fetch product data and categories on mount
  useEffect(() => {
    fetchProduct();
    fetchCategories();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setFetching(true);
      const response = await fetch(`/api/services/${id}`);
      const data = await response.json();

      if (data.success && data.data) {
        const product = data.data;

        // Parse images
        let productImages: string[] = [];
        try {
          productImages = typeof product.images === 'string'
            ? JSON.parse(product.images)
            : product.images || [];
        } catch (e) {
          productImages = [];
        }

        // Parse tags
        let productTags = '';
        try {
          const tagsArray = typeof product.tags === 'string'
            ? JSON.parse(product.tags)
            : product.tags || [];
          productTags = Array.isArray(tagsArray) ? tagsArray.join(', ') : '';
        } catch (e) {
          productTags = '';
        }

        setExistingImages(productImages);
        setImages(productImages);

        setFormData({
          name: product.title || '',
          description: product.description || '',
          category: product.category?.id || '',
          price: product.discountPrice?.toString() || product.price?.toString() || '',
          originalPrice: product.discountPrice ? product.price?.toString() : '',
          stock: product.stock?.toString() || '0',
          tags: productTags,
          isFeatured: product.featured || false,
          status: product.status || 'APPROVED',
          // Shop name stored in metaTitle
          shopName: product.metaTitle || product.seller?.name || '',
          // Location
          address: product.address || '',
          city: product.city || '',
          state: product.state || '',
          zipCode: product.zipCode || '',
          country: product.country || 'India',
          latitude: product.latitude?.toString() || '',
          longitude: product.longitude?.toString() || '',
        });
      } else {
        setError('Product not found');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setError('Failed to fetch product details');
    } finally {
      setFetching(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      // Fetch only PRODUCT categories
      const response = await fetch('/api/categories?type=PRODUCT');
      const data = await response.json();

      if (data.success) {
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Auto-detect location
  const detectLocation = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setDetectingLocation(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );

          const data = await response.json();

          if (data && data.address) {
            const addr = data.address;
            setFormData(prev => ({
              ...prev,
              address: [addr.road, addr.neighbourhood, addr.suburb].filter(Boolean).join(', ') || '',
              city: addr.city || addr.town || addr.village || addr.county || '',
              state: addr.state || '',
              zipCode: addr.postcode || '',
              country: addr.country || 'India',
              latitude: latitude.toString(),
              longitude: longitude.toString(),
            }));
          }
        } catch (err) {
          setFormData(prev => ({
            ...prev,
            latitude: latitude.toString(),
            longitude: longitude.toString(),
          }));
        }

        setDetectingLocation(false);
      },
      (error) => {
        setDetectingLocation(false);
        setError('Could not detect location. Please enter manually.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));

      setImageFiles([...imageFiles, ...newFiles].slice(0, 5));
      setImages([...images, ...newPreviews].slice(0, 5));
    }
  };

  const removeImage = (index: number) => {
    const imageToRemove = images[index];
    setImages(images.filter((_, i) => i !== index));

    if (imageToRemove.startsWith('blob:')) {
      const blobIndex = images.slice(0, index).filter(img => img.startsWith('blob:')).length;
      setImageFiles(imageFiles.filter((_, i) => i !== blobIndex));
    } else {
      setExistingImages(existingImages.filter(img => img !== imageToRemove));
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'products');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success && data.file?.url) {
        return data.file.url;
      }
      return null;
    } catch (error) {
      console.error('Image upload error:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!formData.name || !formData.description || !formData.category || !formData.price) {
        throw new Error('Please fill in all required fields');
      }

      let allImageUrls: string[] = [...existingImages.filter(img => images.includes(img))];

      for (const file of imageFiles) {
        const url = await uploadImage(file);
        if (url) {
          allImageUrls.push(url);
        }
      }

      if (allImageUrls.length === 0) {
        allImageUrls = ['https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400'];
      }

      const updateData = {
        title: formData.name,
        description: formData.description,
        shortDescription: formData.description.substring(0, 100),
        price: formData.originalPrice ? parseFloat(formData.originalPrice) : parseFloat(formData.price),
        discountPrice: formData.originalPrice ? parseFloat(formData.price) : null,
        images: JSON.stringify(allImageUrls),
        tags: formData.tags ? JSON.stringify(formData.tags.split(',').map(t => t.trim()).filter(t => t)) : null,
        metaTitle: formData.shopName || null,
        featured: formData.isFeatured,
        status: formData.status,
        stock: formData.stock ? parseInt(formData.stock) : 0,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      };

      const response = await fetch(`/api/services/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        setTimeout(() => router.push('/vendor/products'), 2000);
      } else {
        throw new Error(result.message || 'Failed to update product');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/services/${id}`, { method: 'DELETE' });
      const result = await response.json();

      if (result.success) {
        router.push('/vendor/products');
      } else {
        throw new Error(result.message || 'Failed to delete product');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  if (fetching) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Updated Successfully!</h1>
          <p className="text-gray-600 mb-6">Your changes have been saved to the database.</p>
          <Link
            href="/vendor/products"
            className="block w-full bg-emerald-600 text-white font-semibold py-3 rounded-xl hover:bg-emerald-700 transition-colors"
          >
            View My Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/vendor/products" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <FiArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
            <p className="text-gray-600">Update your product details</p>
          </div>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {deleting ? (
            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <FiTrash2 className="w-4 h-4" />
          )}
          Delete Product
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-red-800">Error</h4>
            <p className="text-sm text-red-700">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
            <FiX className="w-5 h-5" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Status Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <FiInfo className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-gray-900">Product Status</h2>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="status"
                value="APPROVED"
                checked={formData.status === 'APPROVED'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-4 h-4 text-green-600"
              />
              <span className="text-sm text-gray-700">Active</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="status"
                value="INACTIVE"
                checked={formData.status === 'INACTIVE'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-4 h-4 text-gray-600"
              />
              <span className="text-sm text-gray-700">Inactive</span>
            </label>
          </div>
        </div>

        {/* Images Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <FiImage className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-gray-900">Product Images</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={image}
                  alt={`Product ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400';
                  }}
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <FiX className="w-4 h-4" />
                </button>
                {index === 0 && (
                  <span className="absolute bottom-2 left-2 text-xs bg-emerald-600 text-white px-2 py-1 rounded">Main</span>
                )}
              </div>
            ))}

            {images.length < 5 && (
              <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-emerald-500 cursor-pointer flex flex-col items-center justify-center gap-2 transition-colors">
                <FiUpload className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-500">Upload</span>
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
              </label>
            )}
          </div>
        </div>

        {/* Shop Details */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <FiHome className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-gray-900">Shop Details</h2>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Shop/Store Name *</label>
            <input
              type="text"
              required
              value={formData.shopName}
              onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
              placeholder="e.g., Fresh Farm Store"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <FiInfo className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-gray-900">Product Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer mt-8">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <span className="text-sm text-gray-700">Feature on Store</span>
              </label>
            </div>
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <FiDollarSign className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-gray-900">Pricing & Inventory</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Selling Price (₹) *</label>
              <input
                type="number"
                required
                min="1"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Original Price (₹)</label>
              <input
                type="number"
                min="0"
                value={formData.originalPrice}
                onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty if no discount</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center gap-2">
                  <FiPackage className="w-4 h-4" />
                  Stock Quantity *
                </span>
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="0"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Available inventory count</p>
            </div>
          </div>
        </div>

        {/* Location Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FiMapPin className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-semibold text-gray-900">Location</h2>
            </div>
            <button
              type="button"
              onClick={detectLocation}
              disabled={detectingLocation}
              className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
            >
              {detectingLocation ? (
                <>
                  <div className="w-4 h-4 border-2 border-green-700 border-t-transparent rounded-full animate-spin"></div>
                  Detecting...
                </>
              ) : (
                <>
                  <FiNavigation className="w-4 h-4" />
                  Auto-detect
                </>
              )}
            </button>
          </div>

          {formData.latitude && formData.longitude && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700 flex items-center gap-2">
                <FiCheckCircle className="w-4 h-4" />
                Location: {formData.latitude}, {formData.longitude}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Street address"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">PIN Code</label>
              <input
                type="text"
                value={formData.zipCode}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <FiTag className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-gray-900">Tags</h2>
          </div>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            placeholder="organic, fresh, local, healthy"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link
            href="/vendor/products"
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-semibold hover:from-emerald-600 hover:to-teal-700 shadow-sm hover:shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <FiSave className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
