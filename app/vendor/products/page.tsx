"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FiPlus,
  FiSearch,
  FiFilter,
  FiEdit,
  FiTrash2,
  FiEye,
  FiStar,
  FiBox,
  FiMoreVertical,
  FiAlertCircle,
  FiCheckCircle,
  FiPackage,
  FiRefreshCw,
} from "react-icons/fi";

interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  discountPrice?: number;
  images: string;
  status: string;
  rating: number;
  totalReviews: number;
  featured: boolean;
  popular: boolean;
  views: number;
  createdAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  seller: {
    id: string;
    name: string;
    email: string;
    verified: boolean;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    "APPROVED": "bg-green-100 text-green-800",
    "Active": "bg-green-100 text-green-800",
    "PENDING": "bg-yellow-100 text-yellow-800",
    "REJECTED": "bg-red-100 text-red-800",
    "INACTIVE": "bg-gray-100 text-gray-800",
    "Low Stock": "bg-orange-100 text-orange-800",
    "Out of Stock": "bg-red-100 text-red-800",
    "Draft": "bg-gray-100 text-gray-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "APPROVED":
    case "Active":
      return <FiCheckCircle className="w-4 h-4" />;
    case "PENDING":
    case "Low Stock":
      return <FiAlertCircle className="w-4 h-4" />;
    case "REJECTED":
    case "Out of Stock":
      return <FiAlertCircle className="w-4 h-4" />;
    default:
      return null;
  }
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    "APPROVED": "Active",
    "PENDING": "Pending",
    "REJECTED": "Rejected",
    "INACTIVE": "Inactive",
  };
  return labels[status] || status;
};

const getProductImage = (images: string) => {
  try {
    const parsed = typeof images === 'string' ? JSON.parse(images) : images;
    if (parsed && parsed.length > 0) {
      return parsed[0];
    }
  } catch (e) {
    // Fallback
  }
  return 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300';
};

export default function VendorProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [userId, setUserId] = useState<string | null>(null);

  // Load user ID on mount
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserId(user.id);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  // Fetch products when userId is available
  useEffect(() => {
    if (userId) {
      fetchProducts();
      fetchCategories();
    }
  }, [userId]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Fetch PRODUCTS for this seller (not services)
      const response = await fetch(`/api/services?sellerId=${userId}&type=PRODUCT&status=`);
      const data = await response.json();

      if (data.success) {
        setProducts(data.services || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      // Fetch only PRODUCT categories
      const response = await fetch('/api/categories?type=PRODUCT');
      const data = await response.json();

      if (data.success) {
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const response = await fetch(`/api/services/${productId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        // Remove from local state
        setProducts(products.filter(p => p.id !== productId));
      } else {
        alert('Failed to delete product: ' + data.message);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || product.category?.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate stats
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.status === 'APPROVED').length;
  const pendingProducts = products.filter(p => p.status === 'PENDING').length;
  const inactiveProducts = products.filter(p => p.status === 'INACTIVE' || p.status === 'REJECTED').length;

  // Get unique categories from products + API categories
  const allCategories = ["All", ...new Set([
    ...categories.map(c => c.name),
    ...products.map(p => p.category?.name).filter(Boolean)
  ])];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
          <p className="text-gray-600 mt-1">Manage your product listings and inventory</p>
        </div>
        <Link
          href="/vendor/products/add"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <FiPlus className="w-5 h-5" />
          Add New Product
        </Link>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <FiBox className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{loading ? '-' : totalProducts}</p>
              <p className="text-sm text-gray-500">Total Products</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <FiCheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{loading ? '-' : activeProducts}</p>
              <p className="text-sm text-gray-500">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <FiAlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{loading ? '-' : pendingProducts}</p>
              <p className="text-sm text-gray-500">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <FiPackage className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{loading ? '-' : inactiveProducts}</p>
              <p className="text-sm text-gray-500">Inactive</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchProducts}
            className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            {allCategories.slice(0, 6).map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === category
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <span className="ml-3 text-gray-600">Loading your products...</span>
        </div>
      ) : (
        <>
          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-emerald-300 transition-all"
              >
                {/* Product Image */}
                <div className="relative h-48 bg-gray-100">
                  <img
                    src={getProductImage(product.images)}
                    alt={product.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300';
                    }}
                  />
                  <div className="absolute top-3 right-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(product.status)}`}>
                      {getStatusIcon(product.status)}
                      {getStatusLabel(product.status)}
                    </span>
                  </div>
                  {product.discountPrice && product.discountPrice < product.price && (
                    <div className="absolute top-3 left-3">
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
                      </span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="text-xs text-emerald-600 font-medium">{product.category?.name || 'Uncategorized'}</span>
                      <h3 className="font-semibold text-gray-900 mt-1">{product.title}</h3>
                    </div>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <FiMoreVertical className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>

                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                    {product.shortDescription || product.description}
                  </p>

                  <div className="flex items-center gap-2 mb-3">
                    {product.discountPrice && product.discountPrice < product.price ? (
                      <>
                        <span className="text-xl font-bold text-gray-900">₹{product.discountPrice}</span>
                        <span className="text-sm text-gray-400 line-through">₹{product.price}</span>
                      </>
                    ) : (
                      <span className="text-xl font-bold text-gray-900">₹{product.price}</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <span className="flex items-center gap-1">
                      <FiStar className="w-4 h-4 text-yellow-500 fill-current" />
                      {product.rating?.toFixed(1) || '0.0'} ({product.totalReviews || 0})
                    </span>
                    <span>{product.views || 0} views</span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-500">
                      Added {new Date(product.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/buy-products/${product.slug}`}
                        className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="View"
                      >
                        <FiEye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/vendor/products/edit/${product.id}`}
                        className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <FiEdit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredProducts.length === 0 && !loading && (
            <div className="text-center py-12">
              <FiBox className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {products.length === 0 ? 'No products yet' : 'No products found'}
              </h3>
              <p className="text-gray-500 mb-4">
                {products.length === 0
                  ? 'Start by adding your first product to the store'
                  : 'Try adjusting your search or filter criteria'
                }
              </p>
              <Link
                href="/vendor/products/add"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-sm"
              >
                <FiPlus className="w-4 h-4" />
                Add Your First Product
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
