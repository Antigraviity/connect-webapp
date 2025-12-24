"use client";

import Image from "next/image";
import { CheckCircle } from "lucide-react";

const features = [
  "Discover and book trusted local services instantly",
  "Empower small businesses to reach more customers",
  "Connect job seekers with top companies",
  "Build trust through transparent ratings and verified profiles",
  "Strengthen India’s local economy through digital innovation",
];

export default function KnowAboutUs() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Image with Badge */}
          <div className="relative">
            {/* Background Decoration */}
            <div className="absolute -left-12 top-0 w-80 h-80 bg-blue-50 rounded-full -z-10 opacity-50"></div>

            {/* ✅ Image Container */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gray-200">
              <Image
                src="/assets/img/our-team.webp"
                alt="Our Team"
                width={800} // ✅ Explicit width
                height={500} // ✅ Explicit height
                className="object-cover w-full h-[500px]"
                priority
              />

              {/* Experience Badge */}
              <div className="absolute bottom-10 left-10 bg-gradient-to-br from-primary-200 to-primary-500 text-white px-10 py-8 rounded-2xl shadow-2xl">
                <div className="text-6xl font-bold leading-none">5 Years</div>
                <div className="text-xl font-semibold mt-2">Experience</div>
              </div>
            </div>
          </div>

          {/* Right Side - Content */}
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Know About Us
            </h2>

            <p className="text-gray-600 text-lg mb-4 leading-relaxed">
              Connect is transforming how local communities grow. We bring customers, service providers, and job seekers together on one trusted platform — making it simple to discover nearby shops, book reliable services, and find meaningful work close to home. Through technology, we empower people and businesses to thrive within their own neighborhoods.
            </p>

            {/* Features List */}
            <div className="space-y-4 mt-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-secondary-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-base">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
