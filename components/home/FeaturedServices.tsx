
import Link from "next/link";
import { Star, MapPin, Sparkles, Shield } from "lucide-react";
import { getServices } from "@/lib/services";

interface Service {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  price: number;
  discountPrice: number | null;
  images: string;
  rating: number;
  totalReviews: number;
  zipCode: string | null;
  city: string | null;
  state: string | null;
  address: string | null;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  seller: {
    id: string;
    name: string;
    email: string;
    verified: boolean;
  };
  status: string;
  featured: boolean;
}

// Helper to parse images
const getFirstImage = (images: string) => {
  try {
    const imageArray = JSON.parse(images);
    return imageArray[0] || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500';
  } catch {
    return 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500';
  }
};

export default async function FeaturedServices() {
  // Fetch data directly on the server
  let services: any[] = [];
  try {
    const data = await getServices({
      status: 'APPROVED',
      type: 'SERVICE',
      limit: 4,
      featured: true
    });

    if (data.success) {
      services = data.services;
      // Use slice just in case, though API limits to 4
      if (services.length > 4) {
        services = services.slice(0, 4);
      }
    }
  } catch (error) {
    console.error('Error in FeaturedServices component:', error);
    // Graceful degradation - show empty or error state if needed, or just nothing
    return null;
  }

  // If no services, don't show the section
  if (services.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50 px-8 md:px-16">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-4xl font-bold text-gray-900">
              Featured Services
            </h2>
            {/* Mild Blue Underline */}
            <div className="w-24 h-[2px] bg-blue-500 mt-2 rounded-full"></div>
          </div>
          <Link
            href="/book-services"
            className="text-primary-500 hover:text-secondary-500 font-semibold flex items-center gap-1"
          >
            Explore All →
          </Link>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <Link
              key={service.id}
              href={`/book-services/${service.category?.slug}/${service.slug}`}
              className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-primary-300 hover:shadow-xl transition-all duration-300"
            >
              {/* Image */}
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src={getFirstImage(service.images)}
                  alt={service.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Featured Badge */}
                {service.featured && (
                  <div className="absolute top-3 right-3 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Featured
                  </div>
                )}

                {/* Category Badge */}
                <div className="absolute bottom-3 left-3 bg-white/90 px-3 py-1 rounded-full text-xs font-semibold text-gray-700 backdrop-blur">
                  {service.category?.name || 'Service'}
                </div>
              </div>

              {/* Content */}
              <div className="p-4 flex flex-col justify-between h-[220px]">
                <div>
                  {/* Seller Name */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {service.seller?.name || 'Provider'}
                    </span>
                    {service.seller?.verified && (
                      <Shield className="w-3 h-3 text-blue-500 fill-blue-500" />
                    )}
                  </div>

                  {/* Service Title */}
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                    {service.title}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-3">
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    <span className="font-semibold text-sm text-gray-900">
                      {service.rating || 0}
                    </span>
                    <span className="text-gray-500 text-sm">
                      ({service.totalReviews || 0})
                    </span>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-1 text-gray-500 text-xs mb-3">
                    <MapPin className="w-3 h-3" />
                    {service.city && service.state ? (
                      <span>{service.city}, {service.state}</span>
                    ) : service.zipCode ? (
                      <span>Pincode: {service.zipCode}</span>
                    ) : (
                      <span>Location available</span>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-auto">
                  <div className="text-left">
                    <div className="text-xs text-gray-500">Starting at</div>
                    <div className="text-xl font-bold text-gray-900">
                      ₹{service.discountPrice || service.price}
                    </div>
                    {service.discountPrice && (
                      <div className="text-xs text-gray-400 line-through">
                        ₹{service.price}
                      </div>
                    )}
                  </div>
                  <button
                    className="border-2 border-primary-500 text-primary-600 text-sm font-semibold px-4 py-2 rounded-full hover:bg-gradient-to-r hover:from-primary-500 hover:to-primary-600 hover:text-white hover:border-transparent shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
