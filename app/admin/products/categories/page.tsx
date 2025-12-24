"use client";

import { useState, useEffect } from "react";
import {
  FiLayers,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiPackage,
  FiX,
  FiCheckCircle,
  FiAlertTriangle,
} from "react-icons/fi";

// Category interface
interface Category {
  id: number;
  name: string;
  products: number;
  status: "ACTIVE" | "INACTIVE";
  description: string;
  subCategories?: string[];
}

// Initial categories data
const initialCategoriesData: Category[] = [
  { id: 1, name: "Food", products: 2450, status: "ACTIVE", description: "Prepared meals and food items", subCategories: ["Veg", "Non-Veg", "Organic", "Ready to Eat", "Homemade"] },
  { id: 2, name: "Snacks", products: 1890, status: "ACTIVE", description: "Snacks and munchies", subCategories: ["Traditional", "Chips", "Namkeen", "Sweets", "Bakery"] },
  { id: 3, name: "Vegetables", products: 1456, status: "ACTIVE", description: "Fresh vegetables", subCategories: ["Organic", "Fresh", "Exotic", "Leafy Greens", "Root Vegetables"] },
  { id: 4, name: "Fruits", products: 1234, status: "ACTIVE", description: "Fresh fruits", subCategories: ["Seasonal", "Exotic", "Organic", "Dry Fruits", "Fresh"] },
  { id: 5, name: "Dairy & Eggs", products: 890, status: "ACTIVE", description: "Dairy products and eggs", subCategories: ["Milk", "Cheese", "Butter", "Eggs", "Paneer"] },
  { id: 6, name: "Street Food", products: 567, status: "ACTIVE", description: "Street food items", subCategories: ["Chaat", "Samosa", "Vada Pav", "Dosa", "Pav Bhaji"] },
  { id: 7, name: "Beverages", products: 345, status: "INACTIVE", description: "Drinks and beverages", subCategories: ["Juices", "Smoothies", "Lassi", "Tea", "Coffee"] },
];

