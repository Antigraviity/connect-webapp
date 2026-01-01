"use client";

import { FiUpload } from "react-icons/fi";
import { useState, useEffect } from "react";
import {
  FiShoppingBag,
  FiSearch,
  FiPlus,
  FiMoreVertical,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiStar,
  FiMapPin,
  FiCheckCircle,
  FiClock,
  FiDownload,
  FiGrid,
  FiList,
  FiPackage,
  FiAlertTriangle,
  FiX,
} from "react-icons/fi";

interface Product {
  id: string;
  name: string;
  seller: string;
  sellerLocation: string;
  category: string;
  price: number;
  discountPrice: number | null;
  discountPercent: number;
  stock: number;
  stockStatus: string;
  rating: number;
  reviews: number;
  status: string;
  featured: boolean;
  image: string | null;
  createdAt: string;
}

interface Stats {
  total: number;
  active: number;
  pending: number;
  lowStock: number;
  outOfStock: number;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "APPROVED":
      return { bg: "bg-green-100", text: "text-green-800", label: "Active" };
    case "PENDING":
      return { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pending" };
    case "REJECTED":
      return { bg: "bg-red-100", text: "text-red-800", label: "Rejected" };
    case "INACTIVE":
      return { bg: "bg-gray-100", text: "text-gray-800", label: "Inactive" };
    default:
      return { bg: "bg-gray-100", text: "text-gray-800", label: status };
  }
};

const getStockBadge = (stockStatus: string, stock: number) => {
  if (stockStatus === "Out of Stock") {
    return { bg: "bg-red-100", text: "text-red-800", label: "Out of Stock" };
  } else if (stockStatus === "Low Stock") {
    return { bg: "bg-orange-100", text: "text-orange-800", label: `${stock} units - Low Stock` };
  } else {
    return { bg: "bg-green-100", text: "text-green-800", label: `${stock} units - In Stock` };
  }
};

