"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function CategorySlugRedirectPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  useEffect(() => {
    // Map category slugs to readable names
    const categoryMap: { [key: string]: string } = {
      "beauty-&-wellness": "Beauty & Wellness",
      "beauty-wellness": "Beauty & Wellness",
      "health-&-medical": "Health & Medical",
      "health-medical": "Health & Medical",
      "home-services": "Home Services",
      "automotive": "Automotive",
      "food-&-catering": "Food & Catering",
      "food-catering": "Food & Catering",
      "street-foods": "Street Foods",
    };

    const categoryName = categoryMap[slug] || slug;
    
    // Redirect to book-services page with category as query parameter
    router.replace(`/book-services?category=${encodeURIComponent(categoryName)}`);
  }, [router, slug]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading category services...</p>
      </div>
    </div>
  );
}
