/**
 * CTA (Call-to-Action) Component
 * 
 * Features:
 * - Final conversion section on homepage with dark background (gray-900)
 * - Headline encouraging users to start their Germany relocation journey
 * - Two-paragraph value proposition emphasizing smooth transition and cultural support
 * - Direct contact information (Mayur Bafna, +91 9545099997) for introductory call
 * - Dual CTA buttons: "Explore Packages" (primary) and "Contact Us" (secondary)
 * - Responsive layout with centered content and flexible button arrangement
 * - Maximum content width (max-w-3xl) for optimal readability
 * 
 * Layout Structure:
 * - Dark background wrapper (bg-gray-900)
 * - Centered content container with responsive padding
 * - Headline (text-3xl on mobile, text-4xl on desktop)
 * - Two descriptive paragraphs in gray-300
 * - Button row (vertical on mobile, horizontal on desktop)
 * 
 * Button Actions:
 * - Primary button → /packages (pricing page)
 * - Secondary button → /contact (contact form)
 * 
 * Design Pattern: Final homepage section designed to convert visitors into leads
 * Contact: Direct phone number encourages immediate personal connection
 */
import Link from "next/link";

const CTA = () => {
  return (
    /* Dark background wrapper for visual contrast with preceding sections */
    <div className="bg-gray-900">
    <section className=" text-white py-20">
      {/* Centered content container with responsive padding */}
      <div className=" text-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main headline - larger on desktop (text-4xl) than mobile (text-3xl) */}
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Ready to Start Your German Journey?
        </h2>
        
        {/* Value proposition paragraph #1: Emphasizes smooth transition and cultural relevance */}
        <p className="text-gray-300 text-lg max-w-3xl mx-auto mb-10">
          Let us help you make your transition from India to Germany smooth and stress-free.
          Our team is ready to provide culturally relevant support at every step.
        </p>
        
        {/* Value proposition paragraph #2: Direct contact information for personal connection */}
        <p className="text-gray-300 text-lg max-w-3xl mx-auto mb-10">
          Contact Mayur Bafna at +91 9545099997 for an introductory call to discuss your needs.
        </p>
        
        {/* CTA buttons: Vertical stack on mobile (flex-col), horizontal row on desktop (sm:flex-row) */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {/* Primary CTA: Navigate to packages/pricing page */}
          <button
            className="btn btn-primary hover:bg-primary-hover"
          >
            <Link href="/packages">Explore Packages</Link>
          </button>
          
          {/* Secondary CTA: Navigate to contact form */}
          <button className="btn hover:bg-gray-100">
            <Link href="/contact">Contact Us</Link>
          </button>
        </div>
      </div>
    </section>
    </div>
  );
};

export default CTA;
