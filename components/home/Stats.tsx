import { Users, Briefcase, Award, Clock } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "50,000+",
    label: "Active Users",
    color: "bg-blue-500",
  },
  {
    icon: Briefcase,
    value: "100,000+",
    label: "Projects Completed",
    color: "bg-green-500",
  },
  {
    icon: Award,
    value: "15,000+",
    label: "Verified Professionals",
    color: "bg-purple-500",
  },
  {
    icon: Clock,
    value: "24/7",
    label: "Customer Support",
    color: "bg-orange-500",
  },
];

export default function Stats() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center">
                <div
                  className={`${stat.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}
                >
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
