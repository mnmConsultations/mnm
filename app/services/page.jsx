/**
 * Services Page
 * /services
 * 
 * Marketing page showcasing M&M Consultations service offerings
 * Detailed breakdown of relocation services for Indian students in Germany
 * 
 * Features:
 * - Service categories with icons and descriptions
 * - Expandable service details
 * - Visual imagery for each service
 * - Auth-based redirect for logged-in users
 * - Call-to-action linking to packages page
 * 
 * Service Categories:
 * 1. Pre-Departure Support - Q&A, video series, starter kit
 * 2. Arrival & Settlement - Airport pickup, orientation bootcamp
 * 3. Documentation Assistance - Anmeldung, banking, insurance
 * 4. Accommodation Help - Housing search, viewings, lease support
 * 5. Academic Support - University enrollment, tutoring
 * 6. Social Integration - Event coordination, networking
 * 
 * Auth Logic:
 * - Checks logged-in status via useLoggedInUser
 * - Redirects admin → /dashboard/admin
 * - Redirects user → /dashboard/user
 * - Shows loading spinner during auth check
 * 
 * Layout:
 * - Hero section with page intro
 * - Grid of service cards with lucide-react icons
 * - Each card expandable for detailed features
 * - Service images for visual appeal
 * - CTA section at bottom
 * 
 * Hydration Protection:
 * - isMounted state prevents SSR/client mismatch
 * - Returns null while redirecting
 */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLoggedInUser } from "@/lib/hooks/auth.hooks";
import {
  Book, Building, Plane, CreditCard, Phone, MapPin, FileText, Calendar, Users, Award
} from "lucide-react";
import Link from "next/link";

/**
 * Services Array
 * 10 service categories with detailed features
 * Categories: Pre-Departure, Arrival, Documentation, Cultural, Buddy, 
 * Accommodation, Transportation, Connectivity, Safety, Financial
 */
const services = [
  {
    id: 'pre-departure',
    title: 'Pre-Departure Support',
    description: 'Comprehensive preparation for your journey to Germany, ensuring you start your academic adventure with confidence and clarity. Our pre-departure services focus on addressing common concerns and providing practical guidance before you leave India.',
    icon: <Book className="h-12 w-12 text-primary" />,
    features: [
      'Online Q&A Sessions (1-hour group Zoom)',
      'WhatsApp Support Group (6 months)',
      'Berlin Relocation Blueprint (10-part video series with Hindi subtitles)',
      'Pre-Departure Starter Kit (Berlin map, O2 SIM card, phrasebook)',
      '1-1 Pre-Departure Discussion (optional)'
    ],
    src: "/accomodation-help.png",
  },
  {
    id: 'arrival',
    title: 'Arrival & Settlement',
    description: 'Make your transition to German life smooth with our arrival and settlement services. From the moment you land at Berlin Brandenburg Airport, our team ensures you navigate your new environment with ease and confidence.',
    icon: <Plane className="h-12 w-12 text-primary" />,
    features: [
      'Airport Pickup Service with public transport training',
      '10-Day Post-Arrival Support with daily check-ins',
      'Orientation Bootcamp (Anmeldung, transport, groceries)',
      'Indian Welcome Package (spices, rice, recipe booklet)',
      'Assistance with local SIM activation and banking'
    ],
    src: "/Anmeldung-Assistance.jpg"
  },
  {
    id: 'documents',
    title: 'Documentation Assistance',
    description: 'Navigate German bureaucracy with expert guidance. We support you through essential registration processes and paperwork, ensuring you meet all legal requirements for your stay in Germany as a student.',
    icon: <FileText className="h-12 w-12 text-primary" />,
    features: [
      'Anmeldung (city registration) assistance',
      'Guidance on blocked account options (Expatrio, Fintiba)',
      'Bank account setup support',
      'Health insurance guidance',
      'University enrollment documentation advice'
    ],
    src: "/airport-pickup.png",
  },
  {
    id: 'cultural',
    title: 'Cultural Integration',
    description: 'Experience the best of both worlds with our cultural integration services. We help you maintain connections to Indian culture while embracing German society, creating a balanced and enriching international experience.',
    icon: <Calendar className="h-12 w-12 text-primary" />,
    features: [
      'Monthly cultural events (Diwali, Holi, Bollywood nights)',
      'Indian Student Association Berlin connections',
      'Guided city explorations (Brandenburg Gate, Mauerpark)',
      'Cultural adaptation workshops',
      'German language resources and practice opportunities'
    ],
    src: "/bank_account-setup.jpg",
  },
  {
    id: 'buddy',
    title: 'Buddy Program',
    description: 'Gain personalized guidance from experienced Indian students already established in Berlin. Our Buddy Program provides mentorship and friendly support to help you navigate both academic and day-to-day challenges.',
    icon: <Users className="h-12 w-12 text-primary" />,
    features: [
      '1-2 months of mentorship from Berlin-based Indian students',
      'Local insights and practical advice',
      'Help finding Indian grocery stores and restaurants',
      'Social integration and friendship building',
      'Academic and career guidance from experienced peers'
    ],
    src: "/sim-card-connectivity.jpg",
  },
  {
    id: 'accommodation',
    title: 'Accommodation Support',
    description: 'Finding suitable and affordable housing is one of the biggest challenges for international students in Germany. We provide guidance on navigating the Berlin housing market and understanding German rental practices.',
    icon: <Building className="h-12 w-12 text-primary" />,
    features: [
      'Housing market orientation during Bootcamp',
      'Guidance on WG-Gesucht and other platforms',
      'Explanation of German rental terms (Kaltmiete, Warmmiete)',
      'Temporary accommodation recommendations',
      'Document preparation for rental applications'
    ],
    src: "/accomodation-help.png",
  },
  {
    id: 'transportation',
    title: 'Transport Navigation',
    description: 'Learn to navigate Berlin\'s extensive public transportation system confidently with our hands-on guidance. We teach you cost-effective travel methods that save money while helping you explore the city independently.',
    icon: <MapPin className="h-12 w-12 text-primary" />,
    features: [
      'Public transport training (FEX, S-Bahn, U-Bahn, buses)',
      'BVG app setup and usage guidance',
      'Information on student discounts and semester tickets',
      'Bicycle safety and rental options',
      'Cost-saving tips (€5-€10 tickets vs. €50-€70 taxis)'
    ],
    src: "/welcome-resource.jpeg",
  },
  {
    id: 'connectivity',
    title: 'Connectivity Solutions',
    description: 'Stay connected from day one with our exclusive mobile plans and internet setup assistance. Through our partnership with O2, we offer special rates and high-data packages designed specifically for Indian students.',
    icon: <Phone className="h-12 w-12 text-primary" />,
    features: [
      'Exclusive O2 partnership with 50% discount',
      'High-data mobile plans (100-300 GB)',
      'Pre-activated SIM cards in Starter Kit',
      'Home internet options guidance',
      'WhatsApp Support Group for technical questions'
    ],
    src: "/Event-connecting.png",
  },
  {
    id: 'safety',
    title: 'Safety & Emergency Support',
    description: 'Your wellbeing is our priority. Our safety workshops and emergency support ensure you\'re prepared for any situation and know how to access help when needed in your new environment.',
    icon: <Award className="h-12 w-12 text-primary" />,
    features: [
      'Safety & Emergency Workshop (1-day)',
      'Guidance on emergency numbers (110, 112)',
      'Scam awareness and prevention tips',
      'Safety kit with whistle and contact card',
      'Information on student rights and protections'
    ],
    src: "/Specialised-service (1).jpeg",
  },
  {
    id: 'financial',
    title: 'Financial Guidance',
    description: 'Managing finances in a new country can be challenging. We provide practical advice on banking, budgeting, and cost-saving strategies to help you make the most of your resources while studying in Germany.',
    icon: <CreditCard className="h-12 w-12 text-primary" />,
    features: [
      'Blocked account guidance (€11,904/year requirement)',
      'German bank account setup assistance',
      'Budget planning for Berlin living costs',
      'Information on student jobs and income options',
      'Tips for managing monthly expenses (rent, food, transport)'
    ],
    src: "/ongoing.jpeg",
  },
];

