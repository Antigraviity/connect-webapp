"use client";

import { useState, useEffect, createContext, useContext } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
} from "react-icons/fi";
import LoadingSpinner from "@/components/common/LoadingSpinner";

// Tab types for Admin
type AdminTabType = "services" | "products" | "jobs" | "overview";

// Create context for tab state
const AdminTabContext = createContext<{
  activeTab: AdminTabType;
  setActiveTab: (tab: AdminTabType) => void;
}>({
  activeTab: "overview",
  setActiveTab: () => { },
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
        <LoadingSpinner size="lg" color="admin" label="Verifying admin access..." />
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
    <AdminTabContext.Provider value={{ activeTab, setActiveTab: handleTabChange }}>
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
          className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 flex flex-col ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
            } lg:translate-x-0`}
        >
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-admin-500 to-admin-800 rounded-lg flex items-center justify-center">
                <FiShield className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-gray-900 leading-tight">Connect</span>
                <span className="text-xs text-gray-500">Admin Panel</span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>



          {/* Current Tab Label */}
          <div className="px-4 py-2 bg-gray-50">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
              {(() => {
                const currentTab = adminTabs.find((t) => t.id === activeTab);
                const Icon = currentTab?.icon || FiGrid;
                return (
                  <>
                    <Icon className="w-4 h-4" />
                    <span>{currentTab?.label} Management</span>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-300 group relative ${active
                    ? "text-admin-600 bg-admin-50/50"
                    : "text-gray-700 hover:text-admin-600 hover:bg-admin-50/30"
                    }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className={`w-5 h-5 transition-transform duration-300 ${active ? "text-admin-600 scale-110" : "text-gray-400 group-hover:text-admin-600 group-hover:scale-110"}`} />
                  {item.name}

                  {/* Premium Floating Gradient Indicator */}
                  <div
                    className={`absolute bottom-0 left-[20%] right-[20%] h-[2px] rounded-full bg-gradient-to-r from-admin-500 to-admin-600 transition-all duration-500 ease-out ${active ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100'
                      }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Settings & Logout */}
          <div className="border-t border-gray-200 p-4 space-y-1">
            <Link
              href="/admin/settings"
              className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-300 group relative ${isActive("/admin/settings")
                ? "text-admin-600 bg-admin-50/50"
                : "text-gray-700 hover:text-admin-600 hover:bg-admin-50/30"
                }`}
            >
              <FiSettings className={`w-5 h-5 transition-transform duration-300 ${isActive("/admin/settings") ? "text-admin-600 scale-110" : "text-gray-400 group-hover:text-admin-600 group-hover:scale-110"}`} />
              Settings

              {/* Premium Floating Gradient Indicator */}
              <div
                className={`absolute bottom-0 left-[20%] right-[20%] h-[2px] rounded-full bg-gradient-to-r from-admin-500 to-admin-600 transition-all duration-500 ease-out ${isActive("/admin/settings") ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100'
                  }`}
              />
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
            >
              <FiLogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="lg:pl-64">
          {/* Top Header with Tabs */}
          <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
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
                    {adminTabs.map((tab) => {
                      const Icon = tab.icon;
                      const isActiveTab = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => handleTabChange(tab.id)}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${isActiveTab
                            ? "bg-admin-600 text-white shadow-md"
                            : "text-gray-600 hover:text-admin-600"
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
                  {/* Search */}
                  <div className="hidden md:flex relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-admin-500 focus:border-transparent"
                    />
                  </div>

                  {/* Notifications */}
                  <button className="relative text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <FiBell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      5
                    </span>
                  </button>

                  {/* Admin Profile */}
                  <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
                    <div className="w-8 h-8 bg-gradient-to-br from-admin-500 to-admin-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">A</span>
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-sm font-medium text-gray-900">Admin</p>
                      <p className="text-xs text-gray-500">Super Admin</p>
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
