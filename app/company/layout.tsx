"use client";

import { useState, useEffect } from "react";
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
} from "react-icons/fi";

const menuItems = [
  { name: "Dashboard", href: "/company/dashboard", icon: FiHome },
  { name: "Job Posts", href: "/company/jobs", icon: FiBriefcase },
  { name: "Applications", href: "/company/applications", icon: FiUsers, showBadge: true },
  { name: "Talent Pool", href: "/company/talent-pool", icon: FiAward },
  { name: "Analytics", href: "/company/analytics", icon: FiBarChart2 },
  { name: "Messages", href: "/company/messages", icon: FiMessageSquare },
];

const bottomMenuItems = [
  { name: "Company Profile", href: "/company/profile", icon: FiUser },
  { name: "Settings", href: "/company/settings", icon: FiSettings },
];

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [companyName, setCompanyName] = useState("Company");
  const [companyInitials, setCompanyInitials] = useState("C");
  const [stats, setStats] = useState({ activeJobs: 0, newApplications: 0 });

  useEffect(() => {
    // Get company info from localStorage or user
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
    } else if (user) {
      const name = user.name || "Company";
      setCompanyName(name);
      const initials = name
        .split(' ')
        .map((n: string) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
      setCompanyInitials(initials);
    }
  }, [user]);

  // Fetch employer stats
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
    
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const isActive = (href: string) => {
    if (href === "/company/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
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
          className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 flex flex-col ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0`}
        >
          {/* Company Info */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
            <Link href="/company/dashboard" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">{companyInitials}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-gray-900 leading-tight truncate max-w-[120px]">{companyName}</span>
                <span className="text-xs text-gray-500">Employer Dashboard</span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Stats */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-blue-50 rounded-lg p-2.5 text-center">
                <p className="text-lg font-bold text-blue-600">{stats.activeJobs}</p>
                <p className="text-xs text-blue-700">Active Jobs</p>
              </div>
              <div className="bg-green-50 rounded-lg p-2.5 text-center">
                <p className="text-lg font-bold text-green-600">{stats.newApplications}</p>
                <p className="text-xs text-green-700">New Apps</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            <p className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Recruitment
            </p>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className={`w-5 h-5 ${active ? "text-blue-600" : "text-gray-400"}`} />
                  {item.name}
                  {item.showBadge && stats.newApplications > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {stats.newApplications}
                    </span>
                  )}
                </Link>
              );
            })}

            <div className="my-4 border-t border-gray-100" />

            <p className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Account
            </p>
            {bottomMenuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className={`w-5 h-5 ${active ? "text-blue-600" : "text-gray-400"}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="border-t border-gray-200 p-4">
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
          {/* Top Header */}
          <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-30">
            <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <FiMenu className="w-6 h-6" />
              </button>

              {/* Search */}
              <div className="hidden md:flex flex-1 max-w-md mx-4">
                <div className="relative w-full">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search jobs, applicants..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4">
                {/* Notifications */}
                <button className="relative text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <FiBell className="w-5 h-5" />
                  {stats.newApplications > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {stats.newApplications > 9 ? '9+' : stats.newApplications}
                    </span>
                  )}
                </button>

                {/* Add Job Button */}
                <Link
                  href="/company/jobs/add"
                  className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                >
                  <FiPlus className="w-4 h-4" />
                  Post New Job
                </Link>

                {/* Mobile Add Button */}
                <Link
                  href="/company/jobs/add"
                  className="sm:hidden flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FiPlus className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main>{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
