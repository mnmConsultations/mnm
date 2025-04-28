import Link from "next/link";
import {
  HomeIcon,
  BuildingIcon,
  FileText,
  Plane,
  CreditCard,
  Phone,
} from "lucide-react";

const services = [
  {
    id: 1,
    title: "Accommodation Support",
    description:
      "Find the perfect place to stay with our curated housing options.",
    icon: <BuildingIcon className="h-10 w-10 text-primary" />,
    link: "/services#accommodation",
  },
  {
    id: 2,
    title: "Anmeldung Assistance",
    description: "Navigate the German registration process with ease.",
    icon: <FileText className="h-10 w-10 text-primary" />,
    link: "/services#anmeldung",
  },
  {
    id: 3,
    title: "Airport Pickup",
    description:
      "Start your journey with a warm welcome and hassle-free transfer.",
    icon: <Plane className="h-10 w-10 text-primary" />,
    link: "/services#airport",
  },
  {
    id: 4,
    title: "Bank Account Setup",
    description: "Get financial guidance and assistance with account creation.",
    icon: <CreditCard className="h-10 w-10 text-primary" />,
    link: "/services#banking",
  },
  {
    id: 5,
    title: "SIM Card & Connectivity",
    description: "Stay connected with the right mobile and internet solutions.",
    icon: <Phone className="h-10 w-10 text-primary" />,
    link: "/services#sim",
  },
  {
    id: 6,
    title: "Local Orientation",
    description:
      "Learn to navigate your new surroundings with our local guides.",
    icon: <HomeIcon className="h-10 w-10 text-primary" />,
    link: "/services#orientation",
  },
];

const ServicesHighlight = () => {
  return (
    <section className=" bg-white">
      <div className=" px-4 py-12 md:px-52 md:py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Our Services
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            We provide comprehensive solutions to make your relocation to
            Germany smooth and stress-free. Our expert team offers personalized
            assistance for all your needs.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-8 md:p-2">
          {services.map((service) => (
            <Link
              href={service.link}
              key={service.id}
              className="card shadow-lg md:shadow-xs p-2 md:p-0 flex flex-col items-center text-center group"
            >
              <div className="mb-4 p-3 rounded-full bg-blue-50 group-hover:bg-blue-100 transition-colors">
                {service.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800 group-hover:text-primary transition-colors">
                {service.title}
              </h3>
              <p className="text-gray-600">{service.description}</p>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="btn btn-link">
            <Link href="/services">View All Services</Link>
          </button>
        </div>
      </div>
    </section>
  );
};

export default ServicesHighlight;
