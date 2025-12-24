"use client";

import Link from "next/link";
import { useState } from "react";
import { FiMenu, FiX, FiArrowRight, FiChevronDown } from "react-icons/fi";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showLoginMenu, setShowLoginMenu] = useState(false);
  const [showServicesMenu, setShowServicesMenu] = useState(false);
  const pathname = usePathname();

  // Mock user state - replace with actual auth
  const isLoggedIn = false;

  // Determine if we're on about, contact, or auth pages for white navbar
  const isAboutPage = pathname === "/about";
  const isContactPage = pathname === "/contact";
  const isAuthPage = pathname?.startsWith("/auth/");
  const isServicesPage = pathname?.startsWith("/book-services");
  const isBookingPage = pathname?.startsWith("/booking");

  const isWhiteNavbar =
    isAboutPage || isContactPage || isAuthPage || isServicesPage || isBookingPage;

  const scrollToMobileApp = () => {
    const mobileAppSection = document.getElementById("mobile-app-section");
    if (mobileAppSection) {
      const navbarHeight = 80; // 20 * 4 = 80px (h-20)
      const elementPosition = mobileAppSection.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <nav
      className={`${
        isWhiteNavbar
          ? "bg-white"
          : "bg-gradient-to-br from-primary-500 to-primary-200"
      } shadow-lg sticky top-0 z-50`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className={`px-4 py-2 rounded-lg ${
                isWhiteNavbar
                  ? "bg-primary-500 text-white"
                  : "bg-white bg-opacity-20 text-white"
              }`}>
                <span className="text-2xl font-bold">Logo</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className={`${
                isWhiteNavbar
                  ? "text-gray-900 hover:text-primary-500"
                  : "text-black hover:text-secondary-500"
              } transition-colors font-medium`}
            >
              Home
            </Link>
            <Link
              href="/about"
              className={`${
                isWhiteNavbar
                  ? "text-gray-900 hover:text-primary-500"
                  : "text-black hover:text-secondary-500"
              } transition-colors font-medium`}
            >
              About Connect
            </Link>

            {/* Services Dropdown */}
            {/* Services Dropdown (hover-based, center-aligned) */}
<div
  className="relative group"
  onMouseEnter={() => setShowServicesMenu(true)}
  onMouseLeave={() => setShowServicesMenu(false)}
>
  <button
    className={`${
      isWhiteNavbar
        ? "text-gray-900 hover:text-primary-500"
        : "text-black hover:text-secondary-500"
    } transition-colors font-medium flex items-center gap-1`}
  >
    Services
    <FiChevronDown
      className={`w-4 h-4 transition-transform duration-300 ${
        showServicesMenu ? "rotate-180" : ""
      }`}
    />
  </button>

  {/* Dropdown Menu - centered under button, same look as Login dropdown */}
  <div
    className={`absolute left-1/2 transform -translate-x-1/2 top-full mt-2 w-32 bg-gray-100 rounded-lg shadow-xl overflow-hidden z-20 transition-all duration-300 origin-top ${
      showServicesMenu
        ? "opacity-100 scale-100 visible"
        : "opacity-0 scale-95 invisible"
    }`}
  >
    <Link
      href="/book-services"
      className="block px-3 py-2.5 text-gray-700 hover:bg-primary-500 hover:text-white transition-colors font-medium text-center text-sm"
    >
      Book Service
    </Link>
    <Link
      href="/buy-products"
      className="block px-3 py-2.5 text-gray-700 hover:bg-primary-500 hover:text-white transition-colors font-medium text-center text-sm border-t border-gray-200"
    >
      Buy Products
    </Link>
    <Link
      href="/apply-job"
      className="block px-3 py-2.5 text-gray-700 hover:bg-primary-500 hover:text-white transition-colors font-medium text-center text-sm border-t border-gray-200"
    >
      Apply Job
    </Link>
  </div>
</div>
            <Link
              href="/contact"
              className={`${
                isWhiteNavbar
                  ? "text-gray-900 hover:text-primary-500"
                  : "text-black hover:text-secondary-500"
              } transition-colors font-medium`}
            >
              Contact
            </Link>
          </div>

          {/* Right Side - Get App & Login */}
          <div className="flex items-center space-x-4">
            {/* Get App Button */}
            <button
              onClick={scrollToMobileApp}
              className="hidden md:flex items-center justify-center gap-2 border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white px-5 py-2 rounded-xl font-semibold transition-all w-[130px] box-border"
            >
              <span>Get App</span>
              <FiArrowRight className="w-4 h-4" />
            </button>

            {/* Login Dropdown */}
            {/* Login Dropdown (hover-based) */}
<div
  className="hidden md:block relative group"
  onMouseEnter={() => setShowLoginMenu(true)}
  onMouseLeave={() => setShowLoginMenu(false)}
>
  <button
    className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-5 py-2 rounded-xl font-semibold transition-all w-[130px] border-2 border-transparent box-border"
  >
    <span>Login</span>
    <FiChevronDown
      className={`w-4 h-4 transition-transform duration-300 ${
        showLoginMenu ? "rotate-180" : ""
      }`}
    />
  </button>

  {/* Dropdown Menu */}
  <div
    className={`absolute right-0 top-full mt-2 w-32 bg-gray-100 rounded-lg shadow-xl overflow-hidden z-20 transition-all duration-300 origin-top ${
      showLoginMenu
        ? "opacity-100 scale-100 visible"
        : "opacity-0 scale-95 invisible"
    }`}
  >
    <Link
      href="/auth/register"
      className="block px-3 py-2.5 text-gray-700 hover:bg-gray-900 hover:text-white transition-colors font-medium text-center text-sm"
    >
      Sign Up
    </Link>
    <Link
      href="/auth/login"
      className="block px-3 py-2.5 text-gray-700 hover:bg-gray-900 hover:text-white transition-colors font-medium text-center text-sm border-t border-gray-200"
    >
      Sign In
    </Link>
  </div>
</div>
            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-md text-gray-700 hover:text-primary-500 hover:bg-gray-100"
            >
              {isOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              href="/"
              className="block px-4 py-3 rounded-md text-gray-700 hover:bg-primary-50 hover:text-primary-500 font-medium"
            >
              Home
            </Link>

            {/* Services with submenu for mobile */}
            <div className="space-y-1">
              <div className="px-4 py-3 text-gray-700 font-medium">
                Services
              </div>
              <Link
                href="/book-services"
                className="block px-8 py-2 rounded-md text-gray-600 hover:bg-primary-50 hover:text-primary-500 font-medium text-sm"
                onClick={() => setIsOpen(false)}
              >
                Service Booking
              </Link>
              <Link
                href="/buy-products"
                className="block px-8 py-2 rounded-md text-gray-600 hover:bg-primary-50 hover:text-primary-500 font-medium text-sm"
                onClick={() => setIsOpen(false)}
              >
                Buy Products
              </Link>
              <Link
                href="/apply-job"
                className="block px-8 py-2 rounded-md text-gray-600 hover:bg-primary-50 hover:text-primary-500 font-medium text-sm"
                onClick={() => setIsOpen(false)}
              >
                Apply Jobs
              </Link>
            </div>

            <Link
              href="/categories"
              className="block px-4 py-3 rounded-md text-gray-700 hover:bg-primary-50 hover:text-primary-500 font-medium"
            >
              Categories
            </Link>
            <Link
              href="/about"
              className="block px-4 py-3 rounded-md text-gray-700 hover:bg-primary-50 hover:text-primary-500 font-medium"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="block px-4 py-3 rounded-md text-gray-700 hover:bg-primary-50 hover:text-primary-500 font-medium"
            >
              Contact
            </Link>

            {/* Get App Link */}
            <button
              onClick={() => {
                scrollToMobileApp();
                setIsOpen(false);
              }}
              className="flex items-center justify-center gap-2 mx-2 mt-4 px-4 py-3 border-2 border-gray-900 text-gray-900 rounded-xl font-semibold hover:bg-gray-900 hover:text-white transition-all w-full"
            >
              <span>Get the App</span>
              <FiArrowRight className="w-4 h-4" />
            </button>

            {/* Mobile Login Section */}
            <div className="pt-2 space-y-2">
              <Link
                href="/auth/register"
                className="block mx-2 px-4 py-3 rounded-xl bg-gray-900 text-white text-center font-semibold hover:bg-gray-800"
              >
                Sign Up
              </Link>
              <Link
                href="/auth/login"
                className="block mx-2 px-4 py-3 rounded-xl border-2 border-gray-900 text-gray-900 text-center font-semibold hover:bg-gray-50"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
