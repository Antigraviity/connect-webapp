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
  FiAlertTriangle,
  FiX,
} from "react-icons/fi";
import LoadingSpinner from "@/components/common/LoadingSpinner";

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
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; product: Product | null }>({ isOpen: false, product: null });
  const [deleting, setDeleting] = useState(false);

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
    try {
      setDeleting(true);
      const response = await fetch(`/api/services/${productId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        // Remove from local state
        setProducts(products.filter(p => p.id !== productId));
        setDeleteModal({ isOpen: false, product: null });
      } else {
        alert('Failed to delete product: ' + data.message);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    } finally {
      setDeleting(false);
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">My Products</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage your product listings and inventory</p>
        </div>
        <Link
          href="/vendor/products/add"
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-sm font-bold hover:from-emerald-600 hover:to-teal-700 transition-all shadow-md hover:shadow-lg active:scale-95"
        >
          <FiPlus className="w-5 h-5" />
          Add New Product
        </Link>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Products", value: totalProducts, color: "text-gray-900", bg: "bg-white", icon: FiBox, iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
          { label: "Active", value: activeProducts, color: "text-emerald-600", bg: "bg-emerald-50/50", icon: FiCheckCircle, iconBg: "bg-emerald-100", iconColor: "text-emerald-700" },
          { label: "Pending", value: pendingProducts, color: "text-amber-600", bg: "bg-amber-50/50", icon: FiAlertCircle, iconBg: "bg-amber-100", iconColor: "text-amber-700" },
          { label: "Inactive", value: inactiveProducts, color: "text-gray-500", bg: "bg-gray-50/50", icon: FiPackage, iconBg: "bg-red-50", iconColor: "text-red-600" }
        ].map((item, index) => (
          <div key={index} className={`${item.bg} rounded-2xl border border-gray-100 p-4 transition-all hover:border-emerald-100 shadow-sm`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${item.iconBg} rounded-xl flex items-center justify-center shrink-0`}>
                <item.icon className={`w-5 h-5 ${item.iconColor}`} />
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{loading ? '-' : item.value}</p>
                <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider truncate">{item.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-8 shadow-sm">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all text-sm font-medium"
              />
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchProducts}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-50 text-gray-700 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-all text-sm font-bold border border-transparent hover:border-emerald-100"
            >
              {loading ? (
                <LoadingSpinner size="sm" color="current" />
              ) : (
                <FiRefreshCw className="w-4 h-4" />
              )}
              Refresh
            </button>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
            {allCategories.slice(0, 10).map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-300 ${selectedCategory === category
                  ? "bg-emerald-600 text-white shadow-lg scale-105"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
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
        <div className="py-12">
          <LoadingSpinner size="lg" color="vendor" label="Loading..." />
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
                      {/* Badge removed as per request */}
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

                  {/* Product Actions */}
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                    <Link
                      href={`/vendor/products/preview/${product.id}`}
                      className="flex items-center justify-center gap-2 px-3 py-2.5 bg-gray-50 text-gray-700 rounded-xl text-xs sm:text-sm font-bold hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-transparent hover:border-emerald-100"
                    >
                      <FiEye className="w-4 h-4" /> View
                    </Link>
                    <Link
                      href={`/vendor/products/edit/${product.id}`}
                      className="flex items-center justify-center gap-2 px-3 py-2.5 bg-gray-50 text-gray-700 rounded-xl text-xs sm:text-sm font-bold hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-transparent hover:border-emerald-100"
                    >
                      <FiEdit className="w-4 h-4" /> Edit
                    </Link>
                    <button
                      onClick={() => setDeleteModal({ isOpen: true, product })}
                      className="col-span-2 flex items-center justify-center gap-2 px-3 py-2.5 bg-rose-50 text-rose-600 rounded-xl text-xs sm:text-sm font-bold hover:bg-rose-100 transition-all border border-transparent hover:border-rose-100"
                    >
                      <FiTrash2 className="w-4 h-4" /> Delete Product
                    </button>
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

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && deleteModal.product && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <FiAlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Product</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <span className="font-semibold text-gray-900">"{deleteModal.product.title}"</span>? This will permanently remove the product from your listings.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal({ isOpen: false, product: null })}
                disabled={deleting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteModal.product!.id)}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <LoadingSpinner size="sm" color="white" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <FiTrash2 className="w-4 h-4" />
                    Delete Product
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
