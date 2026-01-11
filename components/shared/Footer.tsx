"use client";

import Link from "next/link";
import {
  FiInstagram,
  FiLinkedin,
  FiFacebook,
  FiMail,
  FiPhone,
  FiMapPin,
} from "react-icons/fi";
import Image from "next/image";
import { useAuth } from "@/lib/useAuth";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { isSeller } = useAuth();

  return (
    <footer className="bg-gradient-to-br from-primary-200 to-primary-500 text-gray-900">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="text-center flex flex-col items-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Image
                src="/assets/img/logo-white.webp"
                alt="Forge India Connect"
                width={180}
                height={60}
                className="h-12 w-auto object-contain"
              />
            </div>
            <p className="mb-4 max-w-md">
              Your trusted marketplace for finding services and job
              opportunities. Connect with verified professionals and employers
              effortlessly.
            </p>
            <div className="flex justify-center space-x-4">
              <a
                href="https://www.instagram.com/forgeindia_connect?igsh=MTF4Z2M4Z3p2OHA2YQ=="
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-secondary-500 transition-colors"
              >
                <FiInstagram className="w-5 h-5" />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61583095918027"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-secondary-500 transition-colors"
              >
                <FiFacebook className="w-5 h-5" />
              </a>
              <a
                href="https://www.linkedin.com/in/forge-india-connect-57474838a?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-secondary-500 transition-colors"
              >
                <FiLinkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-center">
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="hover:text-secondary-500 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/apply-job"
                  className="hover:text-secondary-500 transition-colors"
                >
                  Find Jobs
                </Link>
              </li>
              <li>
                <Link
                  href="/book-services"
                  className="hover:text-secondary-500 transition-colors"
                >
                  Book Services
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-secondary-500 transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* For Professionals */}
          <div className="text-center">
            <h3 className="font-semibold text-lg mb-4">For Professionals</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/auth/register?type=seller"
                  className="hover:text-secondary-500 transition-colors"
                >
                  Become a Seller
                </Link>
              </li>
              <li>
                <Link
                  href={isSeller() ? "/vendor/dashboard" : "/auth/register?type=seller"}
                  className="hover:text-secondary-500 transition-colors"
                >
                  Seller Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href={isSeller() ? "/vendor/support" : "/auth/register?type=seller"}
                  className="hover:text-secondary-500 transition-colors"
                >
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="text-center">
            <h3 className="font-semibold text-lg mb-4">Contact Info</h3>
            <ul className="space-y-4">
              <li className="flex flex-col items-center space-y-2">
                <FiMapPin className="w-5 h-5 flex-shrink-0" />
                <span>
                  1st floor, knt manikam road, new bus stand, No10, Krishnagiri, Tamil Nadu 635001
                </span>
              </li>
              <li className="flex flex-col items-center space-y-2">
                <FiPhone className="w-5 h-5 flex-shrink-0" />
                <a
                  href="tel:+916369406416"
                  className="hover:text-secondary-500 transition-colors"
                >
                  +91 63694 06416
                </a>
              </li>
              <li className="flex flex-col items-center space-y-2">
                <FiMail className="w-5 h-5 flex-shrink-0" />
                <a
                  href="mailto:info@forgeindiaconnect.com"
                  className="hover:text-secondary-500 transition-colors"
                >
                  info@forgeindiaconnect.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-center items-center">
            <p className="text-sm text-center">
              © {currentYear} Forge India Connect Pvt Ltd. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
