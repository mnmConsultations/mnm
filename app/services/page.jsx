import {
  FileText,
  Building,
  Plane,
  CreditCard,
  Phone,
  MapPin,
  Book,
  Calendar,
  Award,
  Clock,
} from "lucide-react";
import Link from "next/link";

const services = [
  {
    id: "accommodation",
    title: "Accommodation Support",
    description:
      "Finding the right place to live is crucial for your experience in Germany. We provide personalized accommodation search based on your preferences, budget, and location needs. Our team conducts virtual tours, helps with rental applications, and reviews contracts to ensure you find a suitable and safe living arrangement.",
    icon: <Building className="h-12 w-12 text-primary" />,
    features: [
      "Personalized accommodation search",
      "Virtual property tours",
      "Rental application assistance",
      "Contract review and explanation",
      "Move-in support and documentation",
    ],
    src: "/accomodation-help.png",
  },
  {
    id: "anmeldung",
    title: "Anmeldung Assistance",
    description:
      "The address registration (Anmeldung) is a mandatory procedure in Germany. Our service helps you navigate this process smoothly by preparing all necessary documentation, scheduling appointments, and providing translation support during your visit to the registration office.",
    icon: <FileText className="h-12 w-12 text-primary" />,
    features: [
      "Document preparation and verification",
      "Appointment booking service",
      "Translation assistance",
      "In-person support (optional)",
      "Follow-up document management",
    ],
    src: "/Anmeldung-Assistance.jpg"
  },
  {
    id: "airport",
    title: "Airport Pickup",
    description:
      "Start your new life in Germany stress-free with our reliable airport pickup service. Our friendly team will greet you at the airport, help with your luggage, and provide a comfortable transfer to your accommodation. During the journey, we'll share useful local information and answer any immediate questions you might have.",
    icon: <Plane className="h-12 w-12 text-primary" />,
    features: [
      "Meet and greet at arrival gate",
      "Luggage assistance",
      "Comfortable private transfer",
      "Local orientation during journey",
      "24/7 service availability",
    ],
    src: "/airport-pickup.png",
  },
  {
    id: "banking",
    title: "Bank Account Setup",
    description:
      "Opening a bank account is an essential step for your financial stability in Germany. We guide you through the options available, assist with application forms, schedule appointments, and provide translation support during bank visits to ensure you select the right banking service for your needs.",
    icon: <CreditCard className="h-12 w-12 text-primary" />,
    features: [
      "Bank comparison and recommendation",
      "Application preparation",
      "Appointment scheduling",
      "Translation assistance",
      "Online banking setup support",
    ],
    src: "/bank_account-setup.jpg",
  },
  {
    id: "sim",
    title: "SIM Card & Connectivity",
    description:
      "Stay connected from day one with our SIM card and internet setup assistance. We help you choose the most suitable mobile plan based on your usage requirements, assist with activation, and guide you through the process of setting up home internet if needed.",
    icon: <Phone className="h-12 w-12 text-primary" />,
    features: [
      "Mobile plan comparison",
      "SIM card procurement and activation",
      "Phone setup assistance",
      "Home internet options guidance",
      "Troubleshooting support",
    ],
    src: "/sim-card-connectivity.jpg",
  },
  {
    id: "orientation",
    title: "Local Orientation",
    description:
      "Get familiar with your new surroundings through our personalized orientation tours. We show you essential locations in your neighborhood, help you understand the public transportation system, and introduce you to local amenities, making you feel at home in your new environment.",
    icon: <MapPin className="h-12 w-12 text-primary" />,
    features: [
      "Guided neighborhood tour",
      "Public transportation tutorial",
      "Essential amenities introduction",
      "Cultural tips and local insights",
      "Customized recommendations",
    ],
    src: "/local-orientation.png",
  },
  {
    id: "resources",
    title: "Welcome Resources",
    description:
      "Our comprehensive welcome resources provide you with essential information about living in Germany. From cultural norms to practical tips, these curated materials help you navigate everyday situations and understand German customs better.",
    icon: <Book className="h-12 w-12 text-primary" />,
    features: [
      "Digital welcome guide",
      "Cultural integration tips",
      "Local recommendation list",
      "Emergency contact information",
      "Seasonal event calendar",
    ],
    src: "/welcome-resource.jpeg",
  },
  {
    id: "events",
    title: "Events & Networking",
    description:
      "Connect with fellow newcomers and locals through our regular events and networking opportunities. These gatherings help you build your social circle, practice language skills, and integrate into the community more effectively.",
    icon: <Calendar className="h-12 w-12 text-primary" />,
    features: [
      "Regular social gatherings",
      "Cultural exchange events",
      "Professional networking opportunities",
      "Language practice meetups",
      "Community integration activities",
    ],
    src: "/Event-connecting.png",
  },
  {
    id: "specialized",
    title: "Specialized Services",
    description:
      "For specific needs beyond our standard offerings, we provide specialized services tailored to your unique situation. Whether it's educational guidance, professional certification assistance, or family-related support, our team can develop customized solutions.",
    icon: <Award className="h-12 w-12 text-primary" />,
    features: [
      "Educational institution guidance",
      "Professional certification assistance",
      "Healthcare system navigation",
      "Family support services",
      "Legal consultation referrals",
    ],
    src: "/Specialised-service (1).jpeg",
  },
  {
    id: "ongoing",
    title: "Ongoing Support",
    description:
      "Our commitment doesn't end after initial services. With our ongoing support packages, you can access continued assistance as you settle into your new life. This flexible support system ensures you always have someone to turn to when challenges arise.",
    icon: <Clock className="h-12 w-12 text-primary" />,
    features: [
      "Virtual consultation sessions",
      "Priority response system",
      "Problem resolution assistance",
      "Regular check-ins",
      "Extended support periods available",
    ],
    src: "/ongoing.jpeg",
  },
];

