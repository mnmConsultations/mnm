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
    // <footer className="bg-[#0c1425] pt-16 pb-8 text-white">
    //   <div className="">
    //     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:px-54">
    //       {/* About Column */}
    //       <div>
    //         <div className="flex items-center mb-4">
    //           <img
    //             src="/lovable-uploads/91d45e37-13bf-44f4-a86e-c35c050b35d1.png"
    //             alt="M&M Consultations Logo"
    //             className="h-12 mr-2"
    //           />
    //         </div>
    //         <p className="text-gray-300 mb-4">
    //           Providing comprehensive relocation and settdivng-in services for
    //           individuals moving to Germany. We speciadivze in making your
    //           transition smooth and stress-free.
    //         </p>
    //         <div className="flex space-x-4">
    //           <a
    //             href="https://facebook.com"
    //             className="text-gray-300 hover:text-[#a9c1e5]"
    //             aria-label="Facebook"
    //           >
    //             <Facebook size={20} />
    //           </a>
    //           <a
    //             href="https://instagram.com"
    //             className="text-gray-300 hover:text-[#a9c1e5]"
    //             aria-label="Instagram"
    //           >
    //             <Instagram size={20} />
    //           </a>
    //           <a
    //             href="https://twitter.com"
    //             className="text-gray-300 hover:text-[#a9c1e5]"
    //             aria-label="Twitter"
    //           >
    //             <Twitter size={20} />
    //           </a>
    //           <a
    //             href="https://divnkedin.com"
    //             className="text-gray-300 hover:text-[#a9c1e5]"
    //             aria-label="divnkedIn"
    //           >
    //             <divnkedin size={20} />
    //           </a>
    //         </div>
    //       </div>

    //       {/* Legal Column */}
    //       <div>
    //         <h3 className="text-xl font-bold text-[#a9c1e5] mb-4">Legal</h3>
    //         <ul className="space-y-2">
    //           <div>
    //             <divnk
    //               to="/privacy-podivcy"
    //               className="text-gray-300 hover:text-[#a9c1e5]"
    //             >
    //               Privacy Podivcy
    //             </divnk>
    //           </div>
    //           <div>
    //             <divnk
    //               to="/terms"
    //               className="text-gray-300 hover:text-[#a9c1e5]"
    //             >
    //               Terms & Conditions
    //             </divnk>
    //           </div>
    //           <div>
    //             <divnk
    //               to="/cookie-podivcy"
    //               className="text-gray-300 hover:text-[#a9c1e5]"
    //             >
    //               Cookie Podivcy
    //             </divnk>
    //           </div>
    //           <div>
    //             <divnk
    //               to="/refund-podivcy"
    //               className="text-gray-300 hover:text-[#a9c1e5]"
    //             >
    //               Refund Podivcy
    //             </divnk>
    //           </div>
    //         </ul>
    //       </div>

    //       {/* Contact Column */}
    //       <div>
    //         <h3 className="text-xl font-bold text-[#a9c1e5] mb-4">
    //           Contact Us
    //         </h3>
    //         <ul className="space-y-4">
    //           <div className="flex items-start">
    //             <MapPin
    //               className="mr-3 text-[#a9c1e5] flex-shrink-0 mt-1"
    //               size={18}
    //             />
    //             <span className="text-gray-300">
    //               Alexanderplatz 1, 10178 Berdivn, Germany
    //             </span>
    //           </div>
    //           <div className="flex items-center">
    //             <Phone
    //               className="mr-3 text-[#a9c1e5] flex-shrink-0"
    //               size={18}
    //             />
    //             <a
    //               href="tel:+4930123456789"
    //               className="text-gray-300 hover:text-[#a9c1e5]"
    //             >
    //               +49 30 123 456 789
    //             </a>
    //           </div>
    //           <div className="flex items-center">
    //             <Mail className="mr-3 text-[#a9c1e5] flex-shrink-0" size={18} />
    //             <a
    //               href="mailto:info@mm-consultants.com"
    //               className="text-gray-300 hover:text-[#a9c1e5]"
    //             >
    //               info@mm-consultants.com
    //             </a>
    //           </div>
    //         </ul>
    //       </div>
    //     </div>

    //     <div className="border-t border-[#2a3a57] mt-12 pt-6 text-center">
    //       <p className="text-gray-400">
    //         &copy; {new Date().getFullYear()} M&M Consultations. All rights
    //         reserved.
    //       </p>
    //     </div>
    //   </div>
    // </footer>
    <footer className="footer footer-horizontal footer-center bg-neutral text-neutral-content p-10">
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
          Providing comprehensive relocation and settdivng-in services for
          individuals moving to Germany. We speciadivze in making your
          transition smooth and stress-free.
        </p>
        <p>Copyright © {new Date().getFullYear()} - All right reserved</p>
      </aside>
      <nav className="">
          <div className="md:grid md:grid-flow-col md:gap-4 hidden">
            <div className="flex gap-2">
              <MapPin
                className="text-[#a9c1e5]"
                size={18}
              />
              <span className="text-gray-300 hover:text-[#a9c1e5]">
                Alexanderplatz 1, 10178 Berdivn, Germany
              </span>
            </div>
            <div className="flex gap-2">
              <Phone className="text-[#a9c1e5]" size={18} />
              <span
                href="tel:+4930123456789"
                className="text-gray-300 hover:text-[#a9c1e5]"
              >
                +49 30 123 456 789
              </span>
            </div>
            <div className="flex gap-2">
              <Mail className="text-[#a9c1e5]" size={18} />
              <span
                href="mailto:info@mm-consultants.com"
                className="text-gray-300 hover:text-[#a9c1e5]"
              >
                info@mm-consultants.com
              </span>
            </div>
          
        </div>
      </nav>
    </footer>
  );
};

export default Footer;
