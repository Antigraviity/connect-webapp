"use client";

import { useState, useEffect, createContext, useContext, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  FiHome,
  FiPackage,
  FiShoppingBag,
  FiBriefcase,
  FiCalendar,
  FiStar,
  FiMessageSquare,
  FiBarChart2,
  FiSettings,

  FiLogOut,
  FiMenu,
  FiX,
  FiBell,
  FiSearch,
  FiHeart,
  FiClock,
  FiMapPin,
  FiShoppingCart,
  FiTruck,
  FiFileText,
  FiCheckCircle,
  FiDollarSign,
  FiGrid,
  FiList,
  FiBookmark,
  FiAward,
  FiTarget,
  FiTrendingUp,
  FiCheck,
  FiAlertCircle,
  FiInfo,
  FiTrash2,
  FiShield,
  FiChevronRight,
  FiArrowLeft
} from "react-icons/fi";

// Tab types
type TabType = "jobs" | "services" | "products" | "account";

// Notification type from database
interface Notification {
  id: string;
  userId: string;
  type: string; // ORDER, SERVICE, MESSAGE, PAYMENT, SYSTEM
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

// Create context for tab state
const TabContext = createContext<{
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}>({
  activeTab: "services",
  setActiveTab: () => { },
});

export const useTab = () => useContext(TabContext);

// Cart Context
interface CartContextType {
  cartItems: any[];
  cartCount: number;
  refreshCart: () => void;
}

const CartContext = createContext<CartContextType>({
  cartItems: [],
  cartCount: 0,
  refreshCart: () => { },
});

export const useCart = () => useContext(CartContext);

// Navigation items for each tab (without View Profile and Settings)
const jobsNavigation = [
  { name: "Dashboard", href: "/buyer/dashboard", icon: FiHome },
  { name: "Find Jobs", href: "/buyer/jobs", icon: FiBriefcase },
  { name: "My Applications", href: "/buyer/applications", icon: FiFileText },
  { name: "Saved Jobs", href: "/buyer/saved-jobs", icon: FiBookmark },
  { name: "Messages", href: "/buyer/messages/jobs", icon: FiMessageSquare },
  { name: "Support", href: "/buyer/support", icon: FiAlertCircle },
];

const servicesNavigation = [
  { name: "Dashboard", href: "/buyer/dashboard", icon: FiHome },
  { name: "Browse Services", href: "/buyer/services", icon: FiPackage },
  { name: "My Bookings", href: "/buyer/bookings", icon: FiShoppingBag },
  { name: "Favorites", href: "/buyer/favorites", icon: FiHeart },
  { name: "Reviews", href: "/buyer/reviews", icon: FiStar },
  { name: "Messages", href: "/buyer/messages/services", icon: FiMessageSquare },
  { name: "Support", href: "/buyer/support/services", icon: FiAlertCircle },
];

const productsNavigation = [
  { name: "Dashboard", href: "/buyer/dashboard", icon: FiHome },
  { name: "Browse Products", href: "/buyer/products", icon: FiShoppingCart },
  { name: "My Orders", href: "/buyer/orders", icon: FiTruck },
  { name: "Wishlist", href: "/buyer/wishlist", icon: FiHeart },
  { name: "Purchase History", href: "/buyer/purchase-history", icon: FiClock },
  { name: "Reviews", href: "/buyer/product-reviews", icon: FiStar },
  { name: "Messages", href: "/buyer/messages/products", icon: FiMessageSquare },
  { name: "Support", href: "/buyer/support/products", icon: FiAlertCircle },
];

// Common navigation items for all tabs
// Common navigation items for all tabs
const commonNavigation: { name: string; href: string; icon: any }[] = [];

// Tab configuration - All tabs use unified brand blue theme
const tabs = [
  { id: "services" as TabType, label: "Book Services", icon: FiPackage },
  { id: "products" as TabType, label: "Buy Products", icon: FiShoppingCart },
  { id: "jobs" as TabType, label: "Find Jobs", icon: FiBriefcase },
];

// Helper to determine active tab based on current path
const getActiveTabFromPath = (pathname: string): TabType => {
  if (pathname.includes("/buyer/jobs") ||
    pathname.includes("/buyer/applications") ||
    pathname.includes("/buyer/saved-jobs") ||
    pathname.includes("/buyer/job-alerts") ||
    pathname.includes("/buyer/messages/jobs") ||
    pathname === "/buyer/support") {
    return "jobs";
  }
  if (pathname.includes("/buyer/services") ||
    pathname.includes("/buyer/bookings") ||
    pathname.includes("/buyer/favorites") ||
    pathname.includes("/buyer/reviews") ||
    pathname.includes("/buyer/messages/services") ||
    pathname.includes("/buyer/support/services")) {
    return "services";
  }
  if (pathname.includes("/buyer/products") ||
    pathname.includes("/buyer/orders") ||
    pathname.includes("/buyer/wishlist") ||
    pathname.includes("/buyer/purchase-history") ||
    pathname.includes("/buyer/product-reviews") ||
    pathname.includes("/buyer/messages/products") ||
    pathname.includes("/buyer/support/products")) {
    return "products";
  }
  return "services"; // Default tab
};

// Helper to check if current page is a common page (profile, settings)
const isCommonPage = (pathname: string): boolean => {
  return pathname.includes("/buyer/profile") ||
    pathname.includes("/buyer/settings");
  // Dashboard is NOT a common page - it should show tabs
};

export default function BuyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("services");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const cartRef = useRef<HTMLDivElement>(null);

