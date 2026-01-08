"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import AuthGuard from "@/components/auth/AuthGuard";
import { useAuth } from "@/lib/useAuth";
import {
    FiHome,
    FiBriefcase,
    FiUsers,
    FiBarChart2,
    FiSettings,
    FiLogOut,
    FiMessageSquare,
    FiMenu,
    FiX,
    FiBell,
    FiSearch,
    FiPlus,
    FiUser,
    FiAward,
    FiChevronLeft,
    FiChevronRight,
    FiCheck,
    FiTrash2,
    FiDollarSign,
    FiFileText,
    FiCalendar,
} from "react-icons/fi";
import NextImage from "next/image";

// Notification interface
interface Notification {
    id: string;
    userId: string;
    type: string;
    title: string;
    message: string;
    link?: string;
    read: boolean;
    createdAt: string;
}

// Helper to format time ago
const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return date.toLocaleDateString();
};

const menuItems = [
    { name: "Dashboard", href: "/company/dashboard", icon: FiHome },
    { name: "Job Posts", href: "/company/jobs", icon: FiBriefcase },
    { name: "Applications", href: "/company/applications", icon: FiUsers, showBadge: true },
    { name: "Interviews", href: "/company/interviews", icon: FiCalendar },
    { name: "Analytics", href: "/company/analytics", icon: FiBarChart2 },
    { name: "Messages", href: "/company/messages", icon: FiMessageSquare },
];

const bottomMenuItems = [
    { name: "Settings", href: "/company/settings", icon: FiSettings },
];

