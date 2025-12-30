"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    HelpCircle,
    MessageCircle,
    Clock,
    CheckCircle,
    AlertTriangle,
    Plus,
    Eye,
    Send,
} from "lucide-react";

interface Ticket {
    id: string;
    ticketId: string;
    subject: string;
    description: string;
    status: string;
    priority: string;
    messages: number;
    createdAt: string;
    updatedAt: string;
}

export default function ProductSupportPage() {
    const [loading, setLoading] = useState(true);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [showNewTicketForm, setShowNewTicketForm] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        subject: "",
        description: "",
        priority: "medium",
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        // Get user ID from localStorage
        const user = localStorage.getItem("user");
        if (user) {
            const userData = JSON.parse(user);
            setUserId(userData.id);
        }
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            // Ideally pass type=PRODUCT filter if backend supports it
            const response = await fetch("/api/tickets?type=PRODUCT");
            const data = await response.json();

            if (data.success) {
                setTickets(data.tickets || []);
            }
        } catch (error) {
            console.error("Error fetching tickets:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!userId) {
            alert("Please login to create a support ticket");
            return;
        }

        try {
            setSubmitting(true);
            const response = await fetch("/api/tickets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    userId,
                    type: "PRODUCT", // Explicitly set type
                }),
            });

            const data = await response.json();

            if (data.success) {
                alert("Support ticket created successfully!");
                setFormData({ subject: "", description: "", priority: "medium" });
                setShowNewTicketForm(false);
                fetchTickets(); // Refresh the list
            } else {
                alert(data.message || "Failed to create ticket");
            }
        } catch (error) {
            console.error("Error creating ticket:", error);
            alert("Failed to create ticket");
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const upperStatus = status.toUpperCase();
        switch (upperStatus) {
            case "OPEN":
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Open
                    </span>
                );
            case "IN_PROGRESS":
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Clock className="w-3 h-3 mr-1" />
                        In Progress
                    </span>
                );
            case "RESOLVED":
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Resolved
                    </span>
                );
            case "CLOSED":
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Closed
                    </span>
                );
            default:
                return null;
        }
    };

    const getPriorityBadge = (priority: string) => {
        const lower = priority.toLowerCase();
        const colors = {
            high: "bg-red-100 text-red-800",
            medium: "bg-yellow-100 text-yellow-800",
            low: "bg-green-100 text-green-800",
        };
        return (
            <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[lower as keyof typeof colors] || "bg-gray-100 text-gray-800"
                    }`}
            >
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </span>
        );
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Product Support Tickets</h1>
                        <p className="text-gray-600 mt-2">
                            Get help with your product orders an account
                        </p>
                    </div>
                    <button
                        onClick={() => setShowNewTicketForm(!showNewTicketForm)}
                        className="flex items-center gap-2 bg-gradient-to-r from-primary-300 to-primary-500 text-white px-4 py-2 rounded-lg hover:from-primary-400 hover:to-primary-600 shadow-md hover:shadow-lg transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        New Ticket
                    </button>
                </div>
            </div>

            {/* New Ticket Form */}
            {showNewTicketForm && (
                <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Create Product Support Ticket
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Subject *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.subject}
                                onChange={(e) =>
                                    setFormData({ ...formData, subject: e.target.value })
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                                placeholder="Brief description of your issue"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description *
                            </label>
                            <textarea
                                required
                                rows={5}
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                                placeholder="Provide detailed information about your issue"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Priority
                            </label>
                            <select
                                value={formData.priority}
                                onChange={(e) =>
                                    setFormData({ ...formData, priority: e.target.value })
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                            >
                                <option value="low">Low - General inquiry</option>
                                <option value="medium">Medium - Issue affecting usage</option>
                                <option value="high">High - Urgent issue</option>
                            </select>
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex items-center gap-2 bg-gradient-to-r from-primary-300 to-primary-500 text-white px-6 py-2 rounded-lg hover:from-primary-400 hover:to-primary-600 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                            >
                                <Send className="w-4 h-4" />
                                {submitting ? "Submitting..." : "Submit Ticket"}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowNewTicketForm(false)}
                                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Tickets</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {loading ? "-" : tickets.length}
                            </p>
                        </div>
                        <HelpCircle className="w-8 h-8 text-blue-500" />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Open</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {loading
                                    ? "-"
                                    : tickets.filter((t) => t.status === "OPEN").length}
                            </p>
                        </div>
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">In Progress</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {loading
                                    ? "-"
                                    : tickets.filter((t) => t.status === "IN_PROGRESS").length}
                            </p>
                        </div>
                        <Clock className="w-8 h-8 text-yellow-500" />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Resolved</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {loading
                                    ? "-"
                                    : tickets.filter((t) => t.status === "RESOLVED").length}
                            </p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                </div>
            </div>

            {/* Tickets List */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">My Product Tickets</h2>
                </div>

                {loading ? (
                    <div className="p-12 text-center">
                        <p className="text-gray-500">Loading tickets...</p>
                    </div>
                ) : tickets.length === 0 ? (
                    <div className="p-12 text-center">
                        <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 mb-2">No support tickets yet</p>
                        <p className="text-sm text-gray-400">
                            Click "New Ticket" to create your first support request
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Ticket
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Priority
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Messages
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Created
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {tickets.map((ticket) => (
                                    <tr key={ticket.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {ticket.ticketId}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {ticket.subject}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(ticket.status)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getPriorityBadge(ticket.priority)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                                <MessageCircle className="w-4 h-4" />
                                                {ticket.messages}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-600">
                                                {new Date(ticket.createdAt).toLocaleDateString()}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1">
                                                <Eye className="w-4 h-4" />
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
