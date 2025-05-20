import Hero from "../components/home/Hero";
import ServicesHighlight from "../components/home/ServicesHighlight";
import PackagesOverview from "../components/home/PackageOverview";
import ChecklistTeaser from "../components/home/ChecklistTeaser";
import Testimonials from "../components/home/Testimonials";
import CTA from "../components/home/CTA";

export default function Home() {
  return (
   <div>
      <Hero />
      <ServicesHighlight />
      <PackagesOverview />
      <ChecklistTeaser />
      {/* <Testimonials /> */}
      <CTA />
   </div>
  );
}
