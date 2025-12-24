import AboutHero from "@/components/about/AboutHero";
import KnowAboutUs from "@/components/about/KnowAboutUs";
import WhyOurMarketplace from "@/components/about/WhyOurMarketplace";
import BrowseCategories from "@/components/about/BrowseCategories";
import StartAsSeller from "@/components/about/StartAsSeller";
import TrustedBy from "@/components/about/TrustedBy";

export const metadata = {
  title: "About Us | Company name",
  description:
    "Learn about Company name - Connecting you to trusted local services and exciting career opportunities",
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
