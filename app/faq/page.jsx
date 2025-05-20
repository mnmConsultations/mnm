import Link from "next/link";
import { HelpCircle } from "lucide-react";

const faqs = [
    {
      id: "1",
      question: "What is M&M Consultations, and how does it support Indian students in Germany?",
      answer: "M&M Consultations, founded by Mruddual Sojitra, empowers Indian students pursuing higher education in Germany, particularly Berlin. We offer a holistic support system, including pre-departure tools (e.g., video series, Q&A sessions, starter kits) and post-arrival services (e.g., airport pickups, orientation bootcamps, cultural events) to ensure academic success, cultural integration, and a smooth transition."
    },
    {
      id: "2",
      question: "What services are included in the Essential Package?",
      answer: "The Essential Package (₹25,000/student) includes: Online Q&A Session (1-hour group Zoom), WhatsApp Support Group (6 months pre-arrival), Berlin Relocation Blueprint (10-part video series), Pre-Departure Starter Kit (Berlin map, O2 SIM card, phrasebook), Event Coordination & Group Integration (1 cultural event + 1 group introduction), and Orientation Bootcamp (2-day program for city registration, transport). Add-ons like airport pickups or Indian Welcome Packages are available for additional fees."
    },
    {
      id: "3",
      question: "How does M&M Consultations ensure affordability?",
      answer: "We provide a 50% fee reduction on pre-arrival services (e.g., Online Q&A at ₹1,500, Berlin Relocation Blueprint at ₹1,000). The Essential Package is priced at ₹25,000, and we promote cost-saving measures like public transport training (₹5-₹10 tickets vs. ₹50-₹70 taxis). Our O2 partnership offers 50% off mobile plans (100-300 GB data)."
    },
    {
      id: "4",
      question: "What is the airport pickup service, and how does it work?",
      answer: "For ₹4,000, our airport pickup service guides students from Berlin Brandenburg Airport (BER) using public transport (e.g., FEX train, S-Bahn). A Berlin-based Indian advisor or student ambassador assists within 48 hours of arrival, teaching ticket purchasing and BVG app usage, with a 1-hour orientation en route."
    },
    {
      id: "5",
      question: "What cultural events does M&M Consultations organize?",
      answer: "We host monthly events (₹2,500/event) like Holi, Diwali, and Bollywood nights, capped at 30 students for intimacy. These include Indian food and integration into groups like the Indian Student Association Berlin, promoted via Instagram and WhatsApp."
    },
    {
      id: "6",
      question: "How does the WhatsApp Support Group function?",
      answer: "Included in the Essential Package or ₹1,500 individually, our WhatsApp Support Group offers 6 months of pre-arrival guidance on accommodation, finances, and emergencies. Moderated by our team, it guarantees responses within 12 hours, 24/7, with weekly tips and pinned FAQs."
    },
    {
      id: "7",
      question: "What is the Indian Welcome Package?",
      answer: "For ₹6,000, the Indian Welcome Package includes Indian spices (turmeric, cumin), basmati rice, lentils, a recipe booklet, and a map of Berlin's Indian stores. It's delivered within 1 week of arrival via local Indian suppliers."
    },
    {
      id: "8",
      question: "Can I customize my service package?",
      answer: "Yes, you can start with the Essential Package and add services like the Buddy Program (₹7,500), Safety & Emergency Workshop (₹2,000), or individual offerings like a 1-1 Pre-Departure Discussion (₹2,000). Contact us to create a personalized plan."
    },
    {
      id: "9",
      question: "How does M&M support networking and career growth?",
      answer: "We connect students with the Indian Student Association Berlin and professional networks for mentorship, career workshops, and industry meet-ups. Monthly guided explorations (e.g., Brandenburg Gate, Mauerpark karaoke) and cultural events foster informal networking."
    },
    {
      id: "10",
      question: "How do I start with M&M Consultations?",
      answer: "Contact Mayur Bafna at +91 9545099997 for an introductory call within 7 days to select packages. An MoU will be signed within 14 days, with onboarding by May 2025 for a June 2025 launch."
    },
    {
      id: "11",
      question: "Why is a blocked account required for a German student visa?",
      answer: "A blocked account (Sperrkonto) proves to German authorities that you have sufficient funds (₹11,904/year or ₹992/month in 2025) to cover living expenses. It's mandatory for non-EU students applying for a student visa."
    },
    {
      id: "12",
      question: "Can M&M Consultations help with opening a blocked account?",
      answer: "While we don't directly open blocked accounts, our 1-1 Pre-Departure Discussion (₹2,000) and WhatsApp Support Group guide students through the process, recommending trusted providers like Expatrio or Fintiba."
    },
    {
      id: "13",
      question: "What is the process for opening a German bank account?",
      answer: "After arriving in Germany and completing city registration (Anmeldung), you can open a current account (Girokonto) with banks like Commerzbank or N26. Our Orientation Bootcamp (included in the Essential Package) assists with this step."
    },
    {
      id: "14",
      question: "Do I need a German bank account for daily expenses?",
      answer: "Yes, a German bank account with a DE IBAN is essential for receiving blocked account payouts, paying rent, and avoiding transaction fees. Our advisors help you set this up post-arrival."
    },
    {
      id: "15",
      question: "Is health insurance mandatory in Germany?",
      answer: "Yes, health insurance is required for all residents, including students. You need travel health insurance for your visa and public/private insurance upon arrival. Our team provides guidance during the 10-Day Post-Arrival Support (₹5,000)."
    }
  ];
  
  const moreTopics = [
    "German Bank Accounts",
    "Health Insurance",
    "University Enrollment",
    "Public Transportation",
    "City Registration (Anmeldung)",
    "Cultural Integration",
    "Student Discounts",
    "Working in Germany",
    "Finding Accommodation",
    "German Language Skills"
  ];