/**
 * Services Component
 * Main page component for services listing
 * 
 * State:
 * - isMounted: Hydration protection flag
 * 
 * Auth Flow:
 * 1. Check authentication status
 * 2. Redirect if logged in
 * 3. Show loading during check
 * 4. Render services if not logged in
 */
const Services = () => {
  const router = useRouter();
  const { data: user, isLoading } = useLoggedInUser();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Redirect logged-in users to their dashboard
    if (isMounted && !isLoading && user) {
      if (user.role === 'admin') {
        router.push('/dashboard/admin');
      } else {
        router.push('/dashboard/user');
      }
    }
  }, [user, isLoading, isMounted, router]);

  // Show loading state while checking authentication
  if (!isMounted || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render content if user is logged in (will redirect)
  if (user) {
    return null;
  }

  return (
    <div>
      <section className="bg-gradient-to-r from-blue-50 to-blue-100 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Our Services
            </h1>
            <p className="text-lg text-gray-700 mb-8">
              Comprehensive support services designed specifically for Indian students 
              pursuing higher education in Germany. From pre-departure preparation to 
              cultural integration, we've got you covered every step of the way.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-16">
            {services.map((service, index) => (
              <div
                key={service.id}
                id={service.id}
                className={`scroll-mt-24 ${index % 2 === 0 ? "" : "bg-base-300 md:bg-gray-200 -mx-4 px-4 py-12 rounded-lg"}`}
              >
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className={`${index % 2 === 0 ? "order-1" : "order-2"}`}>
                    <div className="inline-block p-3 bg-blue-50 rounded-full mb-6">
                      {service.icon}
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                      {service.title}
                    </h2>
                    <p className="text-gray-700 mb-6">{service.description}</p>
                    <ul className="space-y-3 mb-8">
                      {service.features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                          <div className="bg-primary/10 p-1 rounded-full mr-3 flex-shrink-0 mt-1">
                            <svg
                              className="h-3 w-3 text-primary"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className={`${index % 2 === 0 ? "order-2" : "order-1"}`}>
                    <img
                      src={`${service.src}`}
                      alt={service.title}
                      className="rounded-lg shadow-md w-full h-auto max-h-240 md:max-h-[460px] object-cover"
                    />
                  </div>
                </div>
              </div>
              
            ))}
          </div>

          <div className="text-center mt-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-gray-700 mb-8">
              Explore our pre-designed packages or create a custom solution
              based on your specific needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn btn-primary text-neutral-content">
                <Link href="/packages">View Packages</Link>
              </button>
              <button className="btn btn-primary text-neutral-content">
                <Link href="/contact">Contact Us</Link>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;
