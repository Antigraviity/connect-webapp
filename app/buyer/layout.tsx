"use client";

import { useState, useEffect, createContext, useContext, useRef } from "react";
import Link from "next/link";
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
  FiUser,
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
} from "react-icons/fi";

// Tab types
type TabType = "jobs" | "services" | "products";

// Notification type
interface Notification {
  id: string;
  type: "job" | "service" | "product" | "system";
  title: string;
  message: string;
  time: string;
  read: boolean;
  link?: string;
}

// Mock notifications data - organized by category
const mockNotifications: Notification[] = [
  // Job notifications
  {
    id: "1",
    type: "job",
    title: "New Job Match",
    message: "Senior Frontend Developer at TechCorp matches your profile",
    time: "5 min ago",
    read: false,
    link: "/buyer/jobs"
  },
  {
    id: "4",
    type: "job",
    title: "Application Viewed",
    message: "Your application for UX Designer was viewed by the employer",
    time: "3 hours ago",
    read: false,
    link: "/buyer/applications"
  },
  {
    id: "7",
    type: "job",
    title: "Interview Scheduled",
    message: "TechCorp has scheduled an interview for Nov 28 at 10:00 AM",
    time: "1 day ago",
    read: true,
    link: "/buyer/interviews"
  },
  {
    id: "8",
    type: "job",
    title: "Application Shortlisted",
    message: "Congratulations! You've been shortlisted for Product Manager role",
    time: "2 days ago",
    read: true,
    link: "/buyer/applications"
  },
  // Service notifications
  {
    id: "2",
    type: "service",
    title: "Booking Confirmed",
    message: "Your home cleaning service is scheduled for tomorrow at 10 AM",
    time: "1 hour ago",
    read: false,
    link: "/buyer/bookings"
  },
  {
    id: "9",
    type: "service",
    title: "Service Provider Assigned",
    message: "CleanPro Services has been assigned to your booking",
    time: "2 hours ago",
    read: false,
    link: "/buyer/bookings"
  },
  {
    id: "10",
    type: "service",
    title: "Service Completed",
    message: "Your AC repair service has been completed. Please rate the service!",
    time: "1 day ago",
    read: true,
    link: "/buyer/reviews"
  },
  {
    id: "11",
    type: "service",
    title: "New Message",
    message: "CoolTech AC Services sent you a message about your booking",
    time: "2 days ago",
    read: true,
    link: "/buyer/messages/services"
  },
  // Product notifications
  {
    id: "3",
    type: "product",
    title: "Order Shipped",
    message: "Your order #ORD-2024-001089 has been shipped and will arrive in 2-3 days",
    time: "2 hours ago",
    read: false,
    link: "/buyer/orders"
  },
  {
    id: "6",
    type: "product",
    title: "Price Drop Alert",
    message: "An item in your wishlist is now 20% off!",
    time: "1 day ago",
    read: false,
    link: "/buyer/wishlist"
  },
  {
    id: "12",
    type: "product",
    title: "Order Delivered",
    message: "Your order #ORD-2024-001088 has been delivered successfully",
    time: "2 days ago",
    read: true,
    link: "/buyer/orders"
  },
  {
    id: "13",
    type: "product",
    title: "Review Reminder",
    message: "How was your Organic Vegetables Basket? Leave a review!",
    time: "3 days ago",
    read: true,
    link: "/buyer/product-reviews"
  },
];

// Create context for tab state
const TabContext = createContext<{
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}>({
  activeTab: "services",
  setActiveTab: () => { },
});

export const useTab = () => useContext(TabContext);

// Navigation items for each tab (without View Profile and Settings)
const jobsNavigation = [
  { name: "Dashboard", href: "/buyer/dashboard", icon: FiHome },
  { name: "Find Jobs", href: "/buyer/jobs", icon: FiBriefcase },
  { name: "My Applications", href: "/buyer/applications", icon: FiFileText },
  { name: "Saved Jobs", href: "/buyer/saved-jobs", icon: FiBookmark },
  { name: "Job Alerts", href: "/buyer/job-alerts", icon: FiBell },
  { name: "Messages", href: "/buyer/messages/jobs", icon: FiMessageSquare },
];

