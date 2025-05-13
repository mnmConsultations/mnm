import Link from "next/link";
import { ClipboardCheck, ArrowRight } from "lucide-react";

const ChecklistTeaser = () => {
  return (
    <section className="bg-gradient-to-r from-primary to-blue-950 text-white py-16 px-4 md:py-24 md:px-8 lg:px-16">
      <div className=" max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="mb-6 inline-block p-3 bg-white/20 rounded-full">
              <ClipboardCheck className="h-12 w-12" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Interactive Moving Checklist
            </h2>
            <p className="text-lg mb-6 text-blue-100">
              Stay organized with our comprehensive relocation checklist. Track
              your progress, get timely reminders, and ensure nothing is
              forgotten during your move to Germany.
            </p>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-white/20 p-1 rounded-full mr-3 flex-shrink-0 mt-1">
                  <ArrowRight className="h-4 w-4" />
                </div>
                <p>Personalized task list based on your situation</p>
              </div>
              <div className="flex items-start">
                <div className="bg-white/20 p-1 rounded-full mr-3 flex-shrink-0 mt-1">
                  <ArrowRight className="h-4 w-4" />
                </div>
                <p>Track your progress with visual indicators</p>
              </div>
              <div className="flex items-start">
                <div className="bg-white/20 p-1 rounded-full mr-3 flex-shrink-0 mt-1">
                  <ArrowRight className="h-4 w-4" />
                </div>
                <p>Detailed information for each task</p>
              </div>
              <div className="flex items-start">
                <div className="bg-white/20 p-1 rounded-full mr-3 flex-shrink-0 mt-1">
                  <ArrowRight className="h-4 w-4" />
                </div>
                <p>Connect tasks with our relevant services</p>
              </div>
            </div>
            <div className="mt-8">
              <button className="btn text-black">
                Comming Soon...
                {/* <Link href="/checklist">Start Your Checklist</Link> */}
              </button>
            </div>
          </div>

          <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
            <div className="bg-white/10 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-xl mb-2">Before Arrival</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked
                    className="h-5 w-5 rounded border-white/30 bg-white/20"
                  />
                  <span className="ml-3">Research visa requirements</span>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked
                    className="h-5 w-5 rounded border-white/30 bg-white/20"
                  />
                  <span className="ml-3">Secure accommodation</span>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-white/30 bg-white/20"
                  />
                  <span className="ml-3">Book flights</span>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-white/30 bg-white/20"
                  />
                  <span className="ml-3">Arrange health insurance</span>
                </div>
              </div>
            </div>

            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="font-semibold text-xl mb-2">Upon Arrival</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-white/30 bg-white/20"
                  />
                  <span className="ml-3">Register address (Anmeldung)</span>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-white/30 bg-white/20"
                  />
                  <span className="ml-3">Open bank account</span>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-white/30 bg-white/20"
                  />
                  <span className="ml-3">Get SIM card</span>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-white/30 bg-white/20"
                  />
                  <span className="ml-3">Explore public transportation</span>
                </div>
              </div>
            </div>

            <div className="mt-4 text-center text-sm text-blue-100">
              <span>Complete checklist available in the interactive tool</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChecklistTeaser;
