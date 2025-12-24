export default function MobileApp() {
  return (
    <section
      id="mobile-app-section"
      className="min-h-[75vh] py-24 flex justify-center bg-white relative"
    >
      <div className="relative max-w-[1400px] w-full bg-gradient-to-b from-[#FFF6F6] to-[#FFEDED] rounded-[32px] shadow-lg flex flex-col md:flex-row items-center justify-between px-10 py-16 overflow-hidden">
        {/* LEFT CONTENT */}
        <div className="md:w-1/2 mb-10 md:mb-0 z-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Download the Connect App now!
          </h2>
          <p className="text-gray-600 text-lg mb-8">
            Experience seamless booking and exclusive discounts curated for you.
          </p>

          {/* ✅ Tick Bullet Points */}
          <div className="space-y-5">
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

        {/* RIGHT CONTENT — Phone Image slightly overlapping bottom */}
        <div className="md:w-1/2 flex justify-center items-end relative">
          {/* 🔆 Radial Glow Behind Phone */}
          <div className="absolute bottom-[-40px] w-[520px] h-[520px] rounded-full bg-[radial-gradient(circle_at_center,_rgba(0,0,0,0.08),_transparent_70%)] -z-10"></div>

          {/* 📱 Phone Image */}
          <img
            src="/assets/icons/qr.webp"
            alt="Phone mockup"
            className="absolute bottom-[-214px] w-[420px] md:w-[460px] lg:w-[620px] object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.1)] transition-transform duration-500 hover:scale-105"
          />
        </div>
      </div>
    </section>
  );
}
