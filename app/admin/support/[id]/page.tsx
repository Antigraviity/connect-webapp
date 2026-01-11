"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Send,
    Clock,
    CheckCircle,
    AlertTriangle,
    User,
    Shield,
    Calendar,
    Check
} from "lucide-react";

interface TicketMessage {
    id: string;
    message: string;
    attachment: string | null;
    isAdmin: boolean;
    createdAt: string;
}

interface Ticket {
    id: string;
    ticketId: string;
    subject: string;
    description: string;
    status: string;
    priority: string;
    customer: string;
    email: string;
    phone: string;
    createdAt: string;
    messages: TicketMessage[];
}

export default async function AdminTicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <AdminTicketDetailPageClient id={id} />;
}

function AdminTicketDetailPageClient({ id }: { id: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [newMessage, setNewMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchTicket();
    }, [id]);

    useEffect(() => {
        scrollToBottom();
    }, [ticket?.messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchTicket = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/tickets/${id}`);
            const data = await response.json();

            if (data.success) {
                setTicket(data.ticket);
            } else {
                console.error("Failed to fetch ticket:", data.message);
            }
        } catch (error) {
            console.error("Error fetching ticket:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !ticket) return;

        try {
            setSending(true);
            const response = await fetch(`/api/tickets/${id}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: newMessage,
                    isAdmin: true, // Admin view sends isAdmin: true
                }),
            });

            const data = await response.json();

            if (data.success) {
                setNewMessage("");
                fetchTicket();
            } else {
                alert(data.message || "Failed to send message");
            }
        } catch (error) {
            console.error("Error sending message:", error);
            alert("Failed to send message");
        } finally {
            setSending(false);
        }
    };

    const handleUpdateStatus = async (status: string) => {
        try {
            setUpdatingStatus(true);
            const response = await fetch(`/api/tickets/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });

            const data = await response.json();

            if (data.success) {
                fetchTicket();
            } else {
                alert(data.message || "Failed to update status");
            }
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to update status");
        } finally {
            setUpdatingStatus(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const upperStatus = status.toUpperCase();
        switch (upperStatus) {
            case "OPEN":
                return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">Open</span>;
            case "IN_PROGRESS":
                return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200">In Progress</span>;
            case "RESOLVED":
                return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">Resolved</span>;
            case "CLOSED":
                return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200">Closed</span>;
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    if (!ticket) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-2xl font-bold">Ticket Not Found</h2>
                <button onClick={() => router.back()} className="text-admin-600 mt-4 hover:underline">Go Back</button>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-xl font-bold text-gray-900">{ticket.subject}</h1>
                                {getStatusBadge(ticket.status)}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                Ticket ID: <span className="font-mono">{ticket.ticketId}</span> • Created on {new Date(ticket.createdAt).toLocaleString()}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {ticket.status !== 'IN_PROGRESS' && ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && (
                            <button
                                onClick={() => handleUpdateStatus('IN_PROGRESS')}
                                disabled={updatingStatus}
                                className="px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm font-semibold hover:bg-yellow-600 transition-all"
                            >
                                Mark In Progress
                            </button>
                        )}
                        {ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && (
                            <button
                                onClick={() => handleUpdateStatus('RESOLVED')}
                                disabled={updatingStatus}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-all flex items-center gap-2"
                            >
                                <Check className="w-4 h-4" />
                                Resolve Ticket
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Info Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Customer Details</h2>
                        <div className="space-y-4 text-sm">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-admin-50 rounded-lg">
                                    <User className="w-4 h-4 text-admin-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">{ticket.customer}</p>
                                    <p className="text-gray-500 break-all">{ticket.email}</p>
                                    <p className="text-gray-500">{ticket.phone}</p>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-gray-100">
                                <p className="text-xs text-gray-400 font-bold uppercase mb-2">Priority</p>
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${ticket.priority === 'high' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                    {ticket.priority.toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chat Section */}
                <div className="lg:col-span-2 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-[600px]">
                    <div className="p-4 bg-gray-50 border-b border-gray-200 overflow-y-auto max-h-32">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-2">Description</p>
                        <p className="text-sm text-gray-700">{ticket.description}</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {ticket.messages.length === 0 ? (
                            <div className="text-center py-10 opacity-50">
                                <p className="text-sm">No messages yet. Start the conversation.</p>
                            </div>
                        ) : (
                            ticket.messages.map((msg) => (
                                <div key={msg.id} className={`flex items-start gap-3 ${msg.isAdmin ? "flex-row-reverse" : ""}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.isAdmin ? "bg-admin-100" : "bg-gray-100"}`}>
                                        {msg.isAdmin ? <Shield className="w-4 h-4 text-admin-600" /> : <User className="w-4 h-4 text-gray-600" />}
                                    </div>
                                    <div className={`max-w-[80%] ${msg.isAdmin ? "text-right" : ""}`}>
                                        <div className={`flex items-center gap-2 mb-1 ${msg.isAdmin ? "flex-row-reverse" : ""}`}>
                                            <span className="text-xs font-bold">{msg.isAdmin ? "You (Admin)" : ticket.customer}</span>
                                            <span className="text-[10px] text-gray-400">{new Date(msg.createdAt).toLocaleTimeString()}</span>
                                        </div>
                                        <p className={`text-sm p-3 rounded-lg ${msg.isAdmin ? "bg-admin-600 text-white" : "bg-gray-100 text-gray-800"}`}>
                                            {msg.message}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-4 border-t border-gray-200 bg-gray-50">
                        <form onSubmit={handleSendMessage} className="flex gap-2">
                            <textarea
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Reply to customer..."
                                className="flex-1 bg-white border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-admin-500/20 focus:border-admin-500 resize-none"
                                rows={2}
                            />
                            <button
                                type="submit"
                                disabled={sending || !newMessage.trim()}
                                className="bg-admin-600 text-white px-4 rounded-lg hover:bg-admin-700 transition-all flex items-center justify-center disabled:opacity-50"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
