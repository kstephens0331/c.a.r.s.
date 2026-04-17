import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

export default function TermsOfService() {
  return (
    <div className="bg-gradient-to-br from-[#2c1b14] via-[#3e1f1c] to-black text-white overflow-x-hidden">
      <Helmet>
        <title>Terms of Service | C.A.R.S. Collision & Refinish</title>
        <meta name="description" content="Terms of Service for C.A.R.S. Collision & Refinish Shop. Review our service agreements, repair policies, and warranties." />
      </Helmet>

      {/* Hero */}
      <section className="text-center px-6 py-20">
        <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
        <p className="max-w-3xl mx-auto text-lg text-gray-200 leading-relaxed">
          Please review the following terms and conditions that govern your use of our website and auto repair services.
        </p>
      </section>

      {/* Content */}
      <section className="px-6 py-12 max-w-4xl mx-auto">
        <p className="text-sm text-gray-400 mb-10">Last updated: April 17, 2026</p>

        {/* Agreement */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-brandRed">Agreement to Terms</h2>
          <p className="text-gray-200 leading-relaxed">
            By accessing or using the C.A.R.S. Collision & Refinish Shop website (carscollisionandrefinishshop.com) or engaging our auto repair services, you agree to be bound by these Terms of Service. These terms apply to all visitors, customers, and users of our website and services.
          </p>
        </div>

        {/* Services */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-brandRed">Services Provided</h2>
          <p className="text-gray-200 leading-relaxed mb-4">
            C.A.R.S. Collision & Refinish Shop provides auto body and mechanical services including:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-200">
            <li>Collision repair for all makes and models</li>
            <li>Paint and refinishing services (factory match, custom, full repaint)</li>
            <li>Paintless dent repair (PDR)</li>
            <li>Custom paint and specialty finishes</li>
            <li>Spray-in bedliners and truck accessories</li>
            <li>Light mechanical services (brakes, A/C, suspension, oil changes)</li>
            <li>Frame straightening and structural repair</li>
          </ul>
          <p className="text-gray-200 leading-relaxed mt-4">
            We serve Spring, TX and surrounding communities including The Woodlands, Klein, Tomball, Cypress, and Conroe.
          </p>
        </div>

        {/* Estimates */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-brandRed">Estimates and Repair Authorization</h2>
          <p className="text-gray-200 leading-relaxed mb-4">
            All repair work begins with a written estimate:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-200">
            <li>Estimates are provided free of charge and are valid for 30 days</li>
            <li>Written authorization is required before any repair work begins</li>
            <li>If additional damage is discovered during disassembly (hidden damage/supplements), we will notify you and your insurance company before proceeding</li>
            <li>Supplement estimates require separate authorization</li>
            <li>Final repair costs may differ from the initial estimate due to hidden damage, parts availability, or scope changes. All changes will be communicated and approved before work continues</li>
          </ul>
        </div>

        {/* Insurance */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-brandRed">Insurance Claims</h2>
          <p className="text-gray-200 leading-relaxed mb-4">
            When working with insurance companies:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-200">
            <li>We work with all major insurance carriers</li>
            <li>You are responsible for paying your deductible directly to us</li>
            <li>We will coordinate with your insurance adjuster for damage assessment and supplements</li>
            <li>Insurance payments are made directly to C.A.R.S. Collision & Refinish Shop or jointly with the vehicle owner</li>
            <li>Any difference between the insurance payment and the final repair cost is the responsibility of the vehicle owner</li>
            <li>We are not responsible for insurance claim denials or disputes between you and your insurance provider</li>
          </ul>
        </div>

        {/* Parts */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-brandRed">Parts and Materials</h2>
          <p className="text-gray-200 leading-relaxed mb-4">
            Regarding parts used in repairs:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-200">
            <li>We use OEM (Original Equipment Manufacturer), aftermarket, and recycled parts depending on the repair scope and your insurance coverage</li>
            <li>OEM parts may be requested at additional cost if not covered by insurance</li>
            <li>All parts used are documented on your invoice</li>
            <li>Parts warranties are provided by the respective manufacturer and vary by part type</li>
          </ul>
        </div>

        {/* Payment */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-brandRed">Payment Terms</h2>
          <p className="text-gray-200 leading-relaxed mb-4">
            Payment is due upon completion of services:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-200">
            <li>We accept cash, check, Visa, Mastercard, Discover, and American Express</li>
            <li>Financing is available through Snap Finance for qualifying customers</li>
            <li>Financing terms are governed by Snap Finance's terms and conditions</li>
            <li>Vehicles will not be released until payment is received in full</li>
            <li>Past-due balances may be subject to storage fees and collection efforts</li>
          </ul>
        </div>

        {/* Storage */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-brandRed">Vehicle Storage</h2>
          <p className="text-gray-200 leading-relaxed">
            Once repairs are complete and you have been notified that your vehicle is ready for pickup, you have 3 business days to retrieve your vehicle at no additional charge. After 3 business days, a daily storage fee may apply. Vehicles left for more than 30 days after notification of completion may be subject to mechanics lien procedures in accordance with Texas law.
          </p>
        </div>

        {/* Warranties */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-brandRed">Workmanship Warranty</h2>
          <p className="text-gray-200 leading-relaxed mb-4">
            C.A.R.S. Collision & Refinish Shop stands behind our work:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-200">
            <li>We provide a workmanship warranty on all labor performed</li>
            <li>Paint work is warranted against peeling, cracking, and fading under normal conditions</li>
            <li>Warranties do not cover damage from accidents, misuse, neglect, unauthorized modifications, environmental hazards, or acts of nature</li>
            <li>Warranty claims must be reported by calling (832) 885-3055</li>
          </ul>
        </div>

        {/* Liability */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-brandRed">Limitation of Liability</h2>
          <p className="text-gray-200 leading-relaxed mb-4">
            C.A.R.S. Collision & Refinish Shop shall not be liable for:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-200">
            <li>Pre-existing conditions in your vehicle unrelated to the repairs we performed</li>
            <li>Personal property left in the vehicle during repairs</li>
            <li>Delays caused by parts availability, insurance processing, or circumstances beyond our control</li>
            <li>Indirect or consequential damages arising from our services</li>
          </ul>
          <p className="text-gray-200 leading-relaxed mt-4">
            Our total liability shall not exceed the amount paid for the specific service in question.
          </p>
        </div>

        {/* Customer Portal */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-brandRed">Customer Portal</h2>
          <p className="text-gray-200 leading-relaxed mb-4">
            Our customer portal allows you to track repair progress, view photos, and access documents:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-200">
            <li>You are responsible for maintaining the confidentiality of your account credentials</li>
            <li>You agree to provide accurate information when creating your account</li>
            <li>We reserve the right to suspend or terminate accounts that violate these terms</li>
            <li>Portal data is provided for informational purposes; official documents are the authoritative source</li>
          </ul>
        </div>

        {/* Photo Usage */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-brandRed">Photo Usage Rights</h2>
          <p className="text-gray-200 leading-relaxed">
            With your consent, repair photos and before/after comparisons may be used on our website, social media, or marketing materials to showcase our work. No personally identifiable information (license plate, VIN, owner name) will be visible in any published photos. You may opt out of photo usage at any time by contacting us.
          </p>
        </div>

        {/* Website */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-brandRed">Website Use</h2>
          <p className="text-gray-200 leading-relaxed mb-4">When using our website, you agree to:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-200">
            <li>Use the website only for lawful purposes</li>
            <li>Provide accurate information when submitting forms or creating accounts</li>
            <li>Not attempt to access admin features or other users' data</li>
            <li>Not reproduce or distribute content from this website without permission</li>
          </ul>
        </div>

        {/* Governing Law */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-brandRed">Governing Law</h2>
          <p className="text-gray-200 leading-relaxed">
            These Terms of Service are governed by the laws of the State of Texas. Any disputes shall be resolved in the courts of Harris County, Texas.
          </p>
        </div>

        {/* Changes */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-brandRed">Changes to These Terms</h2>
          <p className="text-gray-200 leading-relaxed">
            We reserve the right to update these Terms of Service at any time. Changes will be effective immediately upon posting. Your continued use of our website or services constitutes acceptance of the updated terms.
          </p>
        </div>

        {/* Contact */}
        <div className="mb-10 bg-white/5 border-l-4 border-brandRed rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p className="text-gray-200 leading-relaxed mb-2">Questions about these Terms of Service? Contact us:</p>
          <ul className="text-gray-200 space-y-1">
            <li><strong>C.A.R.S. Collision & Refinish Shop</strong></li>
            <li>2530 Old Louetta Loop #114, Spring, TX 77388</li>
            <li>Phone: <a href="tel:8328853055" className="text-brandRed hover:underline">(832) 885-3055</a></li>
            <li>Email: <a href="mailto:carscollisionhouston@gmail.com" className="text-brandRed hover:underline">carscollisionhouston@gmail.com</a></li>
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-black/30 py-16 text-center px-6">
        <h2 className="text-2xl font-bold mb-4">Need a Repair Estimate?</h2>
        <p className="text-gray-300 mb-6 max-w-xl mx-auto">
          Contact us today for a free, no-obligation estimate on your collision repair needs.
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
