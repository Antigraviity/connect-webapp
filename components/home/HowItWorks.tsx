import { Search, MessageSquare, CheckCircle, Star } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Find Your Service",
    description:
      "Browse through thousands of services or search for exactly what you need",
    icon: Search,
    color: "bg-blue-500",
  },
  {
    number: "02",
    title: "Compare & Choose",
    description:
      "Review profiles, portfolios, and ratings to find the perfect match",
    icon: Star,
    color: "bg-purple-500",
  },
  {
    number: "03",
    title: "Communicate",
    description:
      "Discuss project details and requirements directly with the seller",
    icon: MessageSquare,
    color: "bg-orange-500",
  },
  {
    number: "04",
    title: "Get It Done",
    description:
      "Receive your completed work and approve it when you're satisfied",
    icon: CheckCircle,
    color: "bg-green-500",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How Qixer Works
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Getting started is easy. Follow these simple steps to find and hire
            the perfect freelancer
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="relative">
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-gray-300 to-transparent -z-10"></div>
                )}

                <div className="text-center">
                  <div
                    className={`${step.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-4xl font-bold text-gray-200 mb-2">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors">
            Get Started Now
          </button>
        </div>
      </div>
    </section>
  );
}
