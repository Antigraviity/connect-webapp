"use client";

import { useState, useEffect, createContext, useContext, useRef, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  FiHome, FiPackage, FiShoppingBag, FiBriefcase, FiCalendar, FiStar,
  FiMessageSquare, FiSettings, FiHeart, FiClock, FiShoppingCart, FiTruck,
  FiFileText, FiBookmark, FiAlertCircle, FiGrid
} from "react-icons/fi";
import DashboardLayoutBase from "@/components/shared/DashboardLayoutBase";

// Tab types
type TabType = "jobs" | "services" | "products" | "account";

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

// Navigation items for each tab
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

const tabs = [
  { id: "services" as TabType, label: "Book Services", icon: FiPackage },
  { id: "products" as TabType, label: "Buy Products", icon: FiShoppingCart },
  { id: "jobs" as TabType, label: "Find Jobs", icon: FiBriefcase },
];

const getActiveTabFromPath = (pathname: string): TabType => {
  if (pathname.includes("/buyer/jobs") || pathname.includes("/buyer/applications") || pathname.includes("/buyer/saved-jobs") || pathname.includes("/buyer/messages/jobs") || pathname === "/buyer/support") return "jobs";
  if (pathname.includes("/buyer/services") || pathname.includes("/buyer/bookings") || pathname.includes("/buyer/favorites") || pathname.includes("/buyer/messages/services")) return "services";
  if (pathname.includes("/buyer/products") || pathname.includes("/buyer/orders") || pathname.includes("/buyer/wishlist") || pathname.includes("/buyer/messages/products")) return "products";
  return "services";
};

export default function BuyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("services");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  const refreshCart = useCallback(() => {
    const savedCart = localStorage.getItem("cartItems");
    if (savedCart) {
      try {
        const items = JSON.parse(savedCart);
        setCartItems(items);
        setCartCount(items.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0));
      } catch (e) { console.error("Error parsing cart items", e); }
    } else {
      setCartItems([]);
      setCartCount(0);
    }
  }, []);

  useEffect(() => {
    refreshCart();
    window.addEventListener('storage', refreshCart);
    return () => window.removeEventListener('storage', refreshCart);
  }, [refreshCart]);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserName(user.name || user.fullName || "User");
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
    if (pathname === "/buyer/dashboard" || pathname.includes("/buyer/settings")) return;
    setActiveTab(getActiveTabFromPath(pathname));
  }, [pathname]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (pathname === "/buyer/settings") return;
    switch (tab) {
      case "jobs": router.push("/buyer/jobs"); break;
      case "services": router.push("/buyer/services"); break;
      case "products": router.push("/buyer/products"); break;
      case "account": router.push("/buyer/profile"); break;
    }
  };

  const currentNavItems = activeTab === "jobs" ? jobsNavigation : activeTab === "products" ? productsNavigation : servicesNavigation;

  if (!isAuthChecked) return null;

  return (
    <TabContext.Provider value={{ activeTab, setActiveTab: handleTabChange }}>
      <CartContext.Provider value={{ cartItems, cartCount, refreshCart }}>
        <DashboardLayoutBase
          userType="buyer"
          navItems={currentNavItems}
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          userName={userName}
          userEmail={userEmail}
          cartCount={cartCount}
          onCartClick={() => router.push('/buyer/cart')}
        >
          {children}
        </DashboardLayoutBase>
      </CartContext.Provider>
    </TabContext.Provider>
  );
}
