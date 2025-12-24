import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "David Chen",
    role: "Startup Founder",
    rating: 5,
    text: "Qixer made it incredibly easy to find talented designers for our brand. The quality exceeded our expectations and the process was seamless.",
    avatar: "DC",
  },
  {
    id: 2,
    name: "Rachel Green",
    role: "Marketing Manager",
    rating: 5,
    text: "I've hired multiple freelancers through Qixer for various projects. The platform is intuitive and the talent pool is exceptional.",
    avatar: "RG",
  },
  {
    id: 3,
    name: "Michael Scott",
    role: "Business Owner",
    rating: 5,
    text: "As a seller on Qixer, I've been able to grow my freelance business significantly. The platform provides great exposure and reliable clients.",
    avatar: "MS",
  },
];

export default function Testimonials() {
  return (
    <section className="py-16 bg-gradient-to-br from-blue-600 to-purple-700 text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What Our Users Say
          </h2>
          <p className="text-blue-100 text-lg">
            Join thousands of satisfied clients and freelancers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-colors"
            >
              <Quote className="w-10 h-10 text-blue-200 mb-4" />

              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>

              <p className="text-white mb-6 leading-relaxed">
                &quot;{testimonial.text}&quot;
              </p>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center font-bold text-white">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-blue-200">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="flex items-center justify-center gap-8 flex-wrap">
            <div className="text-center">
              <div className="text-4xl font-bold mb-1">50K+</div>
              <div className="text-blue-200">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-1">100K+</div>
              <div className="text-blue-200">Projects Completed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-1">4.9/5</div>
              <div className="text-blue-200">Average Rating</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
