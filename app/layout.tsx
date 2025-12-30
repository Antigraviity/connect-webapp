import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import LayoutWrapper from "@/components/shared/LayoutWrapper";

const notoSans = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-noto",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Forge India Connect | Service Platform",
  description: "Find and book trusted service professionals in your area",
  keywords: ["services", "marketplace", "booking", "professionals", "handyman"],
  icons: {
    icon: "/assets/img/fav.webp",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${notoSans.variable}`}>
      <body className="min-h-screen bg-gray-50 font-sans">
        <LayoutWrapper>{children}</LayoutWrapper>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
