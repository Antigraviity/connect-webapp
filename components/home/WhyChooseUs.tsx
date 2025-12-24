"use client";

import { useState, useEffect, useRef } from "react";
import { Shield, Clock, Star, Headphones } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Trusted Professionals & Employers",
    description:
      "All vendors and employers on Connect are verified to ensure reliability and a safe experience for customers and job seekers alike.",
  },
  {
    icon: Clock,
    title: "Instant Booking & Quick Hiring",
    description:
      "Book appointments or apply for jobs instantly. Real-time availability means no waiting — just fast, hassle-free connections.",
  },
  {
    icon: Star,
    title: "Quality & Transparency Guaranteed",
    description:
      "We prioritize verified reviews, fair pricing, and quality standards to make every service and job trustworthy.",
  },
  {
    icon: Headphones,
    title: "Smart Communication",
    description:
      "Chat directly with vendors or recruiters to clarify details, negotiate, or get support — all within the platform.",
  },
];

const stats = [
  { number: 50000, label: "Happy Customers", suffix: "+" },
  { number: 15000, label: "Verified Vendors & Employers", suffix: "+" },
  { number: 100000, label: "Services & Jobs Opted", suffix: "+" },
  { number: 4.5, label: "Average Satisfaction Rating", suffix: "/5" },
];

export default function WhyChooseUs() {
  const [animatedValues, setAnimatedValues] = useState(stats.map(() => 0));
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            stats.forEach((stat, index) => {
              let start = 0;
              const end = stat.number;
              const duration = 2000; // 2 seconds
              const stepTime = 20;
              const increment = end / (duration / stepTime);

              const timer = setInterval(() => {
                start += increment;
                if (start >= end) {
                  start = end;
                  clearInterval(timer);
                }
                setAnimatedValues((prev) => {
                  const updated = [...prev];
                  updated[index] = parseFloat(start.toFixed(1));
                  return updated;
                });
              }, stepTime);
            });
            observer.disconnect(); // run animation only once
          }
        });
      },
      { threshold: 0.3 },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-16 bg-white px-8 md:px-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose Connect?
          </h2>

          {/* Blue line below heading */}
          <div className="w-24 h-[2px] bg-blue-500 mx-auto mb-4 rounded-full"></div>

          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Connecting You to Trusted Local Services & Exciting Career
            Opportunities
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="text-center">
                <div className="bg-gray-200 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
                  <Icon className="w-8 h-8 text-primary-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            );
          })}
        </div>

        {/* Stats Bar with Animation */}
        <div ref={sectionRef} className="bg-blue-100 rounded-3xl p-8 md:p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-gray-900">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="text-3xl md:text-4xl font-bold mb-2 transition-all">
                  {animatedValues[index] >= 1000
                    ? `${Math.round(animatedValues[index] / 1000)}K${stat.suffix}`
                    : `${animatedValues[index]}${stat.suffix}`}
                </div>
                <div className="text-gray-700 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
