"use client";

import { useState, useEffect, createContext, useContext } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  FiHome,
  FiPackage,
  FiShoppingBag,
  FiBriefcase,
  FiUsers,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiBell,
  FiSearch,
  FiBarChart2,
  FiDollarSign,
  FiFileText,
  FiMessageSquare,
  FiStar,
  FiCalendar,
  FiMapPin,
  FiShield,
  FiLayers,
  FiGrid,
  FiTrendingUp,
  FiActivity,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiTag,
  FiFlag,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import LoadingSpinner from "@/components/common/LoadingSpinner";

// Tab types for Admin
type AdminTabType = "services" | "products" | "jobs" | "overview";

// Create context for tab state
const AdminTabContext = createContext<{
  activeTab: AdminTabType;
  setActiveTab: (tab: AdminTabType) => void;
  isCollapsed: boolean;
}>({
  activeTab: "overview",
  setActiveTab: () => { },
  isCollapsed: false,
});

export const useAdminTab = () => useContext(AdminTabContext);

// Navigation items for each tab - REMOVED ANALYTICS FROM ALL TABS
const overviewNavigation = [
  { name: "Dashboard", href: "/admin", icon: FiHome },
  { name: "All Users", href: "/admin/users", icon: FiUsers },
  { name: "Reports", href: "/admin/reports", icon: FiFileText },
  { name: "Revenue", href: "/admin/revenue", icon: FiDollarSign },
  { name: "Support Tickets", href: "/admin/support", icon: FiMessageSquare },
  { name: "Notifications", href: "/admin/notifications", icon: FiBell },
];

const servicesNavigation = [
  { name: "Dashboard", href: "/admin/services/dashboard", icon: FiHome },
  { name: "All Services", href: "/admin/services", icon: FiPackage },
  { name: "Service Categories", href: "/admin/services/categories", icon: FiLayers },
  { name: "Vendors", href: "/admin/services/vendors", icon: FiUsers },
  { name: "Bookings", href: "/admin/services/bookings", icon: FiCalendar },
  { name: "Reviews", href: "/admin/services/reviews", icon: FiStar },
  { name: "Disputes", href: "/admin/services/disputes", icon: FiFlag },
];

const productsNavigation = [
  { name: "Dashboard", href: "/admin/products/dashboard", icon: FiHome },
  { name: "All Products", href: "/admin/products", icon: FiShoppingBag },
  { name: "Categories", href: "/admin/products/categories", icon: FiLayers },
  { name: "Sellers", href: "/admin/products/sellers", icon: FiUsers },
  { name: "Orders", href: "/admin/products/orders", icon: FiFileText },
  { name: "Reviews", href: "/admin/products/reviews", icon: FiStar },
  { name: "Inventory", href: "/admin/products/inventory", icon: FiPackage },
];

const jobsNavigation = [
  { name: "Dashboard", href: "/admin/jobs/dashboard", icon: FiHome },
  { name: "All Jobs", href: "/admin/jobs", icon: FiBriefcase },
  { name: "Job Categories", href: "/admin/jobs/categories", icon: FiLayers },
  { name: "Companies", href: "/admin/jobs/companies", icon: FiUsers },
  { name: "Applications", href: "/admin/jobs/applications", icon: FiFileText },
];

// Tab configuration
const adminTabs = [
  { id: "overview" as AdminTabType, label: "Overview", icon: FiGrid },
  { id: "services" as AdminTabType, label: "Services", icon: FiPackage },
  { id: "products" as AdminTabType, label: "Products", icon: FiShoppingBag },
  { id: "jobs" as AdminTabType, label: "Jobs", icon: FiBriefcase },
];

