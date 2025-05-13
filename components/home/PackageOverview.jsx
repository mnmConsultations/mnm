"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"; // Import hooks
import Link from "next/link";
import { Check } from "lucide-react";

const packages = [
  {
    id: 'essential',
    name: 'Essential Package',
    description: 'Core services for a smooth transition to Germany',
    price: '₹25,000',
    features: [
      'Online Q&A Session (1-hour group Zoom)',
      'WhatsApp Support Group (6 months pre-arrival)',
      'Berlin Relocation Blueprint (10-part video series)',
      'Pre-Departure Starter Kit',
      'Event Coordination & Group Integration',
      'Orientation Bootcamp (2-day program)'
    ],
    link: "/packages#essential",
    recommended: true
  },
  {
    id: 'premium',
    name: 'Premium Package',
    description: 'Comprehensive support for a worry-free experience',
    price: '₹40,000',
    features: [
      'Everything in Essential Package',
      'Airport Pickup Service',
      'Indian Welcome Package',
      '10-Day Post-Arrival Support',
      'Buddy Program (1-2 months mentorship)',
      'Safety & Emergency Workshop',
      '1-1 Pre-Departure Discussion'
    ],
    link: "/packages#premium",
    recommended: false
  }
];

// Find the index of the recommended package for default selection
const recommendedIndex = packages.findIndex((pkg) => pkg.recommended) ?? 0;

