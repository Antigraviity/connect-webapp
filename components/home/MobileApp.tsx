export default function MobileApp() {
  return (
    <section
      id="mobile-app-section"
      className="pt-0 pb-0 px-4 md:px-8 lg:px-16 flex justify-center bg-white relative"
    >
      <div className="relative max-w-[1400px] w-full bg-gradient-to-b from-[#FFF6F6] to-[#FFEDED] rounded-[32px] shadow-lg flex flex-col md:flex-row items-center justify-between px-10 pt-2 pb-0 overflow-hidden">
        {/* LEFT CONTENT */}
        <div className="md:w-1/2 mt-10 md:mt-0 mb-6 md:mb-10 z-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
            Download the Connect App now!
          </h2>
          <p className="text-gray-600 text-lg mb-0">
            Experience seamless booking and exclusive discounts curated for you.
          </p>

          {/* ✅ Tick Bullet Points */}
          <div className="space-y-4 mt-4">
            {[
              "Book anytime, anywhere",
              "Instant updates and real-time notifications",
              "Exclusive app-only rewards",
            ].map((text, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-7 h-7 bg-green-100 rounded-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={3}
                    stroke="#16A34A"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span className="text-gray-700 text-lg">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT CONTENT — Original Phone mockup design */}
        <div className="md:w-1/2 flex justify-center items-end relative min-h-[260px] md:min-h-[580px] w-full">
          {/* 🔆 Radial Glow Behind Phone */}
          <div className="absolute bottom-[-20px] w-[200px] h-[200px] md:w-[550px] md:h-[550px] rounded-full bg-[radial-gradient(circle_at_center,_rgba(0,0,0,0.08),_transparent_70%)] -z-10"></div>

          {/* 📱 Phone Image (Transparent hand with phone) */}
          <img
            src="/assets/icons/qr.webp"
            alt="App Download QR Code"
            className="absolute bottom-0 w-[400px] sm:w-[500px] md:w-[680px] lg:w-[900px] object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.2)] transition-transform duration-500 hover:scale-105"
          />
        </div>
      </div>
    </section>
  );
}
