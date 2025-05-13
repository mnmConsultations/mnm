import Link from "next/link";

const CTA = () => {
  return (
    <div className="bg-gray-900">
    <section className=" text-white py-20">
      <div className=" text-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Ready to Start Your German Journey?
        </h2>
        <p className="text-gray-300 text-lg max-w-3xl mx-auto mb-10">
          Let us help you make your transition from India to Germany smooth and stress-free.
          Our team is ready to provide culturally relevant support at every step.
        </p>
        <p className="text-gray-300 text-lg max-w-3xl mx-auto mb-10">
          Contact Mayur Bafna at +91 9545099997 for an introductory call to discuss your needs.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            className="btn btn-primary hover:bg-primary-hover"
          >
            <Link href="/packages">Explore Packages</Link>
          </button>
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
