import Link from "next/link";

const CTA = () => {
  return (
    <section className="bg-gray-900 text-white py-20">
      <div className=" text-center md:px-54 md:py-8 px-6 py-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Ready to Start Your German Journey?
        </h2>
        <p className="text-gray-300 text-lg max-w-3xl mx-auto mb-10">
          Let us help you make your relocation to Germany smooth and
          stress-free. Our expert team is ready to assist you every step of the
          way.
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
  );
};

export default CTA;