// Add Category Modal
function AddCategoryModal({ isOpen, onClose, onAdd }: { isOpen: boolean; onClose: () => void; onAdd: (category: Category) => void }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE",
    subCategories: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Category name is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    const subCats = formData.subCategories.split(",").map((s) => s.trim()).filter((s) => s.length > 0);
    
    const newCategory: Category = {
      id: Date.now(),
      name: formData.name,
      description: formData.description,
      status: formData.status,
      products: 0,
      subCategories: subCats.length > 0 ? subCats : undefined,
    };

    onAdd(newCategory);
    setIsSubmitting(false);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setFormData({ name: "", description: "", status: "ACTIVE", subCategories: "" });
    setErrors({});
  };

  const resetAndClose = () => { resetForm(); onClose(); };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={resetAndClose} />
        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 backdrop-blur rounded-lg"><FiPlus className="w-5 h-5 text-white" /></div>
                <div><h3 className="text-lg font-semibold text-white">Add New Category</h3><p className="text-sm text-orange-100">Create a new product category</p></div>
              </div>
              <button onClick={resetAndClose} className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg"><FiX className="w-5 h-5" /></button>
            </div>
          </div>

          {/* Form */}
          <div className="px-6 py-6 space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Organic Food"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${errors.name ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                placeholder="Brief description of this category"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${errors.description ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>

            {/* Sub-categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sub-Categories (optional)</label>
              <input
                type="text"
                name="subCategories"
                value={formData.subCategories}
                onChange={handleInputChange}
                placeholder="e.g., Veg, Non-Veg, Organic (comma separated)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Separate multiple sub-categories with commas</p>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
            <button onClick={resetAndClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 flex items-center gap-2 disabled:bg-orange-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Adding...</>) : (<><FiPlus className="w-4 h-4" />Add Category</>)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Edit Category Modal
function EditCategoryModal({ category, isOpen, onClose, onSave }: { category: Category | null; isOpen: boolean; onClose: () => void; onSave: (category: Category) => void }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE",
    subCategories: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form when category changes
  if (isOpen && category && formData.name !== category.name) {
    setFormData({
      name: category.name,
      description: category.description,
      status: category.status,
      subCategories: category.subCategories?.join(", ") || "",
    });
  }

  if (!isOpen || !category) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Category name is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    const subCats = formData.subCategories.split(",").map((s) => s.trim()).filter((s) => s.length > 0);
    
    const updatedCategory: Category = {
      ...category,
      name: formData.name,
      description: formData.description,
      status: formData.status,
      subCategories: subCats.length > 0 ? subCats : undefined,
    };

    onSave(updatedCategory);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 backdrop-blur rounded-lg"><FiEdit2 className="w-5 h-5 text-white" /></div>
                <div><h3 className="text-lg font-semibold text-white">Edit Category</h3><p className="text-sm text-blue-100">Update category details</p></div>
              </div>
              <button onClick={onClose} className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg"><FiX className="w-5 h-5" /></button>
            </div>
          </div>

          {/* Form */}
          <div className="px-6 py-6 space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.name ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.description ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>

            {/* Sub-categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sub-Categories</label>
              <input
                type="text"
                name="subCategories"
                value={formData.subCategories}
                onChange={handleInputChange}
                placeholder="Comma separated sub-categories"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Separate multiple sub-categories with commas</p>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            {/* Products count info */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiPackage className="w-4 h-4" />
                <span><strong>{category.products.toLocaleString()}</strong> products in this category</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Saving...</>) : (<><FiCheckCircle className="w-4 h-4" />Save Changes</>)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Delete Confirmation Modal
function DeleteConfirmModal({ category, isOpen, onClose, onConfirm }: { category: Category | null; isOpen: boolean; onClose: () => void; onConfirm: () => void }) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !category) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    onConfirm();
    setIsDeleting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
          <div className="p-6">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full mb-4">
              <FiAlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Delete Category</h3>
            <p className="text-gray-600 text-center mb-4">
              Are you sure you want to delete <strong>"{category.name}"</strong>? This action cannot be undone.
            </p>
            {category.products > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 text-yellow-700 text-sm">
                  <FiAlertTriangle className="w-4 h-4" />
                  <span>This category has <strong>{category.products.toLocaleString()} products</strong>. They will need to be reassigned.</span>
                </div>
              </div>
            )}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <FiLayers className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{category.name}</p>
                <p className="text-sm text-gray-500">{category.description}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 flex items-center gap-2 disabled:bg-red-400 disabled:cursor-not-allowed"
            >
              {isDeleting ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Deleting...</>) : (<><FiTrash2 className="w-4 h-4" />Delete Category</>)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductCategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/products/categories');
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.categories || []);
      } else {
        console.error('Failed to fetch categories:', data.message);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddCategory = async (newCategory: Category) => {
    try {
      const response = await fetch('/api/admin/products/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newCategory.name,
          description: newCategory.description,
          status: newCategory.status,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh categories list
        fetchCategories();
        alert('Category created successfully!');
      } else {
        alert(data.message || 'Failed to create category');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Failed to create category');
    }
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setShowEditModal(true);
  };

  const handleSaveCategory = (updatedCategory: Category) => {
    setCategories((prev) => prev.map((cat) => (cat.id === updatedCategory.id ? updatedCategory : cat)));
  };

  const handleDeleteClick = (category: Category) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (selectedCategory) {
      setCategories((prev) => prev.filter((cat) => cat.id !== selectedCategory.id));
    }
  };

  const stats = {
    total: categories.length,
    active: categories.filter((c) => c.status === "ACTIVE").length,
    inactive: categories.filter((c) => c.status === "INACTIVE").length,
    totalProducts: categories.reduce((sum, c) => sum + c.products, 0),
  };

  return (
    <div className="p-6 space-y-6">
      {/* Modals */}
      <AddCategoryModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onAdd={handleAddCategory} />
      <EditCategoryModal category={selectedCategory} isOpen={showEditModal} onClose={() => setShowEditModal(false)} onSave={handleSaveCategory} />
      <DeleteConfirmModal category={selectedCategory} isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} onConfirm={handleConfirmDelete} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Categories</h1>
          <p className="text-gray-600 mt-1">Manage product categories for the marketplace.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm font-semibold"
        >
          <FiPlus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiLayers className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">Total Categories</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FiCheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              <p className="text-xs text-gray-500">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <FiLayers className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
              <p className="text-xs text-gray-500">Inactive</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <FiPackage className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProducts.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Total Products</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="relative max-w-md">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => (
          <div
            key={category.id}
            className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                category.status === "ACTIVE"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}>
                {category.status}
              </span>
            </div>

            <p className="text-sm text-gray-500 mb-3">{category.description}</p>

            {/* Sub-categories */}
            {category.subCategories && category.subCategories.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {category.subCategories.slice(0, 3).map((sub) => (
                  <span key={sub} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                    {sub}
                  </span>
                ))}
                {category.subCategories.length > 3 && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                    +{category.subCategories.length - 3} more
                  </span>
                )}
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiPackage className="w-4 h-4" />
                <span>{category.products.toLocaleString()} products</span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleEditCategory(category)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit Category"
                >
                  <FiEdit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteClick(category)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Category"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Empty State */}
      {filteredCategories.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <FiLayers className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
          <p className="text-gray-500 mb-4">Try adjusting your search or add a new category</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 text-sm font-semibold"
          >
            <FiPlus className="w-4 h-4" />
            Add Category
          </button>
        </div>
      )}
    </div>
  );
}
