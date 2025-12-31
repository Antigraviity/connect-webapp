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

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-primary-200 to-primary-500 text-gray-900">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <Image
                src="/assets/img/logo-white.webp"
                alt="Forge India Connect"
                width={180}
                height={60}
                className="h-12 w-auto object-contain"
              />
            </div>
            <p className="mb-4">
              Your trusted marketplace for finding services and job
              opportunities. Connect with verified professionals and employers
              effortlessly.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-secondary-500 transition-colors"
              >
                <FiInstagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-secondary-500 transition-colors"
              >
                <FiFacebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-secondary-500 transition-colors"
              >
                <FiLinkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
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
          <div>
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
                  href="/vendor/dashboard"
                  className="hover:text-secondary-500 transition-colors"
                >
                  Seller Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/vendor/support"
                  className="hover:text-secondary-500 transition-colors"
                >
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact Info</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <FiMapPin className="w-5 h-5 mt-1 flex-shrink-0" />
                <span>
                  Your Company Address Here
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <FiPhone className="w-5 h-5 flex-shrink-0" />
                <a
                  href="tel:+1234567890"
                  className="hover:text-secondary-500 transition-colors"
                >
                  +1 (234) 567-890
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <FiMail className="w-5 h-5 flex-shrink-0" />
                <a
                  href="mailto:info@yourcompany.com"
                  className="hover:text-secondary-500 transition-colors"
                >
                  info@yourcompany.com
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
              © {currentYear} Forge India Connect. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
