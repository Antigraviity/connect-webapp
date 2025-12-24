import Link from "next/link";
import {
  Laptop,
  Sparkles,
  Home,
  Scissors,
  TrendingUp,
  Wrench,
} from "lucide-react";

const categories = [
  {
    name: "Beauty & Wellness",
    image: "/assets/img/beauty-wellness.webp",
    color: "bg-primary-100",
  },
  {
    name: "Health & Medical",
    image: "/assets/img/health-medical.webp",
    color: "bg-secondary-100",
  },
  {
    name: "Home Services",
    image: "/assets/img/home-services.webp",
    color: "bg-primary-100",
  },
  {
    name: "Automotive",
    image: "/assets/img/vechile-repair.webp",
    color: "bg-secondary-100",
  },
  {
    name: "Food & Catering",
    image: "/assets/img/food-catering.webp",
    color: "bg-primary-100",
  },
  {
    name: "Street Foods",
    image: "/assets/img/street-foods.webp",
    color: "bg-secondary-100",
  },
];

export default function BrowseCategories() {
  return (
    <section className="py-16 bg-white px-8 md:px-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Browse Categories
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Discover a wide range of trusted services available in our marketplace. 
            From home repairs to health services, find the perfect service provider for your needs.
          </p>
        </div>

        {/* Categories Grid */}
       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={`/book-services?category=${encodeURIComponent(category.name)}`}
              className="group"
            >
              <div className="bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-lg transition-all text-center hover:border-primary-300">
                {/* 📸 Image replaces the icon */}
                <div className="w-full h-36 rounded-2xl overflow-hidden mb-4">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                {/* ✨ Thin grey line */}
                <div className="w-10 mx-auto border-t border-gray-300 mb-3"></div>

                {/* 🏷️ Category Name */}
                <h3 className="font-semibold text-gray-900 text-base">
                  {category.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
        {/* Explore More Button / Text */}
<div className="text-center mt-10">
  <Link
    href="/book-services"
    className="inline-block text-primary-600 font-semibold text-lg hover:text-secondary-500 transition-colors"
  >
    Explore More →
  </Link>
</div>
      </div>
    </section>
  );
}
