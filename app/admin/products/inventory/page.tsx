"use client";

import { useState, useEffect } from "react";
import {
  FiPackage,
  FiSearch,
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle,
  FiEdit2,
  FiRefreshCw,
  FiBox,
  FiMapPin,
} from "react-icons/fi";

interface InventoryItem {
  id: string;
  productName: string;
  seller: string;
  sku: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  status: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
  lastRestocked: string;
  price: string;
  location: string;
}

interface Stats {
  total: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "IN_STOCK":
      return { bg: "bg-green-100", text: "text-green-800", label: "In Stock", icon: FiCheckCircle };
    case "LOW_STOCK":
      return { bg: "bg-orange-100", text: "text-orange-800", label: "Low Stock", icon: FiAlertTriangle };
    case "OUT_OF_STOCK":
      return { bg: "bg-red-100", text: "text-red-800", label: "Out of Stock", icon: FiXCircle };
    default:
      return { bg: "bg-gray-100", text: "text-gray-800", label: status, icon: FiBox };
  }
};

const getStockLevel = (current: number, max: number) => {
  const percentage = (current / max) * 100;
  if (current === 0) return { color: "bg-red-500", percentage: 0 };
  if (percentage <= 30) return { color: "bg-orange-500", percentage };
  return { color: "bg-green-500", percentage };
};

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, inStock: 0, lowStock: 0, outOfStock: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [editingStock, setEditingStock] = useState<string | null>(null);
  const [newStock, setNewStock] = useState<number>(0);

  useEffect(() => {
    fetchInventory();
  }, [filterCategory, filterStatus, searchQuery]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterCategory !== 'all') params.append('category', filterCategory);
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/admin/products/inventory?${params}`);
      const data = await response.json();

      if (data.success) {
        setInventory(data.inventory);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async (productId: string, stock: number) => {
    try {
      const response = await fetch('/api/admin/products/inventory', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, stock, action: 'set' })
      });

      const data = await response.json();
      if (data.success) {
        fetchInventory(); // Refresh the list
        setEditingStock(null);
      }
    } catch (error) {
      console.error('Error updating stock:', error);
    }
  };

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.seller.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Product Inventory</h1>
        <p className="text-gray-600 mt-1">Manage stock levels and inventory.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FiBox className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">Total Products</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <FiCheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.inStock}</p>
              <p className="text-sm text-gray-500">In Stock</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <FiAlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.lowStock}</p>
              <p className="text-sm text-gray-500">Low Stock</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <FiXCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.outOfStock}</p>
              <p className="text-sm text-gray-500">Out of Stock</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stock Alert */}
      {stats.lowStock + stats.outOfStock > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
          <FiAlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-orange-900">Stock Alert</h3>
            <p className="text-sm text-orange-700 mt-1">
              {stats.lowStock} products are running low on stock and {stats.outOfStock} products are out of stock. Consider restocking soon.
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by product name, seller, or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg"
          >
            <option value="all">All Categories</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg"
          >
            <option value="all">All Status</option>
            <option value="IN_STOCK">In Stock</option>
            <option value="LOW_STOCK">Low Stock</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
          </select>
          <button
            onClick={fetchInventory}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <FiRefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Restocked
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Loading inventory...
                  </td>
                </tr>
              ) : filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No products found.
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => {
                  const statusBadge = getStatusBadge(item.status);
                  const stockLevel = getStockLevel(item.currentStock, item.maxStock);
                  const StatusIcon = statusBadge.icon;

                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{item.productName}</p>
                          <p className="text-sm text-gray-500">{item.seller} • <FiMapPin className="inline w-3 h-3" /> {item.location}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.sku}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {editingStock === item.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={newStock}
                                onChange={(e) => setNewStock(parseInt(e.target.value) || 0)}
                                className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                                autoFocus
                              />
                              <button
                                onClick={() => handleUpdateStock(item.id, newStock)}
                                className="text-green-600 hover:text-green-700"
                              >
                                <FiCheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEditingStock(null)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <FiXCircle className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <p className="text-sm font-medium text-gray-900">
                              {item.currentStock} / {item.maxStock}
                            </p>
                          )}
                          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${stockLevel.color} transition-all`}
                              style={{ width: `${stockLevel.percentage}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500">Min: {item.minStock}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full ${statusBadge.bg} ${statusBadge.text}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.lastRestocked}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            setEditingStock(item.id);
                            setNewStock(item.currentStock);
                          }}
                          className="text-purple-600 hover:text-purple-700"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
