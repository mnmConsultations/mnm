import { Open_Sans  } from 'next/font/google'
import "./globals.css";

import ConditionalLayout from '../components/ConditionalLayout';
import QueryProvider from '../lib/providers/QueryProvider';

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
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </QueryProvider>
      </body>
    </html>
  );
}
