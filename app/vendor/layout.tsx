"use client";

import { useState, useEffect, createContext, useContext, useRef, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  FiHome, FiPackage, FiShoppingBag, FiShoppingCart, FiCalendar, FiDollarSign,
  FiStar, FiMessageSquare, FiSettings, FiBox, FiTruck, FiLayers, FiCreditCard
} from "react-icons/fi";
import DashboardLayoutBase from "@/components/shared/DashboardLayoutBase";

// Tab types
type TabType = "services" | "products";

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
  { name: "My Bookings", href: "/vendor/bookings", icon: FiShoppingBag },
  { name: "Schedule", href: "/vendor/schedule", icon: FiCalendar },
  { name: "Earnings", href: "/vendor/earnings/services", icon: FiDollarSign },
  { name: "Reviews", href: "/vendor/reviews/services", icon: FiStar },
  { name: "Messages", href: "/vendor/messages/services", icon: FiMessageSquare },
  { name: "My Subscription", href: "/vendor/subscription", icon: FiCreditCard },
];

// Navigation items for Products tab
const productsNavigation = [
  { name: "Dashboard", href: "/vendor/dashboard", icon: FiHome },
  { name: "My Products", href: "/vendor/products", icon: FiBox },
  { name: "Orders", href: "/vendor/orders", icon: FiTruck },
  { name: "Inventory", href: "/vendor/inventory", icon: FiLayers },
  { name: "Earnings", href: "/vendor/earnings/products", icon: FiDollarSign },
  { name: "Reviews", href: "/vendor/reviews/products", icon: FiStar },
  { name: "Messages", href: "/vendor/messages/products", icon: FiMessageSquare },
  { name: "My Subscription", href: "/vendor/subscription", icon: FiCreditCard },
];

const tabs = [
  { id: "services" as TabType, label: "Services", icon: FiPackage },
  { id: "products" as TabType, label: "Products", icon: FiShoppingCart },
];

const getActiveTabFromPath = (pathname: string): TabType => {
  if (pathname.includes("/vendor/products") || pathname.includes("/vendor/orders") || pathname.includes("/vendor/inventory") || pathname.includes("/vendor/earnings/products") || pathname.includes("/vendor/reviews/products") || pathname.includes("/vendor/messages/products")) return "products";
  return "services";
};

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("services");
  const [userName, setUserName] = useState("Vendor");
  const [userEmail, setUserEmail] = useState("");
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserName(user.name || user.businessName || "Vendor");
        setUserEmail(user.email || "");
        setIsAuthChecked(true);
      } catch (e) {
        localStorage.clear();
        router.push('/signin');
      }
    } else {
      router.push('/signin');
    }
  }, [router]);

  useEffect(() => {
    if (pathname === "/vendor/dashboard") return;
    setActiveTab(getActiveTabFromPath(pathname));
  }, [pathname]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === "products") router.push("/vendor/products");
    else router.push("/vendor/services");
  };

  const currentNavItems = activeTab === "products" ? productsNavigation : servicesNavigation;

  if (!isAuthChecked) return null;

  return (
    <TabContext.Provider value={{ activeTab, setActiveTab: handleTabChange }}>
      <DashboardLayoutBase
        userType="vendor"
        navItems={currentNavItems}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        userName={userName}
        userEmail={userEmail}
      >
        {children}
      </DashboardLayoutBase>
    </TabContext.Provider>
  );
}
