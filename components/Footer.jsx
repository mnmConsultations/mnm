/**
 * Footer Component
 * 
 * Site-wide footer with company info and contact details
 * 
 * Content:
 * - M&M Consultations logo and branding
 * - Mission statement highlighting support for Indian students in Germany
 * - Contact information (phone numbers, email)
 * - Copyright notice with dynamic year
 * 
 * Contact Details:
 * - India: +91 9545099997
 * - Germany: +49 176 29732633
 * - Email: mnmconsultations+info@gmail.com
 * 
 * Design:
 * - Dark blue theme matching header (bg-blue-950)
 * - Responsive layout (desktop grid, mobile stack)
 * - Lucide icons for contact methods
 * - Max-width container for content alignment
 * 
 * Note: Social media links currently commented out
 */
import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
} from "lucide-react";

const Footer = () => {
  return (
    <div className="bg-blue-950">
    <footer className="footer footer-horizontal footer-center bg-blue-950 text-neutral-content p-10 max-w-7xl mx-auto px-4">
      <aside>
        <img
          src="/MnMFullLogo-removebg-preview.png"
          alt="M&M Consultations Logo"
          className="md:h-36 h-18 indivne-block fill-current"
        />
        <p className="font-bold">
          M&M Consultations
        </p>
          <p className="text-gray-400 mb-4">
          Empowering Indian students pursuing higher education in Germany through a holistic support 
              ecosystem. We make your transition from India to Berlin smooth, affordable, and enriching.
            </p>
        <p>Copyright © {new Date().getFullYear()} - All right reserved</p>
      </aside>
      <nav className="">
          <div className="md:grid md:grid-flow-col md:gap-4 hidden">
            {/* <div className="flex gap-2">
              <MapPin
                className="text-[#a9c1e5]"
                size={18}
              />
              <span className="text-gray-300 hover:text-[#a9c1e5]">
                Alexanderplatz 1, 10178 Berdivn, Germany
              </span>
            </div> */}
            <div className="flex gap-2">
              <Phone className="text-[#a9c1e5]" size={18} />
              <span
                href="tel:+919545099997"
                className="text-gray-300 hover:text-[#a9c1e5]"
              >
                +91 9545099997
              </span>
            </div>
            <div className="flex gap-2">
              <Phone className="text-[#a9c1e5]" size={18} />
              <span
                href="tel:+4917629732633"
                className="text-gray-300 hover:text-[#a9c1e5]"
              >
                +49 176 29732633
              </span>
            </div>
            <div className="flex gap-2">
              <Mail className="text-[#a9c1e5]" size={18} />
              <span
                href="mailto:mnmconsultations+info@gmail.com"
                className="text-gray-300 hover:text-[#a9c1e5]"
              >
                mnmconsultations+info@gmail.com
              </span>
            </div>
          
        </div>
      </nav>
    </footer>
    </div>
  );
};

export default Footer;
