import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";

export default function JoinAsProvider() {
  return (
    <section className="mt-12 md:mt-20 pt-32 pb-12 md:pt-48 md:pb-24 bg-sky-50 px-4 md:px-16 overflow-hidden">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center md:text-left">
            <h2 className="text-3xl md:text-5xl font-semi-bold text-gray-800 mb-6 leading-tight">
              Join with us as a service provider and earn a good remuneration
            </h2>

            <ul className="space-y-4 mb-8 text-gray-700 inline-block text-left">
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-blue-500" />
                <span className="text-sm md:text-base">Get regular works</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-blue-500" />
                <span className="text-sm md:text-base">24/7 Support</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-blue-500" />
                <span className="text-sm md:text-base">Generous service buyers</span>
              </li>
            </ul>

            <div className="mt-4">
              <Link
                href="/auth/register?type=seller"
                className="inline-block border border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white font-semibold px-8 py-4 rounded-full transition-colors shadow-md text-sm md:text-base"
              >
                Join As A Seller
              </Link>
            </div>
          </div>

          {/* Right Floating Avatars */}
          <div className="relative flex justify-center items-center h-[300px] md:h-[400px]">
            <div className="relative w-full max-w-[320px] md:max-w-[500px] h-full">
              {/* Floating Images */}
              <div className="absolute top-0 left-1/3 transform -translate-x-1/2">
                <Image
                  src="/assets/img/beauty-wellness.webp"
                  alt="Provider"
                  width={100}
                  height={100}
                  className="rounded-full border-4 border-white shadow-lg w-[80px] h-[80px] md:w-[120px] md:h-[120px] object-cover"
                />
              </div>

              <div className="absolute top-10 right-0 md:top-20 md:right-10">
                <Image
                  src="/assets/img/doctor-consultation.webp"
                  alt="Provider"
                  width={80}
                  height={80}
                  className="rounded-full border-4 border-white shadow-lg w-[60px] h-[60px] md:w-[100px] md:h-[100px] object-cover"
                />
              </div>

              <div className="absolute bottom-10 left-0 md:bottom-0">
                <Image
                  src="/assets/img/catering.webp"
                  alt="Provider"
                  width={110}
                  height={110}
                  className="rounded-full border-4 border-white shadow-lg w-[90px] h-[90px] md:w-[140px] md:h-[140px] object-cover"
                />
              </div>

              <div className="absolute bottom-5 right-0 md:bottom-10">
                <Image
                  src="/assets/img/haircut.webp"
                  alt="Provider"
                  width={90}
                  height={90}
                  className="rounded-full border-4 border-white shadow-lg w-[70px] h-[70px] md:w-[110px] md:h-[110px] object-cover"
                />
              </div>

              <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 md:bottom-32 md:left-40 md:translate-x-0">
                <Image
                  src="/assets/img/home-services.webp"
                  alt="Provider"
                  width={100}
                  height={100}
                  className="rounded-full border-4 border-white shadow-lg w-[80px] h-[80px] md:w-[130px] md:h-[130px] object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