// Helper to determine active tab based on current path
const getActiveTabFromPath = (pathname: string): AdminTabType => {
  if (pathname.includes("/admin/services")) return "services";
  if (pathname.includes("/admin/products")) return "products";
  if (pathname.includes("/admin/jobs")) return "jobs";
  return "overview";
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTabType>("overview");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [adminData, setAdminData] = useState<{ email: string; name: string } | null>(null);

  // Check if current page is the login page
  const isLoginPage = pathname === "/admin/login";

  // Check admin authentication
  useEffect(() => {
    // Skip auth check for login page
    if (isLoginPage) {
      setIsAuthenticated(true); // Allow access to login page
      return;
    }

    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/verify', {
          method: 'GET',
          credentials: 'include',
        });

        const data = await response.json();

        if (data.success && data.authenticated) {
          setIsAuthenticated(true);
          // Get admin data from localStorage
          const storedAdmin = localStorage.getItem('adminUser');
          if (storedAdmin) {
            setAdminData(JSON.parse(storedAdmin));
          }
        } else {
          setIsAuthenticated(false);
          router.push('/admin/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
        router.push('/admin/login');
      }
    };

    checkAuth();
  }, [pathname, router, isLoginPage]);

  // Update active tab when pathname changes
  useEffect(() => {
    const tabFromPath = getActiveTabFromPath(pathname);
    setActiveTab(tabFromPath);
  }, [pathname]);

  // Get navigation items based on active tab
  const getNavigation = () => {
    switch (activeTab) {
      case "services":
        return servicesNavigation;
      case "products":
        return productsNavigation;
      case "jobs":
        return jobsNavigation;
      default:
        return overviewNavigation;
    }
  };

  const navigation = getNavigation();

  const isActive = (href: string) => {
    // Exact match for root paths
    if (href === "/admin" && pathname === "/admin") return true;
    if (href === "/admin/services" && pathname === "/admin/services") return true;
    if (href === "/admin/products" && pathname === "/admin/products") return true;
    if (href === "/admin/jobs" && pathname === "/admin/jobs") return true;

    // For other paths, check exact match or if it's a direct child path
    if (href !== "/admin" && href !== "/admin/services" && href !== "/admin/products" && href !== "/admin/jobs") {
      // Exact match
      if (pathname === href) return true;
      // Check if pathname starts with href and the next character is "/" (to avoid partial matches)
      if (pathname.startsWith(href + "/")) return true;
    }

    return false;
  };

  const handleTabChange = (tab: AdminTabType) => {
    setActiveTab(tab);
    switch (tab) {
      case "services":
        router.push("/admin/services/dashboard");
        break;
      case "products":
        router.push("/admin/products/dashboard");
        break;
      case "jobs":
        router.push("/admin/jobs/dashboard");
        break;
      default:
        router.push("/admin");
    }
  };

  const handleLogout = async () => {
    try {
      // Clear admin token cookie by calling logout API
      await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }

    // Clear local storage
    localStorage.removeItem("adminUser");
    localStorage.removeItem("user");

    // Clear cookies manually as fallback
    document.cookie = "adminToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";

    // Redirect to admin login
    window.location.href = "/admin/login";
  };

  // Show loading state while checking authentication
  if (isAuthenticated === null && !isLoginPage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" color="admin" label="Loading..." />
      </div>
    );
  }

  // For login page, just render children without the admin layout
  if (isLoginPage) {
    return <>{children}</>;
  }

  // If not authenticated and not on login page, don't render anything (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <AdminTabContext.Provider value={{ activeTab, setActiveTab: handleTabChange, isCollapsed }}>
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
          className={`fixed top-0 left-0 h-full bg-gradient-to-b from-primary-900 via-primary-800 to-primary-700 border-r border-white/10 z-50 transform transition-all duration-300 ease-in-out flex flex-col 
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
            lg:translate-x-0 
            ${isCollapsed ? "w-20" : "w-64"}`}
        >
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-white/10 relative">
            <Link href="/admin" className={`flex items-center transition-opacity duration-200 ${isCollapsed ? 'justify-center w-full' : ''}`}>
              {isCollapsed ? (
                <Image
                  src="/assets/img/fav.webp"
                  alt="Forge India Connect"
                  width={40}
                  height={40}
                  className="w-8 h-8 object-contain"
                />
              ) : (
                <Image
                  src="/assets/img/logo.webp"
                  alt="Forge India Connect"
                  width={140}
                  height={40}
                  className="h-8 w-auto object-contain"
                  priority
                />
              )}
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <FiX className="w-5 h-5" />
            </button>

            {/* Desktop Collapse Toggle - Floating on border */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-primary-600 border border-primary-500 rounded-full items-center justify-center text-white shadow-md hover:bg-primary-500 transition-colors z-20"
            >
              {isCollapsed ? <FiChevronRight className="w-3 h-3" /> : <FiChevronLeft className="w-3 h-3" />}
            </button>
          </div>

          {/* Current Tab Label */}
          <div className={`px-4 py-2 bg-white/5 transition-all duration-300 ${isCollapsed ? 'flex justify-center' : ''}`}>
            <div className={`flex items-center gap-2 text-sm font-semibold text-gray-300 ${isCollapsed ? 'justify-center' : ''}`}>
              {(() => {
                const currentTab = adminTabs.find((t) => t.id === activeTab);
                const Icon = currentTab?.icon || FiGrid;
                return (
                  <>
                    <Icon className="w-4 h-4" />
                    {!isCollapsed && <span>{currentTab?.label} Management</span>}
                  </>
                );
              })()}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 py-2.5 text-sm font-medium transition-all duration-300 group relative rounded-lg 
                    ${isCollapsed ? 'justify-center px-2' : 'px-4'}
                    ${active ? "text-white bg-white/20 shadow-lg" : "text-gray-300 hover:text-white hover:bg-white/10"}
                  `}
                  title={isCollapsed ? item.name : ""}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className={`w-5 h-5 transition-transform duration-300 shrink-0 ${active ? "text-white scale-110" : "text-gray-400 group-hover:text-white group-hover:scale-110"}`} />

                  <span className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                    {item.name}
                  </span>

                  {/* Premium Floating Gradient Indicator */}
                  <div
                    className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[60%] rounded-r-full bg-secondary-500 transition-all duration-300 
                      ${active ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0'}
                    `}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Settings & Logout */}
          <div className="border-t border-white/10 p-4 space-y-1">
            <Link
              href="/admin/settings"
              className={`flex items-center gap-3 py-2.5 text-sm font-medium transition-all duration-300 group relative rounded-lg 
                ${isCollapsed ? 'justify-center px-2' : 'px-4'}
                ${isActive("/admin/settings") ? "text-white bg-white/20 shadow-lg" : "text-gray-300 hover:text-white hover:bg-white/10"}
              `}
              title={isCollapsed ? "Settings" : ""}
            >
              <FiSettings className={`w-5 h-5 transition-transform duration-300 shrink-0 ${isActive("/admin/settings") ? "text-white scale-110" : "text-gray-400 group-hover:text-white group-hover:scale-110"}`} />
              <span className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                Settings
              </span>
            </Link>
            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-3 py-2.5 text-sm text-red-300 hover:bg-red-500/10 hover:text-red-200 rounded-lg transition-colors font-medium
                ${isCollapsed ? 'justify-center px-2' : 'px-4'}
              `}
              title={isCollapsed ? "Logout" : ""}
            >
              <FiLogOut className="w-5 h-5 shrink-0" />
              <span className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                Logout
              </span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className={`transition-all duration-300 ease-in-out ${isCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
          {/* Top Header with Tabs */}
          <header className="bg-white border-b border-primary-100 sticky top-0 z-30">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex items-center h-16">
                {/* Mobile menu button */}
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden text-primary-700 hover:text-primary-900 mr-4"
                >
                  <FiMenu className="w-6 h-6" />
                </button>

                <div className="flex-1 flex items-center justify-center lg:justify-start">
                  <div className="inline-flex bg-primary-50 rounded-xl p-1 overflow-x-auto max-w-full no-scrollbar">
                    {adminTabs.map((tab) => {
                      const Icon = tab.icon;
                      const isActiveTab = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => handleTabChange(tab.id)}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${isActiveTab
                            ? "bg-primary-600 text-white shadow-md"
                            : "text-primary-700 hover:text-primary-900 hover:bg-primary-100/50"
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
                <div className="flex items-center gap-3 ml-4">
                  {/* Search */}
                  <div className="hidden md:flex relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      className="pl-10 pr-4 py-2 w-64 border border-primary-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-primary-300 text-primary-900"
                    />
                  </div>

                  {/* Notifications */}
                  <button className="relative text-primary-700 hover:text-primary-900 p-2 rounded-lg hover:bg-primary-50 transition-colors">
                    <FiBell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      5
                    </span>
                  </button>

                  {/* Admin Profile */}
                  <div className="flex items-center gap-2 pl-3 border-l border-primary-100">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">A</span>
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-sm font-medium text-primary-900">Admin</p>
                      <p className="text-xs text-primary-600">Super Admin</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main>{children}</main>
        </div>
      </div>
    </AdminTabContext.Provider>
  );
}
