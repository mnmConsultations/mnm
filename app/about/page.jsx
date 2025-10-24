/**
 * About Page
 * /about
 * 
 * Company information and mission statement page
 * Showcases M&M Consultations' values and services
 * 
 * Features:
 * - Company mission and values
 * - Why choose us section with icons
 * - What sets us apart differentiators
 * - Our approach methodology
 * - Contact CTA
 * - Auth-based redirect for logged-in users
 * 
 * Content Sections:
 * 1. Hero - Company tagline and introduction
 * 2. Mission - Core values and goals
 * 3. Why Choose Us - 3 key benefits (Pre-Departure, Cultural, Practical)
 * 4. What Sets Us Apart - Unique differentiators
 * 5. Our Approach - Student-focused methodology
 * 6. CTA - Contact button
 * 
 * Icons:
 * - Info: Pre-departure guidance
 * - Users: Cultural integration
 * - Star: Practical support
 * - MapPin, Calendar, Award: Additional features
 * 
 * Auth Logic:
 * - Redirects logged-in users to dashboard
 * - Admin → /dashboard/admin
 * - User → /dashboard/user
 * - Loading state during auth check
 * 
 * Images:
 * - Unsplash images for visual content
 * - Indian students in Berlin focus
 * 
 * Hydration Protection:
 * - isMounted prevents SSR mismatch
 */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLoggedInUser } from "@/lib/hooks/auth.hooks";
import { Info, Users, Star, MapPin, Calendar, Award } from 'lucide-react';
import Link from "next/link";

/**
 * About Component
 * Marketing page with company information
 * 
 * State:
 * - isMounted: Hydration protection flag
 * 
 * Auth Flow:
 * 1. Check authentication status
 * 2. Redirect if logged in
 * 3. Show loading during check
 * 4. Render content if not logged in
 */
