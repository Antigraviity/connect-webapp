import { Settings, Star, Shield, Zap, DollarSign, Headphones } from "lucide-react";

const features = [
  {
    icon: Settings,
    title: "One Platform, Many Possibilities",
    description:
      "Discover local shops, trusted services, and nearby job opportunities — all in one place designed for simplicity and convenience.",
    color: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    icon: Star,
    title: "Verified and Trusted Providers",
    description:
      "Every business and professional on Company name Connect is verified, ensuring you always connect with genuine, high-quality service providers.",
    color: "bg-pink-100",
    iconColor: "text-pink-600",
  },
  {
    icon: Shield,
    title: "Smart Matching System",
    description:
      "Our intelligent location-based system quickly connects customers, businesses, and job seekers, helping everyone find the perfect local match with ease.",
    color: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    icon: Zap,
    title: "Real Reviews, Real Experiences",
    description:
      "Transparency matters. Every rating and review comes from real users, helping you make confident decisions backed by community feedback.",
    color: "bg-orange-100",
    iconColor: "text-orange-600",
  },
  {
    icon: DollarSign,
    title: "Earn, Grow, and Thrive",
    description:
      "Company name Connect supports local entrepreneurs, freelancers, and job seekers to grow their reach, income, and visibility in a digital marketplace.",
    color: "bg-teal-100",
    iconColor: "text-teal-600",
  },
  {
    icon: Headphones,
    title: "A Community That Cares",
    description:
      "We believe in people over platforms. Our mission is to strengthen India’s local economy by building meaningful connections between those who serve and those who need.",
    color: "bg-purple-100",
    iconColor: "text-purple-600",
  },
];

export default function WhyOurMarketplace() {
  return (
    <section className="py-16 bg-gray-50 px-8 md:px-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Why Our Marketplace?
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Company name Connect isn’t just a platform-<br/>It’s a smarter way to discover, book, and grow within your local community.<br/>
            We focus on reliability, simplicity, and trust to make every experience seamless for customers, businesses, and job seekers alike.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                {/* Icon */}
                <div
                  className={`${feature.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6`}
                >
                  <Icon className={`w-8 h-8 ${feature.iconColor}`} />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
