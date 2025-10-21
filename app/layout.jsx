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
