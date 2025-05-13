import Link from "next/link";

const Hero = () => {
  // Remove the TypeScript type annotation
  return (
    <div className="bg-gradient-to-r from-blue-50 to-blue-100">
    <div className="max-w-7xl mx-auto px-4">
    <section className="relative py-20 md:py-32 overflow-hidden max-w-7xl mx-auto px-4">
      {/* Map background */}

      <div className="relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
            From <span className="text-[#FF9933]">India</span> to <span className="text-primary">Germany</span> With Confidence
            </h1>
            <p className="text-lg text-gray-900 mb-8">
            Comprehensive support services for Indian students pursuing higher education in Germany. 
            We simplify your international journey with culturally relevant guidance every step of the way.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/packages" className="btn btn-primary">
                View Packages
              </Link>
              <Link href="/contact" className="btn btn-primary">
                Contact Us
              </Link>
            </div>
          </div>

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
