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
