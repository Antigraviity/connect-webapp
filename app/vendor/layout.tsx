"use client";

import { useState, useEffect, createContext, useContext, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  FiHome,
  FiPackage,
  FiShoppingBag,
  FiShoppingCart,
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
  FiPlus,
  FiTruck,
  FiClock,
  FiGrid,
  FiCheck,
  FiTrash2,
  FiMapPin,
  FiInfo,
  FiList,
  FiTag,
  FiLayers,
  FiBox,
  FiCreditCard,
  FiChevronLeft,
  FiChevronRight,
  FiFileText,
} from "react-icons/fi";
import { FaRupeeSign } from "react-icons/fa";

// Tab types
type TabType = "services" | "products";

// Notification type from API
interface ApiNotification {
  id: string;
  title: string;
  message: string;
  type: string; // 'ORDER' | 'SERVICE' | 'MESSAGE' | 'PAYMENT' | 'SYSTEM'
  read: boolean;
  link: string | null;
  createdAt: string;
}

// UI Notification type
interface Notification {
  id: string;
  type: "service" | "product" | "message";
  title: string;
  message: string;
  time: string;
  read: boolean;
  link?: string;
}

// Plan names mapping
const planNames: Record<string, string> = {
  free: "Free",
  starter: "Starter",
  professional: "Professional",
  enterprise: "Enterprise"
};

// Mock notifications data - organized by category
const mockNotifications: Notification[] = [
  // Service notifications
  {
    id: "1",
    type: "service",
    title: "New Booking Request",
    message: "Rahul Sharma requested AC Repair service for tomorrow",
    time: "5 min ago",
    read: false,
    link: "/vendor/bookings"
  },
  {
    id: "2",
    type: "service",
    title: "Booking Confirmed",
    message: "Your booking #BK-2024-0892 has been confirmed by customer",
    time: "1 hour ago",
    read: false,
    link: "/vendor/bookings"
  },
  {
    id: "3",
    type: "service",
    title: "New Review",
    message: "Priya Patel gave you 5 stars for Plumbing service",
    time: "3 hours ago",
    read: true,
    link: "/vendor/reviews/services"
  },
  {
    id: "4",
    type: "service",
    title: "Service Completed",
    message: "Electrical repair service marked as completed",
    time: "1 day ago",
    read: true,
    link: "/vendor/bookings"
  },
  // Product notifications
  {
    id: "5",
    type: "product",
    title: "New Order Received",
    message: "Order #ORD-2024-001234 - Fresh Vegetables Basket (2 items)",
    time: "10 min ago",
    read: false,
    link: "/vendor/orders"
  },
  {
    id: "6",
    type: "product",
    title: "Low Stock Alert",
    message: "Organic Tomatoes stock is running low (5 units left)",
    time: "2 hours ago",
    read: false,
    link: "/vendor/products"
  },
  {
    id: "7",
    type: "product",
    title: "Order Delivered",
    message: "Order #ORD-2024-001230 has been delivered successfully",
    time: "1 day ago",
    read: true,
    link: "/vendor/orders"
  },
  {
    id: "8",
    type: "product",
    title: "Product Review",
    message: "Customer rated your Homemade Murukku 5 stars",
    time: "2 days ago",
    read: true,
    link: "/vendor/reviews/products"
  },
];

// Helper to format relative time
const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Helper to determine notification UI type from API type
const getNotificationUiType = (apiType: string, link: string | null): "service" | "product" | "message" => {
  if (apiType === 'MESSAGE') return 'message';
  if (link?.includes('product') || link?.includes('order')) return 'product';
  return 'service';
};

// Create context for tab state
const TabContext = createContext<{
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}>({
  activeTab: "services",
  setActiveTab: () => { },
});

export const useVendorTab = () => useContext(TabContext);

// Navigation items for Services tab
const servicesNavigation = [
  { name: "Dashboard", href: "/vendor/dashboard", icon: FiHome },
  { name: "My Services", href: "/vendor/services", icon: FiPackage },
  { name: "Bookings", href: "/vendor/bookings", icon: FiShoppingBag },
  { name: "Schedule", href: "/vendor/schedule", icon: FiCalendar },
  { name: "Earnings", href: "/vendor/earnings/services", icon: FaRupeeSign },
  { name: "Reviews", href: "/vendor/reviews/services", icon: FiStar },
  { name: "Messages", href: "/vendor/messages/services", icon: FiMessageSquare },
  { name: "My Subscription", href: "/vendor/subscription", icon: FiCreditCard },
  { name: "Invoices", href: "/vendor/invoices", icon: FiFileText },
];