const PackagesOverview = () => {
  // State to track the active package index
  const [activeIndex, setActiveIndex] = useState(recommendedIndex);
  // Ref for the carousel container
  const carouselRef = useRef(null);
  // Refs for individual carousel items
  const itemRefs = useRef([]);
  // Ref to prevent observer updates while scrolling programmatically
  const isScrollingProgrammatically = useRef(false);
  // Ref for the observer instance
  const observerRef = useRef(null);

  // Function to handle tab changes
  const handleTabChange = (index) => {
    if (index === activeIndex) return; // Avoid unnecessary updates

    setActiveIndex(index);
    const targetItem = itemRefs.current[index];
    if (targetItem && carouselRef.current) {
      isScrollingProgrammatically.current = true; // Flag programmatic scroll
      const scrollLeft = targetItem.offsetLeft - carouselRef.current.offsetLeft;
      carouselRef.current.scrollTo({ left: scrollLeft, behavior: "smooth" });

      // Reset the flag after scrolling animation likely finishes
      setTimeout(() => {
        isScrollingProgrammatically.current = false;
      }, 600); // Adjust timeout based on scroll behavior duration
    }
  };

  // Callback for Intersection Observer
  const handleIntersection = useCallback(
    (entries) => {
      if (isScrollingProgrammatically.current) return; // Ignore observer if scrolling programmatically

      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.75) {
          // Check if item is mostly visible
          const index = itemRefs.current.findIndex(
            (ref) => ref === entry.target,
          );
          if (index !== -1 && index !== activeIndex) {
            // Update state only if a *different* item becomes active due to user swipe
            setActiveIndex(index);
          }
        }
      });
    },
    [activeIndex],
  ); // Recreate callback if activeIndex changes

  // Effect to set up Intersection Observer
  useEffect(() => {
    // Ensure refs are populated before setting up observer
    const currentItemRefs = itemRefs.current.filter(Boolean); // Filter out any null refs initially
    if (currentItemRefs.length === 0) return;

    // Disconnect previous observer if it exists
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const options = {
      root: carouselRef.current, // Observe intersections within the carousel container
      rootMargin: "0px",
      threshold: 0.75, // Trigger when 75% of the item is visible
    };

    const observer = new IntersectionObserver(handleIntersection, options);
    observerRef.current = observer; // Store observer instance

    currentItemRefs.forEach((item) => {
      if (item) observer.observe(item);
    });

    // Initial scroll to the active index without smooth behavior
    const initialItem = itemRefs.current[activeIndex];
    if (initialItem && carouselRef.current) {
      const scrollLeft =
        initialItem.offsetLeft - carouselRef.current.offsetLeft;
      carouselRef.current.scrollTo({ left: scrollLeft, behavior: "auto" });
    }

    // Cleanup function
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleIntersection, activeIndex]); // Rerun effect if handler or activeIndex changes (for initial scroll)

  // Effect to clear item refs array on unmount or package change (if packages were dynamic)
  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, packages.length);
    return () => {
      itemRefs.current = [];
    }; // Clear refs on unmount
  }, [packages.length]);

  return (
    <section className=" bg-gray-50 py-16 px-4 md:py-24 md:px-8 lg:px-16">
      <div className=" max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Service Packages
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Choose from our carefully designed packages to suit your relocation
            needs. Each package can be customized with additional services as
            required.
          </p>
        </div>

        {/* --- Mobile View: Toggles + Carousel (Hidden on Medium screens and up) --- */}
        <div className="md:hidden">
          {/* DaisyUI Tabs for Toggles */}
          <div role="tablist" className="tabs tabs-boxed justify-center mb-6">
            {packages.map((pkg, index) => (
              <input
                key={pkg.id}
                type="radio"
                name="package_tabs"
                role="tab"
                className="tab"
                aria-label={pkg.name}
                checked={activeIndex === index} // Control checked state
                onChange={() => handleTabChange(index)} // Handle click/change
                // Add readOnly because we control state, prevents console warning
                readOnly
              />
            ))}
          </div>

          {/* DaisyUI Carousel */}
          <div
            ref={carouselRef}
            className="carousel w-full rounded-box scroll-smooth"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {packages.map((pkg, index) => (
              <div
                key={pkg.id}
                // Assign ref to each item's container
                ref={(el) => (itemRefs.current[index] = el)}
                id={`package-mobile-${pkg.id}`}
                className="carousel-item w-full flex-shrink-0" // Ensure items don't shrink
                style={{ scrollSnapAlign: "start" }} // Snap alignment
              >
                {/* Add padding within the carousel item if needed */}
                <div className="p-2 w-full">
                  {/* Re-use card structure, ensure h-full and flex */}
                  <div
                    className={`bg-white rounded-lg shadow-md overflow-hidden relative flex flex-col h-full ${
                      pkg.recommended ? "ring-2 ring-primary" : ""
                    }`}
                  >
                    {pkg.recommended && (
                      <div className="absolute top-2 right-2 bg-primary text-white px-3 py-1 text-xs font-medium rounded z-10">
                        Recommended
                      </div>
                    )}
                    <div className="p-6 w-full flex flex-col flex-grow">
                      {" "}
                      {/* Use flex-grow */}
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">
                          {pkg.name}
                        </h3>
                        {/* Optional: Set min-height for description */}
                        <p className="text-gray-600 mb-4 min-h-[4rem]">
                          {pkg.description}
                        </p>
                        <p className="text-3xl font-bold text-primary mb-6">
                          {pkg.price}
                        </p>
                      </div>
                      <div className="flex-grow">
                        {" "}
                        {/* Make features list grow */}
                        <ul className="space-y-3 mb-8">
                          {pkg.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-start">
                              <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      {/* Button pushed to bottom */}
                <div className="">
                  {/* Make Link fill button */}
                  <Link
                    href="/contact"
                    className={`w-full btn ${
                      pkg.recommended ? "btn-primary" : "btn-outline"
                    }`}
                  >
                    Contact
                  </Link>
                </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- Desktop Grid (Hidden on Small screens) --- */}
        <div className="hidden md:grid md:grid-cols-2 gap-8">
          {packages.map((pkg) => (
            // Use existing card structure - Ensure h-full and flex for consistent height
            <div
              key={pkg.id}
              className={`bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:-translate-y-2 relative flex flex-col h-full ${
                pkg.recommended ? "ring-2 ring-primary" : ""
              }`}
            >
              {pkg.recommended && (
                <div className="absolute top-0 right-0 bg-primary text-white px-4 py-1 text-sm font-medium">
                  Recommended
                </div>
              )}
              {/* Ensure inner div allows flex column and takes full height */}
              <div className="p-6 w-full flex flex-col flex-grow">
                
                {/* Use flex-grow */}
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {pkg.name}
                  </h3>
                  {/* Optional: Set min-height for description */}
                  <p className="text-gray-600 mb-4 min-h-[4rem]">
                    {pkg.description}
                  </p>
                  <p className="text-3xl font-bold text-primary mb-6">
                    {pkg.price}
                  </p>
                </div>
                {/* Make features list grow */}
                <div className="flex-grow">
                  <ul className="space-y-3 mb-8">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Button pushed to bottom */}
                <div className="">
                  {/* Make Link fill button */}
                  <Link
                    href="/contact"
                    className={`w-full btn ${
                      pkg.recommended ? "btn-primary" : "btn-outline"
                    }`}
                  >
                    Contact
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ... (Custom package link remains the same) ... */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Need something more specific? Create your custom package.
          </p>
          {/* Ensure Link is styled as a button */}
          <Link href="/contact" className="btn btn-primary text-neutral-content">
            Connect...
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PackagesOverview;