export default function AllProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    active: 0,
    pending: 0,
    lowStock: 0,
    outOfStock: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [sellers, setSellers] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    discountPrice: '',
    categoryId: '',
    sellerId: '',
    images: [] as string[],
    featured: false,
    stock: '',
  });
  const [editFormData, setEditFormData] = useState({
    id: '',
    title: '',
    description: '',
    price: '',
    discountPrice: '',
    categoryId: '',
    sellerId: '',
    images: [] as string[],
    featured: false,
    stock: '',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (showAddModal) {
      fetchCategoriesAndSellers();
    }
  }, [showAddModal]);

  const fetchCategoriesAndSellers = async () => {
    try {
      const catResponse = await fetch('/api/admin/services/categories');
      const catData = await catResponse.json();
      if (catData.success) {
        setAllCategories(catData.categories);
      }

      const sellerResponse = await fetch('/api/admin/products/sellers');
      const sellerData = await sellerResponse.json();
      if (sellerData.success) {
        setSellers(sellerData.sellers);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);
        formDataUpload.append('folder', 'products');

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formDataUpload,
        });

        const data = await response.json();
        if (data.success && data.file?.url) {
          uploadedUrls.push(data.file.url);
        }
      }

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));
    } catch (error) {
      alert('Failed to upload images');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/admin/products/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert('Product created successfully!');
        setShowAddModal(false);
        setFormData({
          title: '',
          description: '',
          price: '',
          discountPrice: '',
          categoryId: '',
          sellerId: '',
          images: [],
          featured: false,
          stock: '',
        });
        fetchProducts();
      } else {
        alert(data.message || 'Failed to create product');
      }
    } catch (error) {
      alert('Network error: Could not create product');
      console.error('Submit error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (product: any) => {
    try {
      // Fetch full product details
      const response = await fetch(`/api/admin/products/get?id=${product.id}`);
      const data = await response.json();

      if (data.success) {
        const fullProduct = data.product;
        console.log('Full product data:', fullProduct);
        console.log('Images array:', fullProduct.images);
        setEditingProduct(fullProduct);
        setEditFormData({
          id: fullProduct.id,
          title: fullProduct.title,
          description: fullProduct.description || '',
          price: fullProduct.price.toString(),
          discountPrice: fullProduct.discountPrice?.toString() || '',
          categoryId: fullProduct.categoryId || '',
          sellerId: fullProduct.sellerId || '',
          images: fullProduct.images || [],
          featured: fullProduct.featured || false,
          stock: fullProduct.stock?.toString() || '0',
        });
        setShowEditModal(true);
        fetchCategoriesAndSellers();
      } else {
        alert('Failed to load product details');
      }
    } catch (error) {
      alert('Error loading product');
      console.error('Edit error:', error);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(`/api/admin/products/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData),
      });

      const data = await response.json();

      if (data.success) {
        alert('Product updated successfully!');
        setShowEditModal(false);
        setEditingProduct(null);
        fetchProducts();
      } else {
        alert(data.message || 'Failed to update product');
      }
    } catch (error) {
      alert('Network error: Could not update product');
      console.error('Update error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (productId: string, productName: string) => {
    if (!confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/products/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: productId }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Product deleted successfully!');
        fetchProducts();
      } else {
        alert(data.message || 'Failed to delete product');
      }
    } catch (error) {
      alert('Network error: Could not delete product');
      console.error('Delete error:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/admin/products/all");
      const data = await response.json();

      if (data.success) {
        setProducts(data.products);
        setStats(data.stats);
      } else {
        setError(data.message || "Failed to fetch products");
      }
    } catch (err) {
      setError("Network error: Could not fetch products");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.seller.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || product.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Get unique categories
  const categories = Array.from(new Set(products.map(p => p.category)));

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading products...</p>
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
            <FiAlertTriangle className="w-5 h-5" />
            <div>
              <h3 className="font-semibold">Error Loading Products</h3>
              <p className="text-sm">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchProducts}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">All Products</h1>
            <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
              LIVE DATA
            </span>
          </div>
          <p className="text-gray-600 mt-1">Manage all products listed on the marketplace.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <FiDownload className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors font-medium"
          >
            <FiPlus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiShoppingBag className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-sm text-gray-500">Total</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <FiCheckCircle className="w-4 h-4 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
          <p className="text-sm text-gray-500">Active</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <FiClock className="w-4 h-4 text-yellow-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
          <p className="text-sm text-gray-500">Pending</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <FiAlertTriangle className="w-4 h-4 text-orange-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.lowStock}</p>
          <p className="text-sm text-gray-500">Low Stock</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <FiPackage className="w-4 h-4 text-red-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.outOfStock}</p>
          <p className="text-sm text-gray-500">Out of Stock</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products or sellers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="APPROVED">Active</option>
            <option value="PENDING">Pending</option>
            <option value="REJECTED">Rejected</option>
            <option value="INACTIVE">Inactive</option>
          </select>
          <div className="flex gap-2 border border-gray-300 rounded-lg p-1">
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded ${viewMode === "list" ? "bg-orange-100 text-orange-600" : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              <FiList className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded ${viewMode === "grid" ? "bg-orange-100 text-orange-600" : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              <FiGrid className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiShoppingBag className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {products.length === 0 ? "No Products Found" : "No products match your filters"}
          </h3>
          <p className="text-gray-500">
            {searchQuery || categoryFilter !== "all" || statusFilter !== "all"
              ? "Try adjusting your filters"
              : "Products will appear here once sellers add them"}
          </p>
        </div>
      ) : (
        <>
          {/* Products Table */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <input type="checkbox" className="rounded border-gray-300" />
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Product
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Seller
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Stock
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Rating
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.map((product) => {
                    const statusBadge = getStatusBadge(product.status);
                    const stockBadge = getStockBadge(product.stockStatus, product.stock);

                    return (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <input type="checkbox" className="rounded border-gray-300" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center overflow-hidden">
                              {product.image ? (
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-2xl">📦</span>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-gray-900">{product.name}</p>
                                {product.featured && (
                                  <span className="flex items-center gap-1 text-xs text-yellow-600">
                                    ⭐ Featured
                                  </span>
                                )}
                                {product.discountPercent > 0 && (
                                  <>
                                    {/* Badge removed */}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{product.seller}</p>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <FiMapPin className="w-3 h-3" />
                              {product.sellerLocation}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-bold text-gray-900">
                              ₹{product.discountPrice || product.price}
                            </p>
                            {product.discountPrice && (
                              <p className="text-xs text-gray-500 line-through">
                                ₹{product.price}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${stockBadge.bg} ${stockBadge.text}`}
                          >
                            {stockBadge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <FiStar className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="font-medium text-gray-900">{product.rating > 0 ? product.rating : 'N/A'}</span>
                            <span className="text-xs text-gray-500">({product.reviews})</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${statusBadge.bg} ${statusBadge.text}`}
                          >
                            {statusBadge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => alert(`View ${product.name}`)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <FiEye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(product)}
                              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Edit Product"
                            >
                              <FiEdit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(product.id, product.name)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Product"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {filteredProducts.length} of {products.length} products (live data)
              </p>
            </div>
          </div>
        </>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Add New Product</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  placeholder="e.g., Fresh Chicken Biryani"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  placeholder="Describe your product..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                    placeholder="299"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Discount Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.discountPrice}
                    onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                    placeholder="259"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  placeholder="10"
                />
                <p className="text-xs text-gray-500 mt-1">How many units available?</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  >
                    <option value="">Select Category</option>
                    {allCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Seller *</label>
                  <select
                    required
                    value={formData.sellerId}
                    onChange={(e) => setFormData({ ...formData, sellerId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  >
                    <option value="">Select Seller</option>
                    {sellers.map(seller => (
                      <option key={seller.id} value={seller.id}>{seller.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="image-upload"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <FiUpload className="w-4 h-4" />
                    {uploading ? 'Uploading...' : 'Upload Images'}
                  </label>
                  <p className="text-sm text-gray-500 mt-2">PNG, JPG up to 5MB</p>
                </div>

                {formData.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-4 gap-2">
                    {formData.images.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Product ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            images: prev.images.filter((_, i) => i !== index)
                          }))}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FiX className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                  Mark as Featured Product
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || submitting}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Creating...' : uploading ? 'Please wait...' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Edit Product</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingProduct(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Title *</label>
                <input
                  type="text"
                  required
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  placeholder="e.g., Fresh Chicken Biryani"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  required
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  placeholder="Describe your product..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={editFormData.price}
                    onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                    placeholder="299"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Discount Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editFormData.discountPrice}
                    onChange={(e) => setEditFormData({ ...editFormData, discountPrice: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                    placeholder="259"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={editFormData.stock}
                  onChange={(e) => setEditFormData({ ...editFormData, stock: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  placeholder="10"
                />
                <p className="text-xs text-gray-500 mt-1">Current stock level</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    required
                    value={editFormData.categoryId}
                    onChange={(e) => setEditFormData({ ...editFormData, categoryId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  >
                    <option value="">Select Category</option>
                    {allCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Seller *</label>
                  <select
                    required
                    value={editFormData.sellerId}
                    onChange={(e) => setEditFormData({ ...editFormData, sellerId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  >
                    <option value="">Select Seller</option>
                    {sellers.map(seller => (
                      <option key={seller.id} value={seller.id}>{seller.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="edit-image-upload"
                    multiple
                    accept="image/*"
                    onChange={async (e) => {
                      const files = e.target.files;
                      if (!files || files.length === 0) return;

                      setUploading(true);
                      const uploadedUrls: string[] = [];

                      try {
                        for (let i = 0; i < files.length; i++) {
                          const file = files[i];
                          const formDataUpload = new FormData();
                          formDataUpload.append('file', file);
                          formDataUpload.append('folder', 'products');

                          const response = await fetch('/api/upload', {
                            method: 'POST',
                            body: formDataUpload,
                          });

                          const data = await response.json();
                          if (data.success && data.file?.url) {
                            uploadedUrls.push(data.file.url);
                          }
                        }

                        setEditFormData(prev => ({
                          ...prev,
                          images: [...prev.images, ...uploadedUrls]
                        }));
                      } catch (error) {
                        alert('Failed to upload images');
                        console.error('Upload error:', error);
                      } finally {
                        setUploading(false);
                      }
                    }}
                    className="hidden"
                  />
                  <label
                    htmlFor="edit-image-upload"
                    className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <FiUpload className="w-4 h-4" />
                    {uploading ? 'Uploading...' : 'Upload Images'}
                  </label>
                  <p className="text-sm text-gray-500 mt-2">PNG, JPG up to 5MB</p>
                </div>

                {editFormData.images && editFormData.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-4 gap-2">
                    {editFormData.images.map((url, index) => {
                      // Skip if URL is null, undefined, or not a string
                      if (!url || typeof url !== 'string') {
                        console.warn('Invalid image URL at index', index, url);
                        return null;
                      }

                      return (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Product ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                            onError={(e) => {
                              console.error('Failed to load image:', url);
                              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Ctext x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setEditFormData(prev => ({
                              ...prev,
                              images: prev.images.filter((_, i) => i !== index)
                            }))}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <FiX className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    }).filter(Boolean)}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit-featured"
                  checked={editFormData.featured}
                  onChange={(e) => setEditFormData({ ...editFormData, featured: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <label htmlFor="edit-featured" className="text-sm font-medium text-gray-700">
                  Mark as Featured Product
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingProduct(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || submitting}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Updating...' : uploading ? 'Please wait...' : 'Update Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
