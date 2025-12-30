"use client";

import { Phone, Mail, MapPin } from "lucide-react";

type Detail = {
  label: string;
  link?: string; // ✅ optional
};

type ContactCard = {
  icon: React.ElementType;
  title: string;
  details: Detail[];
  bgColor: string;
  iconColor: string;
};

const contactCards: ContactCard[] = [
  {
    icon: Phone,
    title: "Call Us",
    details: [
      { label: "+91 000000000", link: "tel:+910000000" },
    ],
    bgColor: "bg-secondary-400",
    iconColor: "text-white",
  },
  {
    icon: Mail,
    title: "Mail Us",
    details: [
      { label: "info@forgeindia.com", link: "mailto:info@forgeindia.com" },
    ],
    bgColor: "bg-secondary-400",
    iconColor: "text-white",
  },
  {
    icon: MapPin,
    title: "Our Address",
    details: [
      { label: "address" },
    ],
    bgColor: "bg-secondary-400",
    iconColor: "text-white",
  },
];

export default function ContactInfo() {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-6">
          {contactCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div
                  className={`${card.bgColor} w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md`}
                >
                  <Icon className={`w-8 h-8 ${card.iconColor}`} />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3">{card.title}</h3>

                <div className="space-y-1">
                  {card.details.map((detail, idx) =>
                    detail.link ? (
                      <a
                        key={idx}
                        href={detail.link}
                        className="text-gray-600 text-sm hover:text-orange-600 transition-colors"
                      >
                        {detail.label}
                      </a>
                    ) : (
                      <p key={idx} className="text-gray-600 text-sm">
                        {detail.label}
                      </p>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