const Faq = () => {

    return (
        <div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-[#0c1425]">Frequently Asked Questions</h1>
            <p className="text-gray-600 text-lg">
              Find answers to common questions about studying in Germany as an Indian student
            </p>
          </div>

          <div className="mb-10 flex justify-center">
            <div className="bg-[#e5eeff] p-4 rounded-full">
              <HelpCircle size={32} className="text-[#4e6690]" />
            </div>
          </div>

          <div className="w-full mb-12 flex flex-col gap-2">
            {faqs.map((faq) => (
                <div key={faq.id} className="collapse collapse-plus bg-base-100 border border-base-300">
                    <input type="radio" name="my-accordion-3" defaultChecked={faq.id === "1"} />
                    <div className="collapse-title font-semibold">{faq.question}</div>
                    <div className="collapse-content text-sm">{faq.answer}</div>
                </div>
            ))}
          </div>

          <div className="bg-blue-50 p-6 rounded-lg mb-12">
            <h2 className="text-xl font-bold mb-4">Looking for More Information?</h2>
            <p className="text-gray-700 mb-4">
              We have answers to more than 50 questions about studying in Germany. Our comprehensive FAQ covers topics like:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
              {moreTopics.map((topic, index) => (
                <div key={index} className="flex items-center">
                  <div className="h-2 w-2 bg-primary rounded-full mr-2"></div>
                  <span>{topic}</span>
                </div>
              ))}
            </div>
            <p className="text-gray-700 mb-4">
              Contact us for answers to specific questions not covered here.
            </p>
          </div>

          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold mb-4 text-[#0c1425]">Still have questions?</h3>
            <p className="text-gray-600 mb-6">
              Contact our team for personalized assistance with your study abroad journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn btn-primary text-neutral-content">
                <Link href="/contact">Contact Us</Link>
              </button>
              <button variant="btn btn-outline">
                <Link href="/packages">View Our Packages</Link>
              </button>
            </div>
          </div>
        </div>
      </div>
        </div>
    )
}

export default Faq;