import Link from "next/link";
import { CheckCircle } from "lucide-react";

const benefits = [
  "Grow your visibility and attract more customers in your area",
  "Manage your services, bookings, and payments with ease",
  "Build a trusted digital presence and expand your local reach",
];

export default function StartAsSeller() {
  return (
    <section className="py-16 bg-gray-50 px-8 md:px-16">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Content */}
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Start As a Seller
            </h2>

            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              Join Connect and grow your business faster by reaching more local customers every day. 
              Our platform helps you showcase your services, manage bookings easily, 
              and build trust through verified reviews and secure transactions.
            </p>

            {/* Benefits List */}
            <div className="space-y-4 mb-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-secondary-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <Link
              href="/become-seller"
              className="inline-block bg-gradient-to-r from-primary-300 to-primary-500 text-white font-semibold px-8 py-4 rounded-full hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              Become a Seller
            </Link>
          </div>

          {/* Right Side - Image */}
          <div className="relative">
            {/* Decorative element */}
            <div className="absolute -right-8 bottom-0 w-72 h-72 bg-yellow-100 rounded-full -z-10"></div>

            {/* Image Container */}
            <div className="relative rounded-3xl overflow-hidden shadow-xl">
              <img
                src="/assets/img/seller.webp"
                alt="Start as Seller"
                className="w-full h-[500px] object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
