"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    FiMenu, FiX, FiBell, FiLogOut, FiSettings, FiUser, FiInfo, FiAlertCircle, FiShoppingCart
} from "react-icons/fi";

interface NavItem {
    name: string;
    href: string;
    icon: any;
}

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    createdAt: string;
    read: boolean;
    link?: string;
}

interface DashboardLayoutBaseProps {
    children: React.ReactNode;
    navItems: NavItem[];
    userType: "buyer" | "vendor" | "admin";
    tabs?: { id: string; label: string; icon: any }[];
    activeTab?: string;
    onTabChange?: (tab: any) => void;
    brandName?: string;
    cartCount?: number;
    onCartClick?: () => void;
    userName?: string;
    userEmail?: string;
}

export default function DashboardLayoutBase({
    children,
    navItems,
    userType,
    tabs,
    activeTab,
    onTabChange,
    brandName = "Connect",
    cartCount = 0,
    onCartClick,
    userName,
    userEmail
}: DashboardLayoutBaseProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const pathname = usePathname();
    const router = useRouter();
    const notificationRef = useRef<HTMLDivElement>(null);

    // Close notifications when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setNotificationsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchNotifications = useCallback(async () => {
        try {
            const response = await fetch('/api/notifications');
            const data = await response.json();
            if (data.success) {
                setNotifications(data.notifications);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // 30s polling
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/login');
        } catch (error) {
            console.error("Logout failed:", error);
            router.push('/login');
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 shadow-xl lg:shadow-none transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-6 flex items-center justify-between border-b border-gray-50">
                        <Link href={`/${userType}/dashboard`} className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xl">C</span>
                            </div>
                            <span className="text-xl font-bold text-gray-900">{brandName}</span>
                        </Link>
                        <button className="lg:hidden p-2 hover:bg-gray-100 rounded-lg" onClick={() => setSidebarOpen(false)}>
                            <FiX className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto scroller-hide">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`
                    flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200
                    ${isActive
                                            ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                                            : "text-gray-500 hover:bg-blue-50 hover:text-blue-600"}
                  `}
                                >
                                    <item.icon className={`w-5 h-5 mr-3 ${isActive ? "text-white" : ""}`} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Bottom Actions */}
                    <div className="p-4 border-t border-gray-100 space-y-1">
                        <Link
                            href={`/${userType}/settings`}
                            className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${pathname.includes('settings') ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:bg-gray-50"}`}
                        >
                            <FiSettings className="w-5 h-5 mr-3" />
                            Settings
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-500 rounded-xl hover:bg-red-50 transition-colors"
                        >
                            <FiLogOut className="w-5 h-5 mr-3" />
                            Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-30">
                    <div className="flex items-center">
                        <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 hover:bg-gray-100 rounded-lg mr-2">
                            <FiMenu className="w-6 h-6 text-gray-600" />
                        </button>
                        <h1 className="text-xl font-bold text-gray-900 md:hidden">{brandName}</h1>
                    </div>

                    <div className="flex items-center space-x-2 md:space-x-4">
                        {/* Cart - only for buyer */}
                        {userType === 'buyer' && onCartClick && (
                            <button
                                onClick={onCartClick}
                                className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all relative"
                            >
                                <FiShoppingCart className="w-5 h-5" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1.5 min-w-[20px] h-5 px-1.5 bg-blue-600 text-white text-[10px] font-bold border-2 border-white rounded-full flex items-center justify-center">
                                        {cartCount}
                                    </span>
                                )}
                            </button>
                        )}

                        {/* Notifications */}
                        <div className="relative" ref={notificationRef}>
                            <button
                                onClick={() => setNotificationsOpen(!notificationsOpen)}
                                className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all relative"
                            >
                                <FiBell className="w-5 h-5" />
                                {notifications.some(n => !n.read) && (
                                    <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full" />
                                )}
                            </button>

                            {notificationsOpen && (
                                <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden">
                                    <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                                        <h3 className="font-bold text-gray-900">Notifications</h3>
                                        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                                            {notifications.filter(n => !n.read).length} New
                                        </span>
                                    </div>
                                    <div className="max-h-[400px] overflow-y-auto">
                                        {notifications.length > 0 ? (
                                            notifications.map(n => (
                                                <div key={n.id} className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!n.read ? "bg-blue-50/30" : ""}`}>
                                                    <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                                                    <p className="text-sm text-gray-500 mt-1">{n.message}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center text-gray-400">
                                                <FiBell className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                                <p>No notifications yet</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Profile */}
                        <Link href={`/${userType}/profile`} className="flex items-center space-x-3 p-1.5 hover:bg-gray-50 rounded-xl transition-colors">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center text-blue-600 font-bold border border-blue-50">
                                {userName ? userName[0].toUpperCase() : 'U'}
                            </div>
                            <div className="hidden lg:block text-left">
                                <p className="text-sm font-bold text-gray-900 leading-tight">{userName || 'User'}</p>
                                <p className="text-[11px] text-gray-500 font-medium tracking-tight truncate max-w-[120px]">{userEmail || 'account'}</p>
                            </div>
                        </Link>
                    </div>
                </header>

                {/* Tab switcher */}
                {tabs && tabs.length > 0 && onTabChange && (
                    <div className="bg-white border-b border-gray-100 px-6 flex items-center h-14 overflow-x-auto scroller-hide sticky top-20 z-20">
                        <div className="flex space-x-8 items-center h-full">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => onTabChange(tab.id)}
                                    className={`
                     h-full py-4 text-sm font-bold border-b-2 transition-all duration-200 whitespace-nowrap flex items-center space-x-2
                     ${activeTab === tab.id
                                            ? "border-blue-600 text-blue-600"
                                            : "border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200"}
                   `}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Page Content */}
                <div className="flex-1 overflow-y-auto bg-gray-50/50 p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