const Services = () => {
  return (
    <div>
      <section className="bg-gradient-to-r from-blue-50 to-blue-100 py-16 px-6 md:py-24">
        <div className="">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Our Services
            </h1>
            <p className="text-lg text-gray-700 mb-8">
              Comprehensive relocation and settling-in services designed to make
              your transition to Germany smooth and stress-free. From
              accommodation support to local orientation, we've got you covered
              every step of the way.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="">
          <div className="grid grid-cols-1 gap-16 p-8 md:py-24 md:px-52 px-6">
            {services.map((service, index) => (
              <div
                key={service.id}
                id={service.id}
                className={`scroll-mt-24 ${index % 2 === 0 ? "" : "bg-base-300 md:bg-gray-200 -mx-4 px-4 py-12 rounded-lg"}`}
              >
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className={`${index % 2 === 0 ? "order-1" : "order-2"}`}>
                    <div className="inline-block p-3 bg-blue-50 rounded-full mb-6">
                      {service.icon}
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                      {service.title}
                    </h2>
                    <p className="text-gray-700 mb-6">{service.description}</p>
                    <ul className="space-y-3 mb-8">
                      {service.features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                          <div className="bg-primary/10 p-1 rounded-full mr-3 flex-shrink-0 mt-1">
                            <svg
                              className="h-3 w-3 text-primary"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className={`${index % 2 === 0 ? "order-2" : "order-1"}`}>
                    <img
                      src={`${service.src}`}
                      alt={service.title}
                      className="rounded-lg shadow-md w-full h-auto max-h-240 md:max-h-[460px] object-cover"
                    />
                  </div>
                </div>
              </div>
              
            ))}
          </div>

          <div className="text-center p-8 md:py-24 md:px-52 px-4">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-gray-700 mb-8">
              Explore our pre-designed packages or create a custom solution
              based on your specific needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-primary">
                <Link href="/packages">View Packages</Link>
              </button>
              <button className="btn-outline">
                <Link href="/contact">Contact Us</Link>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;
