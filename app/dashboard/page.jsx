/**
 * Dashboard Router Page
 * /dashboard
 * 
 * Smart router that redirects to appropriate dashboard based on user role
 * Acts as entry point for dashboard access
 * 
 * Features:
 * - Auto-detects user role (admin/user)
 * - Redirects to role-specific dashboard
 * - Handles unauthenticated access
 * - Shows loading states during auth check
 * - Error handling with fallback UI
 * 
 * Redirect Logic:
 * - No user → /auth/signin
 * - Admin user → /dashboard/admin
 * - Regular user → /dashboard/user
 * 
 * Authentication Flow:
 * 1. useLoggedInUser hook fetches current user
 * 2. Wait for mount (hydration protection)
 * 3. Wait for auth query to complete
 * 4. Check user exists
 * 5. Redirect based on role
 * 
 * Hydration Protection:
 * - isMounted state prevents SSR/client mismatch
 * - Only routes after client-side mount complete
 * 
 * Loading States:
 * 1. Pre-mount: Shows loading spinner
 * 2. Auth check: Shows "Loading dashboard..." message
 * 3. Routing: Shows "Redirecting to your dashboard..."
 * 
 * Error State:
 * - Displays error message if auth query fails
 * - Provides "Go to Sign In" button fallback
 * 
 * Usage:
 * Users access /dashboard (generic)
 * Automatically routed to /dashboard/admin or /dashboard/user
 * Provides seamless UX without manual role checking
 */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLoggedInUser } from "@/lib/hooks/auth.hooks";

const Dashboard = () => {
  const router = useRouter();
  const { data: user, isLoading, error, status } = useLoggedInUser();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Only route after component is mounted and query is not loading
    if (isMounted && !isLoading) {
      if (!user) {
        router.push('/auth/signin');
      } else if (user.role === 'admin') {
        router.push('/dashboard/admin');
      } else {
        router.push('/dashboard/user');
      }
    }
  }, [user, isLoading, isMounted, router, error, status]);

  // Show loading state
  if (!isMounted || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error loading dashboard. Please try again.</p>
          <button 
            onClick={() => router.push('/auth/signin')}
            className="mt-4 btn btn-primary"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  // This will only show briefly while routing
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="loading loading-spinner loading-lg text-primary"></div>
        <p className="mt-4 text-gray-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
};

export default Dashboard;
