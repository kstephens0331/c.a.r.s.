import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const careSteps = [
  {
    title: 'First 48-72 Hours After Repair',
    icon: '⏰',
    items: [
      'Do not wash your vehicle for at least 48 hours after paint work',
      'Avoid waxing or polishing repaired areas for 90 days',
      'Do not park under trees where sap or bird droppings may land on fresh paint',
      'If possible, park in a garage or covered area',
      'Avoid driving on gravel roads to prevent stone chips on fresh paint',
    ]
  },
  {
    title: 'Washing Guidelines',
    icon: '🧽',
    items: [
      'Hand wash only for the first 90 days after paint work',
      'Use a pH-neutral car wash soap (avoid dish soap or harsh detergents)',
      'Use a soft microfiber wash mitt, not brushes or sponges',
      'Avoid automatic car washes with brushes for at least 90 days',
      'Touchless automatic washes are acceptable after 2 weeks',
      'Rinse thoroughly before washing to remove loose debris',
      'Dry with clean microfiber towels, not chamois or air blowers',
    ]
  },
  {
    title: 'Waxing and Sealant',
    icon: '✨',
    items: [
      'Wait at least 90 days before applying wax or paint sealant to repaired areas',
      'Use a high-quality carnauba wax or synthetic sealant',
      'Avoid abrasive compounds or cutting polishes on fresh paint',
      'Regular waxing after the cure period helps protect the finish',
      'Ceramic coatings should not be applied for at least 6 months',
    ]
  },
  {
    title: 'Sun and Weather Protection',
    icon: '☀️',
    items: [
      'Fresh paint is more sensitive to UV rays during the first 90 days',
      'Park in shaded areas when possible during the curing period',
      'If bird droppings, tree sap, or bugs land on fresh paint, remove immediately with a damp microfiber cloth',
      'Do not use tar remover or adhesive removers on fresh paint for 90 days',
      'Rain and humidity will not damage properly cured paint',
    ]
  },
  {
    title: 'Ongoing Maintenance',
    icon: '🔧',
    items: [
      'Inspect repaired areas regularly for any signs of bubbling, peeling, or color mismatch',
      'If you notice any issues, contact us immediately as they may be covered under warranty',
      'Keep your vehicle clean to prevent contaminants from bonding to the paint',
      'Address stone chips and scratches promptly to prevent rust on metal panels',
      'Schedule regular maintenance to keep your vehicle in top condition',
    ]
  },
  {
    title: 'What to Avoid',
    icon: '🚫',
    items: [
      'Do not apply stickers or decals to freshly painted surfaces for at least 90 days',
      'Avoid spilling gasoline, brake fluid, or antifreeze on repaired surfaces as these can damage paint',
      'Do not scrape ice or snow off freshly painted surfaces with hard scrapers',
      'Avoid high-pressure washers directly on repaired edges and seams',
      'Do not use clay bars on fresh paint for at least 90 days',
    ]
  }
];

export default function RepairCarePage() {
  return (
    <div className="bg-gradient-to-br from-[#2c1b14] via-[#3e1f1c] to-black text-white overflow-x-hidden">
      <Helmet>
        <title>Post-Repair Care Guide | C.A.R.S. Collision & Refinish | Spring TX</title>
        <meta name="description" content="Post-repair care instructions for your vehicle after collision repair and paint work at C.A.R.S. Collision & Refinish Shop in Spring, TX." />
      </Helmet>

      {/* Hero */}
      <section className="text-center px-6 py-20">
        <h1 className="text-4xl font-bold mb-4">Post-Repair Care Guide</h1>
        <p className="max-w-3xl mx-auto text-lg text-gray-200 leading-relaxed">
          Congratulations on your completed repair. Following these care instructions will help ensure your paint and repair work lasts for years to come.
        </p>
      </section>

      {/* Care Steps */}
      <section className="px-6 py-12 max-w-4xl mx-auto">
        <div className="space-y-8">
          {careSteps.map((step, index) => (
            <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-brandRed flex items-center gap-2">
                <span className="text-2xl">{step.icon}</span>
                {step.title}
              </h2>
              <ul className="space-y-2">
                {step.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-200">
                    <span className="text-green-400 mt-1 flex-shrink-0">&#10003;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Warranty Note */}
        <div className="mt-12 bg-brandRed/10 border border-brandRed/30 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-3 text-brandRed">Workmanship Warranty</h2>
          <p className="text-gray-200 leading-relaxed mb-4">
            C.A.R.S. Collision & Refinish Shop stands behind all of our work with a workmanship warranty. If you notice any issues with paint adhesion, color match, or repair quality, contact us right away. Most warranty claims can be resolved quickly and at no additional cost.
          </p>
          <p className="text-gray-200 leading-relaxed">
            Please note that damage from accidents, misuse, environmental hazards (hail, floods), or unauthorized modifications is not covered under our workmanship warranty. Manufacturer parts warranties are governed by the respective manufacturer.
          </p>
        </div>

        {/* Print Notice */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>You can print this page for reference using your browser's print function (Ctrl+P or Cmd+P).</p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-black/30 py-16 text-center px-6">
        <h2 className="text-2xl font-bold mb-4">Questions About Your Repair?</h2>
        <p className="text-gray-300 mb-6 max-w-xl mx-auto">
          Our team is here to help. If you have any questions about your repair or notice any issues, do not hesitate to reach out.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="tel:8328853055"
            className="bg-brandRedDark text-white px-8 py-3 rounded hover:bg-red-700 transition font-semibold"
          >
            Call (832) 885-3055
          </a>
          <Link
            to="/contact"
            className="bg-white text-primary px-8 py-3 rounded hover:bg-gray-100 transition font-semibold"
          >
            Contact Us Online
          </Link>
        </div>
      </section>
    </div>
  );
}
