/**
 * Root Layout Component
 * 
 * Top-level application layout with global providers
 * Wraps all pages with essential context providers
 * 
 * Features:
 * - Global font configuration (Open Sans)
 * - React Query provider for data fetching
 * - Toast notification system
 * - Confirm dialog system
 * - Conditional header/footer rendering
 * 
 * Font Setup:
 * - Open Sans from Google Fonts
 * - Latin subset
 * - CSS variable: --font-open-sans
 * 
 * Provider Hierarchy (outer to inner):
 * 1. QueryProvider - React Query for API state management
 * 2. ToastProvider - Global toast notifications
 * 3. ConfirmDialogProvider - Confirmation dialogs
 * 4. ConditionalLayout - Header/Footer based on route
 * 5. Page Content (children)
 * 
 * Metadata:
 * - Title: "M&M Consultants - Your Relocation Partner in Germany"
 * - Description: SEO-optimized description for relocation services
 * 
 * Hydration Protection:
 * - suppressHydrationWarning on html tag
 * - Prevents console warnings from theme switching or dynamic content
 * 
 * Global Styles:
 * - globals.css imported
 * - min-h-screen on body for full viewport height
 * - Font variable applied to html tag
 */
import { Open_Sans  } from 'next/font/google'
import "./globals.css";

import ConditionalLayout from '../components/ConditionalLayout';
import QueryProvider from '../lib/providers/QueryProvider';
import { ToastProvider } from '../components/Toast';
import { ConfirmDialogProvider } from '../components/ConfirmDialog';

const openSans = Open_Sans({
  subsets: ['latin'], // Specify the character subsets you need
  variable: '--font-open-sans', // Define a CSS variable for easier use
});

export const metadata = {
  title: "M&M Consultants - Your Relocation Partner in Germany",
  description:
    "Comprehensive relocation and settling-in services for individuals moving to Germany, specializing in assistance for students and professionals.",
}

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en" suppressHydrationWarning className={openSans.variable}>
      <body className={`min-h-screen`}>
        <QueryProvider>
          <ToastProvider>
            <ConfirmDialogProvider>
              <ConditionalLayout>
                {children}
              </ConditionalLayout>
            </ConfirmDialogProvider>
          </ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
