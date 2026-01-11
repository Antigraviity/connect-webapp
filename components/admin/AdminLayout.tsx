'use client';

import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Star,
  Settings,
  FileText,
  MessageSquare,
  TrendingUp,
  Bell,
  Search,
  Menu,
  X,
  LogOut,
  BriefcaseIcon,
  Calendar,
  DollarSign,
  Heart,
  MapPin,
  Clock,
  Package,
  Eye,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },

  // User Management Section
  {
    name: 'User Management',
    icon: Users,
    children: [
      { name: 'All Users', href: '/admin/users', icon: Users },
      { name: 'Buyers', href: '/admin/users/buyers', icon: ShoppingBag },
      { name: 'Sellers/Vendors', href: '/admin/users/sellers', icon: Package },
      { name: 'Employers', href: '/admin/users/employers', icon: BriefcaseIcon },
      { name: 'User Analytics', href: '/admin/users/analytics', icon: TrendingUp },
    ]
  },

  // Service Management Section
  {
    name: 'Service Management',
    icon: ShoppingBag,
    children: [
      { name: 'All Services', href: '/admin/services', icon: ShoppingBag },
      { name: 'Service Bookings', href: '/admin/services/bookings', icon: Calendar },
      { name: 'Service Categories', href: '/admin/categories', icon: Star },
      { name: 'Service Reviews', href: '/admin/services/reviews', icon: MessageSquare },
      { name: 'Service Analytics', href: '/admin/services/analytics', icon: TrendingUp },
    ]
  },

  // Products Section
  { name: 'Buy Products', href: '/admin/products', icon: Package },

  // Job Management Section
  {
    name: 'Job Management',
    icon: BriefcaseIcon,
    children: [
      { name: 'All Jobs', href: '/admin/jobs', icon: BriefcaseIcon },
      { name: 'Job Applications', href: '/admin/jobs/applications', icon: FileText },
      { name: 'Job Categories', href: '/admin/jobs/categories', icon: Star },
      { name: 'Job Analytics', href: '/admin/jobs/analytics', icon: TrendingUp },
    ]
  },

  // Orders & Transactions
  {
    name: 'Orders & Payments',
    icon: FileText,
    children: [
      { name: 'All Orders', href: '/admin/orders', icon: FileText },
      { name: 'Service Orders', href: '/admin/orders/services', icon: ShoppingBag },
      { name: 'Job Transactions', href: '/admin/orders/jobs', icon: BriefcaseIcon },
      { name: 'Payment Analytics', href: '/admin/payments', icon: DollarSign },
      { name: 'Earnings & Commissions', href: '/admin/earnings', icon: TrendingUp },
    ]
  },

  // Communication & Reviews
  {
    name: 'Communication',
    icon: MessageSquare,
    children: [
      { name: 'All Messages', href: '/admin/messages', icon: MessageSquare },
      { name: 'Reviews & Ratings', href: '/admin/reviews', icon: Star },
      { name: 'Support Tickets', href: '/admin/support', icon: FileText },
      { name: 'Notifications', href: '/admin/notifications', icon: Bell },
    ]
  },

  // Scheduling & Bookings
  {
    name: 'Scheduling',
    icon: Calendar,
    children: [
      { name: 'All Schedules', href: '/admin/schedules', icon: Calendar },
      { name: 'Service Schedules', href: '/admin/schedules/services', icon: Calendar },
      { name: 'Interview Schedules', href: '/admin/schedules/interviews', icon: Clock },
      { name: 'Availability Management', href: '/admin/schedules/availability', icon: Clock },
    ]
  },

  // Analytics & Reports
  {
    name: 'Analytics & Reports',
    icon: TrendingUp,
    children: [
      { name: 'Platform Overview', href: '/admin/analytics', icon: TrendingUp },
      { name: 'User Analytics', href: '/admin/analytics/users', icon: Users },
      { name: 'Service Analytics', href: '/admin/analytics/services', icon: ShoppingBag },
      { name: 'Job Analytics', href: '/admin/analytics/jobs', icon: BriefcaseIcon },
      { name: 'Financial Reports', href: '/admin/analytics/financial', icon: DollarSign },
      { name: 'Geographic Analytics', href: '/admin/analytics/geographic', icon: MapPin },
    ]
  },

  // Settings
  { name: 'Platform Settings', href: '/admin/settings', icon: Settings },
];

