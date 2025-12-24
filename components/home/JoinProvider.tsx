import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";

export default function JoinAsProvider() {
  return (
    <section className="py-20 bg-sky-50 px-8 md:px-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <h2 className="text-4xl md:text-5xl font-semi-bold text-gray-800 mb-6 leading-snug">
              Join with us as a service provider and earn a good remuneration
            </h2>

            <ul className="space-y-4 mb-8 text-gray-700">
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-blue-500" />
                <span>Get regular works</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-blue-500" />
                <span>24/7 Support</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-blue-500" />
                <span>Generous service buyers</span>
              </li>
            </ul>

            <Link
              href="/provider/register"
              className="inline-block border border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white font-semibold px-8 py-4 rounded-full transition-colors shadow-md"
            >
              Join As A Seller
            </Link>
          </div>

          {/* Right Floating Avatars */}
          <div className="relative flex justify-center items-center">
            <div className="relative w-[500px] h-[400px]">
              {/* Floating Images */}
              <div className="absolute top-0 left-1/3 transform -translate-x-1/2">
                <Image
                  src="/assets/img/beauty-wellness.webp"
                  alt="Provider"
                  width={120}
                  height={120}
                  className="rounded-full border-4 border-white shadow-lg"
                />
              </div>

              <div className="absolute top-20 right-10">
                <Image
                  src="/assets/img/doctor-consultation.webp"
                  alt="Provider"
                  width={100}
                  height={100}
                  className="rounded-full border-4 border-white shadow-lg"
                />
              </div>

              <div className="absolute bottom-0 left-0">
                <Image
                  src="/assets/img/catering.webp"
                  alt="Provider"
                  width={140}
                  height={140}
                  className="rounded-full border-4 border-white shadow-lg"
                />
              </div>

              <div className="absolute bottom-10 right-0">
                <Image
                  src="/assets/img/haircut.webp"
                  alt="Provider"
                  width={110}
                  height={110}
                  className="rounded-full border-4 border-white shadow-lg"
                />
              </div>

              <div className="absolute bottom-32 left-40">
                <Image
                  src="/assets/img/home-services.webp"
                  alt="Provider"
                  width={130}
                  height={130}
                  className="rounded-full border-4 border-white shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
