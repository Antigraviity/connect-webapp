"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FiArrowLeft,
  FiUpload,
  FiX,
  FiPlus,
  FiInfo,
  FiDollarSign,
  FiPackage,
  FiTag,
  FiImage,
  FiAlertCircle,
  FiCheckCircle,
  FiMapPin,
  FiNavigation,
  FiHome,
} from "react-icons/fi";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function AddProduct() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [detectingLocation, setDetectingLocation] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    originalPrice: "",
    stock: "",
    unit: "piece",
    minOrder: "1",
    maxOrder: "",
    sku: "",
    tags: "",
    isOrganic: false,
    isFeatured: false,
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

  // Load user ID and categories on mount
  useEffect(() => {
    // Get user ID from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserId(user.id);
        // Pre-fill from user profile
        if (user.address) setFormData(prev => ({ ...prev, address: user.address }));
        if (user.city) setFormData(prev => ({ ...prev, city: user.city }));
        if (user.state) setFormData(prev => ({ ...prev, state: user.state }));
        if (user.zipCode) setFormData(prev => ({ ...prev, zipCode: user.zipCode }));
        // Use user's name as default shop name if not set
        if (user.name) setFormData(prev => ({ ...prev, shopName: prev.shopName || user.name }));
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }

    // Fetch categories
    fetchCategories();
  }, []);

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

  // Auto-detect location using browser Geolocation API
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
          // Use OpenStreetMap Nominatim API for reverse geocoding (free, no API key needed)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            {
              headers: {
                'Accept-Language': 'en',
              }
            }
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
          console.error('Reverse geocoding error:', err);
          // Still save coordinates even if reverse geocoding fails
          setFormData(prev => ({
            ...prev,
            latitude: latitude.toString(),
            longitude: longitude.toString(),
          }));
        }

        setDetectingLocation(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setDetectingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError('Location permission denied. Please enable location access in your browser settings.');
            break;
          case error.POSITION_UNAVAILABLE:
            setError('Location information is unavailable.');
            break;
          case error.TIMEOUT:
            setError('Location request timed out.');
            break;
          default:
            setError('An error occurred while getting your location.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));

      // Store both files and previews
      setImageFiles([...imageFiles, ...newFiles].slice(0, 5));
      setImages([...images, ...newPreviews].slice(0, 5));
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setImageFiles(imageFiles.filter((_, i) => i !== index));
  };

  // Upload image to server
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
      // Validate required fields
      if (!formData.name || !formData.description || !formData.category || !formData.price) {
        throw new Error('Please fill in all required fields');
      }

      if (!userId) {
        throw new Error('User not logged in. Please sign in again.');
      }

      // Upload images first
      let uploadedImageUrls: string[] = [];
      if (imageFiles.length > 0) {
        console.log('Uploading images...');
        for (const file of imageFiles) {
          const url = await uploadImage(file);
          if (url) {
            uploadedImageUrls.push(url);
          }
        }
      }

      // If no images uploaded, use placeholder
      if (uploadedImageUrls.length === 0) {
        uploadedImageUrls = ['https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400'];
      }

      // Find category ID from selected category name
      const selectedCategory = categories.find(cat => cat.name === formData.category || cat.id === formData.category);
      if (!selectedCategory) {
        throw new Error('Please select a valid category');
      }

      // Prepare service/product data
      const productData = {
        title: formData.name,
        description: formData.description,
        shortDescription: formData.description.substring(0, 100),
        price: formData.originalPrice ? parseFloat(formData.originalPrice) : parseFloat(formData.price),
        discountPrice: formData.originalPrice ? parseFloat(formData.price) : undefined,
        duration: 60,
        categoryId: selectedCategory.id,
        sellerId: userId,
        images: uploadedImageUrls,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t) : [],
        metaKeywords: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t) : [],
        featured: formData.isFeatured,
        type: 'PRODUCT', // Important: Set type to PRODUCT
        stock: formData.stock ? parseInt(formData.stock) : 0, // Stock quantity for inventory
        // Shop & Location data
        shopName: formData.shopName,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
      };

      console.log('Creating product with data:', productData);

      // Call the services API to create the product
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        console.log('Product created successfully:', result);

        // Redirect after a short delay
        setTimeout(() => {
          router.push('/vendor/products');
        }, 2000);
      } else {
        throw new Error(result.message || 'Failed to create product');
      }
    } catch (err) {
      console.error('Error creating product:', err);
      setError(err instanceof Error ? err.message : 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  // Success message
  if (success) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Added Successfully!</h1>
          <p className="text-gray-600 mb-6">
            Your product has been saved to the database and is now live.
          </p>
          <div className="space-y-3">
            <Link
              href="/vendor/products"
              className="block w-full bg-emerald-600 text-white font-semibold py-3 rounded-xl hover:bg-emerald-700 transition-colors"
            >
              View My Products
            </Link>
            <button
              onClick={() => {
                setSuccess(false);
                setFormData({
                  name: "",
                  description: "",
                  category: "",
                  price: "",
                  originalPrice: "",
                  stock: "",
                  unit: "piece",
                  minOrder: "1",
                  maxOrder: "",
                  sku: "",
                  tags: "",
                  isOrganic: false,
                  isFeatured: false,
                  shopName: "",
                  address: "",
                  city: "",
                  state: "",
                  zipCode: "",
                  country: "India",
                  latitude: "",
                  longitude: "",
                });
                setImages([]);
                setImageFiles([]);
              }}
              className="block w-full border border-gray-300 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Add Another Product
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/vendor/products"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
          <p className="text-gray-600">Fill in the details to list a new product</p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-red-800">Error</h4>
            <p className="text-sm text-red-700">{error}</p>
            {error.includes("Plan limit reached") && (
              <Link href="/vendor/subscription" className="mt-2 text-xs font-bold text-red-800 underline hover:text-red-900 inline-block">
                Upgrade your plan to list more products &rarr;
              </Link>
            )}
          </div>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
            <FiX className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Info Banner */}
      <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
        <FiInfo className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-emerald-800">Product will be saved to database</h4>
          <p className="text-sm text-emerald-700">
            Your product details will be stored in the database and will be visible to customers immediately.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Images Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <FiImage className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-gray-900">Product Images</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                <img src={image} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <FiX className="w-4 h-4" />
                </button>
                {index === 0 && (
                  <span className="absolute bottom-2 left-2 text-xs bg-emerald-600 text-white px-2 py-1 rounded">
                    Main
                  </span>
                )}
              </div>
            ))}

            {images.length < 5 && (
              <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-emerald-500 cursor-pointer flex flex-col items-center justify-center gap-2 transition-colors">
                <FiUpload className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-500">Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-3">
            Upload up to 5 images. First image will be the main product image.
          </p>
        </div>

        {/* Shop Details */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <FiHome className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-gray-900">Shop Details</h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shop/Store Name *
            </label>
            <input
              type="text"
              required
              value={formData.shopName}
              onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
              placeholder="e.g., Fresh Farm Store, Organic Kitchen"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              This name will be displayed to customers (like store names on Swiggy/Zomato)
            </p>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Fresh Organic Vegetables Basket"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description * <span className="text-gray-400">(minimum 20 characters)</span>
              </label>
              <textarea
                required
                rows={4}
                minLength={20}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your product in detail..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length}/20 characters minimum
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              {categoriesLoading ? (
                <div className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                  Loading categories...
                </div>
              ) : (
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
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SKU (Optional)
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="e.g., VEG-001"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Location Section with Auto-detect */}
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
                  <LoadingSpinner size="sm" color="current" />
                  Detecting...
                </>
              ) : (
                <>
                  <FiNavigation className="w-4 h-4" />
                  Auto-detect Location
                </>
              )}
            </button>
          </div>

          {formData.latitude && formData.longitude && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700 flex items-center gap-2">
                <FiCheckCircle className="w-4 h-4" />
                Location detected: {formData.latitude}, {formData.longitude}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Street address, Building name"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g., Chennai"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="e.g., Tamil Nadu"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PIN Code
              </label>
              <input
                type="text"
                value={formData.zipCode}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                placeholder="e.g., 600001"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="e.g., India"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <FiDollarSign className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-gray-900">Pricing</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selling Price (₹) *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="249"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Original Price (₹)
              </label>
              <input
                type="number"
                min="0"
                value={formData.originalPrice}
                onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                placeholder="299"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty if no discount</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="piece">Per Piece</option>
                <option value="kg">Per Kg</option>
                <option value="gram">Per 100g</option>
                <option value="liter">Per Liter</option>
                <option value="pack">Per Pack</option>
                <option value="dozen">Per Dozen</option>
              </select>
            </div>
          </div>
        </div>

        {/* Inventory */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <FiPackage className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-gray-900">Inventory</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Quantity
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="50"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Order Qty
              </label>
              <input
                type="number"
                min="1"
                value={formData.minOrder}
                onChange={(e) => setFormData({ ...formData, minOrder: e.target.value })}
                placeholder="1"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Order Qty
              </label>
              <input
                type="number"
                min="1"
                value={formData.maxOrder}
                onChange={(e) => setFormData({ ...formData, maxOrder: e.target.value })}
                placeholder="10"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Tags & Options */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <FiTag className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-gray-900">Tags & Options</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="organic, fresh, local, healthy"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isOrganic}
                  onChange={(e) => setFormData({ ...formData, isOrganic: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <span className="text-sm text-gray-700">Organic Product</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <span className="text-sm text-gray-700">Feature on Store</span>
              </label>
            </div>
          </div>
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
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-semibold hover:from-emerald-600 hover:to-teal-700 shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" color="white" />
                Saving to Database...
              </>
            ) : (
              <>
                <FiPlus className="w-5 h-5" />
                Publish Product
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
