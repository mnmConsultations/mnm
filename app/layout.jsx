import { Open_Sans  } from 'next/font/google'
import "./globals.css";

import Header from '../components/Header';
import Footer from '../components/Footer';

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
        <div className="flex flex-col min-h-screen max-w[1280px]">
          <Header />
          <main className="flex-grow">
        {children}
      </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
