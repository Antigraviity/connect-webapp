"use client";

import { useState } from "react";
import {
  FiSearch,
  FiAlertCircle,
  FiCheckCircle,
  FiPackage,
  FiEdit,
  FiTrendingUp,
  FiTrendingDown,
  FiBox,
  FiPlus,
  FiMinus,
} from "react-icons/fi";

// Mock inventory data
const inventoryData = [
  { id: "1", name: "Fresh Vegetables Basket", sku: "VEG-001", stock: 45, minStock: 20, sold: 156, price: 249, status: "In Stock" },
  { id: "2", name: "Homemade Murukku", sku: "SNK-001", stock: 12, minStock: 20, sold: 89, price: 120, status: "Low Stock" },
  { id: "3", name: "Organic Fruit Pack", sku: "FRT-001", stock: 30, minStock: 15, sold: 67, price: 449, status: "In Stock" },
  { id: "4", name: "Farm Fresh Eggs", sku: "DAI-001", stock: 60, minStock: 30, sold: 234, price: 120, status: "In Stock" },
  { id: "5", name: "Homemade Pickle", sku: "CON-001", stock: 0, minStock: 10, sold: 145, price: 180, status: "Out of Stock" },
  { id: "6", name: "Fresh Paneer", sku: "DAI-002", stock: 25, minStock: 20, sold: 98, price: 280, status: "In Stock" },
  { id: "7", name: "Organic Honey", sku: "CON-002", stock: 8, minStock: 15, sold: 56, price: 350, status: "Low Stock" },
  { id: "8", name: "Mixed Dry Fruits", sku: "SNK-002", stock: 40, minStock: 25, sold: 78, price: 599, status: "In Stock" },
];

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    "In Stock": "bg-green-100 text-green-800",
    "Low Stock": "bg-orange-100 text-orange-800",
    "Out of Stock": "bg-red-100 text-red-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};

export default function VendorInventory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [inventory, setInventory] = useState(inventoryData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStock, setEditStock] = useState<number>(0);

  const filteredInventory = inventory.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    totalProducts: inventory.length,
    inStock: inventory.filter(i => i.status === "In Stock").length,
    lowStock: inventory.filter(i => i.status === "Low Stock").length,
    outOfStock: inventory.filter(i => i.status === "Out of Stock").length,
    totalValue: inventory.reduce((acc, item) => acc + (item.stock * item.price), 0),
  };

  const handleStockUpdate = (id: string, newStock: number) => {
    setInventory(inventory.map(item => {
      if (item.id === id) {
        let status = "In Stock";
        if (newStock === 0) status = "Out of Stock";
        else if (newStock < item.minStock) status = "Low Stock";
        return { ...item, stock: newStock, status };
      }
      return item;
    }));
    setEditingId(null);
  };

  const quickAdjustStock = (id: string, amount: number) => {
    setInventory(inventory.map(item => {
      if (item.id === id) {
        const newStock = Math.max(0, item.stock + amount);
        let status = "In Stock";
        if (newStock === 0) status = "Out of Stock";
        else if (newStock < item.minStock) status = "Low Stock";
        return { ...item, stock: newStock, status };
      }
      return item;
    }));
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
        <p className="text-gray-600 mt-1">Track and manage your product stock levels</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <FiBox className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
              <p className="text-sm text-gray-500">Total Products</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <FiCheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.inStock}</p>
              <p className="text-sm text-gray-500">In Stock</p>
            </div>
          </div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <FiAlertCircle className="w-8 h-8 text-orange-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.lowStock}</p>
              <p className="text-sm text-gray-500">Low Stock</p>
            </div>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <FiPackage className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.outOfStock}</p>
              <p className="text-sm text-gray-500">Out of Stock</p>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 col-span-2 sm:col-span-1">
          <div>
            <p className="text-2xl font-bold text-gray-900">₹{stats.totalValue.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Total Inventory Value</p>
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {stats.lowStock > 0 || stats.outOfStock > 0 ? (
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-4 mb-6 text-white">
          <div className="flex items-center gap-3">
            <FiAlertCircle className="w-6 h-6" />
            <div>
              <p className="font-semibold">Stock Alert!</p>
              <p className="text-sm text-orange-100">
                {stats.lowStock} product(s) running low and {stats.outOfStock} product(s) out of stock
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by product name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Product</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">SKU</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Stock</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Min Stock</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Sold</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Value</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">₹{item.price} per unit</p>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{item.sku}</span>
                  </td>
                  <td className="py-4 px-4">
                    {editingId === item.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          value={editStock}
                          onChange={(e) => setEditStock(parseInt(e.target.value) || 0)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => handleStockUpdate(item.id, editStock)}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                        >
                          <FiCheckCircle className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold ${item.stock === 0 ? "text-red-600" : item.stock < item.minStock ? "text-orange-600" : "text-gray-900"}`}>
                          {item.stock}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => quickAdjustStock(item.id, -1)}
                            className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <FiMinus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => quickAdjustStock(item.id, 1)}
                            className="p-1 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                          >
                            <FiPlus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-gray-600">{item.minStock}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-900 font-medium">{item.sold}</span>
                      <FiTrendingUp className="w-4 h-4 text-green-500" />
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-semibold text-gray-900">₹{(item.stock * item.price).toLocaleString()}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => {
                        setEditingId(item.id);
                        setEditStock(item.stock);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Stock"
                    >
                      <FiEdit className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredInventory.length === 0 && (
          <div className="text-center py-12">
            <FiPackage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
