"use client"

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Check, X } from "lucide-react";
import Link from "next/link";

const packages = [
  {
    id: "basic",
    name: "Basic",
    description: "Essential support for your move to Germany",
    price: "€299",
    features: [
      "Anmeldung Assistance",
      "SIM Card Setup",
      "Initial Consultation (1 hour)",
      "Digital Welcome Guide",
      "Email Support (1 week)",
    ],
    excludedFeatures: [
      "Accommodation Assistance",
      "Airport Pickup",
      "Bank Account Setup",
      "Local Orientation Tour",
      "Ongoing Support",
    ],
    popular: false,
  },
  {
    id: "standard",
    name: "Standard",
    description: "Comprehensive support for a smooth transition",
    price: "€599",
    features: [
      "Everything in Basic",
      "Accommodation Assistance",
      "Bank Account Setup",
      "Local Transportation Guidance",
      "Extended Consultation (2 hours)",
      "Email & Phone Support (2 weeks)",
    ],
    excludedFeatures: [
      "Airport Pickup",
      "In-person Anmeldung Assistance",
      "Orientation Tour",
      "Priority Support",
    ],
    popular: true,
  },
  {
    id: "premium",
    name: "Premium",
    description: "Complete end-to-end relocation support",
    price: "€999",
    features: [
      "Everything in Standard",
      "Airport Pickup",
      "In-person Anmeldung Assistance",
      "Guided Orientation Tour",
      "Utility Connections Setup",
      "Extended Consultation (4 hours)",
      "Priority Email & Phone Support (4 weeks)",
    ],
    excludedFeatures: [],
    popular: false,
  },
];

const additionalServices = [
  { id: "airport", name: "Airport Pickup", price: "€80" },
  { id: "orientation", name: "City Orientation Tour", price: "€120" },
  { id: "insurance", name: "Insurance Setup Assistance", price: "€110" },
  { id: "translation", name: "Document Translation (per page)", price: "€25" },
  {
    id: "housing-extended",
    name: "Extended Accommodation Search",
    price: "€150",
  },
  {
    id: "accompaniment",
    name: "Appointment Accompaniment (per hour)",
    price: "€60",
  },
  {
    id: "support-extension",
    name: "Support Extension (per week)",
    price: "€100",
  },
  { id: "furniture", name: "Furniture Shopping Assistance", price: "€90" },
];

const popularIndex = packages.findIndex((pkg) => pkg.popular) ?? 0;

