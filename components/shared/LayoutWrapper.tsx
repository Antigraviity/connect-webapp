"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Hide navbar and footer on auth pages, vendor dashboard, company dashboard, buyer dashboard, and admin dashboard
  const isAuthPage = pathname?.startsWith("/auth") || pathname?.startsWith("/signin");
  const isVendorPage = pathname?.startsWith("/vendor");
  const isCompanyPage = pathname?.startsWith("/company");
  const isBuyerPage = pathname?.startsWith("/buyer");
  const isAdminPage = pathname?.startsWith("/admin");

  const showNavAndFooter = !isAuthPage && !isVendorPage && !isCompanyPage && !isBuyerPage && !isAdminPage;

  return (
    <>
      {showNavAndFooter && <Navbar />}
      <main className={showNavAndFooter ? "min-h-[calc(100vh-200px)]" : ""}>
        {children}
      </main>
      {showNavAndFooter && <Footer />}
    </>
  );
}
