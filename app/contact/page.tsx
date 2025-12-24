import ContactHero from "@/components/contact/ContactHero";
import ContactInfo from "@/components/contact/ContactInfo";
import ContactForm from "@/components/contact/ContactForm";

export const metadata = {
  title: "Contact Us | Company name",
  description:
    "Get in touch with Company name - We're here to help you with trusted local services and career opportunities",
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
