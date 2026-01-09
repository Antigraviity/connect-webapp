import AboutHero from "@/components/about/AboutHero";
import KnowAboutUs from "@/components/about/KnowAboutUs";
import WhyOurMarketplace from "@/components/about/WhyOurMarketplace";
import BrowseCategories from "@/components/about/BrowseCategories";
import StartAsSeller from "@/components/about/StartAsSeller";
import TrustedBy from "@/components/about/TrustedBy";

export const metadata = {
  title: "About Connect | Forge India Connect",
  description:
    "Learn about Forge India Connect - Your trusted platform connecting you to local services, products, and career opportunities across India",
};

export default function AboutPage() {
  return (
    <div className="w-full">
      {/* Hero Section with Breadcrumb */}
      <AboutHero />

      {/* Know About Us Section */}
      <KnowAboutUs />

      {/* Why Our Marketplace */}
      <WhyOurMarketplace />

      {/* Browse Categories */}
      <BrowseCategories />

      {/* Start As Seller */}
      <StartAsSeller />

      {/* Trusted By Section */}
      <TrustedBy />
    </div>
  );
}