const servicesNavigation = [
  { name: "Dashboard", href: "/buyer/dashboard", icon: FiHome },
  { name: "Browse Services", href: "/buyer/services", icon: FiPackage },
  { name: "My Bookings", href: "/buyer/bookings", icon: FiShoppingBag },
  { name: "Favorites", href: "/buyer/favorites", icon: FiHeart },
  { name: "Reviews", href: "/buyer/reviews", icon: FiStar },
  { name: "Messages", href: "/buyer/messages/services", icon: FiMessageSquare },
];

const productsNavigation = [
  { name: "Dashboard", href: "/buyer/dashboard", icon: FiHome },
  { name: "Browse Products", href: "/buyer/products", icon: FiShoppingCart },
  { name: "My Orders", href: "/buyer/orders", icon: FiTruck },
  { name: "Wishlist", href: "/buyer/wishlist", icon: FiHeart },
  { name: "Purchase History", href: "/buyer/purchase-history", icon: FiClock },
  { name: "Reviews", href: "/buyer/product-reviews", icon: FiStar },
  { name: "Messages", href: "/buyer/messages/products", icon: FiMessageSquare },
];

// Common navigation items for all tabs
const commonNavigation = [
  { name: "Support", href: "/buyer/support", icon: FiAlertCircle },
];

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
    pathname.includes("/buyer/profile") ||
    pathname.includes("/buyer/messages/jobs")) {
    return "jobs";
  }
  if (pathname.includes("/buyer/services") ||
    pathname.includes("/buyer/bookings") ||
    pathname.includes("/buyer/favorites") ||
    pathname.includes("/buyer/reviews") ||
    pathname.includes("/buyer/messages/services")) {
    return "services";
  }
  if (pathname.includes("/buyer/products") ||
    pathname.includes("/buyer/orders") ||
    pathname.includes("/buyer/wishlist") ||
    pathname.includes("/buyer/purchase-history") ||
    pathname.includes("/buyer/product-reviews") ||
    pathname.includes("/buyer/checkout") ||
    pathname.includes("/buyer/messages/products")) {
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
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const notificationRef = useRef<HTMLDivElement>(null);

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

  // Update active tab when pathname changes (but preserve tab for dashboard and common pages)
  useEffect(() => {
    // Don't change tab if we're on dashboard - let it show the current active tab
    if (pathname === "/buyer/dashboard") {
      console.log('📊 Dashboard - keeping active tab:', activeTab);
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

  // Unified brand theme - Primary Brand Blue (#0053B0)
  const getThemeColor = () => {
    return {
      primary: "brand-blue",
      bg: "bg-[#0053B0]",
      bgHover: "hover:bg-[#003d85]",
      bgLight: "bg-blue-50",
      text: "text-[#0053B0]",
      textHover: "hover:text-[#0053B0]",
      border: "border-[#0053B0]",
      ring: "focus:ring-[#0053B0]",
      gradient: "from-[#0053B0] to-[#003d85]",
      // Yellow accent for badges
      accent: "#FDD201",
      accentBg: "bg-[#FDD201]",
      accentText: "text-[#1a1a1a]",
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
    // Navigate to the default page for the selected tab
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
    }
  };

  // Notification functions
  // Filter notifications based on active tab
  const getFilteredNotifications = () => {
    const typeMap: Record<TabType, string> = {
      jobs: "job",
      services: "service",
      products: "product"
    };
    const notificationType = typeMap[activeTab];
    return notifications.filter(n => n.type === notificationType);
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = filteredNotifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    const typeMap: Record<TabType, string> = {
      jobs: "job",
      services: "service",
      products: "product"
    };
    const notificationType = typeMap[activeTab];
    setNotifications(notifications.map(n =>
      n.type === notificationType ? { ...n, read: true } : n
    ));
  };

  const clearAllNotifications = () => {
    const typeMap: Record<TabType, string> = {
      jobs: "job",
      services: "service",
      products: "product"
    };
    const notificationType = typeMap[activeTab];
    setNotifications(notifications.filter(n => n.type !== notificationType));
  };

  const deleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(notifications.filter(n => n.id !== id));
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
      case "job":
        return <FiBriefcase className="w-4 h-4 text-blue-600" />;
      case "service":
        return <FiPackage className="w-4 h-4 text-blue-600" />;
      case "product":
        return <FiShoppingCart className="w-4 h-4 text-blue-600" />;
      default:
        return <FiInfo className="w-4 h-4 text-gray-600" />;
    }
  };

  const getNotificationBgColor = (type: string) => {
    switch (type) {
      case "job":
        return "bg-blue-100";
      case "service":
        return "bg-blue-100";
      case "product":
        return "bg-blue-100";
      default:
        return "bg-gray-100";
    }
  };

  return (
    <TabContext.Provider value={{ activeTab, setActiveTab: handleTabChange }}>
      {/* Show loading while checking auth */}
      {!isAuthChecked ? (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0053B0] mx-auto"></div>
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
          <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
            <Link href="/buyer/dashboard" className="flex items-center gap-2">
              <div className={`w-8 h-8 bg-gradient-to-br ${theme.gradient} rounded-lg flex items-center justify-center`}>
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Connect</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Current Tab Indicator */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${theme.bgLight}`}>
              {(() => {
                const currentTab = tabs.find(t => t.id === activeTab);
                const Icon = currentTab?.icon || FiGrid;
                return (
                  <>
                    <Icon className={`w-4 h-4 ${theme.text}`} />
                    <span className={`text-sm font-semibold ${theme.text}`}>
                      {currentTab?.label}
                    </span>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto max-h-[calc(100vh-280px)]">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${active
                    ? `${theme.bgLight} ${theme.text}`
                    : "text-gray-700 hover:bg-gray-50"
                    }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
            
            {/* Separator */}
            <div className="py-2">
              <div className="border-t border-gray-200"></div>
            </div>
            
            {/* Common Navigation */}
            {commonNavigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${active
                    ? `${theme.bgLight} ${theme.text}`
                    : "text-gray-700 hover:bg-gray-50"
                    }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 bg-gradient-to-br ${theme.gradient} rounded-full flex items-center justify-center`}>
                <span className="text-white font-semibold">{userInitials}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">{userName}</p>
                <p className="text-xs text-gray-500">Premium Customer</p>
              </div>
            </div>

            {/* View Profile and Settings Links */}
            <div className="space-y-1 mb-3">
              <Link
                href={activeTab === "jobs" ? "/buyer/profile" : "/buyer/settings"}
                className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
                  isActive("/buyer/profile") || (isActive("/buyer/settings") && activeTab !== "jobs")
                    ? `${theme.bgLight} ${theme.text} font-medium`
                    : "text-gray-700 hover:bg-gray-50"
                  }`}
                onClick={() => setSidebarOpen(false)}
              >
                <FiUser className="w-4 h-4" />
                {activeTab === "jobs" ? "Job Seeker Profile" : "View Profile"}
              </Link>
              <Link
                href="/buyer/settings"
                className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${isActive("/buyer/settings")
                  ? `${theme.bgLight} ${theme.text} font-medium`
                  : "text-gray-700 hover:bg-gray-50"
                  }`}
                onClick={() => setSidebarOpen(false)}
              >
                <FiSettings className="w-4 h-4" />
                Settings
              </Link>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <FiLogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="lg:pl-64">
          {/* Top Bar with Tabs */}
          <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
            {/* Tab Navigation - Hidden on common pages */}
            {!isCommonPage(pathname) && (
              <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex items-center h-16">
                  {/* Mobile menu button */}
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden text-gray-500 hover:text-gray-700 mr-4"
                  >
                    <FiMenu className="w-6 h-6" />
                  </button>

                  {/* Tabs */}
                  <div className="flex-1 flex items-center justify-center lg:justify-start">
                    <div className="inline-flex bg-gray-100 rounded-xl p-1">
                      {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActiveTab = activeTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${isActiveTab
                              ? "bg-[#0053B0] text-white shadow-md"
                              : "text-gray-600 hover:text-[#0053B0]"
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

                    {/* Notifications */}
                    <div className="relative" ref={notificationRef}>
                      <button
                        onClick={() => setNotificationsOpen(!notificationsOpen)}
                        className="relative text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <FiBell className="w-5 h-5" />
                        {unreadCount > 0 && (
                          <span className="absolute top-0 right-0 w-5 h-5 bg-[#FDD201] text-[#1a1a1a] text-xs font-bold rounded-full flex items-center justify-center">
                            {unreadCount}
                          </span>
                        )}
                      </button>

                      {/* Notifications Dropdown */}
                      {notificationsOpen && (
                        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                          {/* Header */}
                          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-[#0053B0] to-[#003d85]">
                            <div className="flex items-center gap-2">
                              <FiBell className="w-5 h-5 text-white" />
                              <h3 className="font-semibold text-white">
                                {activeTab === "jobs" ? "Job Notifications" :
                                  activeTab === "services" ? "Service Notifications" :
                                    "Product Notifications"}
                              </h3>
                            </div>
                            <button
                              onClick={() => setNotificationsOpen(false)}
                              className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded transition-colors"
                              title="Close"
                            >
                              <FiX className="w-5 h-5" />
                            </button>
                          </div>

                          {/* Action Bar */}
                          {filteredNotifications.length > 0 && (
                            <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                              <span className="text-xs text-gray-500">
                                {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
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
                            {filteredNotifications.length === 0 ? (
                              <div className="px-4 py-8 text-center text-gray-500">
                                <FiBell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p className="font-medium">No notifications</p>
                                <p className="text-sm text-gray-400 mt-1">
                                  {activeTab === "jobs" ? "No job updates yet" :
                                    activeTab === "services" ? "No service updates yet" :
                                      "No product updates yet"}
                                </p>
                              </div>
                            ) : (
                              filteredNotifications.map((notification) => (
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
                                          {notification.time}
                                        </span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${notification.type === "job" ? "bg-blue-100 text-blue-700" :
                                          notification.type === "service" ? "bg-blue-100 text-blue-700" :
                                            notification.type === "product" ? "bg-blue-100 text-blue-700" :
                                              "bg-gray-100 text-gray-600"
                                          }`}>
                                          {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>

                          {/* Footer */}
                          {filteredNotifications.length > 0 && (
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

                    {/* Quick Action Button */}
                    <Link
                      href={
                        activeTab === "jobs" ? "/buyer/jobs" :
                          activeTab === "services" ? "/buyer/services" :
                            "/buyer/products"
                      }
                      className={`hidden sm:flex items-center gap-2 px-4 py-2 ${theme.bg} ${theme.bgHover} text-white rounded-lg text-sm font-semibold transition-colors`}
                    >
                      {activeTab === "jobs" && <FiBriefcase className="w-4 h-4" />}
                      {activeTab === "services" && <FiPackage className="w-4 h-4" />}
                      {activeTab === "products" && <FiShoppingCart className="w-4 h-4" />}
                      {activeTab === "jobs" ? "Find Jobs" :
                        activeTab === "services" ? "Book Service" :
                          "Shop Now"}
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </header>

          {/* Page Content */}
          <main>{children}</main>
        </div>
      </div>
      )}
    </TabContext.Provider>
  );
}
