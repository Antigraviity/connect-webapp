"use client";

import Link from "next/link";
import { FiBriefcase, FiArrowRight } from "react-icons/fi";

export default function JobConnectTeaser() {
  return (
    <section className="py-16 bg-secondary-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-flex items-center gap-2 bg-secondary-100 text-secondary-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <FiBriefcase className="w-4 h-4" />
                Job Opportunities
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-heading">
                Looking for Jobs?
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                Explore thousands of job openings from top
                companies. Find the perfect opportunity that matches your skills
                and career goals.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Browse jobs across all industries",
                  "Apply directly to employers",
                  "Get hired by verified companies",
                  "Track your applications easily",
                ].map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-green-500 mt-1">✓</span>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/services/apply-jobs"
                className="inline-flex items-center gap-2 border border-primary-300 text-primary-300 text-sm font-semibold px-4 py-4 rounded-full hover:bg-gradient-to-r from-primary-300 to-primary-500 hover:text-white shadow-sm hover:shadow-md transition-all"
              >
                View Job Listings
                <FiArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Right Image/Illustration */}
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-200 to-secondary-200 rounded-3xl transform rotate-3"></div>
                <div className="relative bg-gradient-to-br from-primary-400 to-primary-400 rounded-3xl p-8 text-white">
                  <div className="space-y-6">
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center">
                          <FiBriefcase className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="font-bold text-lg">100+</div>
                          <div className="text-sm text-white/80">
                            Active Jobs
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center">
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                        </div>
                        <div>
                          <div className="font-bold text-lg">2,500+</div>
                          <div className="text-sm text-white/80">
                            Companies Hiring
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center">
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <div>
                          <div className="font-bold text-lg">10,000+</div>
                          <div className="text-sm text-white/80">
                            Jobs Filled
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