const About = () => {
  const router = useRouter();
  const { data: user, isLoading } = useLoggedInUser();
  const [isMounted, setIsMounted] = useState(false);

  // Hydration protection
  useEffect(() => {
    setIsMounted(true);
  }, []);

  /**
   * Auth-based Redirect Effect
   * Redirects authenticated users to role-specific dashboard
   */
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

  /**
   * Loading State
   * Shown during component mount and auth check
   */
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

  /**
   * Auth Redirect State
   * Returns null while redirecting logged-in users
   */
  if (user) {
    return null;
  }

    return (
        <div>
            {/* Hero Section - Company introduction */}
            <section className="bg-gradient-to-r from-blue-50 to-blue-100 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">About M&M Consultations</h1>
            <p className="text-lg text-gray-700">
              Supporting Indian students pursuing higher education in Germany with personalized guidance and cultural integration.
            </p>
          </div>
        </div>
      </section>
      
      {/* Our Mission Section - Company values and goals */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-700 mb-6">
                At M&M Consultations, our mission is to empower Indian students pursuing higher education in Germany, particularly in Berlin, by creating a holistic support ecosystem.
              </p>
              <p className="text-lg text-gray-700 mb-6">
                We strive to simplify the journey from pre-departure planning to post-arrival integration, ensuring academic success, cultural adaptation, and personal growth.
              </p>
              <p className="text-lg text-gray-700">
                Through tailored services, strategic partnerships, and a commitment to affordability, we aim to make studying abroad a seamless and enriching experience.
              </p>
            </div>
            {/* Mission Image - Indian students in Berlin */}
            <div className="rounded-lg overflow-hidden shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1171&auto=format&fit=crop" 
                alt="Indian Students in Berlin" 
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Why Choose Us Section - 3 key benefits with icons */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Choose M&M Consultations?</h2>
            <p className="text-lg text-gray-700">
              Studying abroad can be daunting, but M&M Consultations makes it manageable and rewarding. We go beyond traditional agency services by offering a comprehensive suite of tools and support.
            </p>
          </div>
          
          {/* Benefit Cards Grid - 3 columns on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Benefit 1: Pre-Departure Guidance */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="bg-blue-50 p-3 inline-block rounded-full mb-4">
                <Info className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Pre-Departure Guidance</h3>
              <p className="text-gray-700">
                From video series and personalized consultations to starter kits with Berlin maps and O2 SIM cards, we prepare you for success before you leave India.
              </p>
            </div>
            
            {/* Benefit 2: Cultural Integration */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="bg-blue-50 p-3 inline-block rounded-full mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Cultural Integration</h3>
              <p className="text-gray-700">
                We host monthly events including Diwali, Holi, and Bollywood nights, fostering a sense of community and cultural connection for Indian students in Berlin.
              </p>
            </div>
            
            {/* Benefit 3: Practical Support */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="bg-blue-50 p-3 inline-block rounded-full mb-4">
                <Star className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Practical Support</h3>
              <p className="text-gray-700">
                Our orientation bootcamps cover essential skills like transport navigation, Anmeldung assistance, and grocery shopping, ensuring a smooth transition to German life.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* What Sets Us Apart Section - Unique differentiators */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">What Sets Us Apart</h2>
            <p className="text-lg text-gray-700">
              M&M Consultations distinguishes itself through a professional, student-focused, and culturally attuned approach, setting a new standard in international education support.
            </p>
          </div>
          
          {/* Differentiator Cards - Full-width stacked */}
          <div className="space-y-8">
            {/* Differentiator 1: Affordable Packages */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Affordable and Customizable Packages</h3>
              <p className="text-gray-700">
                Starting at ₹25,000, our service packages include a 50% fee reduction on pre-arrival services, ensuring accessibility without compromising quality. Students can tailor their support to match their specific needs and budgets.
              </p>
            </div>
            
            {/* Differentiator 2: Cultural Events */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Regular Cultural and Social Events</h3>
              <p className="text-gray-700">
                We host monthly events, including Diwali, Holi, and Bollywood nights, fostering a sense of community and cultural connection. These gatherings, capped at 30 students for an intimate experience, are promoted via Instagram and WhatsApp, ensuring easy access and engagement.
              </p>
            </div>
            
            {/* Differentiator 3: Networking */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Networking Opportunities</h3>
              <p className="text-gray-700">
                We facilitate connections with Berlin's Indian Student Association and other professional networks, providing access to mentorship, career workshops, and industry meet-ups. These opportunities empower students to build meaningful relationships and enhance their career prospects.
              </p>
            </div>
            
            {/* Differentiator 4: Comprehensive Onboarding */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Comprehensive Onboarding and Support</h3>
              <p className="text-gray-700">
                From airport pickups using cost-effective public transport to a 10-day post-arrival support program with daily check-ins, our Berlin-based Indian advisors and student ambassadors offer hands-on guidance. Our orientation bootcamps cover essential skills like transport navigation and grocery shopping, ensuring a smooth transition.
              </p>
            </div>
            
            {/* Differentiator 5: Culturally Relevant Resources */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Culturally Relevant Resources</h3>
              <p className="text-gray-700">
                Our Indian Welcome Package, featuring spices, basmati rice, lentils, and a recipe booklet, helps students feel at home. Combined with our 10-part Berlin Relocation Blueprint video series (available with Hindi subtitles), we provide practical, relatable tools for adaptation.
              </p>
            </div>
          </div>
          
          {/* View Packages CTA */}
          <div className="mt-10 text-center">
            <button className="btn btn-primary text-neutral-content" >
              <Link href="/packages">View Our Packages</Link>
            </button>
          </div>
        </div>
      </section>
      
      {/* Team Section - Founders and leadership */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Team</h2>
            <p className="text-lg text-gray-700">
              Meet the dedicated professionals who understand the Indian student experience firsthand.
            </p>
          </div>
          
          {/* Team Grid - 2 columns for founders */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {/* Founder 1: Mayur Bafna */}
            <div className="text-center">
              <div className="mb-4 overflow-hidden rounded-full w-48 h-48 mx-auto">
                <img 
                  src="/Founder.jpg" 
                  alt="Mruddual Sojitra" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Mayur Bafna</h3>
              <p className="text-primary">Founder & CEO</p>
            </div>
            
            {/* Co-Founder: Mruddual Sojitra */}
            <div className="text-center">
              <div className="mb-4 overflow-hidden rounded-full w-48 h-48 mx-auto">
                <img 
                  src="/CoFounder.jpeg" 
                  alt="Mayur Bafna" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Mruddual Sojitra</h3>
              <p className="text-primary">Co-Founder & Operations Manager</p>
            </div>
            
          </div>
        </div>
      </section>
      
      {/* Final CTA Section - Contact and explore packages */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to Start Your German Journey?</h2>
          <p className="text-lg text-gray-700 mb-8">
            Contact Mayur Bafna at +91 9545099997 for an introductory call to select packages tailored to your needs.
          </p>
          {/* Dual CTA Buttons - Explore packages or contact */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn btn-primary text-neutral-content" >
              <Link href="/packages">Explore Packages</Link>
            </button>
            <button className="btn text-primary shadow-xs" >
              <Link href="/contact">Contact Us</Link>
            </button>
          </div>
        </div>
      </section>
        </div>
    )
}

export default About;