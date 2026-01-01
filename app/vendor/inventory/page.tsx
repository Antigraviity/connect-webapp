"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FiSearch,
  FiAlertCircle,
  FiCheckCircle,
  FiPackage,
  FiEdit,
  FiTrendingUp,
  FiBox,
  FiPlus,
  FiMinus,
  FiRefreshCw,
  FiShoppingBag,
} from "react-icons/fi";

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  stock: number;
  minStock: number;
  sold: number;
  price: number;
  value: number;
  status: string;
  image: string | null;
}

interface Stats {
  totalProducts: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  totalValue: number;
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    "In Stock": "bg-emerald-100 text-emerald-800",
    "Low Stock": "bg-amber-100 text-amber-800",
    "Out of Stock": "bg-red-100 text-red-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};

export default function VendorInventory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
    totalValue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStock, setEditStock] = useState<number>(0);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);

      const userStr = localStorage.getItem('user');
      if (!userStr) {
        setError('Please login to view inventory');
        setLoading(false);
        return;
      }

      const user = JSON.parse(userStr);
      const response = await fetch(`/api/vendor/inventory?sellerId=${user.id}`);
      const data = await response.json();

      if (data.success) {
        setInventory(data.inventory || []);
        setStats(data.stats || {
          totalProducts: 0,
          inStock: 0,
          lowStock: 0,
          outOfStock: 0,
          totalValue: 0,
        });
      } else {
        setError(data.message || 'Failed to fetch inventory');
      }
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const filteredInventory = inventory.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStockUpdate = async (id: string, newStock: number) => {
    try {
      setUpdating(id);

      const userStr = localStorage.getItem('user');
      if (!userStr) return;
      const user = JSON.parse(userStr);

      const response = await fetch('/api/vendor/inventory', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: id,
          stock: newStock,
          sellerId: user.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh inventory
        fetchInventory();
      } else {
        alert(data.message || 'Failed to update stock');
      }
    } catch (err) {
      console.error('Error updating stock:', err);
      alert('Failed to update stock');
    } finally {
      setUpdating(null);
      setEditingId(null);
    }
  };

  const quickAdjustStock = async (id: string, amount: number) => {
    const item = inventory.find(i => i.id === id);
    if (!item) return;

    const newStock = Math.max(0, item.stock + amount);
    await handleStockUpdate(id, newStock);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading inventory...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Inventory</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchInventory}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-1">Track and manage your product stock levels</p>
        </div>
        <button
          onClick={fetchInventory}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
        >
          <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <FiBox className="w-8 h-8 text-emerald-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
              <p className="text-sm text-gray-500">Total Products</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <FiCheckCircle className="w-8 h-8 text-emerald-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.inStock}</p>
              <p className="text-sm text-gray-500">In Stock</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <FiAlertCircle className="w-8 h-8 text-amber-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.lowStock}</p>
              <p className="text-sm text-gray-500">Low Stock</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <FiPackage className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.outOfStock}</p>
              <p className="text-sm text-gray-500">Out of Stock</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-lg p-4 text-white shadow-md">
          <div>
            <p className="text-2xl font-bold">₹{stats.totalValue.toLocaleString()}</p>
            <p className="text-sm text-emerald-50/80">Total Inventory Value</p>
          </div>
        </div>
      </div>

      {/* Stock Alert */}
      {(stats.lowStock > 0 || stats.outOfStock > 0) && (
        <div className="bg-gradient-to-r from-amber-500 to-red-500 text-white rounded-xl p-4 mb-6 flex items-center gap-3 shadow-md">
          <FiAlertCircle className="w-6 h-6 flex-shrink-0" />
          <div>
            <p className="font-semibold">Stock Alert!</p>
            <p className="text-sm text-amber-50">
              {stats.lowStock > 0 && `${stats.lowStock} product(s) running low`}
              {stats.lowStock > 0 && stats.outOfStock > 0 && ' and '}
              {stats.outOfStock > 0 && `${stats.outOfStock} product(s) out of stock`}
            </p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by product name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Inventory Table */}
      {filteredInventory.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FiShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Products Found</h3>
          <p className="text-gray-500 mb-4">
            {inventory.length === 0
              ? "You don't have any products yet. Add products to manage inventory."
              : "No products match your search criteria."}
          </p>
          {inventory.length === 0 && (
            <Link
              href="/vendor/products/add"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-lg hover:from-emerald-700 hover:to-teal-800 shadow-md transition-all"
            >
              <FiPlus className="w-4 h-4" />
              Add Product
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Product</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">SKU</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-gray-900">Stock</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-gray-900">Min Stock</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-gray-900">Sold</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-900">Value</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-gray-900">Status</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                            <FiPackage className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-500">₹{item.price} per unit</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">{item.sku}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => quickAdjustStock(item.id, -1)}
                          disabled={item.stock === 0 || updating === item.id}
                          className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FiMinus className="w-4 h-4" />
                        </button>
                        {editingId === item.id ? (
                          <input
                            type="number"
                            min="0"
                            value={editStock}
                            onChange={(e) => setEditStock(parseInt(e.target.value) || 0)}
                            onBlur={() => handleStockUpdate(item.id, editStock)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleStockUpdate(item.id, editStock);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                            autoFocus
                            className="w-16 text-center py-1 border border-emerald-500 rounded focus:outline-none"
                          />
                        ) : (
                          <span
                            onClick={() => {
                              setEditingId(item.id);
                              setEditStock(item.stock);
                            }}
                            className={`w-12 text-center font-semibold cursor-pointer hover:bg-emerald-50 py-1 rounded ${item.stock === 0 ? 'text-red-600' : item.stock < item.minStock ? 'text-amber-600' : 'text-gray-900'
                              }`}
                          >
                            {updating === item.id ? (
                              <FiRefreshCw className="w-4 h-4 animate-spin inline" />
                            ) : (
                              item.stock
                            )}
                          </span>
                        )}
                        <button
                          onClick={() => quickAdjustStock(item.id, 1)}
                          disabled={updating === item.id}
                          className="p-1 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded disabled:opacity-50"
                        >
                          <FiPlus className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600">{item.minStock}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="flex items-center justify-center gap-1 text-gray-900">
                        {item.sold}
                        {item.sold > 0 && <FiTrendingUp className="w-4 h-4 text-emerald-500" />}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-900">
                      ₹{item.value.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center">
                        <Link
                          href={`/vendor/products/edit/${item.id}`}
                          className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Edit Product"
                        >
                          <FiEdit className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Showing count */}
      {filteredInventory.length > 0 && (
        <p className="text-center text-sm text-gray-500 mt-4">
          Showing {filteredInventory.length} of {inventory.length} products
        </p>
      )}
    </div>
  );
}
