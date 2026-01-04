"use client";

import { useState, useEffect } from "react";
import {
  FiAlertCircle,
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiSearch,
  FiEye,
  FiMessageSquare,
} from "react-icons/fi";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface Dispute {
  id: string;
  fullId: string;
  disputeId: string;
  title: string;
  description: string;
  serviceName: string;
  bookingId: string;
  customerName: string;
  customerEmail: string;
  vendorName: string;
  disputedAmount: string;
  disputedAmountValue: number;
  status: string;
  priority: string;
  createdAt: string;
  createdAtISO: string;
}

interface Stats {
  totalDisputes: number;
  openDisputes: number;
  inProgressDisputes: number;
  resolvedDisputes: number;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "OPEN":
      return { bg: "bg-red-100", text: "text-red-800", label: "Open" };
    case "IN_PROGRESS":
      return { bg: "bg-yellow-100", text: "text-yellow-800", label: "In Progress" };
    case "RESOLVED":
      return { bg: "bg-green-100", text: "text-green-800", label: "Resolved" };
    default:
      return { bg: "bg-gray-100", text: "text-gray-800", label: status };
  }
};

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case "HIGH":
      return { bg: "bg-red-100", text: "text-red-800", label: "HIGH" };
    case "MEDIUM":
      return { bg: "bg-yellow-100", text: "text-yellow-800", label: "MEDIUM" };
    case "LOW":
      return { bg: "bg-green-100", text: "text-green-800", label: "LOW" };
    default:
      return { bg: "bg-gray-100", text: "text-gray-800", label: priority };
  }
};

export default function DisputesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalDisputes: 0,
    openDisputes: 0,
    inProgressDisputes: 0,
    resolvedDisputes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/admin/services/disputes");
      const data = await response.json();

      if (data.success) {
        setDisputes(data.disputes);
        setStats(data.stats);
      } else {
        setError(data.message || "Failed to fetch disputes");
      }
    } catch (err) {
      setError("Network error: Could not fetch disputes");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDisputes = disputes.filter((dispute) => {
    const matchesSearch =
      dispute.disputeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.vendorName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || dispute.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <LoadingSpinner size="lg" color="admin" />
            <p className="text-gray-600">Loading disputes...</p>
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
              <h3 className="font-semibold">Error Loading Disputes</h3>
              <p className="text-sm">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchDisputes}
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
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-900">Disputes</h1>
          <span className="px-2 py-1 bg-admin-50 text-admin-700 text-xs font-semibold rounded-full">
            LIVE DATA
          </span>
        </div>
        <p className="text-gray-600 mt-1">
          Manage and resolve service disputes between customers and vendors.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-admin-50 rounded-lg flex items-center justify-center">
              <FiAlertCircle className="w-5 h-5 text-admin-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDisputes}</p>
              <p className="text-xs text-gray-500">Total Disputes</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <FiAlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.openDisputes}</p>
              <p className="text-xs text-gray-500">Open</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <FiClock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.inProgressDisputes}</p>
              <p className="text-xs text-gray-500">In Progress</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FiCheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.resolvedDisputes}</p>
              <p className="text-xs text-gray-500">Resolved</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search disputes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-admin-500 focus:border-transparent outline-none"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-admin-500 focus:border-transparent outline-none cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </div>

      {/* Empty State */}
      {filteredDisputes.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiAlertCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {disputes.length === 0 ? "No Disputes Found" : "No disputes match your search"}
          </h3>
          <p className="text-gray-500">
            {searchQuery || filterStatus !== "all"
              ? "Try adjusting your filters"
              : "Disputes will appear here when customers report issues with services"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDisputes.map((dispute) => {
            const statusBadge = getStatusBadge(dispute.status);
            const priorityBadge = getPriorityBadge(dispute.priority);

            return (
              <div
                key={dispute.fullId}
                className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{dispute.disputeId}</h3>
                      <span
                        className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${statusBadge.bg} ${statusBadge.text}`}
                      >
                        {statusBadge.label}
                      </span>
                      <span
                        className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${priorityBadge.bg} ${priorityBadge.text}`}
                      >
                        {priorityBadge.label}
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1">{dispute.title}</h4>
                    <p className="text-sm text-gray-600">{dispute.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">Disputed Amount</p>
                    <p className="text-xl font-bold text-red-600">{dispute.disputedAmount}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Service</p>
                    <p className="font-medium text-gray-900">{dispute.serviceName}</p>
                    <p className="text-xs text-gray-500">Booking: {dispute.bookingId}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Customer</p>
                    <p className="font-medium text-gray-900">{dispute.customerName}</p>
                    <p className="text-xs text-gray-500">{dispute.customerEmail}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Vendor</p>
                    <p className="font-medium text-gray-900">{dispute.vendorName}</p>
                    <p className="text-xs text-gray-500">{dispute.createdAt}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">Created: {dispute.createdAt}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => alert(`View details for ${dispute.disputeId}`)}
                      className="flex items-center gap-2 px-4 py-2 bg-admin-600 text-white rounded-lg hover:bg-admin-700 transition-colors text-sm font-medium"
                    >
                      <FiEye className="w-4 h-4" />
                      View Details
                    </button>
                    <button
                      onClick={() => alert(`Respond to ${dispute.disputeId}`)}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                      <FiMessageSquare className="w-4 h-4" />
                      Respond
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary */}
      {filteredDisputes.length > 0 && (
        <div className="text-center text-sm text-gray-500">
          Showing {filteredDisputes.length} of {disputes.length} disputes (live data)
        </div>
      )}
    </div>
  );
}
