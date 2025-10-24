/**
 * Testimonials Component
 * Landing page testimonials section
 * 
 * Features:
 * - 3 client testimonials with ratings
 * - Star ratings (1-5 stars)
 * - Client photos and credentials
 * - Hover effects on testimonial cards
 * - Responsive grid layout (1-3 columns)
 * 
 * Testimonial Cards:
 * - Star rating display (filled/unfilled)
 * - Quote text in italics
 * - Client photo (circular)
 * - Client name and role
 * - Shadow and hover effects
 * 
 * Clients Featured:
 * 1. Priya Sharma - TU Berlin student (5 stars)
 * 2. Ahmed Hassan - Humboldt PhD candidate (5 stars)
 * 3. Maria Rodriguez - Software Engineer (4 stars)
 * 
 * Layout:
 * - Section with centered heading
 * - 3-column grid on desktop, 1 column mobile
 * - Gray background cards with shadows
 * - Hover effect increases shadow
 * 
 * Icons:
 * - Star (lucide-react) for ratings
 * - Filled stars for rating value
 * - Gray stars for remaining
 * 
 * Future Enhancement:
 * - "Read More Testimonials" button (commented out)
 * - Link to /testimonials page
 */
import Link from "next/link";
import { Star } from "lucide-react";

/**
 * Testimonials Array
 * 3 client reviews with ratings and credentials
 * Uses randomuser.me for placeholder profile images
 */
const testimonials = [
  {
    id: 1,
    content:
      "M&M Consultants made my move to Berlin so much easier than I expected. Their Anmeldung assistance saved me hours of confusion and their accommodation support helped me find the perfect place.",
    author: "Priya Sharma",
    role: "Student, Technical University of Berlin",
    rating: 5,
    image: "https://randomuser.me/api/portraits/women/45.jpg",
  },
  {
    id: 2,
    content:
      "As an international student, I was overwhelmed with the thought of relocating to a new country. The team guided me through every step, from airport pickup to setting up my bank account.",
    author: "Ahmed Hassan",
    role: "PhD Candidate, Humboldt University",
    rating: 5,
    image: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: 3,
    content:
      "The interactive checklist was a game-changer for my relocation planning. It helped me stay organized and their support team was always available when I had questions.",
    author: "Maria Rodriguez",
    role: "Software Engineer",
    rating: 4,
    image: "https://randomuser.me/api/portraits/women/68.jpg",
  },
];

/**
 * Testimonials Component
 * Renders testimonial cards with ratings and client info
 * 
 * Card Structure:
 * - Star rating at top
 * - Quote text in middle
 * - Client photo and info at bottom
 * 
 * Rating Display:
 * - Creates array of 5 stars
 * - Fills stars up to rating value
 * - Remaining stars are gray/unfilled
 */
const Testimonials = () => {
  return (
    <section className=" bg-white py-16 px-4 md:py-24 md:px-8 lg:px-16">
      <div className=" max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            What Our Clients Say
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Don't just take our word for it - hear from individuals who have
            successfully relocated to Germany with our assistance.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-gray-50 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Star Rating Display */}
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                  />
                ))}
              </div>

              {/* Testimonial Quote */}
              <p className="text-gray-700 mb-6 italic">
                "{testimonial.content}"
              </p>

              {/* Client Info - Photo and credentials */}
              <div className="flex items-center">
                <img
                  src={testimonial.image}
                  alt={testimonial.author}
                  className="h-12 w-12 rounded-full mr-4 object-cover"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {testimonial.author}
                  </h4>
                  <p className="text-gray-600 text-sm">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* More Testimonials Button - Commented out for future use */}
        {/* <div className="text-center mt-12">
          <button className="btn btn-outline">
            <Link href="/testimonials">Read More Testimonials</Link>
          </button>
        </div> */}
      </div>
    </section>
  );
};

export default Testimonials;
