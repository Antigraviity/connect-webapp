"use client";

import Link from "next/link";
import { FiTool, FiArrowRight, FiCalendar, FiStar, FiUsers } from "react-icons/fi";

export default function ServiceConnectTeaser() {
  return (
    <section className="py-16 bg-primary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <FiTool className="w-4 h-4" />
                Professional Services
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-heading">
                Need a Service?
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                Book professional services from verified local experts. 
                From home repairs to salon services, find the right 
                professional for your needs.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Browse services across all categories",
                  "Book appointments at your convenience",
                  "Get services from verified professionals",
                  "Pay securely after service completion",
                ].map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-green-500 mt-1">✓</span>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/book-services"
                className="inline-flex items-center gap-2 border border-primary-300 text-primary-600 text-sm font-semibold px-6 py-4 rounded-full hover:bg-gradient-to-r from-primary-300 to-primary-500 hover:text-white shadow-sm hover:shadow-md transition-all"
              >
                Browse Services
                <FiArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Right Image/Illustration */}
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-200 to-green-200 rounded-3xl transform rotate-3"></div>
                <div className="relative bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl p-8 text-white">
                  <div className="space-y-6">
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center">
                          <FiTool className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="font-bold text-lg">500+</div>
                          <div className="text-sm text-white/80">
                            Services Available
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center">
                          <FiUsers className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="font-bold text-lg">1,000+</div>
                          <div className="text-sm text-white/80">
                            Verified Professionals
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center">
                          <FiStar className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="font-bold text-lg">4.8★</div>
                          <div className="text-sm text-white/80">
                            Average Rating
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
