const connectDB = require('../utils/db');
const Category = require('../models/category.model');
const Task = require('../models/task.model');

const seedData = {
  categories: [
    {
      id: "beforeArrival",
      name: "beforeArrival",
      displayName: "Before Arrival",
      description: "Essential preparations before traveling to Germany",
      icon: "plane-departure",
      color: "#3B82F6",
      order: 1,
      estimatedTimeFrame: "2-3 months before arrival"
    },
    {
      id: "uponArrival",
      name: "uponArrival", 
      displayName: "Upon Arrival",
      description: "Immediate tasks to complete when you arrive in Germany",
      icon: "location-pin",
      color: "#10B981",
      order: 2,
      estimatedTimeFrame: "First week in Germany"
    },
    {
      id: "firstWeeks",
      name: "firstWeeks",
      displayName: "First Weeks",
      description: "Getting settled and integrated into your new environment",
      icon: "calendar-days",
      color: "#F59E0B",
      order: 3,
      estimatedTimeFrame: "First month in Germany"
    },
    {
      id: "ongoing",
      name: "ongoing",
      displayName: "Ongoing",
      description: "Continuous tasks for long-term success in Germany",
      icon: "infinity",
      color: "#8B5CF6",
      order: 4,
      estimatedTimeFrame: "Throughout your stay"
    }
  ],
  tasks: [
    // Before Arrival Tasks
    {
      id: "find-accommodation",
      title: "Find accommodation",
      description: `<div>
        <p>Securing accommodation is one of the most important steps before arriving in Germany. Start your search early as the housing market can be competitive.</p>
        
        <h4>Types of accommodation:</h4>
        <ul>
          <li><strong>Student dormitories (Studentenwohnheim):</strong> Affordable option for students</li>
          <li><strong>Shared apartments (WG - Wohngemeinschaft):</strong> Popular among young people</li>
          <li><strong>Private apartments:</strong> More expensive but offers privacy</li>
          <li><strong>Temporary accommodation:</strong> Hostels or Airbnb for the first few days</li>
        </ul>

        <h4>Popular websites for housing search:</h4>
        <ul>
          <li>WG-Gesucht.de</li>
          <li>Immobilienscout24.de</li>
          <li>Studenten-WG.de</li>
          <li>Housing Anywhere</li>
        </ul>

        <p><strong>Tips:</strong> Prepare all required documents (passport copy, proof of income, etc.) and be ready to respond quickly to accommodation offers.</p>
      </div>`,
      category: "beforeArrival",
      order: 1,
      estimatedDuration: "2-4 weeks",
      difficulty: "hard",
      externalLinks: [
        { title: "WG-Gesucht", url: "https://www.wg-gesucht.de", description: "Popular platform for shared accommodation" },
        { title: "ImmobilienScout24", url: "https://www.immobilienscout24.de", description: "Large real estate platform" }
      ],
      tips: [
        "Start searching 2-3 months before arrival",
        "Prepare a housing application package with all documents",
        "Consider temporary accommodation for your first week",
        "Join Facebook groups for international students in your city"
      ],
      requirements: ["Valid passport", "Proof of income or scholarship", "Passport photos", "Completed application forms"]
    },
    {
      id: "health-insurance",
      title: "Arrange health insurance (link to TK)",
      description: `<div>
        <p>Health insurance is mandatory in Germany. You must have valid health insurance coverage from your first day in the country.</p>
        
        <h4>Types of health insurance:</h4>
        <ul>
          <li><strong>Public health insurance (Gesetzliche Krankenversicherung):</strong> Recommended for most students and employees</li>
          <li><strong>Private health insurance:</strong> For specific cases, consult with an advisor</li>
        </ul>

        <h4>Popular public insurance providers:</h4>
        <ul>
          <li><strong>TK (Techniker Krankenkasse):</strong> Highly recommended, English support available</li>
          <li>AOK</li>
          <li>Barmer</li>
          <li>DAK-Gesundheit</li>
        </ul>

        <p><strong>For students:</strong> Special student rates are available (around €110/month). EU students can use their European Health Insurance Card temporarily.</p>
      </div>`,
      category: "beforeArrival",
      order: 2,
      estimatedDuration: "1-2 days",
      difficulty: "medium",
      externalLinks: [
        { title: "TK - Techniker Krankenkasse", url: "https://www.tk.de", description: "Apply for health insurance with English support" },
        { title: "Health insurance comparison", url: "https://www.krankenkassen.de", description: "Compare different health insurance options" }
      ],
      tips: [
        "TK offers excellent English customer service",
        "Student rates are significantly cheaper",
        "You can apply online before arriving",
        "Keep your insurance documents with you at all times"
      ],
      requirements: ["Valid passport", "Proof of student status or employment", "Bank account details (can be provided later)"]
    },
    {
      id: "book-flights",
      title: "Book flights (link to Skyscanner/Qatar/)",
      description: `<div>
        <p>Booking your flights to Germany requires careful planning, especially considering visa processing times and accommodation availability.</p>
        
        <h4>Best time to book:</h4>
        <ul>
          <li>2-3 months in advance for better prices</li>
          <li>Consider semester start dates if you're a student</li>
          <li>Avoid peak travel seasons for lower costs</li>
        </ul>

        <h4>Major airports in Germany:</h4>
        <ul>
          <li><strong>Frankfurt am Main (FRA):</strong> Largest international hub</li>
          <li><strong>Munich (MUC):</strong> Southern Germany</li>
          <li><strong>Berlin Brandenburg (BER):</strong> Capital city</li>
          <li><strong>Hamburg (HAM):</strong> Northern Germany</li>
          <li><strong>Düsseldorf (DUS):</strong> Western Germany</li>
        </ul>

        <p><strong>Important:</strong> Make sure your passport is valid for at least 6 months from travel date.</p>
      </div>`,
      category: "beforeArrival",
      order: 3,
      estimatedDuration: "1 day",
      difficulty: "easy",
      externalLinks: [
        { title: "Skyscanner", url: "https://www.skyscanner.com", description: "Compare flight prices from multiple airlines" },
        { title: "Qatar Airways", url: "https://www.qatarairways.com", description: "Direct flights to major German cities" },
        { title: "Lufthansa", url: "https://www.lufthansa.com", description: "German national airline" }
      ],
      tips: [
        "Book flexible tickets if possible due to visa uncertainties",
        "Check baggage allowances for international students",
        "Consider arrival time - avoid late night arrivals",
        "Book airport transfer in advance"
      ],
      requirements: ["Valid passport", "Visa (if required)", "Proof of accommodation", "Travel insurance"]
    },
    {
      id: "prepare-documents",
      title: "Prepare necessary documents",
      description: `<div>
        <p>Having all required documents ready and properly translated will save you time and stress during your relocation process.</p>
        
        <h4>Essential documents:</h4>
        <ul>
          <li><strong>Passport:</strong> Valid for at least 6 months</li>
          <li><strong>Visa:</strong> If required for your nationality</li>
          <li><strong>Birth certificate:</strong> Officially translated</li>
          <li><strong>Educational certificates:</strong> Translated and apostilled</li>
          <li><strong>Health insurance confirmation</strong></li>
          <li><strong>Proof of financial resources</strong></li>
          <li><strong>Accommodation confirmation</strong></li>
        </ul>

        <h4>For students additionally:</h4>
        <ul>
          <li>University admission letter</li>
          <li>Academic transcripts</li>
          <li>Language certificates (if required)</li>
        </ul>

        <h4>For workers additionally:</h4>
        <ul>
          <li>Employment contract</li>
          <li>Professional qualifications</li>
          <li>CV in German format</li>
        </ul>

        <p><strong>Important:</strong> Get multiple certified copies of all documents. Translations must be done by certified translators.</p>
      </div>`,
      category: "beforeArrival",
      order: 4,
      estimatedDuration: "1-2 weeks",
      difficulty: "medium",
      tips: [
        "Make multiple copies of all documents",
        "Scan and store digital copies in cloud storage",
        "Use certified translation services",
        "Organize documents in a folder for easy access"
      ],
      requirements: ["Original documents", "Certified translations", "Apostille certification (for some documents)"]
    },

    // Upon Arrival Tasks
    {
      id: "airport-pickup",
      title: "Airport pickup (link to M&M Consultants' service)",
      description: `<div>
        <p>Arriving in a new country can be overwhelming. A reliable airport pickup service ensures a smooth start to your German journey.</p>
        
        <h4>M&M Consultants Airport Pickup Service includes:</h4>
        <ul>
          <li>Professional driver meeting you at arrivals</li>
          <li>Assistance with luggage</li>
          <li>Direct transport to your accommodation</li>
          <li>Basic orientation during the journey</li>
          <li>Emergency contact support</li>
        </ul>

        <h4>What to expect:</h4>
        <ul>
          <li>Driver will have a sign with your name</li>
          <li>Meet at designated pickup point</li>
          <li>Comfortable vehicle with air conditioning</li>
          <li>Multilingual driver support</li>
        </ul>

        <p><strong>Alternative options:</strong> Public transport, taxi, or rental car (if you have an international driving license).</p>
      </div>`,
      category: "uponArrival",
      order: 1,
      estimatedDuration: "1-2 hours",
      difficulty: "easy",
      externalLinks: [
        { title: "M&M Consultants Pickup Service", url: "/contact", description: "Book your airport pickup service" }
      ],
      tips: [
        "Share your flight details 24 hours before arrival",
        "Keep driver contact number handy",
        "Have some Euro cash for tips",
        "Download offline maps as backup"
      ],
      requirements: ["Flight details", "Accommodation address", "Phone number", "Emergency contacts"]
    },
    {
      id: "settle-accommodation",
      title: "Settle into accommodation",
      description: `<div>
        <p>Getting comfortable in your new home is essential for a good start in Germany. Take time to familiarize yourself with your living space and neighborhood.</p>
        
        <h4>First day checklist:</h4>
        <ul>
          <li>Inspect the accommodation for any damages</li>
          <li>Test all utilities (water, electricity, heating, internet)</li>
          <li>Meet your landlord or flatmates</li>
          <li>Locate important facilities (bathroom, kitchen, laundry)</li>
          <li>Find nearest grocery store and pharmacy</li>
        </ul>

        <h4>Important documents to receive:</h4>
        <ul>
          <li><strong>Rental contract (Mietvertrag)</strong></li>
          <li><strong>House rules (Hausordnung)</strong></li>
          <li><strong>Keys and access codes</strong></li>
          <li><strong>Utility information</strong></li>
          <li><strong>Waste disposal schedule</strong></li>
        </ul>

        <h4>Safety and security:</h4>
        <ul>
          <li>Know emergency exit routes</li>
          <li>Test smoke detectors</li>
          <li>Understand heating system</li>
          <li>Get contact information for emergencies</li>
        </ul>
      </div>`,
      category: "uponArrival",
      order: 2,
      estimatedDuration: "Half day",
      difficulty: "easy",
      tips: [
        "Take photos of any existing damages",
        "Ask about quiet hours (usually 22:00-06:00)",
        "Learn how to sort waste properly",
        "Exchange contact information with neighbors"
      ],
      requirements: ["Rental contract", "Photo ID", "Security deposit (if not paid yet)"]
    },
    {
      id: "anmeldung",
      title: "Anmeldung (Registration)",
      description: `<div>
        <p>Anmeldung is mandatory registration with local authorities within 14 days of moving to Germany. This is one of the most important bureaucratic steps.</p>
        
        <h4>What is Anmeldung?</h4>
        <p>Official registration of your residence with the local registration office (Bürgeramt or Einwohnermeldeamt).</p>
        
        <h4>Required documents:</h4>
        <ul>
          <li><strong>Anmeldung form:</strong> Available online or at the office</li>
          <li><strong>Passport or ID card</strong></li>
          <li><strong>Rental contract or confirmation from landlord</strong></li>
          <li><strong>Wohnungsgeberbestätigung:</strong> Confirmation from your landlord</li>
        </ul>

        <h4>Process:</h4>
        <ol>
          <li>Download and fill the Anmeldung form</li>
          <li>Get landlord confirmation (Wohnungsgeberbestätigung)</li>
          <li>Book appointment online or visit during opening hours</li>
          <li>Submit documents and receive registration certificate</li>
        </ol>

        <p><strong>Important:</strong> You'll receive a Meldebestätigung (registration certificate) which you'll need for opening bank accounts, getting insurance, and many other services.</p>
      </div>`,
      category: "uponArrival",
      order: 3,
      estimatedDuration: "Half day",
      difficulty: "medium",
      tips: [
        "Book appointment online to avoid long waits",
        "Bring original documents and copies",
        "Some offices accept walk-ins early morning",
        "Ask landlord for Wohnungsgeberbestätigung in advance"
      ],
      requirements: ["Completed Anmeldung form", "Passport", "Rental contract", "Landlord confirmation"]
    },
    {
      id: "open-bank-account",
      title: "Open a bank account",
      description: `<div>
        <p>A German bank account is essential for receiving salary, paying rent, and managing daily expenses. Most services in Germany require local bank details.</p>
        
        <h4>Popular banks for international residents:</h4>
        <ul>
          <li><strong>Deutsche Bank:</strong> International focus, English service</li>
          <li><strong>Commerzbank:</strong> Good for students and young professionals</li>
          <li><strong>Sparkasse:</strong> Local savings banks, widely available</li>
          <li><strong>N26:</strong> Digital bank with English app</li>
          <li><strong>DKB:</strong> Online bank with free accounts</li>
        </ul>

        <h4>Required documents:</h4>
        <ul>
          <li>Passport or ID card</li>
          <li>Anmeldung certificate (Meldebestätigung)</li>
          <li>Proof of income (employment contract, scholarship letter)</li>
          <li>Student certificate (for student accounts)</li>
        </ul>

        <h4>Account types:</h4>
        <ul>
          <li><strong>Girokonto:</strong> Current account for daily transactions</li>
          <li><strong>Student account:</strong> Often free with special benefits</li>
          <li><strong>Savings account:</strong> For longer-term savings</li>
        </ul>

        <p><strong>Tip:</strong> Many banks offer free accounts for students or with minimum monthly income.</p>
      </div>`,
      category: "uponArrival",
      order: 4,
      estimatedDuration: "1-2 hours",
      difficulty: "medium",
      tips: [
        "Compare account fees and benefits",
        "Ask about English-language services",
        "Request online banking access",
        "Get both EC-card and credit card if needed"
      ],
      requirements: ["Anmeldung certificate", "Passport", "Proof of income", "Initial deposit (varies by bank)"]
    },
    {
      id: "get-sim-card",
      title: "Get a sim card (link to M&M Consultants' service)",
      description: `<div>
        <p>Staying connected is crucial for navigation, communication, and emergency situations. Get a German SIM card for better rates and coverage.</p>
        
        <h4>M&M Consultants SIM Card Service:</h4>
        <p>We can help you get set up with the best mobile plan for your needs, including:</p>
        <ul>
          <li>Comparison of different providers and plans</li>
          <li>Assistance with contract negotiations</li>
          <li>Help with German paperwork</li>
          <li>Setup and activation support</li>
        </ul>

        <h4>Popular mobile providers:</h4>
        <ul>
          <li><strong>Deutsche Telekom (T-Mobile):</strong> Best coverage, premium pricing</li>
          <li><strong>Vodafone:</strong> Good coverage, competitive prices</li>
          <li><strong>O2:</strong> Budget-friendly options</li>
          <li><strong>1&1:</strong> Good value plans</li>
        </ul>

        <h4>Plan types:</h4>
        <ul>
          <li><strong>Prepaid:</strong> No contract, pay as you go</li>
          <li><strong>Contract:</strong> Monthly plans, often better value</li>
          <li><strong>Student plans:</strong> Special discounts available</li>
        </ul>

        <p><strong>What you'll need:</strong> Passport, Anmeldung certificate, and bank account details (for contracts).</p>
      </div>`,
      category: "uponArrival",
      order: 5,
      estimatedDuration: "1 hour",
      difficulty: "easy",
      externalLinks: [
        { title: "M&M Consultants Mobile Service", url: "/contact", description: "Get help choosing the right mobile plan" }
      ],
      tips: [
        "Prepaid is easier for immediate needs",
        "Contract plans offer better long-term value",
        "Check coverage in your area",
        "Ask about EU roaming options"
      ],
      requirements: ["Passport", "Anmeldung certificate", "Bank details (for contracts)"]
    },
    {
      id: "public-transportation",
      title: "Familiarize yourself with public transportation",
      description: `<div>
        <p>Germany has an excellent public transportation system. Learning to navigate it efficiently will save you time and money.</p>
        
        <h4>Transportation types:</h4>
        <ul>
          <li><strong>U-Bahn:</strong> Underground/subway trains in major cities</li>
          <li><strong>S-Bahn:</strong> City and suburban trains</li>
          <li><strong>Straßenbahn:</strong> Trams (in some cities)</li>
          <li><strong>Bus:</strong> City and regional buses</li>
          <li><strong>Regional trains:</strong> DB trains for longer distances</li>
        </ul>

        <h4>Ticketing system:</h4>
        <ul>
          <li><strong>Single tickets:</strong> One-time use</li>
          <li><strong>Day tickets:</strong> Unlimited travel for one day</li>
          <li><strong>Weekly/Monthly passes:</strong> Best value for regular use</li>
          <li><strong>Student discounts:</strong> Semester tickets often available</li>
        </ul>

        <h4>Useful apps:</h4>
        <ul>
          <li><strong>DB Navigator:</strong> National train schedules</li>
          <li><strong>Local transport apps:</strong> Each city has its own app</li>
          <li><strong>Google Maps:</strong> Route planning with public transport</li>
        </ul>

        <p><strong>Important:</strong> Always validate your ticket before traveling. Ticket inspections are common and fines are expensive (€60+).</p>
      </div>`,
      category: "uponArrival",
      order: 6,
      estimatedDuration: "2-3 hours",
      difficulty: "easy",
      tips: [
        "Download local transport apps",
        "Buy a day ticket for your first exploration",
        "Learn the zone system in your city",
        "Always validate paper tickets",
        "Keep your ticket until you exit the transport area"
      ],
      requirements: ["Smartphone for apps", "Cash or card for tickets"]
    },

    // First Weeks Tasks
    {
      id: "orientation-events",
      title: "Attend orientation events (link to M&M Consultants' events)",
      description: `<div>
        <p>Orientation events are crucial for understanding German culture, making connections, and getting practical advice for your new life.</p>
        
        <h4>M&M Consultants Orientation Events:</h4>
        <p>We organize regular orientation sessions covering:</p>
        <ul>
          <li><strong>Cultural integration workshops</strong></li>
          <li><strong>Practical life skills sessions</strong></li>
          <li><strong>Networking events with other internationals</strong></li>
          <li><strong>City tours and local insights</strong></li>
          <li><strong>Q&A sessions with experts</strong></li>
        </ul>

        <h4>Topics typically covered:</h4>
        <ul>
          <li>German workplace culture</li>
          <li>Social customs and etiquette</li>
          <li>Healthcare system navigation</li>
          <li>Tax obligations</li>
          <li>Housing rights and responsibilities</li>
          <li>Educational system (for families)</li>
        </ul>

        <h4>University orientations (for students):</h4>
        <ul>
          <li>Academic system explanation</li>
          <li>Course registration</li>
          <li>Campus tours</li>
          <li>Student services overview</li>
        </ul>

        <p><strong>Benefits:</strong> Meet other internationals, get insider tips, and build your support network from day one.</p>
      </div>`,
      category: "firstWeeks",
      order: 1,
      estimatedDuration: "Several events over 2-3 weeks",
      difficulty: "easy",
      externalLinks: [
        { title: "M&M Consultants Events", url: "/contact", description: "Register for upcoming orientation events" }
      ],
      tips: [
        "Attend multiple events to meet different people",
        "Take notes during practical sessions",
        "Exchange contacts with other participants",
        "Ask questions - no question is too basic"
      ],
      requirements: ["Registration for events", "Notebook for taking notes"]
    },
    {
      id: "university-registration",
      title: "Register at the university",
      description: `<div>
        <p>University registration (Immatrikulation) is essential for students to officially begin their studies and access university services.</p>
        
        <h4>Registration process:</h4>
        <ol>
          <li><strong>Submit required documents</strong></li>
          <li><strong>Pay semester fees</strong></li>
          <li><strong>Complete enrollment forms</strong></li>
          <li><strong>Receive student ID and semester ticket</strong></li>
          <li><strong>Access online student portal</strong></li>
        </ol>

        <h4>Required documents:</h4>
        <ul>
          <li>University admission letter</li>
          <li>Passport and Anmeldung certificate</li>
          <li>Educational certificates (translated)</li>
          <li>Health insurance confirmation</li>
          <li>Passport photos</li>
          <li>Proof of semester fee payment</li>
        </ul>

        <h4>What you'll receive:</h4>
        <ul>
          <li><strong>Student ID card:</strong> Access to campus and services</li>
          <li><strong>Semester ticket:</strong> Public transport pass</li>
          <li><strong>University email account</strong></li>
          <li><strong>Library access</strong></li>
          <li><strong>Student handbook</strong></li>
        </ul>

        <p><strong>Semester fees typically include:</strong> Administrative fees, student union fees, and semester ticket for public transport.</p>
      </div>`,
      category: "firstWeeks",
      order: 2,
      estimatedDuration: "Half day",
      difficulty: "medium",
      tips: [
        "Bring all original documents plus copies",
        "Ask about payment methods for semester fees",
        "Inquire about student discounts and services",
        "Get information about academic calendar and deadlines"
      ],
      requirements: ["Admission letter", "All academic documents", "Health insurance", "Semester fee payment"]
    },
    {
      id: "get-student-id",
      title: "Get a student ID",
      description: `<div>
        <p>Your student ID is your key to accessing university facilities and receiving student discounts throughout Germany.</p>
        
        <h4>Student ID benefits:</h4>
        <ul>
          <li><strong>Campus access:</strong> Buildings, libraries, computer labs</li>
          <li><strong>Meal discounts:</strong> Mensa (university cafeteria)</li>
          <li><strong>Library privileges:</strong> Book borrowing and study spaces</li>
          <li><strong>Student pricing:</strong> Software, events, transportation</li>
          <li><strong>Gym access:</strong> University sports facilities</li>
        </ul>

        <h4>Where to use student discounts:</h4>
        <ul>
          <li>Movie theaters (Kino)</li>
          <li>Museums and cultural sites</li>
          <li>Public transportation (with semester ticket)</li>
          <li>Some restaurants and shops</li>
          <li>Software licenses (Microsoft, Adobe)</li>
          <li>Streaming services</li>
        </ul>

        <h4>Digital services access:</h4>
        <ul>
          <li>Online course materials</li>
          <li>University WiFi</li>
          <li>Digital library resources</li>
          <li>Email and learning management systems</li>
        </ul>

        <p><strong>Keep it safe:</strong> Your student ID is difficult to replace, so keep it secure and carry it with you on campus.</p>
      </div>`,
      category: "firstWeeks",
      order: 3,
      estimatedDuration: "Included in university registration",
      difficulty: "easy",
      tips: [
        "Always carry your student ID on campus",
        "Ask about student discount cards for the city",
        "Learn how to add credit for printing and cafeteria",
        "Register for university WiFi immediately"
      ],
      requirements: ["Completed university registration", "Passport photo", "Student status verification"]
    },
    {
      id: "explore-city",
      title: "Explore the city",
      description: `<div>
        <p>Getting to know your new city helps you feel at home and discover resources, services, and places you'll need regularly.</p>
        
        <h4>Essential places to locate:</h4>
        <ul>
          <li><strong>Government offices:</strong> Bürgeramt, Ausländerbehörde</li>
          <li><strong>Healthcare:</strong> Doctors, pharmacies, hospitals</li>
          <li><strong>Shopping:</strong> Supermarkets, department stores</li>
          <li><strong>Services:</strong> Post office, banks, internet providers</li>
          <li><strong>Recreation:</strong> Parks, gyms, cultural centers</li>
        </ul>

        <h4>Exploration methods:</h4>
        <ul>
          <li><strong>Walking tours:</strong> Free or paid city tours</li>
          <li><strong>Public transport exploration:</strong> Use day tickets</li>
          <li><strong>Bike tours:</strong> Many cities offer bike rentals</li>
          <li><strong>Local apps:</strong> City-specific apps with recommendations</li>
          <li><strong>International meetups:</strong> Join expat groups</li>
        </ul>

        <h4>Cultural highlights to visit:</h4>
        <ul>
          <li>Historic city center</li>
          <li>Museums and galleries</li>
          <li>Local markets</li>
          <li>Parks and recreational areas</li>
          <li>Popular neighborhoods</li>
        </ul>

        <p><strong>Document your exploration:</strong> Take photos and notes about useful locations for future reference.</p>
      </div>`,
      category: "firstWeeks",
      order: 4,
      estimatedDuration: "Several days/weekends",
      difficulty: "easy",
      tips: [
        "Start with areas near your accommodation",
        "Download offline maps for backup",
        "Try local food and restaurants",
        "Join city Facebook groups for tips",
        "Ask locals for recommendations"
      ],
      requirements: ["Comfortable walking shoes", "City map or smartphone", "Public transport day ticket"]
    },
    {
      id: "join-student-groups",
      title: "Join student groups or clubs",
      description: `<div>
        <p>Joining student groups and clubs is one of the best ways to make friends, practice German, and integrate into German student life.</p>
        
        <h4>Types of student organizations:</h4>
        <ul>
          <li><strong>International student groups:</strong> Support for foreign students</li>
          <li><strong>Subject-specific groups:</strong> Related to your field of study</li>
          <li><strong>Cultural associations:</strong> Country-specific or multicultural</li>
          <li><strong>Sports clubs:</strong> University sports teams and recreation</li>
          <li><strong>Hobby groups:</strong> Music, art, gaming, outdoor activities</li>
          <li><strong>Language exchange:</strong> Practice German with native speakers</li>
        </ul>

        <h4>Popular activities:</h4>
        <ul>
          <li><strong>Buddy programs:</strong> Paired with German students</li>
          <li><strong>Erasmus groups:</strong> For exchange students</li>
          <li><strong>Volunteer organizations:</strong> Community service</li>
          <li><strong>Professional networks:</strong> Career-focused groups</li>
        </ul>

        <h4>Where to find groups:</h4>
        <ul>
          <li>University websites and notice boards</li>
          <li>Student union (AStA) information</li>
          <li>Facebook groups and university apps</li>
          <li>International office recommendations</li>
          <li>Orientation event announcements</li>
        </ul>

        <p><strong>Benefits:</strong> Social connections, language practice, cultural understanding, and support network.</p>
      </div>`,
      category: "firstWeeks",
      order: 5,
      estimatedDuration: "Ongoing activity",
      difficulty: "easy",
      tips: [
        "Don't be shy - everyone wants to meet new people",
        "Try several groups to find the right fit",
        "Attend welcome events and mixers",
        "Be open to trying new activities",
        "Exchange contact information with new friends"
      ],
      requirements: ["University registration", "Open attitude", "Time for social activities"]
    },

    // Ongoing Tasks
    {
      id: "manage-finances",
      title: "Manage finances",
      description: `<div>
        <p>Effective financial management is crucial for a successful stay in Germany. Understanding the German financial system will help you budget and save money.</p>
        
        <h4>Monthly budget considerations:</h4>
        <ul>
          <li><strong>Rent:</strong> Usually 30-40% of income (warm rent including utilities)</li>
          <li><strong>Health insurance:</strong> ~€110/month for students, more for employees</li>
          <li><strong>Food:</strong> €200-300/month for groceries and occasional dining</li>
          <li><strong>Transportation:</strong> €60-100/month (student tickets cheaper)</li>
          <li><strong>Phone/Internet:</strong> €30-50/month</li>
          <li><strong>Personal expenses:</strong> €100-200/month</li>
        </ul>

        <h4>German banking features:</h4>
        <ul>
          <li><strong>SEPA transfers:</strong> Free within EU</li>
          <li><strong>Lastschrift:</strong> Direct debit for recurring payments</li>
          <li><strong>Dauerauftrag:</strong> Standing orders for regular transfers</li>
          <li><strong>Girocard:</strong> Debit card for daily purchases</li>
        </ul>

        <h4>Money-saving tips:</h4>
        <ul>
          <li>Shop at discount supermarkets (Aldi, Lidl)</li>
          <li>Use student discounts everywhere</li>
          <li>Cook at home more often</li>
          <li>Take advantage of university facilities</li>
          <li>Use public transport instead of taxis</li>
        </ul>

        <p><strong>Emergency fund:</strong> Keep 2-3 months of expenses saved for unexpected situations.</p>
      </div>`,
      category: "ongoing",
      order: 1,
      estimatedDuration: "Ongoing management",
      difficulty: "medium",
      tips: [
        "Track expenses with apps like YNAB or local alternatives",
        "Set up automatic transfers to savings",
        "Review bank statements monthly",
        "Learn about German tax system",
        "Consider getting financial advice for larger decisions"
      ],
      requirements: ["German bank account", "Budget planning", "Basic understanding of German financial system"]
    },
    {
      id: "maintain-visa-status",
      title: "Maintain visa status",
      description: `<div>
        <p>Maintaining legal status in Germany is critical. Understanding visa requirements and renewal processes will help you avoid complications.</p>
        
        <h4>Common visa types and requirements:</h4>
        <ul>
          <li><strong>Student visa:</strong> Valid enrollment, adequate finances, health insurance</li>
          <li><strong>Job seeker visa:</strong> Actively seeking employment, financial proof</li>
          <li><strong>Work visa:</strong> Valid employment contract, qualification recognition</li>
          <li><strong>Family reunion visa:</strong> Proof of family relationship, sponsor support</li>
        </ul>

        <h4>Important deadlines to track:</h4>
        <ul>
          <li>Visa expiration date</li>
          <li>University enrollment deadlines</li>
          <li>Insurance payment due dates</li>
          <li>Address change notifications (within 14 days)</li>
          <li>Work permit limitations and renewals</li>
        </ul>

        <h4>Required documentation to maintain:</h4>
        <ul>
          <li>Valid passport (renew 6 months before expiry)</li>
          <li>Current Anmeldung certificate</li>
          <li>Proof of financial resources</li>
          <li>Health insurance confirmation</li>
          <li>Academic progress reports (students)</li>
          <li>Employment contracts (workers)</li>
        </ul>

        <p><strong>Ausländerbehörde:</strong> Your local foreigners' office handles all visa-related matters. Build a good relationship and always be punctual for appointments.</p>
      </div>`,
      category: "ongoing",
      order: 2,
      estimatedDuration: "Ongoing monitoring",
      difficulty: "medium",
      tips: [
        "Set calendar reminders for important deadlines",
        "Always submit renewal applications early",
        "Keep copies of all submitted documents",
        "Learn basic German for official interactions",
        "Consider getting legal advice for complex cases"
      ],
      requirements: ["Valid visa/residence permit", "Required supporting documents", "Regular monitoring of status"]
    },
    {
      id: "seek-part-time-work",
      title: "Seek part-time work (if permitted)",
      description: `<div>
        <p>Part-time work can provide valuable income, work experience, and integration opportunities. Understanding German work regulations is essential.</p>
        
        <h4>Work limitations by status:</h4>
        <ul>
          <li><strong>EU students:</strong> No restrictions</li>
          <li><strong>Non-EU students:</strong> 120 full days OR 240 half days per year</li>
          <li><strong>Student assistants:</strong> University jobs don't count toward limit</li>
          <li><strong>Work visa holders:</strong> As specified in visa conditions</li>
        </ul>

        <h4>Popular student jobs:</h4>
        <ul>
          <li><strong>University positions:</strong> Research assistant, tutor, campus jobs</li>
          <li><strong>Service industry:</strong> Restaurants, cafes, retail</li>
          <li><strong>Tutoring:</strong> Language lessons, academic subjects</li>
          <li><strong>Freelance work:</strong> Translation, writing, design</li>
          <li><strong>Internships:</strong> Related to your field of study</li>
        </ul>

        <h4>Job search resources:</h4>
        <ul>
          <li><strong>University career center</strong></li>
          <li><strong>Indeed.de, StepStone.de</strong></li>
          <li><strong>Xing:</strong> German professional network</li>
          <li><strong>Local job boards and newspapers</strong></li>
          <li><strong>Company websites directly</strong></li>
        </ul>

        <p><strong>Important:</strong> Always check your visa conditions and get approval from Ausländerbehörde if required before starting work.</p>
      </div>`,
      category: "ongoing",
      order: 3,
      estimatedDuration: "Ongoing when needed",
      difficulty: "medium",
      tips: [
        "Check visa work restrictions before applying",
        "Prepare German CV format (Lebenslauf)",
        "Learn basic job interview German",
        "Network with other international students",
        "Consider mini-jobs (450€ jobs) for tax benefits"
      ],
      requirements: ["Work permit verification", "German CV", "Basic German language skills", "Social security number"]
    },
    {
      id: "access-healthcare",
      title: "Access healthcare services",
      description: `<div>
        <p>Understanding the German healthcare system ensures you can get proper medical care when needed. Prevention and regular checkups are highly valued.</p>
        
        <h4>German healthcare system basics:</h4>
        <ul>
          <li><strong>General practitioner (Hausarzt):</strong> Your primary doctor for most issues</li>
          <li><strong>Specialists:</strong> Usually need referral from Hausarzt</li>
          <li><strong>Emergency care:</strong> Available 24/7 at hospitals</li>
          <li><strong>Pharmacies (Apotheke):</strong> Prescription and over-the-counter medicines</li>
        </ul>

        <h4>How to find healthcare:</h4>
        <ul>
          <li><strong>Insurance provider directories:</strong> List of covered doctors</li>
          <li><strong>116117.de:</strong> Find doctors and make appointments</li>
          <li><strong>University health services:</strong> Often available for students</li>
          <li><strong>Recommendations:</strong> Ask friends or colleagues</li>
        </ul>

        <h4>Appointment process:</h4>
        <ol>
          <li>Call doctor's office (German preferred)</li>
          <li>Bring insurance card and ID</li>
          <li>Pay quarterly fee (Praxisgebühr) if applicable</li>
          <li>Receive treatment or referral</li>
        </ol>

        <h4>Emergency situations:</h4>
        <ul>
          <li><strong>112:</strong> Emergency services (ambulance, fire, police)</li>
          <li><strong>116117:</strong> Non-emergency medical advice</li>
          <li><strong>Emergency rooms:</strong> For serious, non-life-threatening issues</li>
        </ul>

        <p><strong>Language tip:</strong> Learn basic medical German terms or bring a translation app to appointments.</p>
      </div>`,
      category: "ongoing",
      order: 4,
      estimatedDuration: "As needed",
      difficulty: "medium",
      tips: [
        "Register with a Hausarzt near your home",
        "Keep insurance card with you always",
        "Learn basic medical German vocabulary",
        "Understand your insurance coverage",
        "Schedule preventive checkups regularly"
      ],
      requirements: ["Health insurance", "Insurance card", "Basic German or translation help"]
    },
    {
      id: "cultural-events",
      title: "Participate in cultural events",
      description: `<div>
        <p>Engaging with German culture through events and activities enhances your experience and helps you integrate into local society.</p>
        
        <h4>Types of cultural events:</h4>
        <ul>
          <li><strong>Festivals:</strong> Oktoberfest, Christmas markets, local celebrations</li>
          <li><strong>Arts and culture:</strong> Theater, concerts, museum exhibitions</li>
          <li><strong>Sports events:</strong> Football matches, local sports clubs</li>
          <li><strong>Community events:</strong> Neighborhood festivals, markets</li>
          <li><strong>Educational:</strong> Lectures, workshops, language exchanges</li>
        </ul>

        <h4>Seasonal highlights:</h4>
        <ul>
          <li><strong>Spring:</strong> Easter markets, outdoor festivals</li>
          <li><strong>Summer:</strong> Open-air concerts, city festivals</li>
          <li><strong>Autumn:</strong> Oktoberfest, harvest festivals</li>
          <li><strong>Winter:</strong> Christmas markets, winter sports</li>
        </ul>

        <h4>How to find events:</h4>
        <ul>
          <li><strong>City websites and tourism offices</strong></li>
          <li><strong>Local newspapers and magazines</strong></li>
          <li><strong>Facebook events and groups</strong></li>
          <li><strong>University cultural programs</strong></li>
          <li><strong>Meetup.com for international groups</strong></li>
        </ul>

        <h4>Benefits of participation:</h4>
        <ul>
          <li>Cultural understanding and appreciation</li>
          <li>Language practice in social settings</li>
          <li>Meeting locals and making friends</li>
          <li>Creating memorable experiences</li>
          <li>Building sense of belonging</li>
        </ul>

        <p><strong>Cultural etiquette:</strong> Germans value punctuality, quiet public behavior, and environmental consciousness at events.</p>
      </div>`,
      category: "ongoing",
      order: 5,
      estimatedDuration: "Regular participation",
      difficulty: "easy",
      tips: [
        "Start with international-friendly events",
        "Learn about local customs beforehand",
        "Bring cash - many events don't accept cards",
        "Dress appropriately for the weather and occasion",
        "Be open to trying new foods and activities"
      ],
      requirements: ["Open mindset", "Event tickets (when required)", "Appropriate clothing"]
    }
  ]
};

module.exports = seedData;