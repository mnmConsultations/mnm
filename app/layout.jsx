import { Mona_Sans as FontSans } from 'next/font/google'
import "./globals.css";

import Header from '../components/Header';
import Footer from '../components/Footer';

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata = {
  title: "M&M Consultants - Your Relocation Partner in Germany",
  description:
    "Comprehensive relocation and settling-in services for individuals moving to Germany, specializing in assistance for students and professionals.",
}

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`min-h-screen ${fontSans.variable} font-mono`}>
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
