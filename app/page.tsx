import Hero from "@/components/home/Hero";
import Categories from "@/components/home/Categories";
import FeaturedServices from "@/components/home/FeaturedServices";
import WhyChooseUs from "@/components/home/WhyChooseUs";
// import PopularServices from '@/components/home/PopularServices'
import MobileApp from "@/components/home/MobileApp";
// import BestTaskers from '@/components/home/BestTaskers'
// import BlogSection from '@/components/home/BlogSection'
import JoinProvider from "@/components/home/JoinProvider";
// import Testimonials from '@/components/home/Testimonials'
import Newsletter from "@/components/home/Newsletter";
import FeaturedJobs from "@/components/home/FeaturedJobs";

export default function Home() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <Hero />

      {/* Categories Section */}
      <Categories />

      {/* Featured Jobs */}
      <FeaturedJobs />

      {/* Featured Services */}
      <FeaturedServices />

      {/* Why Choose Us */}
      <WhyChooseUs />

      {/* Popular Services */}
      {/* <PopularServices /> */}

      {/* Mobile App Section */}
      <MobileApp />

      {/* Best Taskers of the Month */}
      {/* <BestTaskers /> */}

      {/* Blog Section */}
      {/* <BlogSection /> */}

      {/* Join as Provider */}
      <JoinProvider />

      {/* Testimonials */}
      {/* <Testimonials /> */}

      {/* Newsletter */}
      <Newsletter />
    </div>
  );
}
