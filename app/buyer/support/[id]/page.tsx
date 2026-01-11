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
    Paperclip,
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
    createdAt: string;
    messages: TicketMessage[];
}

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <TicketDetailPageClient id={id} />;
}

function TicketDetailPageClient({ id }: { id: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [newMessage, setNewMessage] = useState("");
    const [sending, setSending] = useState(false);
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
                // router.push("/buyer/support");
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
                    isAdmin: false,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setNewMessage("");
                fetchTicket(); // Refresh to show new message
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

    const getStatusBadge = (status: string) => {
        const upperStatus = status.toUpperCase();
        switch (upperStatus) {
            case "OPEN":
                return (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Open
                    </span>
                );
            case "IN_PROGRESS":
                return (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200">
                        <Clock className="w-3 h-3 mr-1" />
                        In Progress
                    </span>
                );
            case "RESOLVED":
                return (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Resolved
                    </span>
                );
            case "CLOSED":
                return (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200">
                        Closed
                    </span>
                );
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
            <div className="max-w-7xl mx-auto px-4 py-8 text-center">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold">Ticket Not Found</h2>
                <button
                    onClick={() => router.back()}
                    className="mt-4 text-primary-500 hover:underline"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-900">{ticket.subject}</h1>
                            {getStatusBadge(ticket.status)}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                            Ticket ID: <span className="font-mono">{ticket.ticketId}</span> • Created on {new Date(ticket.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chat Section */}
                <div className="lg:col-span-2 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden h-[600px]">
                    {/* Description Message (Original Post) */}
                    <div className="p-4 bg-gray-50 border-b border-gray-200">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center shrink-0">
                                <User className="w-6 h-6 text-primary-600" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-gray-900">{ticket.customer}</span>
                                    <span className="text-xs text-gray-500">Original Post</span>
                                </div>
                                <p className="text-sm text-gray-800 bg-white p-3 rounded-lg border border-gray-100">
                                    {ticket.description}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Messages List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f8fafc]">
                        {ticket.messages.length === 0 ? (
                            <div className="text-center py-10">
                                <p className="text-gray-400 text-sm italic">Waiting for support team response...</p>
                            </div>
                        ) : (
                            ticket.messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex items-start gap-3 ${msg.isAdmin ? "" : "flex-row-reverse"}`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.isAdmin ? "bg-indigo-100" : "bg-primary-100"}`}>
                                        {msg.isAdmin ? <Shield className="w-5 h-5 text-indigo-600" /> : <User className="w-5 h-5 text-primary-600" />}
                                    </div>
                                    <div className={`max-w-[80%] ${msg.isAdmin ? "" : "text-right"}`}>
                                        <div className={`flex items-center gap-2 mb-1 ${msg.isAdmin ? "" : "flex-row-reverse"}`}>
                                            <span className="text-xs font-bold text-gray-700">{msg.isAdmin ? "Support Team" : "You"}</span>
                                            <span className="text-[10px] text-gray-400">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <p className={`text-sm p-3 rounded-2xl shadow-sm ${msg.isAdmin ? "bg-white text-gray-800 rounded-tl-none border border-gray-100" : "bg-primary-500 text-white rounded-tr-none"}`}>
                                            {msg.message}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Chat Input */}
                    <div className="p-4 border-t border-gray-200">
                        {ticket.status === 'CLOSED' || ticket.status === 'RESOLVED' ? (
                            <div className="text-center p-2 bg-gray-50 rounded-lg text-sm text-gray-500 border border-dashed border-gray-300">
                                This ticket is {ticket.status.toLowerCase()}. Replies are disabled.
                            </div>
                        ) : (
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <div className="relative flex-1">
                                    <textarea
                                        rows={1}
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage(e);
                                            }
                                        }}
                                        placeholder="Type your message here..."
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none"
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-500"
                                    >
                                        <Paperclip className="w-5 h-5" />
                                    </button>
                                </div>
                                <button
                                    type="submit"
                                    disabled={sending || !newMessage.trim()}
                                    className="bg-primary-500 text-white p-3 rounded-xl hover:bg-primary-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center shrink-0"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {/* Info Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Ticket Information</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Priority</p>
                                <div className="mt-1">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${ticket.priority === 'high' ? 'bg-red-50 text-red-600 border-red-100' : ticket.priority === 'medium' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                                        {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Timeline</p>
                                <div className="mt-2 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                            <Calendar className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-700">Submitted</p>
                                            <p className="text-[10px] text-gray-500">{new Date(ticket.createdAt).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                                            <Clock className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-700">Last Activity</p>
                                            <p className="text-[10px] text-gray-500">Today</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-500 to-primary-600 rounded-2xl shadow-lg p-6 text-white">
                        <h2 className="text-lg font-bold mb-2">Need immediate assistance?</h2>
                        <p className="text-primary-50 text-xs mb-4">Our support team is available Mon-Fri, 9am - 6pm. We typically respond within 24 hours.</p>
                        <a href="mailto:support@forgeindiaconnect.com" className="w-full bg-white/10 hover:bg-white/20 p-2 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all backdrop-blur-sm border border-white/20">
                            support@forge.com
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