// Navigation items for Products tab
const productsNavigation = [
  { name: "Dashboard", href: "/vendor/dashboard", icon: FiHome },
  { name: "My Products", href: "/vendor/products", icon: FiBox },
  { name: "Orders", href: "/vendor/orders", icon: FiTruck },
  { name: "Inventory", href: "/vendor/inventory", icon: FiLayers },
  { name: "Earnings", href: "/vendor/earnings/products", icon: FaRupeeSign },
  { name: "Reviews", href: "/vendor/reviews/products", icon: FiStar },
  { name: "Messages", href: "/vendor/messages/products", icon: FiMessageSquare },
  { name: "My Subscription", href: "/vendor/subscription", icon: FiCreditCard },
  { name: "Invoices", href: "/vendor/invoices", icon: FiFileText },
];

// Tab configuration
const tabs = [
  { id: "services" as TabType, label: "Services", icon: FiPackage },
  { id: "products" as TabType, label: "Products", icon: FiShoppingCart },
];

// Helper to determine active tab based on current path
const getActiveTabFromPath = (pathname: string): TabType => {
  if (pathname.includes("/vendor/products") ||
    pathname.includes("/vendor/orders") ||
    pathname.includes("/vendor/inventory") ||
    pathname.includes("/vendor/earnings/products") ||
    pathname.includes("/vendor/reviews/products") ||
    pathname.includes("/vendor/messages/products")) {
    return "products";
  }
  return "services"; // Default tab
};

// Helper to check if current page is a common page (profile, settings)
const isCommonPage = (pathname: string): boolean => {
  return pathname.includes("/vendor/profile") || pathname.includes("/vendor/settings");
};

