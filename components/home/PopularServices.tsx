import Link from "next/link";
import { Star, Heart, MapPin, TrendingUp } from "lucide-react";

const popularServices = [
  {
    id: 5,
    title: "Complete Home Renovation & Remodeling",
    seller: "Emma Wilson",
    rating: 5.0,
    reviews: 234,
    price: 150,
    image: "🏗️",
    category: "Construction",
    trending: true,
  },
  {
    id: 6,
    title: "Professional Moving & Packing Service",
    seller: "Move Masters",
    rating: 4.9,
    reviews: 189,
    price: 80,
    image: "📦",
    category: "Moving",
    trending: true,
  },
  {
    id: 7,
    title: "Pet Grooming & Veterinary Care",
    seller: "Pet Paradise",
    rating: 5.0,
    reviews: 156,
    price: 45,
    image: "🐕",
    category: "Pet Care",
    trending: false,
  },
  {
    id: 8,
    title: "Event Planning & Decoration Services",
    seller: "Party Planners Pro",
    rating: 4.8,
    reviews: 201,
    price: 200,
    image: "🎉",
    category: "Events",
    trending: true,
  },
  {
    id: 9,
    title: "Lawn Care & Landscaping Service",
    seller: "Green Gardens",
    rating: 4.9,
    reviews: 143,
    price: 60,
    image: "🌿",
    category: "Gardening",
    trending: false,
  },
  {
    id: 10,
    title: "Interior Design Consultation",
    seller: "Design Studio",
    rating: 5.0,
    reviews: 178,
    price: 120,
    image: "🛋️",
    category: "Design",
    trending: false,
  },
  {
    id: 11,
    title: "HVAC Installation & Repair",
    seller: "Cool Comfort",
    rating: 4.9,
    reviews: 167,
    price: 90,
    image: "❄️",
    category: "HVAC",
    trending: false,
  },
  {
    id: 12,
    title: "Professional Photography Session",
    seller: "Capture Moments",
    rating: 5.0,
    reviews: 298,
    price: 100,
    image: "📸",
    category: "Photography",
    trending: true,
  },
];

export default function PopularServices() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Popular Services</h2>
          <Link
            href="/services?sort=popular"
            className="text-orange-500 hover:text-orange-600 font-semibold flex items-center gap-1"
          >
            Explore All →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularServices.map((service) => (
            <Link
              key={service.id}
              href={`/service/${service.id}`}
              className="group bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all border border-gray-100"
            >
              {/* Image */}
              <div className="relative h-48 bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center">
                <span className="text-6xl">{service.image}</span>
                {service.trending && (
                  <div className="absolute top-3 left-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Trending
                  </div>
                )}
                <button className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shadow-md">
                  <Heart className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500"></div>
                  <span className="text-sm font-medium text-gray-700">
                    {service.seller}
                  </span>
                </div>

                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2 h-12">
                  {service.title}
                </h3>

                <div className="flex items-center gap-1 mb-3">
                  <Star className="w-4 h-4 fill-orange-400 text-orange-400" />
                  <span className="font-semibold text-sm text-gray-900">
                    {service.rating}
                  </span>
                  <span className="text-gray-500 text-sm">
                    ({service.reviews})
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {service.category}
                  </span>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Starting at</div>
                    <div className="text-xl font-bold text-gray-900">
                      ${service.price}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