export default function CompanyLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { user } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [companyName, setCompanyName] = useState("Company");
    const [companyInitials, setCompanyInitials] = useState("C");
    const [stats, setStats] = useState({ activeJobs: 0, newApplications: 0 });
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const notificationRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const userData = JSON.parse(userStr);
                const name = userData.companyName || userData.name || "Company";
                setCompanyName(name);
                const initials = name
                    .split(' ')
                    .map((n: string) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();
                setCompanyInitials(initials);
            } catch (e) {
                console.error("Error parsing user data", e);
            }
        }
    }, [user]);

    useEffect(() => {
        const fetchStats = async () => {
            if (!user?.id) return;
            try {
                const response = await fetch(`/api/employer/stats?employerId=${user.id}`);
                const data = await response.json();
                if (data.success) {
                    setStats({
                        activeJobs: data.stats.activeJobs || 0,
                        newApplications: data.stats.newApplications || 0,
                    });
                }
            } catch (err) {
                console.error("Error fetching employer stats:", err);
            }
        };
        fetchStats();
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, [user?.id]);

    // Fetch notifications from API
    const fetchNotifications = async (uid: string) => {
        try {
            const response = await fetch(`/api/notifications?userId=${uid}&limit=20&t=${Date.now()}`);
            const data = await response.json();

            if (data.success && data.notifications) {
                setNotifications(data.notifications);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    // Fetch notifications on mount and refresh periodically
    useEffect(() => {
        if (user?.id) {
            fetchNotifications(user.id);
            const interval = setInterval(() => {
                fetchNotifications(user.id);
            }, 1000); // 1 second
            return () => clearInterval(interval);
        }
    }, [user?.id]);

    // Close notifications dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setNotificationsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Notification helper functions
    const getNotificationIcon = (type: string) => {
        switch (type) {
            case "APPLICATION":
                return <FiUsers className="w-5 h-5 text-company-600" />;
            case "MESSAGE":
                return <FiMessageSquare className="w-5 h-5 text-purple-600" />;
            case "INTERVIEW":
                return <FiCalendar className="w-5 h-5 text-company-600" />;
            case "PAYMENT":
                return <FiDollarSign className="w-5 h-5 text-green-600" />;
            default:
                return <FiBell className="w-5 h-5 text-company-600" />;
        }
    };

    const getNotificationBgColor = (type: string) => {
        switch (type) {
            case "APPLICATION":
                return "bg-company-100";
            case "MESSAGE":
                return "bg-purple-100";
            case "INTERVIEW":
                return "bg-company-100";
            case "PAYMENT":
                return "bg-green-100";
            default:
                return "bg-gray-100";
        }
    };

    const markAllAsRead = async () => {
        if (!user?.id) return;
        try {
            await fetch('/api/notifications/mark-all-read', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id }),
            });
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const clearAllNotifications = async () => {
        if (!user?.id) return;
        try {
            await fetch(`/api/notifications?userId=${user.id}`, {
                method: 'DELETE',
            });
            setNotifications([]);
        } catch (error) {
            console.error('Failed to clear notifications:', error);
        }
    };

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.read) {
            try {
                await fetch('/api/notifications/mark-read', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ notificationId: notification.id }),
                });
                setNotifications(prev =>
                    prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
                );
            } catch (error) {
                console.error('Failed to mark as read:', error);
            }
        }
        if (notification.link) {
            router.push(notification.link);
            setNotificationsOpen(false);
        }
    };

    const deleteNotification = async (notificationId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await fetch(`/api/notifications/${notificationId}`, {
                method: 'DELETE',
            });
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    const isActive = (href: string) => {
        if (href === "/company/dashboard") return pathname === href;
        if (href === "/company/settings") return pathname.includes("/company/settings");
        return pathname.startsWith(href);
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (error) {
            console.error('Logout failed:', error);
        }
        localStorage.removeItem('user');
        window.location.href = '/signin';
    };

    return (
        <AuthGuard requiredUserType="EMPLOYER">
            <div className="min-h-screen bg-gray-50">
                {/* Mobile sidebar backdrop */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <aside
                    className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50 transform transition-all duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                        } lg:translate-x-0 ${isCollapsed ? "lg:w-20" : "lg:w-64"}`}
                >
                    {/* Collapse/Expand Toggle (Desktop only) */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-gray-200 rounded-full items-center justify-center text-gray-400 hover:text-company-600 hover:border-company-600 transition-all duration-300 shadow-sm z-[60] group"
                    >
                        {isCollapsed ? (
                            <FiChevronRight className="w-4 h-4 transition-transform group-hover:scale-110" />
                        ) : (
                            <FiChevronLeft className="w-4 h-4 transition-transform group-hover:scale-110" />
                        )}
                    </button>

                    {/* Logo Section */}
                    <div className={`h-20 flex items-center justify-between px-6 border-b border-gray-100 ${isCollapsed ? "lg:px-4 lg:justify-center" : ""}`}>
                        <Link href="/company/dashboard" className="flex items-center gap-3">
                            <div className={`relative transition-all duration-300 ${isCollapsed ? "lg:w-8 lg:h-8" : "w-40 h-10"}`}>
                                <NextImage
                                    src="/assets/img/logo.webp"
                                    alt="Forge Connect Logo"
                                    fill
                                    className={`object-contain object-left transition-all duration-300 ${isCollapsed ? "opacity-0 invisible" : "opacity-100 visible"}`}
                                    priority
                                />
                                <NextImage
                                    src="/assets/img/fav.webp"
                                    alt="Forge Connect Icon"
                                    fill
                                    className={`object-contain object-center transition-all duration-300 absolute inset-0 ${isCollapsed ? "opacity-100 visible" : "opacity-0 invisible"}`}
                                    priority
                                />
                            </div>
                        </Link>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <FiX className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Current Role Indicator */}
                    <div className={`px-6 py-4 ${isCollapsed ? "lg:px-4 lg:flex lg:justify-center" : ""}`}>
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-company-50 border border-company-100 ${isCollapsed ? "lg:px-2" : ""}`}>
                            <FiBriefcase className="w-4 h-4 text-company-500 shrink-0" />
                            <span className={`text-[10px] font-bold uppercase tracking-[0.15em] text-company-600 transition-all duration-300 overflow-hidden whitespace-nowrap ${isCollapsed ? "lg:w-0 lg:opacity-0 lg:ml-0" : "w-auto opacity-100 ml-0"}`}>
                                Employer Dashboard
                            </span>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 text-sm font-bold transition-all duration-300 group relative ${isCollapsed ? "lg:px-0 lg:justify-center" : ""} ${active
                                        ? "text-company-600 bg-company-50/50"
                                        : "text-gray-500 hover:text-company-600 hover:bg-company-50/30"
                                        }`}
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <Icon className={`w-5 h-5 shrink-0 transition-transform duration-300 ${active ? "text-company-600 scale-110" : "group-hover:text-company-600 group-hover:scale-110"}`} />
                                    <span className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${isCollapsed ? "lg:w-0 lg:opacity-0" : "w-auto opacity-100"}`}>
                                        {item.name}
                                    </span>

                                    {/* Indicator Line */}
                                    <div
                                        className={`absolute bottom-0 left-[20%] right-[20%] h-[2px] rounded-full bg-company-500 transition-all duration-500 ease-out ${active ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100'
                                            }`}
                                    />
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Section */}
                    <div className={`border-t border-gray-100 p-6 bg-gray-50/50 ${isCollapsed ? "lg:p-4 lg:flex lg:flex-col lg:items-center" : ""}`}>
                        <Link
                            href="/company/profile"
                            className={`flex items-center gap-3 mb-4 hover:bg-gray-100/80 p-2 -ml-2 rounded-xl transition-all duration-200 cursor-pointer group ${isCollapsed ? "lg:gap-0 lg:mb-6 lg:p-2" : ""}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center border border-gray-100 shadow-sm group-hover:shadow-md transition-shadow">
                                <span className="text-company-500 font-bold">{companyInitials}</span>
                            </div>
                            <div className={`flex-1 min-w-0 transition-all duration-300 overflow-hidden whitespace-nowrap ${isCollapsed ? "lg:w-0 lg:opacity-0" : "w-auto opacity-100"}`}>
                                <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-company-600 transition-colors">
                                    {companyName}
                                </p>
                            </div>
                        </Link>

                        <div className={`space-y-1 mb-3 w-full ${isCollapsed ? "lg:flex lg:flex-col lg:items-center" : ""}`}>
                            {bottomMenuItems.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.href);
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`flex items-center gap-2 px-4 py-2.5 text-sm transition-all duration-300 group relative ${isCollapsed ? "lg:px-0 lg:justify-center" : ""} ${active
                                            ? "text-company-600 font-bold bg-company-50/50"
                                            : "text-gray-500 hover:text-company-600 hover:bg-company-50/30"
                                            }`}
                                        onClick={() => setSidebarOpen(false)}
                                    >
                                        <Icon className={`w-4 h-4 shrink-0 transition-transform duration-300 ${active ? "text-company-600 scale-110" : "group-hover:text-company-600 group-hover:scale-110"}`} />
                                        <span className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${isCollapsed ? "lg:w-0 lg:opacity-0" : "w-auto opacity-100"}`}>
                                            {item.name}
                                        </span>
                                        <div
                                            className={`absolute bottom-0 left-[20%] right-[20%] h-[2px] rounded-full bg-company-500 transition-all duration-500 ease-out ${active ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100'
                                                }`}
                                        />
                                    </Link>
                                );
                            })}
                        </div>

                        <button
                            onClick={handleLogout}
                            className={`w-full flex items-center gap-2 px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 ${isCollapsed ? "lg:px-0 lg:justify-center" : ""}`}
                        >
                            <FiLogOut className="w-4 h-4 shrink-0" />
                            <span className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${isCollapsed ? "lg:w-0 lg:opacity-0" : "w-auto opacity-100"}`}>
                                Logout
                            </span>
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <div className={`transition-all duration-300 ${isCollapsed ? "lg:pl-20" : "lg:pl-64"}`}>
                    {/* Top Bar */}
                    <header className="h-20 bg-white border-b border-gray-100 sticky top-0 z-30 flex items-center">
                        <div className="px-4 sm:px-6 lg:px-8 w-full">
                            <div className="flex items-center justify-between">
                                {/* Left Side: Mobile Menu & Search */}
                                <div className="flex items-center gap-4 flex-1">
                                    <button
                                        onClick={() => setSidebarOpen(true)}
                                        className="lg:hidden text-gray-500 hover:text-gray-700"
                                    >
                                        <FiMenu className="w-6 h-6" />
                                    </button>

                                    <div className="hidden md:flex relative max-w-md w-full">
                                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search jobs, applicants..."
                                            className="w-full pl-10 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-company-500 focus:bg-white transition-all outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Right Side: Actions */}
                                <div className="flex items-center gap-3">
                                    {/* Notifications */}
                                    <div className="relative" ref={notificationRef}>
                                        <button
                                            onClick={() => setNotificationsOpen(!notificationsOpen)}
                                            className="relative text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                        >
                                            <FiBell className="w-5 h-5" />
                                            {unreadCount > 0 && (
                                                <span className="absolute top-0 right-0 w-5 h-5 bg-gradient-to-r from-company-400 to-company-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                                                    {unreadCount > 9 ? '9+' : unreadCount}
                                                </span>
                                            )}
                                        </button>

                                        {/* Notifications Dropdown */}
                                        {notificationsOpen && (
                                            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl z-50 overflow-hidden border border-gray-100">
                                                {/* Header with Company Theme Gradient */}
                                                <div className="px-4 py-3 flex items-center justify-between bg-gradient-to-r from-company-400 to-company-600">
                                                    <div className="flex items-center gap-3">
                                                        <FiBell className="w-5 h-5 text-white" />
                                                        <h3 className="font-bold text-white tracking-tight">Notifications</h3>
                                                    </div>
                                                    <button
                                                        onClick={() => setNotificationsOpen(false)}
                                                        className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-all"
                                                        title="Close"
                                                    >
                                                        <FiX className="w-5 h-5" />
                                                    </button>
                                                </div>

                                                {/* Action Bar */}
                                                {notifications.length > 0 && (
                                                    <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                                                        <span className="text-xs text-gray-500">
                                                            {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                                                            {unreadCount > 0 && ` (${unreadCount} unread)`}
                                                        </span>
                                                        <div className="flex items-center gap-2">
                                                            {unreadCount > 0 && (
                                                                <button
                                                                    onClick={markAllAsRead}
                                                                    className="text-xs text-company-600 hover:text-company-800 font-medium flex items-center gap-1 px-2 py-1 hover:bg-company-50 rounded transition-colors"
                                                                >
                                                                    <FiCheck className="w-3 h-3" />
                                                                    Mark all read
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={clearAllNotifications}
                                                                className="text-xs text-red-600 hover:text-red-800 font-medium flex items-center gap-1 px-2 py-1 hover:bg-red-50 rounded transition-colors"
                                                            >
                                                                <FiTrash2 className="w-3 h-3" />
                                                                Clear all
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Notification List */}
                                                <div className="max-h-[400px] overflow-y-auto">
                                                    {notifications.length === 0 ? (
                                                        <div className="px-4 py-8 text-center text-gray-500">
                                                            <FiBell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                                            <p className="font-medium">No notifications</p>
                                                            <p className="text-sm text-gray-400 mt-1">
                                                                You're all caught up!
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        notifications.map((notification) => (
                                                            <div
                                                                key={notification.id}
                                                                onClick={() => handleNotificationClick(notification)}
                                                                className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors group ${!notification.read ? "bg-company-50/50" : ""
                                                                    }`}
                                                            >
                                                                <div className="flex gap-3">
                                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getNotificationBgColor(notification.type)}`}>
                                                                        {getNotificationIcon(notification.type)}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-start justify-between gap-2">
                                                                            <p className={`text-sm ${!notification.read ? "font-semibold text-gray-900" : "font-medium text-gray-700"
                                                                                }`}>
                                                                                {notification.title}
                                                                            </p>
                                                                            <div className="flex items-center gap-1">
                                                                                {!notification.read && (
                                                                                    <span className="w-2 h-2 bg-company-500 rounded-full flex-shrink-0"></span>
                                                                                )}
                                                                                <button
                                                                                    onClick={(e) => deleteNotification(notification.id, e)}
                                                                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-all"
                                                                                    title="Delete notification"
                                                                                >
                                                                                    <FiX className="w-3 h-3 text-gray-400" />
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                        <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                                                                            {notification.message}
                                                                        </p>
                                                                        <div className="flex items-center gap-2 mt-1.5">
                                                                            <span className="text-xs text-gray-400">
                                                                                {formatTimeAgo(notification.createdAt)}
                                                                            </span>
                                                                            <span className={`text-xs px-2 py-0.5 rounded-full ${getNotificationBgColor(notification.type)} ${notification.type === "PAYMENT" ? "text-green-700" :
                                                                                notification.type === "MESSAGE" ? "text-purple-700" :
                                                                                    "text-company-700"
                                                                                }`}>
                                                                                {notification.type === "APPLICATION" ? "Application" :
                                                                                    notification.type.charAt(0) + notification.type.slice(1).toLowerCase()}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                </div>
                            </div>
                        </div>
                    </header>

                    <main>
                        {children}
                    </main>
                </div>
            </div>
        </AuthGuard>
    );
}
