"use client";

const logos = [
  { name: "UnitedHealth Group", logo: "/assets/img/partners/uhg.webp" },
  { name: "Axis Bank", logo: "/assets/img/partners/axis.webp" },
  { name: "Capgemini", logo: "/assets/img/partners/capgemeni.webp" },
  { name: "Hyundai", logo: "/assets/img/partners/hyundai.webp" },
  { name: "Tata", logo: "/assets/img/partners/tata.webp" },
  { name: "Foxconn", logo: "/assets/img/partners/foxconn.webp" },
  { name: "Muthoot Finance", logo: "/assets/img/partners/muthoot.webp" },
  { name: "Tech Mahindra", logo: "/assets/img/partners/techmahindra.webp" },
];

export default function TrustedBy() {
  return (
    <section className="py-16 bg-white px-8 md:px-16 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Trusted By Leading Companies
          </h2>
          <p className="text-gray-600 text-lg">
            Partnering with the best in the industry
          </p>
        </div>

        {/* Continuous Running Carousel */}
        <div className="relative w-full overflow-hidden group">
          <div className="flex gap-16 animate-scroll whitespace-nowrap group-hover:[animation-play-state:paused]">
            {[...logos, ...logos].map((company, index) => (
              <div
                key={index}
                className="flex-shrink-0 grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100"
              >
                <img
                  src={company.logo}
                  alt={company.name}
                  className="h-24 md:h-28 w-auto object-contain"
                  onError={(e) => {
                    e.currentTarget.src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='100'%3E%3Crect width='200' height='100' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='Arial' font-size='14'%3E" +
                      company.name +
                      "%3C/text%3E%3C/svg%3E";
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          display: flex;
          width: max-content;
          animation: scroll 30s linear infinite;
        }
      `}</style>
    </section>
  );
}
