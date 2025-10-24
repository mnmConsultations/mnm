/**
 * ServicesHighlight Component
 * Landing page services overview section
 * 
 * Features:
 * - 6 key service categories with icons
 * - Brief descriptions for each service
 * - Links to detailed service page sections
 * - Hover effects on service cards
 * - Responsive grid layout (1-2-3 columns)
 * - "View All Services" CTA button
 * 
 * Service Categories:
 * 1. Pre-Departure Support - Video series, Q&A, starter kits
 * 2. Arrival & Settlement - Airport pickups, orientation
 * 3. Documentation Assistance - Anmeldung, banking, enrollment
 * 4. Cultural Integration - Diwali, Holi, community events
 * 5. Connectivity Solutions - O2 partnership, mobile plans
 * 6. Financial Guidance - Banking, budgeting, cost-saving
 * 
 * UI Elements:
 * - Icon in rounded blue background
 * - Title and description text
 * - Hover effects: Background darkens, title changes color
 * - Grid: 1 column mobile, 2 medium, 3 large screens
 * 
 * Links:
 * - Each card links to /services#section-id
 * - Bottom CTA links to /services page
 * 
 * Icons:
 * - Lucide React icons for visual consistency
 */
import Link from "next/link";
import {
  Book, Building, FileText, Plane, CreditCard, Phone
} from "lucide-react";

/**
 * Services Array
 * 6 highlighted services with descriptions and anchor links
 */
const services = [
  {
    id: 1,
    title: 'Pre-Departure Support',
    description: 'Comprehensive preparation with video series, Q&A sessions, and starter kits.',
    icon: <Book className="h-10 w-10 text-primary" />,
    link: '/services#pre-departure'
  },
  {
    id: 2,
    title: 'Arrival & Settlement',
    description: 'Airport pickups, orientation bootcamps, and 10-day support program.',
    icon: <Plane className="h-10 w-10 text-primary" />,
    link: '/services#arrival'
  },
  {
    id: 3,
    title: 'Documentation Assistance',
    description: 'Help with Anmeldung, blocked accounts, and university enrollment.',
    icon: <FileText className="h-10 w-10 text-primary" />,
    link: '/services#documents'
  },
  {
    id: 4,
    title: 'Cultural Integration',
    description: 'Monthly events like Diwali, Holi, and community connections.',
    icon: <Building className="h-10 w-10 text-primary" />,
    link: '/services#cultural'
  },
  {
    id: 5,
    title: 'Connectivity Solutions',
    description: 'Exclusive O2 partnership with 50% off mobile plans and high data packages.',
    icon: <Phone className="h-10 w-10 text-primary" />,
    link: '/services#connectivity'
  },
  {
    id: 6,
    title: 'Financial Guidance',
    description: 'Support with banking, budgeting, and cost-saving strategies.',
    icon: <CreditCard className="h-10 w-10 text-primary" />,
    link: '/services#financial'
  }
];

/**
 * ServicesHighlight Component
 * Renders service cards grid with hover effects
 * 
 * Layout:
 * - Section with centered heading and description
 * - Responsive grid of service cards
 * - CTA button at bottom
 * 
 * Interactions:
 * - Cards are clickable links to service details
 * - Hover effects on icon background and title color
 */
const ServicesHighlight = () => {
  return (
    <section className=" bg-white py-16 px-4 md:py-24 md:px-8 lg:px-16">
      <div className=" max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Our Services
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
          We provide comprehensive solutions to make your relocation from India to Germany smooth and stress-free.
          Our culturally relevant support services are designed specifically for Indian students.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <Link
              href={service.link}
              key={service.id}
              className="card shadow-lg md:shadow-xs p-2 md:p-0 flex flex-col items-center text-center group"
            >
              {/* Service Icon with hover effect */}
              <div className="mb-4 p-3 rounded-full bg-blue-50 group-hover:bg-blue-100 transition-colors">
                {service.icon}
              </div>
              {/* Service Title with hover effect */}
              <h3 className="text-xl font-semibold mb-2 text-gray-800 group-hover:text-primary transition-colors">
                {service.title}
              </h3>
              {/* Service Description */}
              <p className="text-gray-600">{service.description}</p>
            </Link>
          ))}
        </div>

        {/* CTA Button - Link to full services page */}
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
