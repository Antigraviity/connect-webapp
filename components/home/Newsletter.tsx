import { Mail, Send, Phone, MapPin } from "lucide-react";
import Link from "next/link";

export default function ContactUs() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="bg-yellow-200 rounded-3xl p-8 md:p-12 grid md:grid-cols-2 gap-8 items-center shadow-sm">
          {/* Left Section */}
          <div>
            <div className="inline-flex items-center gap-2 bg-yellow-200 text-gray-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Mail className="w-4 h-4" />
              Contact Us
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Get in Touch with Us
            </h2>

            <p className="text-gray-700 mb-6">
              Have questions, suggestions, or partnership inquiries? We’d love
              to hear from you. Reach out to our team for quick assistance.
            </p>

            <div className="space-y-3 text-gray-800">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-700" />
                <a
                  href="tel:+910000000"
                  className="text-gray-800 hover:text-blue-600 transition-colors"
                >
                  +91 000000000
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-700" />
                <a
                  href="mailto:info@forgeindia.com"
                  className="text-gray-800 hover:text-blue-600 transition-colors"
                >
                  info@forgeindia.com
                </a>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-700" />
                <span>Chennai, Tamil Nadu, India</span>
              </div>
            </div>
          </div>

          {/* Right Contact Form */}
          <div>
            <form className="space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
              />
              <input
                type="email"
                placeholder="Your Email"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
              />
              <textarea
                placeholder="Your Message"
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
              ></textarea>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold px-6 py-3 rounded-lg transition-all shadow-md"
              >
                Send Message <Send className="w-4 h-4" />
              </button>
            </form>

            <p className="text-sm text-gray-600 mt-4 text-center">
              We’ll get back to you within 24 hours. Your information is kept
              confidential.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
