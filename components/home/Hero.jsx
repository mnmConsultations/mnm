/**
 * Hero Component
 * Landing page hero section with call-to-action
 * 
 * Features:
 * - Eye-catching headline with India-Germany theme
 * - Value proposition text
 * - Dual CTA buttons (View Packages, Contact Us)
 * - Visual imagery of Berlin skyline
 * - Gradient background (blue-50 to blue-100)
 * - Responsive 2-column layout (1 column on mobile)
 * 
 * UI Elements:
 * - Grid layout: 1 column mobile, 2 columns desktop
 * - Left: Text content with CTAs
 * - Right: Berlin image with shadow and rounded corners
 * - Color accents: Orange (#FF9933) for India, Primary for Germany
 * 
 * CTAs:
 * - Primary: View Packages (/packages)
 * - Secondary: Contact Us (/contact)
 * 
 * Animations:
 * - Fade-in animation on text and image
 */
import Link from "next/link";

const Hero = () => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-blue-100">
    <div className="max-w-7xl mx-auto px-4">
    <section className="relative py-20 md:py-32 overflow-hidden max-w-7xl mx-auto px-4">
      {/* Map background - Placeholder for future feature */}

      <div className="relative z-10">
        {/* Hero Grid - Text on left, image on right */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Hero Content - Headline, description, CTAs */}
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
            From <span className="text-[#FF9933]">India</span> to <span className="text-primary">Germany</span> With Confidence
            </h1>
            <p className="text-lg text-gray-900 mb-8">
            Comprehensive support services for Indian students pursuing higher education in Germany. 
            We simplify your international journey with culturally relevant guidance every step of the way.
            </p>
            {/* CTA Buttons - Packages and Contact */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/packages" className="btn btn-primary">
                View Packages
              </Link>
              <Link href="/contact" className="btn btn-primary">
                Contact Us
              </Link>
            </div>
          </div>

          {/* Hero Image - Berlin skyline */}
          <div className="rounded-lg overflow-hidden shadow-xl animate-fade-in">
            <img
              src="https://images.unsplash.com/photo-1560969184-10fe8719e047?q=80&w=1170&auto=format&fit=crop"
              alt="Berlin skyline with TV tower"
              className="w-full h-auto object-cover rounded-lg"
            />
          </div>
        </div>
      </div>
    </section>
    </div></div>
  );
};

export default Hero;
