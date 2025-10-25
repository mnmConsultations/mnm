/**
 * Conditional Layout Component
 * 
 * Smart layout wrapper that conditionally shows Header/Footer
 * Hides navigation on dashboard pages for clean workspace
 * 
 * Features:
 * - Shows Header + Footer on public pages (landing, about, services, etc.)
 * - Hides Header + Footer on dashboard pages (/dashboard/*)
 * - Maintains full viewport height on all pages
 * 
 * Route Detection:
 * - Uses Next.js usePathname() to check current route
 * - Dashboard detection: pathname.startsWith('/dashboard')
 * - Works for both admin and user dashboards
 * 
 * Layout Structure:
 * Public pages:
 *   Header → Main content (flex-grow) → Footer
 * 
 * Dashboard pages:
 *   Main content (min-h-screen, no header/footer)
 * 
 * Styling:
 * - Flex column layout for footer at bottom
 * - min-h-screen ensures full viewport coverage
 * - flex-grow on main pushes footer to bottom
 * 
 * Usage:
 * Wrapped around all pages in app/layout.jsx
 * Automatically handles layout based on route
 */
'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';

const ConditionalLayout = ({ children }) => {
  const pathname = usePathname();
  
  // Check if the current route is a dashboard page
  const isDashboardPage = pathname?.startsWith('/dashboard');
  
  return (
    <div className="flex flex-col min-h-screen max-w[1280px]">
      {/* Only show Header and Footer on non-dashboard pages */}
      {!isDashboardPage && <Header />}
      
      <main className={isDashboardPage ? "min-h-screen" : "flex-grow"}>
        {children}
      </main>
      
      {!isDashboardPage && <Footer />}
    </div>
  );
};

export default ConditionalLayout;
