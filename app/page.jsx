/**
 * Home Page (Landing Page)
 * 
 * Main marketing page for M&M Consultations
 * Auto-redirects authenticated users to their dashboard
 * 
 * Features:
 * - Hero section with main value proposition
 * - Services highlight showcasing offerings
 * - Package overview with pricing tiers
 * - Checklist teaser for product preview
 * - Testimonials (currently commented out)
 * - Call-to-action section
 * 
 * Authentication Logic:
 * - Checks logged-in user status via useLoggedInUser hook
 * - Auto-redirects admins to /dashboard/admin
 * - Auto-redirects users to /dashboard/user
 * - Shows loading spinner during auth check
 * 
 * Hydration Protection:
 * - Uses isMounted state to prevent hydration mismatches
 * - Ensures consistent server/client rendering
 * - Waits for client-side mount before auth redirect
 * 
 * Loading States:
 * 1. Initial mount check
 * 2. Authentication verification
 * 3. Content display or redirect
 * 
 * UX Flow:
 * - Guest users: See full landing page
 * - Authenticated users: Redirect to dashboard
 * - During check: Loading spinner
 */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLoggedInUser } from "@/lib/hooks/auth.hooks";
import Hero from "../components/home/Hero";
import ServicesHighlight from "../components/home/ServicesHighlight";
import PackagesOverview from "../components/home/PackageOverview";
import ChecklistTeaser from "../components/home/ChecklistTeaser";
import Testimonials from "../components/home/Testimonials";
import CTA from "../components/home/CTA";

export default function Home() {
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
      <Hero />
      <ServicesHighlight />
      <PackagesOverview />
      <ChecklistTeaser />
      {/* <Testimonials /> */}
      <CTA />
   </div>
  );
}
