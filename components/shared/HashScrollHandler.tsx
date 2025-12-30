"use client";

import { useEffect } from "react";

export default function HashScrollHandler() {
  useEffect(() => {
    // Check if there's a hash in the URL
    const hash = window.location.hash;
    
    if (hash) {
      // Small delay to ensure the page is fully rendered
      setTimeout(() => {
        const targetId = hash.replace("#", "");
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          const navbarHeight = 80; // Match the navbar height (h-20 = 80px)
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      }, 100);
    }
  }, []);

  return null; // This component doesn't render anything
}
