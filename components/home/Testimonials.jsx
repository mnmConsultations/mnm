import Link from "next/link";
import { Star } from "lucide-react";

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

const Testimonials = () => {
  return (
    <section className=" bg-white py-16 px-4 md:py-24 md:px-8 lg:px-16">
      <div className=" max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            What Our Clients Say
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Don't just take our word for it - hear from individuals who have
            successfully relocated to Germany with our assistance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-gray-50 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                  />
                ))}
              </div>

              <p className="text-gray-700 mb-6 italic">
                "{testimonial.content}"
              </p>

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