const Packages = () => {
  const [activeIndex, setActiveIndex] = useState(popularIndex);
  const carouselRef = useRef(null);
  const itemRefs = useRef([]);
  const isScrollingProgrammatically = useRef(false);
  const observerRef = useRef(null);

  // --- Helper Functions from PackageOverview ---
  const handleTabChange = (index) => {
    if (index === activeIndex) return;

    setActiveIndex(index);
    const targetItem = itemRefs.current[index];
    if (targetItem && carouselRef.current) {
      isScrollingProgrammatically.current = true;
      const scrollLeft = targetItem.offsetLeft - carouselRef.current.offsetLeft;
      carouselRef.current.scrollTo({ left: scrollLeft, behavior: "smooth" });

      setTimeout(() => {
        isScrollingProgrammatically.current = false;
      }, 600);
    }
  };

  const handleIntersection = useCallback(
    (entries) => {
      if (isScrollingProgrammatically.current) return;

      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.75) {
          const index = itemRefs.current.findIndex(
            (ref) => ref === entry.target,
          );
          if (index !== -1 && index !== activeIndex) {
            setActiveIndex(index);
          }
        }
      });
    },
    [activeIndex],
  );

  // --- useEffect Hooks from PackageOverview ---
  useEffect(() => {
    const currentItemRefs = itemRefs.current.filter(Boolean);
    if (currentItemRefs.length === 0) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const options = {
      root: carouselRef.current,
      rootMargin: "0px",
      threshold: 0.75,
    };

    const observer = new IntersectionObserver(handleIntersection, options);
    observerRef.current = observer;

    currentItemRefs.forEach((item) => {
      if (item) observer.observe(item);
    });

    // Initial scroll for mobile carousel
    const initialItem = itemRefs.current[activeIndex];
    if (initialItem && carouselRef.current) {
        // Check if we are in mobile view before scrolling
        if (window.innerWidth < 768) { // md breakpoint
            const scrollLeft = initialItem.offsetLeft - carouselRef.current.offsetLeft;
            carouselRef.current.scrollTo({ left: scrollLeft, behavior: "auto" });
        }
    }


    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleIntersection, activeIndex]); // Rerun effect if handler or activeIndex changes

  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, packages.length);
    return () => {
      itemRefs.current = [];
    };
  }, [packages.length]);
  return (
    <div>
      <section className="bg-gradient-to-r from-blue-50 to-blue-100 py-16 md:py-24 md:px-52 px-4">
        <div className="">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Our Service Packages
            </h1>
            <p className="text-lg text-gray-700 mb-8">
              Choose from our carefully designed packages to suit your
              relocation needs. Each package can be customized with additional
              services as required.
            </p>
          </div>
        </div>
      </section>

      

      <section className="py-16 packages-section">
        <div className="">
          {/* --- Mobile View: Toggles + Carousel (Hidden on Medium screens and up) --- */}
          <div className="md:hidden"> {/* Added margin bottom */}
            {/* DaisyUI Tabs for Toggles */}
            <div role="tablist" className="tabs tabs-boxed justify-center mb-6">
              {packages.map((pkg, index) => (
                <input
                  key={pkg.id}
                  type="radio"
                  name="package_tabs_page" // Use a unique name
                  role="tab"
                  className="tab"
                  aria-label={pkg.name}
                  checked={activeIndex === index}
                  onChange={() => handleTabChange(index)}
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
                  ref={(el) => (itemRefs.current[index] = el)}
                  id={`package-mobile-${pkg.id}`}
                  className="carousel-item w-full flex-shrink-0"
                  style={{ scrollSnapAlign: "start" }}
                >
                  <div className="p-2 w-full">
                    {/* Re-use card structure, ensure h-full and flex */}
                    <div
                      className={`bg-white rounded-lg shadow-lg overflow-hidden relative flex flex-col h-full ${
                        pkg.popular ? "ring-2 ring-primary" : ""
                      }`}
                    >
                      {pkg.popular && (
                        <div className="bg-primary text-white py-2 text-center font-medium">
                          Most Popular
                        </div>
                      )}
                      <div className="p-6 w-full flex flex-col flex-grow">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-800 mb-2">
                            {pkg.name}
                          </h3>
                          <p className="text-gray-600 mb-4 min-h-[4rem]">
                            {pkg.description}
                          </p>
                          <p className="text-3xl font-bold text-primary mb-6">
                            {pkg.price}
                          </p>
                        </div>
                        <div className="flex-grow">
                          <div className="mb-6">
                            <h4 className="font-semibold text-gray-800 mb-3">
                              Included:
                            </h4>
                            <ul className="space-y-3">
                              {pkg.features.map((feature, fIndex) => (
                                <li key={fIndex} className="flex items-start">
                                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                  <span className="text-gray-700">{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          {pkg.excludedFeatures.length > 0 && (
                            <div className="mb-6">
                              <h4 className="font-semibold text-gray-800 mb-3">
                                Not Included:
                              </h4>
                              <ul className="space-y-1">
                                {pkg.excludedFeatures.map((feature, fIndex) => (
                                  <li key={fIndex} className="flex items-center">
                                    <X className="h-4 w-4 text-red-400 mr-2 flex-shrink-0" /> {/* Added X icon */}
                                    <span className="text-gray-500 text-sm">
                                      {feature}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        <div className="mt-auto pt-4">
                          <button
                            className={`w-full btn ${
                              pkg.popular ? "btn-primary" : "btn-outline"
                            }`}
                          >
                            <Link href={`/contact`} className="w-full h-full flex items-center justify-center">
                              Connect...
                            </Link>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* --- Desktop Grid (Hidden on Small screens) --- */}
          <div className="hidden md:grid md:grid-cols-3 gap-8 p-8 md:py-12 md:px-52 px-4">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                id={pkg.id}
                className={`bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:-translate-y-2 relative flex flex-col h-full ${
                  pkg.popular ? "ring-2 ring-primary" : ""
                }`}
              >
                {pkg.popular && (
                  <div className="bg-primary text-white py-2 text-center font-medium">
                    Most Popular
                  </div>
                )}
                <div className="p-6 w-full flex flex-col flex-grow">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      {pkg.name}
                    </h3>
                    <p className="text-gray-600 mb-4 min-h-[4rem]">
                      {pkg.description}
                    </p>
                    <p className="text-3xl font-bold text-primary mb-6">
                      {pkg.price}
                    </p>
                  </div>
                  <div className="flex-grow">
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-800 mb-3">
                        Included:
                      </h4>
                      <ul className="space-y-3">
                        {pkg.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {pkg.excludedFeatures.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-800 mb-3">
                          Not Included:
                        </h4>
                        <ul className="space-y-1">
                          {pkg.excludedFeatures.map((feature, index) => (
                            <li key={index} className="flex items-center">
                              <X className="h-4 w-4 text-red-400 mr-2 flex-shrink-0" /> {/* Added X icon */}
                              <span className="text-gray-500 text-sm">
                                {feature}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className="mt-auto pt-4">
                    <button
                      className={`w-full btn ${
                        pkg.popular ? "btn-primary" : "btn-outline"
                      }`}
                    >
                      <Link href={`/packages/customize?base=${pkg.id}`} className="w-full h-full flex items-center justify-center">
                        Select Package
                      </Link>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 bg-gray-50 rounded-lg p-8 md:py-24 md:px-52 px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Additional Services
            </h2>
            <p className="text-gray-700 mb-8">
              Customize your package by adding any of these services to meet
              your specific needs:
            </p>

            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {additionalServices.map((service) => (
                <div
                  key={service.id}
                  className="bg-white p-4 rounded-md shadow-sm flex justify-between items-center"
                >
                  <span className="font-medium text-gray-800">
                    {service.name}
                  </span>
                  <span className="text-primary font-semibold">
                    {service.price}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-16 text-center ">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Need a Customized Solution?
            </h2>
            <p className="text-gray-700 mb-8 max-w-3xl mx-auto">
              If our packages don't perfectly match your needs, we offer fully
              customized solutions. Contact us for a personalized consultation
              to create a tailored relocation package.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-outline">
                <Link href="/contact">Contact for Consultation</Link>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-blue-50 md:py-24 md:px-52 px-4">
        <div className="">
        <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
            <div className="collapse collapse-plus bg-base-100 border border-base-300">
              <input type="radio" name="my-accordion-3" defaultChecked />
              <div className="collapse-title font-semibold">
              Can I upgrade my package later?
              </div>
              <div className="collapse-content text-sm">
              Yes, you can upgrade to a higher-tier package or add
                  individual services at any time during your relocation
                  process. Please contact us to discuss your upgrade options.
              </div>
            </div>
            <div className="collapse collapse-plus bg-base-100 border border-base-300">
              <input type="radio" name="my-accordion-3" />
              <div className="collapse-title font-semibold">
              How long is the support period?
              </div>
              <div className="collapse-content text-sm">
              Support periods vary by package: 1 week for Basic, 2 weeks for
                  Standard, and 4 weeks for Premium. You can extend your support
                  period with our additional services.
              </div>
            </div>
            <div className="collapse collapse-plus bg-base-100 border border-base-300">
              <input type="radio" name="my-accordion-3" />
              <div className="collapse-title font-semibold">
              Do you offer refunds if I don't use all services?
              </div>
              <div className="collapse-content text-sm">
              Our packages are designed as comprehensive solutions. While we
                  don't offer partial refunds for unused services, we strive to
                  ensure you get the maximum value from your selected package.
              </div>
            </div>
            <div className="collapse collapse-plus bg-base-100 border border-base-300">
              <input type="radio" name="my-accordion-3" />
              <div className="collapse-title font-semibold">
              Is there a payment plan available?
              </div>
              <div className="collapse-content text-sm">
              Yes, we offer flexible payment plans for our Standard and
                  Premium packages. Please contact our team to discuss the
                  options available to you.
              </div>
            </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Packages;
