import { Star } from "lucide-react";
import Link from "next/link";

const taskers = [
  {
    name: "Alexander P.",
    specialty: "Plumbing Expert",
    rating: 5.0,
    reviews: 342,
    completedJobs: 450,
    avatar: "👨‍🔧",
    verified: true,
  },
  {
    name: "Maria Garcia",
    specialty: "House Cleaning Pro",
    rating: 4.9,
    reviews: 287,
    completedJobs: 380,
    avatar: "👩‍💼",
    verified: true,
  },
  {
    name: "David Chen",
    specialty: "Electrical Specialist",
    rating: 5.0,
    reviews: 298,
    completedJobs: 420,
    avatar: "👨‍💻",
    verified: true,
  },
];

export default function BestTaskers() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Best Taskers of the Month
          </h2>
          <p className="text-gray-600 text-lg">
            Meet our top-rated professionals who consistently deliver
            exceptional service
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {taskers.map((tasker, index) => (
            <Link
              key={index}
              href={`/tasker/${tasker.name.toLowerCase().replace(/ /g, "-")}`}
              className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border-2 border-gray-100 hover:border-orange-300 hover:shadow-xl transition-all"
            >
              {/* Avatar */}
              <div className="text-center mb-4">
                <div className="relative inline-block">
                  <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-3 group-hover:scale-110 transition-transform">
                    {tasker.avatar}
                  </div>
                  {tasker.verified && (
                    <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-xl text-gray-900 mb-1">
                  {tasker.name}
                </h3>
                <p className="text-orange-600 font-medium text-sm">
                  {tasker.specialty}
                </p>
              </div>

              {/* Stats */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-center gap-1">
                  <Star className="w-5 h-5 fill-orange-400 text-orange-400" />
                  <span className="font-bold text-gray-900">
                    {tasker.rating}
                  </span>
                  <span className="text-gray-500 text-sm">
                    ({tasker.reviews} reviews)
                  </span>
                </div>

                <div className="bg-orange-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {tasker.completedJobs}+
                  </div>
                  <div className="text-sm text-gray-600">Completed Jobs</div>
                </div>
              </div>

              {/* Action Button */}
              <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors">
                Book Now
              </button>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