// Global storage for persistent sidebar state
const SIDEBAR_STORAGE_KEY = 'admin-sidebar-expanded-sections';

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const { user } = useAuth();

  // Initialize persistent sidebar state
  useEffect(() => {
    setIsClient(true);

    // Load persisted expanded sections from localStorage
    const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    let savedExpanded: string[] = [];

    if (saved) {
      try {
        savedExpanded = JSON.parse(saved);
      } catch {
        savedExpanded = [];
      }
    }

    // Auto-expand section that contains the current active page
    const currentSection = navigation.find(item => {
      if ('children' in item && item.children) {
        return item.children.some(child => pathname.startsWith(child.href));
      }
      return false;
    });

    if (currentSection) {
      savedExpanded = [...new Set([...savedExpanded, currentSection.name])];
    }

    setExpandedSections(savedExpanded);
  }, [pathname]);

  // Persist expanded sections to localStorage
  useEffect(() => {
    if (isClient) {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(expandedSections));
    }
  }, [expandedSections, isClient]);

  const toggleSection = (sectionName: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionName)
        ? prev.filter(name => name !== sectionName)
        : [...prev, sectionName]
    );
  };

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Sticky Sidebar - Always visible on desktop, completely fixed */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg lg:relative lg:z-auto
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col h-screen
      `}>
        {/* Sidebar Header - Fixed */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 flex-shrink-0">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Connect Admin</h1>
            <p className="text-xs text-gray-500">Platform Management</p>
          </div>
          <button
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Scrollable Navigation Area */}
        <nav className="flex-1 px-3 py-6 overflow-y-auto">
          {navigation.map((item) => {
            const hasChildren = 'children' in item && item.children;
            const isExpanded = expandedSections.includes(item.name);

            // Better active state detection to prevent double highlighting
            let isActive = false;
            let hasActiveChild = false;

            if (hasChildren && item.children) {
              // Check if any child is exactly active (not just startsWith)
              hasActiveChild = item.children.some(child => pathname === child.href);
              // Parent is only active if we're on the parent route exactly, not on child routes
              isActive = pathname === item.href && !hasActiveChild;
            } else {
              // For items without children, exact match only
              isActive = pathname === item.href;
            }

            if (hasChildren) {
              return (
                <div key={item.name} className="mb-1">
                  <button
                    onClick={() => toggleSection(item.name)}
                    className={`
                      w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors
                      ${hasActiveChild
                        ? 'bg-blue-25 text-blue-600' // Very light highlight when child is active
                        : isActive
                          ? 'bg-blue-50 text-blue-700'  // Full highlight only when parent is directly active
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                      }
                    `}
                  >
                    <div className="flex items-center">
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>

                  {/* Always render children, use CSS for show/hide to prevent layout shifts */}
                  <div className={`mt-1 ml-6 space-y-1 transition-all duration-200 overflow-hidden ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                    {item.children?.map((child) => {
                      // Use exact match only to prevent false positives
                      const isChildActive = pathname === child.href;
                      return (
                        <Link
                          key={child.name}
                          href={child.href}
                          className={`
                            flex items-center px-3 py-2 text-sm rounded-md transition-colors
                            ${isChildActive
                              ? 'bg-blue-100 text-blue-800 font-medium'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }
                          `}
                          onClick={() => {
                            // Only close mobile sidebar, don't reset any expanded state
                            if (window.innerWidth < 1024) {
                              setSidebarOpen(false);
                            }
                          }}
                        >
                          <child.icon className="mr-3 h-4 w-4" />
                          {child.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            } else {
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1 transition-colors
                    ${isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                  onClick={() => {
                    // Only close mobile sidebar, don't reset any expanded state
                    if (window.innerWidth < 1024) {
                      setSidebarOpen(false);
                    }
                  }}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            }
          })}
        </nav>

        {/* Sidebar Footer - Fixed */}
        <div className="p-3 bg-white border-t border-gray-200 flex-shrink-0">
          <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:text-gray-900 hover:bg-gray-50">
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Main content area - Only this area scrolls */}
      <div className="flex-1 flex flex-col min-w-0 h-screen lg:ml-0">
        {/* Sticky Top header */}
        <header className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0 sticky top-0 z-30">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <button
                className="lg:hidden mr-4"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </button>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search users, services, jobs..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-500 hover:text-gray-700">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>

              <div className="relative z-[100] border-l border-gray-300 pl-4 ml-4">
                <Link
                  href="/admin/profile"
                  className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 rounded-lg p-1 transition-colors group"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-white group-hover:ring-blue-100 transition-all">
                    {user?.name?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <div className="text-sm hidden md:block text-left">
                    <span className="font-medium text-gray-700 block group-hover:text-blue-700 transition-colors">{user?.name || 'Admin User'}</span>
                    <p className="text-xs text-gray-500 group-hover:text-blue-500 transition-colors">{user?.role || 'Administrator'}</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Page content - Only this area scrolls */}
        <main className="flex-1 p-6 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}