  // Cart State
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [cartCount, setCartCount] = useState(0);

  const refreshCart = useCallback(() => {
    const savedCart = localStorage.getItem("cartItems");
    if (savedCart) {
      try {
        const items = JSON.parse(savedCart);
        setCartItems(items);
        const count = items.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
        setCartCount(count);
      } catch (e) {
        console.error("Error parsing cart items", e);
      }
    } else {
      setCartItems([]);
      setCartCount(0);
    }
  }, []);

  useEffect(() => {
    refreshCart();
    // Listen for storage events (for other tabs)
    window.addEventListener('storage', refreshCart);
    return () => window.removeEventListener('storage', refreshCart);
  }, []);

  // Close notifications and cart dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
        setCartOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // User state - NO DEFAULT VALUES
  const [userName, setUserName] = useState("");
  const [userInitials, setUserInitials] = useState("");
  const [userLocation, setUserLocation] = useState("");
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        // Check for various name fields that might be returned by the backend
        const name = user.name || user.fullName || user.username || "";

        // If no valid user name found, redirect to signin
        if (!name) {
          console.log('❌ No valid user data - redirecting to signin');
          localStorage.clear();
          window.location.href = '/signin';
          return;
        }

        setUserName(name);
        setUserId(user.id);

        // Generate initials
        const initials = name
          .split(' ')
          .map((n: string) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase();
        setUserInitials(initials);

        // Set user location (city or state or country)
        const location = user.city || user.state || user.country || "India";
        setUserLocation(location);
        setIsAuthChecked(true);

        // Fetch notifications for this user
        fetchNotifications(user.id);
      } catch (e) {
        console.error("Error parsing user data", e);
        localStorage.clear();
        window.location.href = '/signin';
      }
    } else {
      // No user data found - redirect to signin immediately
      console.log('❌ No user in localStorage - redirecting to signin');
      localStorage.clear();
      window.location.href = '/signin';
    }
  }, []);

  // Fetch notifications from API
  const fetchNotifications = async (uid: string) => {
    try {
      const response = await fetch(`/api/notifications?userId=${uid}&limit=20`);
      const data = await response.json();

      if (data.success && data.notifications) {
        setNotifications(data.notifications);
        console.log('🔔 Loaded', data.notifications.length, 'notifications');
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  // Refresh notifications periodically (every 30 seconds)
  useEffect(() => {
    if (!userId) return;

    const interval = setInterval(() => {
      fetchNotifications(userId);
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [userId]);

  // Update active tab when pathname changes (but preserve tab for dashboard and common pages)
  useEffect(() => {
    // Don't change tab if we're on dashboard or common pages - let it show the current active tab
    // UNLESS we are on profile page where we might want to switch tabs
    if (pathname === "/buyer/dashboard" || pathname.includes("/buyer/settings")) {
      console.log('📊 Keeping active tab for dashboard/settings');
      return;
    }

    // Special handling for profile page - if the tab is one of the settings tabs, keep it
    if (pathname.includes("/buyer/profile")) {
      return;
    }

    const tabFromPath = getActiveTabFromPath(pathname);
    console.log('🔍 Path changed:', pathname, '→ Active tab:', tabFromPath);
    setActiveTab(tabFromPath);
  }, [pathname]);

  // Get navigation items based on active tab
  const getNavigation = () => {
    switch (activeTab) {
      case "jobs":
        return jobsNavigation;
      case "services":
        return servicesNavigation;
      case "products":
        return productsNavigation;
      default:
        return servicesNavigation;
    }
  };

  // Realistic Brand Theme - Urban Company Inspired (Neutral & High-End)
  const getThemeColor = () => {
    return {
      primary: "gray-900",
      bg: "bg-white",
      bgHover: "hover:bg-gray-50",
      bgLight: "bg-gray-50",
      text: "text-gray-900",
      textPrimary300: "text-gray-400",
      textHover: "hover:text-gray-900",
      border: "border-transparent",
      ring: "focus:ring-gray-200",
      gradient: "from-primary-300 to-primary-500",
      // Subdued accent
      accent: "#111827",
      accentBg: "bg-gray-900",
      accentText: "text-white",
    };
  };

  const theme = getThemeColor();
  const navigation = getNavigation();

  const isActive = (href: string) => pathname === href || (pathname.startsWith(href) && href !== "/buyer/dashboard");

  const handleLogout = async () => {
    console.log('🚪 Logout initiated');

    // Clear all user data from localStorage
    localStorage.removeItem('user');
    localStorage.clear();
    console.log('✅ LocalStorage cleared');

    // Clear ALL cookies - specifically target the 'token' cookie that middleware checks
    const cookies = document.cookie.split(";");

    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();

      // Delete cookie with multiple variations to ensure it's removed
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=." + window.location.hostname;

      // Also try with SameSite and Secure attributes
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax";
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=None;Secure";
    }

    console.log('✅ All cookies cleared');

    // Make a logout API call to clear server-side session
    try {
      await fetch('/api/logout', { method: 'POST' });
      console.log('✅ Server session cleared');
    } catch (error) {
      console.log('⚠️ Logout API call failed, but continuing...', error);
    }

    // Small delay to ensure cookies are cleared before redirect
    await new Promise(resolve => setTimeout(resolve, 100));

    // Force reload and redirect to signin
    console.log('🔄 Redirecting to signin...');
    window.location.href = '/signin';
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);

    // If we are on the main settings page, just switch the tab context (don't navigate away)
    // This allows the user to toggle between "Buy Products", "Find Jobs", etc. settings menus
    if (pathname === "/buyer/settings") {
      return;
    }

    // Otherwise, navigate to the default page for the selected tab
    switch (tab) {
      case "jobs":
        router.push("/buyer/jobs");
        break;
      case "services":
        router.push("/buyer/services");
        break;
      case "products":
        router.push("/buyer/products");
        break;
      case "account":
        router.push("/buyer/profile");
        break;
    }
  };

  // Notification functions
  // All notifications shown (no tab filtering for service notifications)
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id: string) => {
    // Update locally first for instant feedback
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));

    // Then update on server
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          notificationIds: [id]
        })
      });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    // Update locally first
    setNotifications(notifications.map(n => ({ ...n, read: true })));

    // Then update on server
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          markAll: true
        })
      });
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const clearAllNotifications = async () => {
    // Update locally first
    setNotifications([]);

    // Then delete on server
    try {
      await fetch(`/api/notifications?userId=${userId}&deleteAll=true`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  };

  const deleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    // Update locally first
    setNotifications(notifications.filter(n => n.id !== id));

    // Then delete on server
    try {
      await fetch(`/api/notifications?userId=${userId}&notificationId=${id}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    setNotificationsOpen(false);
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "ORDER":
      case "SERVICE":
        return <FiPackage className="w-4 h-4 text-blue-600" />;
      case "PAYMENT":
        return <FiDollarSign className="w-4 h-4 text-green-600" />;
      case "MESSAGE":
        return <FiMessageSquare className="w-4 h-4 text-purple-600" />;
      default:
        return <FiBell className="w-4 h-4 text-gray-600" />;
    }
  };

  const getNotificationBgColor = (type: string) => {
    switch (type) {
      case "ORDER":
      case "SERVICE":
        return "bg-blue-100";
      case "PAYMENT":
        return "bg-green-100";
      case "MESSAGE":
        return "bg-purple-100";
      default:
        return "bg-gray-100";
    }
  };

  return (
    <TabContext.Provider value={{ activeTab, setActiveTab: handleTabChange }}>
      <CartContext.Provider value={{ cartItems, cartCount, refreshCart }}>
        {/* Show loading while checking auth */}
        {!isAuthChecked ? (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          </div>
        ) : (
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
              className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                } lg:translate-x-0`}
            >
              {/* Logo */}
              <div className="h-20 flex items-center justify-between px-6 border-b border-gray-100">
                <Link href="/buyer/dashboard" className="flex items-center gap-3">
                  <div className="relative w-40 h-10">
                    <Image
                      src="/assets/img/logo.webp"
                      alt="Forge Connect Logo"
                      fill
                      className="object-contain object-left"
                      priority
                    />
                  </div>
                </Link>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>



              {/* Current Tab Indicator */}
              <div className="px-6 py-4">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-100`}>
                  {(() => {
                    const currentTab = tabs.find(t => t.id === activeTab);
                    const Icon = currentTab?.icon || FiGrid;
                    return (
                      <>
                        <Icon className={`w-4 h-4 text-blue-500`} />
                        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-blue-600">
                          {currentTab?.label}
                        </span>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 group ${active
                        ? `bg-gradient-to-r ${theme.gradient} text-white shadow-sm`
                        : `text-gray-500 ${theme.bgHover} hover:text-gray-900`
                        }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon className={`w-5 h-5 ${active ? "text-white" : "group-hover:text-gray-900"}`} />
                      <span className={active ? "text-white" : "group-hover:text-gray-900"}>{item.name}</span>
                    </Link>
                  );
                })}


              </nav>

              {/* User Profile */}
              <div className="border-t border-gray-100 p-6 bg-gray-50/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-11 h-11 bg-white rounded-full flex items-center justify-center`}>
                    <span className={`${theme.textPrimary300} font-bold`}>{userInitials}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 leading-none mb-1">{userName}</p>
                    <p className="text-[9px] uppercase tracking-[0.2em] font-medium text-gray-400">Premium Member</p>
                  </div>
                </div>

                {/* View Profile and Settings Links */}
                <div className="space-y-1 mb-3">


                  {/* Settings Link */}
                  <Link
                    href="/buyer/settings"
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm rounded-xl transition-all duration-200 group ${isCommonPage(pathname)
                      ? `bg-gray-100 text-gray-900 font-bold shadow-sm`
                      : `text-gray-500 ${theme.bgHover}`
                      }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <FiSettings className={`w-4 h-4 ${isCommonPage(pathname) ? "text-gray-900" : "group-hover:text-gray-900"}`} />
                    <span className={isCommonPage(pathname) ? "text-gray-900" : "group-hover:text-gray-900"}>
                      Settings
                    </span>
                  </Link>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
                >
                  <FiLogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </aside>

            {/* Main Content */}
            <div className="lg:pl-64">
              {/* Top Bar with Tabs */}
              <header className="bg-white border-b border-gray-100 sticky top-0 z-30 h-20 flex items-center">
                <div className="px-4 sm:px-6 lg:px-8 w-full">
                  <div className="flex items-center justify-between h-16 w-full">
                    {/* Mobile menu button */}
                    <button
                      onClick={() => setSidebarOpen(true)}
                      className="lg:hidden text-gray-500 hover:text-gray-700 mr-4"
                    >
                      <FiMenu className="w-6 h-6" />
                    </button>

                    {/* Tabs - Always Show */}
                    <div className="flex-1 flex items-center justify-center lg:justify-start">
                      <div className={`inline-flex bg-gray-50 rounded-2xl p-1.5`}>
                        {tabs.map((tab) => {
                          const Icon = tab.icon;
                          const isActiveTab = activeTab === tab.id;
                          return (
                            <button
                              key={tab.id}
                              onClick={() => handleTabChange(tab.id)}
                              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${isActiveTab
                                ? `bg-gradient-to-r ${theme.gradient} text-white shadow-lg transform scale-105`
                                : "text-gray-500 hover:text-primary-500"
                                }`}
                            >
                              <Icon className="w-4 h-4" />
                              <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right side actions */}
                    <div className="flex items-center gap-3">
                      {/* Location */}
                      <div className="hidden md:flex items-center gap-1 text-sm text-gray-600">
                        <FiMapPin className="w-4 h-4" />
                        <span>{userLocation}</span>
                      </div>

                      {/* Cart Icon */}
                      <div className="relative" ref={cartRef}>
                        <button
                          onClick={() => setCartOpen(!cartOpen)}
                          className={`relative text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors ${cartOpen ? "bg-gray-100 text-gray-900" : ""}`}
                        >
                          <FiShoppingCart className="w-5 h-5" />
                          {cartCount > 0 && (
                            <span className={`absolute top-0 right-0 w-5 h-5 bg-gradient-to-r ${theme.gradient} text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white`}>
                              {cartCount}
                            </span>
                          )}
                        </button>

                        {/* Cart Dropdown */}
                        {cartOpen && (
                          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl z-50 overflow-hidden border border-gray-100">
                            {/* Header */}
                            <div className={`px-5 py-4 flex items-center justify-between bg-gradient-to-r ${theme.gradient}`}>
                              <div className="flex items-center gap-3">
                                <FiShoppingCart className="w-5 h-5 text-white" />
                                <h3 className="font-bold text-white tracking-tight">Your Cart</h3>
                              </div>
                              <span className="text-xs font-semibold bg-white/20 text-white px-2 py-1 rounded-full">
                                {cartCount} items
                              </span>
                            </div>

                            {/* Cart Items */}
                            <div className="max-h-[320px] overflow-y-auto">
                              {cartItems.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <FiShoppingCart className="w-8 h-8 text-gray-300" />
                                  </div>
                                  <p className="font-medium">Your cart is empty</p>
                                  <Link
                                    href="/buyer/products"
                                    onClick={() => setCartOpen(false)}
                                    className="inline-block mt-3 text-sm text-primary-600 font-semibold hover:underline"
                                  >
                                    Browse Products
                                  </Link>
                                </div>
                              ) : (
                                <div className="divide-y divide-gray-100">
                                  {cartItems.map((item, index) => (
                                    <div key={`${item.id}-${index}`} className="p-4 flex gap-3 hover:bg-gray-50 transition-colors">
                                      {/* Image Placeholder if no images */}
                                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center">
                                        {item.images && item.images.length > 0 ? (
                                          <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                                        ) : (
                                          <FiPackage className="w-6 h-6 text-gray-400" />
                                        )}
                                      </div>

                                      <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-gray-900 text-sm line-clamp-2">{item.name}</h4>
                                        <div className="flex items-center justify-between mt-1">
                                          <p className="text-xs text-gray-500">
                                            Qty: <span className="font-medium text-gray-900">{item.quantity}</span>
                                          </p>
                                          <p className="text-sm font-bold text-gray-900">
                                            ${(item.discountPrice || item.price).toLocaleString()}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Footer */}
                            {cartItems.length > 0 && (
                              <div className="p-4 bg-gray-50/50 border-t border-gray-100">
                                <div className="flex items-center justify-between mb-4">
                                  <span className="text-sm font-medium text-gray-600">Subtotal</span>
                                  <span className="text-lg font-bold text-gray-900">
                                    ${cartItems.reduce((sum, item) => sum + ((item.discountPrice || item.price) * item.quantity), 0).toLocaleString()}
                                  </span>
                                </div>
                                <Link
                                  href="/buyer/checkout"
                                  onClick={() => setCartOpen(false)}
                                  className={`block w-full py-3 text-center text-white font-bold rounded-xl shadow-md transition-all bg-gradient-to-r ${theme.gradient} hover:shadow-lg`}
                                >
                                  Checkout Now
                                </Link>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Notifications */}
                      <div className="relative" ref={notificationRef}>
                        <button
                          onClick={() => setNotificationsOpen(!notificationsOpen)}
                          className="relative text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <FiBell className="w-5 h-5" />
                          {unreadCount > 0 && (
                            <span className={`absolute top-0 right-0 w-5 h-5 bg-gradient-to-r ${theme.gradient} text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white`}>
                              {unreadCount}
                            </span>
                          )}
                        </button>

                        {/* Notifications Dropdown */}
                        {notificationsOpen && (
                          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl z-50 overflow-hidden">
                            {/* Header */}
                            <div className={`px-5 py-4 flex items-center justify-between bg-gradient-to-r ${theme.gradient}`}>
                              <div className="flex items-center gap-3">
                                <FiBell className="w-5 h-5 text-white" />
                                <h3 className="font-bold text-white tracking-tight">Notifications</h3>
                              </div>
                              <button
                                onClick={() => setNotificationsOpen(false)}
                                className="text-white/80 hover:text-white p-1.5 hover:bg-white/10 rounded-lg transition-all"
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
                                      className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 px-2 py-1 hover:bg-blue-50 rounded transition-colors"
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
                                    className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors group ${!notification.read ? "bg-blue-50/50" : ""
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
                                              <span className="w-2 h-2 bg-[#0053B0] rounded-full flex-shrink-0"></span>
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
                                          <span className={`text-xs px-2 py-0.5 rounded-full ${getNotificationBgColor(notification.type)} ${notification.type === "PAYMENT" ? "text-green-700" : notification.type === "MESSAGE" ? "text-purple-700" : "text-blue-700"
                                            }`}>
                                            {notification.type === "ORDER" ? "Booking" : notification.type.charAt(0) + notification.type.slice(1).toLowerCase()}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>

                            {/* Footer */}
                            {notifications.length > 0 && (
                              <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                                <Link
                                  href="/buyer/notifications"
                                  onClick={() => setNotificationsOpen(false)}
                                  className="block text-center text-sm text-[#0053B0] font-medium hover:underline"
                                >
                                  View all notifications →
                                </Link>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </header>

              {/* Page Content */}
              <main>{children}</main>
            </div>
          </div>
        )
        }
      </CartContext.Provider >
    </TabContext.Provider >
  );
}
