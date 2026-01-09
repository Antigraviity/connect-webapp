import ContactHero from "@/components/contact/ContactHero";
import ContactInfo from "@/components/contact/ContactInfo";
import ContactForm from "@/components/contact/ContactForm";

export const metadata = {
  title: "Contact Us | Forge India Connect",
  description:
    "Get in touch with Forge India Connect - We're here to help you with local services, products, and career opportunities",
};

export default function ContactPage() {
  return (
    <div className="w-full">
      {/* Hero Section with Breadcrumb */}
      <ContactHero />

      {/* Contact Info Cards */}
      <ContactInfo />

      {/* Contact Form */}
      <ContactForm />
    </div>
  );
}