export default function VendorLayout({
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
  const [subscriptionPlan, setSubscriptionPlan] = useState<string>("Free");
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Set page title
  useEffect(() => {
    document.title = 'Seller Dashboard | Forge India Connect';
  }, []);

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

  // User state
  const [userName, setUserName] = useState("Vendor Name");
  const [userInitials, setUserInitials] = useState("VN");
  const [userImage, setUserImage] = useState<string | null>(null);

  useEffect(() => {
    const loadUserData = () => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          const name = user.name || user.businessName || user.username || "Vendor Name";
          setUserName(name);
          setUserId(user.id);
          setUserImage(user.image || null);

          const initials = name
            .split(' ')
            .map((n: string) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
          setUserInitials(initials);
        } catch (e) {
          console.error("Error parsing user data", e);
          // If parsing fails, redirect to signin
          router.push('/signin');
        }
      } else {
        // No user found, redirect to signin
        router.push('/signin');
      }
    };

    loadUserData();

    // Listen for storage changes (when profile is updated)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user') {
        loadUserData();
      }
    };

    // Listen for custom event when profile is updated in same tab
    const handleProfileUpdate = () => {
      loadUserData();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('profileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);

  // Fetch notifications from API
  const fetchNotifications = async () => {
    if (!userId) return;

    try {
      const response = await fetch(`/api/notifications?userId=${userId}&limit=20&t=${Date.now()}`);
      const data = await response.json();

      if (data.success && data.notifications) {
        const formattedNotifications: Notification[] = data.notifications.map((n: ApiNotification) => ({
          id: n.id,
          type: getNotificationUiType(n.type, n.link),
          title: n.title,
          message: n.message,
          time: formatRelativeTime(n.createdAt),
          read: n.read,
          link: n.link || undefined,
        }));
        setNotifications(formattedNotifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Fetch notifications when userId is available
  useEffect(() => {
    if (userId) {
      fetchNotifications();
      // Poll for new notifications every 30 seconds (reduced from 1 second to prevent connection pool exhaustion)
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [userId]);

  // Fetch subscription plan
  const fetchSubscription = async () => {
    if (!userId) return;
    try {
      const response = await fetch(`/api/vendor/subscription?vendorId=${userId}`);
      const data = await response.json();
      if (data.success && data.data) {
        setSubscriptionPlan(planNames[data.data.plan] || "Free");
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
    }
  };

  useEffect(() => {
    fetchSubscription();

    // Listen for subscription updates
    const handleSubscriptionUpdate = () => {
      fetchSubscription();
    };

    window.addEventListener('subscriptionUpdated', handleSubscriptionUpdate);
    return () => {
      window.removeEventListener('subscriptionUpdated', handleSubscriptionUpdate);
    };
  }, [userId]);

  // Update active tab when pathname changes (for non-dashboard and non-common pages)
  useEffect(() => {
    if (pathname !== "/vendor/dashboard" && !isCommonPage(pathname)) {
      const tabFromPath = getActiveTabFromPath(pathname);
      setActiveTab(tabFromPath);
    }
  }, [pathname]);

  // Get navigation items based on active tab
  const getNavigation = () => {
    return activeTab === "products" ? productsNavigation : servicesNavigation;
  };

  // Theme colors
  const theme = {
    primary: "emerald-600",
    bg: "bg-white",
    bgHover: "hover:bg-gray-50",
    bgLight: "bg-emerald-50",
    textPrimary300: "text-emerald-400",
    text: "text-emerald-600",
    gradient: "from-emerald-300 to-emerald-600",
  };

  const navigation = getNavigation();

  const isActive = (href: string) => pathname === href || (pathname.startsWith(href) && href !== "/vendor/dashboard");

  const handleLogout = async () => {
    try {
      // Call the logout API to clear server-side cookies
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Error calling logout API:', error);
    }

    // Clear all localStorage data
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('glamai_token');

    // Clear all cookies
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'glamai_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = '__Secure-next-auth.session-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';

    // Force a hard redirect to clear any cached state
    window.location.href = '/signin';
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === "products") {
      router.push("/vendor/products");
    } else {
      router.push("/vendor/services");
    }
  };

  // Notification functions
  const getFilteredNotifications = () => {
    // Show message notifications for both tabs, plus tab-specific ones
    return notifications.filter(n =>
      n.type === 'message' ||
      n.type === activeTab.slice(0, -1) as "service" | "product"
    );
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = filteredNotifications.filter(n => !n.read).length;

  const markAsRead = async (id: string) => {
    if (!userId) return;

    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, notificationIds: [id] }),
      });

      setNotifications(notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!userId) return;

    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, markAll: true }),
      });

      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const clearAllNotifications = async () => {
    if (!userId) return;

    try {
      await fetch(`/api/notifications?userId=${userId}&deleteAll=true`, {
        method: 'DELETE',
      });

      setNotifications([]);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const deleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId) return;

    try {
      await fetch(`/api/notifications?userId=${userId}&notificationId=${id}`, {
        method: 'DELETE',
      });

      setNotifications(notifications.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
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
      case "service":
        return <FiPackage className="w-4 h-4 text-emerald-600" />;
      case "product":
        return <FiShoppingCart className="w-4 h-4 text-emerald-600" />;
      case "message":
        return <FiMessageSquare className="w-4 h-4 text-emerald-600" />;
      default:
        return <FiInfo className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <TabContext.Provider value={{ activeTab, setActiveTab: handleTabChange }}>
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
          className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50 transform transition-all duration-300 flex flex-col ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
            } lg:translate-x-0 ${isCollapsed ? "lg:w-20" : "lg:w-64"}`}
        >
          {/* Collapse/Expand Toggle (Desktop only) */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-gray-200 rounded-full items-center justify-center text-gray-400 hover:text-emerald-600 hover:border-emerald-600 transition-all duration-300 z-[60] group"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? (
              <FiChevronRight className="w-4 h-4 transition-transform group-hover:scale-110" />
            ) : (
              <FiChevronLeft className="w-4 h-4 transition-transform group-hover:scale-110" />
            )}
          </button>
          {/* Logo */}
          <div className={`h-20 flex items-center justify-between px-6 border-b border-gray-100 ${isCollapsed ? "lg:px-4 lg:justify-center" : ""}`}>
            <Link href="/vendor/dashboard" className="flex items-center gap-3">
              <div className={`relative transition-all duration-300 ${isCollapsed ? "lg:w-8 lg:h-8" : "w-40 h-10"}`}>
                <Image
                  src="/assets/img/logo.webp"
                  alt="Forge Connect Logo"
                  fill
                  className={`object-contain object-left transition-all duration-300 ${isCollapsed ? "opacity-0 invisible" : "opacity-100 visible"}`}
                  priority
                />
                <Image
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
              className="lg:hidden text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          {/* Current Tab Indicator */}
          <div className={`px-6 py-4 ${isCollapsed ? "lg:px-4 lg:flex lg:justify-center" : ""}`}>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${theme.bgLight} border border-emerald-100`}>
              {(() => {
                const currentTab = tabs.find(t => t.id === activeTab);
                const Icon = currentTab?.icon || FiGrid;
                return (
                  <>
                    <Icon className={`w-4 h-4 ${theme.text} shrink-0`} />
                    <span className={`text-[10px] font-bold uppercase tracking-[0.15em] ${theme.text} transition-all duration-300 overflow-hidden whitespace-nowrap ${isCollapsed ? "lg:w-0 lg:opacity-0 lg:ml-0" : "w-auto opacity-100 ml-0"}`}>
                      {currentTab?.label} Management
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
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-bold transition-all duration-300 group relative ${isCollapsed ? "lg:px-0 lg:justify-center" : ""} ${active
                    ? `text-emerald-600 bg-emerald-50/30`
                    : `text-gray-500 hover:text-emerald-600 hover:bg-emerald-50/20`
                    }`}
                  onClick={() => setSidebarOpen(false)}
                  title={isCollapsed ? item.name : ""}
                >
                  <Icon className={`w-5 h-5 shrink-0 transition-transform duration-300 ${active ? "text-emerald-600 scale-110" : "group-hover:text-emerald-600 group-hover:scale-110"}`} />
                  <span className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${active ? "text-emerald-600" : "group-hover:text-emerald-600"} ${isCollapsed ? "lg:w-0 lg:opacity-0" : "w-auto opacity-100"}`}>{item.name}</span>

                  {/* Premium Floating Gradient Indicator */}
                  <div
                    className={`absolute bottom-0 left-[20%] right-[20%] h-[2px] rounded-full bg-gradient-to-r ${theme.gradient} transition-all duration-500 ease-out ${active ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100'
                      }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className={`border-t border-gray-100 p-6 bg-gray-50/50 ${isCollapsed ? "lg:p-4 lg:flex lg:flex-col lg:items-center" : ""}`}>
            <Link
              href="/vendor/profile"
              className={`flex items-center gap-3 mb-4 hover:bg-gray-100/80 p-2 -ml-2 rounded-xl transition-all duration-200 cursor-pointer group ${isCollapsed ? "lg:gap-0 lg:mb-6 lg:p-2" : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              <div className={`w-11 h-11 bg-white rounded-full flex items-center justify-center overflow-hidden shrink-0`}>
                {userImage ? (
                  <img src={userImage} alt={userName} className="w-full h-full object-cover" />
                ) : (
                  <span className={`${theme.textPrimary300} font-extrabold`}>{userInitials}</span>
                )}
              </div>
              <div className={`flex-1 transition-all duration-300 overflow-hidden whitespace-nowrap ${isCollapsed ? "lg:w-0 lg:opacity-0" : "w-auto opacity-100"}`}>
                <p className="text-sm font-extrabold text-gray-900 leading-none mb-1 group-hover:text-emerald-700 transition-colors uppercase tracking-tight">{userName}</p>
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${subscriptionPlan === 'Free' ? 'bg-gray-400' :
                    subscriptionPlan === 'Starter' ? 'bg-emerald-500' :
                      subscriptionPlan === 'Professional' ? 'bg-teal-500' :
                        'bg-orange-500'
                    }`} />
                  <p className="text-xs text-gray-500 font-bold">{subscriptionPlan} Plan</p>
                </div>
              </div>
            </Link>

            <div className={`space-y-1 mb-3 w-full ${isCollapsed ? "lg:flex lg:flex-col lg:items-center" : ""}`}>
              <Link
                href="/vendor/settings"
                className={`flex items-center gap-2 px-4 py-3 text-sm transition-all duration-300 group relative ${isCollapsed ? "lg:px-0 lg:justify-center" : ""} ${pathname.includes("/vendor/settings")
                  ? `text-emerald-600 font-bold bg-emerald-50/30`
                  : `text-gray-500 hover:text-emerald-600 hover:bg-emerald-50/20`
                  }`}
                onClick={() => setSidebarOpen(false)}
                title={isCollapsed ? "Settings" : ""}
              >
                <FiSettings className={`w-4 h-4 shrink-0 transition-transform duration-300 ${pathname.includes("/vendor/settings") ? "text-emerald-600 scale-110" : "group-hover:text-emerald-600 group-hover:scale-110"}`} />
                <span className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${pathname.includes("/vendor/settings") ? "text-emerald-600 font-bold" : "group-hover:text-emerald-600"} ${isCollapsed ? "lg:w-0 lg:opacity-0" : "w-auto opacity-100"}`}>
                  Settings
                </span>

                {/* Premium Floating Gradient Indicator */}
                <div
                  className={`absolute bottom-0 left-[20%] right-[20%] h-[2px] rounded-full bg-gradient-to-r ${theme.gradient} transition-all duration-500 ease-out ${pathname.includes("/vendor/settings") ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100'
                    }`}
                />
              </Link>
            </div>

            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-2 px-4 py-3 text-sm font-extrabold text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 ${isCollapsed ? "lg:px-0 lg:justify-center" : ""}`}
              title={isCollapsed ? "Logout" : ""}
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
          {/* Top Bar with Tabs */}
          <header className="bg-white sticky top-0 z-30 h-20 flex items-center">
            {/* Tab Navigation - Hidden on common pages */}
            {!isCommonPage(pathname) && (
              <div className="px-4 sm:px-6 lg:px-8 w-full">
                <div className="flex items-center h-16">
                  {/* Mobile menu button */}
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden text-gray-500 hover:text-gray-700 mr-4"
                  >
                    <FiMenu className="w-6 h-6" />
                  </button>

                  {/* Tabs */}
                  {/* Tabs */}
                  <div className="flex-1 flex items-center justify-center lg:justify-start overflow-x-auto no-scrollbar">
                    {!pathname.includes("/vendor/invoices") && !pathname.includes("/vendor/subscription") && (
                      <div className="inline-flex bg-gray-50 rounded-2xl p-1.5 min-w-max">
                        {tabs.map((tab) => {
                          const Icon = tab.icon;
                          const isActiveTab = activeTab === tab.id;
                          return (
                            <button
                              key={tab.id}
                              onClick={() => handleTabChange(tab.id)}
                              className={`flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${isActiveTab
                                ? `bg-gradient-to-r ${theme.gradient} text-white transform scale-105`
                                : "text-gray-500 hover:text-emerald-500"
                                }`}
                            >
                              <Icon className="w-4 h-4 shrink-0" />
                              <span className="xs:inline">{tab.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Right side actions */}
                  <div className="flex items-center gap-3">


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
                        <div className="absolute right-[-40px] sm:right-0 mt-2 w-[calc(100vw-32px)] sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                          {/* Header */}
                          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-emerald-600 to-teal-700">
                            <div className="flex items-center gap-2">
                              <FiBell className="w-5 h-5 text-white" />
                              <h3 className="font-semibold text-white">
                                {activeTab === "services" ? "Service Notifications" : "Product Notifications"}
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
                                    className="text-xs text-emerald-600 hover:text-emerald-800 font-medium flex items-center gap-1 px-2 py-1 hover:bg-emerald-50 rounded transition-colors"
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
                                  {activeTab === "services" ? "No service updates yet" : "No product updates yet"}
                                </p>
                              </div>
                            ) : (
                              filteredNotifications.map((notification) => (
                                <div
                                  key={notification.id}
                                  onClick={() => handleNotificationClick(notification)}
                                  className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors group ${!notification.read ? "bg-emerald-50/50" : ""
                                    }`}
                                >
                                  <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-emerald-100">
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
                                            <span className="w-2 h-2 bg-emerald-600 rounded-full flex-shrink-0"></span>
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
                                      <span className="text-xs text-gray-400 mt-1 block">
                                        {notification.time}
                                      </span>
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
            )}
          </header>

          {/* Page Content */}
          <main>{children}</main>
        </div>
      </div>
    </TabContext.Provider>
  );
}
