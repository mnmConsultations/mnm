import Link from "next/link";

const Hero = () => {
  // Remove the TypeScript type annotation
  return (
    <section className="relative bg-gradient-to-r from-white to-blue-200 p-9 md:p-52 overflow-hidden">
      {/* Map background */}

      <div className="relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Your Smooth Transition to{" "}
              <span className="text-primary">Germany</span>
            </h1>
            <p className="text-lg text-gray-900 mb-8">
              Comprehensive relocation and settling-in services for individuals
              moving to Germany. We simplify your international move with
              personalized support every step of the way.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/packages" className="btn btn-primary">
                View Packages
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
  );
};

export default Hero;
