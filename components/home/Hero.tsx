"use client";

import Link from "next/link";
import { MapPin, Briefcase, Wrench, Navigation, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Hero() {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [address, setAddress] = useState("");

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setAddress("Detecting location...");
    setShowDropdown(false);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Reverse geocode using OpenStreetMap (free)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
          );
          const data = await response.json();

          const displayAddress =
            data.display_name || "Unable to get address details";
          setAddress(displayAddress);

          // Extract pincode if available
          const pincode = data.address?.postcode || "";
          if (pincode) {
            setAddress(pincode);
          }
        } catch (error) {
          console.error("Error fetching address:", error);
          setAddress("Unable to retrieve address. Try again.");
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Unable to get your location. Please enter address manually.");
        setAddress("");
      },
    );
  };

  const handleBookService = () => {
    // Redirect to book-services page with pincode/address as query parameter
    if (address.trim()) {
      router.push(`/book-services?location=${encodeURIComponent(address.trim())}`);
    } else {
      router.push('/book-services');
    }
  };

  const handleBuyProducts = () => {
    // Redirect to buy-products page with pincode/address as query parameter
    if (address.trim()) {
      router.push(`/buy-products?location=${encodeURIComponent(address.trim())}`);
    } else {
      router.push('/buy-products');
    }
  };

  const handleFindJob = () => {
    // Redirect to apply-job page with pincode/address as query parameter
    if (address.trim()) {
      router.push(`/apply-job?location=${encodeURIComponent(address.trim())}`);
    } else {
      router.push('/apply-job');
    }
  };

  return (
    <section className="bg-gradient-to-br from-primary-50 via-white to-yellow-50 py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Heading */}
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 leading-tight animate-slide-up">
            Buy Products. Book Services. Find Jobs.
            <br /> All in One Stop.
          </h1>
          <p className="text-gray-600 text-lg md:text-xl mb-10 animate-slide-up [animation-delay:200ms]">
            Discover the right opportunities and trusted services —
            effortlessly.
          </p>

          {/* Address Input with Dropdown */}
          <div className="relative max-w-3xl mx-auto mb-10 animate-slide-up [animation-delay:400ms]">
            <div className="bg-white rounded-full shadow-lg px-6 py-4 focus-within:ring-1 focus-within:ring-primary-300 transition-all">
              <div className="flex items-center relative">
                <MapPin className="w-5 h-5 text-primary-500 mr-3 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Enter your pincode or address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  onFocus={() => setShowDropdown(true)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleBookService();
                    }
                  }}
                  className="w-full outline-none text-gray-700 placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Dropdown */}
            {showDropdown && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowDropdown(false)}
                ></div>

                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-full shadow-lg border border-gray-200 overflow-hidden z-20">
                  <button
                    onClick={handleUseCurrentLocation}
                    className="w-full flex items-center gap-2 px-5 py-2.5 hover:bg-primary-50 transition-colors text-left"
                  >
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Navigation className="w-4 h-4 text-primary-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">
                        Use my current location
                      </div>
                      <div className="text-xs text-gray-500">
                        Auto-detect your current address
                      </div>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4 flex-wrap animate-slide-up [animation-delay:600ms]">
            <button
              onClick={handleBookService}
              className="flex items-center gap-2 bg-transparent border-2 border-secondary-500 text-secondary-500 hover:bg-gradient-to-r from-secondary-300 to-secondary-500 hover:text-white font-semibold px-5 py-2.5 rounded-full transition-all text-sm"
            >
              <Wrench className="w-4 h-4" />
              Book Service
            </button>
            <button
              onClick={handleBuyProducts}
              className="flex items-center gap-2 bg-transparent border-2 border-green-500 text-green-500 hover:bg-gradient-to-r from-green-400 to-green-600 hover:text-white font-semibold px-5 py-2.5 rounded-full transition-all text-sm"
            >
              <ShoppingBag className="w-4 h-4" />
              Buy Products
            </button>
            <button
              onClick={handleFindJob}
              className="flex items-center gap-2 bg-transparent border-2 border-primary-300 text-primary-300 hover:bg-gradient-to-r from-primary-300 to-primary-500 hover:text-white font-semibold px-5 py-2.5 rounded-full transition-all text-sm"
            >
              <Briefcase className="w-4 h-4" />
              Find Job
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
