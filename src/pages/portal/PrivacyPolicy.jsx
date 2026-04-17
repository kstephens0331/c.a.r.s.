import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div className="bg-gradient-to-br from-[#2c1b14] via-[#3e1f1c] to-black text-white overflow-x-hidden">
      <Helmet>
        <title>Privacy Policy | C.A.R.S. Collision & Refinish</title>
        <meta name="description" content="Privacy Policy for C.A.R.S. Collision & Refinish Shop. Learn how we collect, use, and protect your personal information." />
      </Helmet>

      {/* Hero */}
      <section className="text-center px-6 py-20">
        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="max-w-3xl mx-auto text-lg text-gray-200 leading-relaxed">
          Your privacy matters to us. This policy explains how C.A.R.S. Collision & Refinish Shop collects, uses, and protects your personal information.
        </p>
      </section>

      {/* Content */}
      <section className="px-6 py-12 max-w-4xl mx-auto">
        <p className="text-sm text-gray-400 mb-10">Last updated: April 17, 2026</p>

        {/* Information We Collect */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-brandRed">Information We Collect</h2>
          <p className="text-gray-200 leading-relaxed mb-4">
            C.A.R.S. Collision & Refinish Shop ("we," "us," or "our") collects information that you voluntarily provide when you:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-200">
            <li>Submit a contact form or request an estimate on our website</li>
            <li>Create a customer portal account to track your vehicle repairs</li>
            <li>Call us to schedule an appointment or ask questions</li>
            <li>Email us at carscollisionhouston@gmail.com</li>
            <li>Apply for financing through Snap Finance</li>
            <li>Provide vehicle and insurance information for repair work</li>
          </ul>
          <p className="text-gray-200 leading-relaxed mt-4">
            This information may include your name, phone number, email address, mailing address, vehicle information (year, make, model, VIN, license plate), insurance details (company, policy number, claim number), and repair photos.
          </p>
        </div>

        {/* How We Use Your Information */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-brandRed">How We Use Your Information</h2>
          <p className="text-gray-200 leading-relaxed mb-4">
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-200">
            <li>Process your repair estimates and work orders</li>
            <li>Communicate repair status updates via email and SMS</li>
            <li>Coordinate with your insurance company on claims</li>
            <li>Provide access to your customer portal (repair tracking, photos, documents)</li>
            <li>Generate invoices, estimates, and work order documentation</li>
            <li>Send appointment reminders and follow-up communications</li>
            <li>Improve our website and customer experience</li>
            <li>Comply with legal obligations</li>
          </ul>
          <p className="text-gray-200 leading-relaxed mt-4">
            We do not sell, rent, or share your personal information with third parties for marketing purposes.
          </p>
        </div>

        {/* Vehicle and Repair Photos */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-brandRed">Vehicle and Repair Photos</h2>
          <p className="text-gray-200 leading-relaxed">
            During the repair process, we take photographs of your vehicle to document damage, track repair progress, and maintain quality records. These photos are stored securely and are accessible through your customer portal. Repair photos may be used in our gallery to showcase our work, but only with your consent and with no personally identifiable information attached.
          </p>
        </div>

        {/* Analytics */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-brandRed">Website Analytics</h2>
          <p className="text-gray-200 leading-relaxed mb-4">
            We use the following analytics services to understand how visitors use our website:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-200">
            <li><strong>Google Analytics 4 (GA4):</strong> Collects anonymous data about pages visited, time on site, and general geographic region. Loaded after page is interactive to avoid impacting performance.</li>
            <li><strong>Ahrefs Analytics:</strong> Monitors website performance and search visibility.</li>
            <li><strong>Sentry:</strong> Captures technical errors to help us improve website reliability. Error reports may include your browser type and the page you were visiting but do not contain personal information.</li>
          </ul>
        </div>

        {/* Third-Party Services */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-brandRed">Third-Party Services</h2>
          <p className="text-gray-200 leading-relaxed mb-4">
            Our website integrates with the following third-party services:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-200">
            <li><strong>Supabase:</strong> Database, authentication, and secure file storage for customer portal</li>
            <li><strong>Formspree:</strong> Contact form submission processing</li>
            <li><strong>Snap Finance:</strong> Financing application portal</li>
            <li><strong>Calendly:</strong> Online appointment scheduling</li>
            <li><strong>Google Maps:</strong> Location and directions</li>
            <li><strong>AWS SNS:</strong> SMS notifications for repair status updates</li>
            <li><strong>Resend:</strong> Email notifications for repair status updates</li>
          </ul>
          <p className="text-gray-200 leading-relaxed mt-4">
            Each of these services has its own privacy policy. We are not responsible for the privacy practices of third-party services.
          </p>
        </div>

        {/* Data Security */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-brandRed">Data Security</h2>
          <p className="text-gray-200 leading-relaxed">
            We take reasonable measures to protect your personal information. Our website uses HTTPS encryption. Customer portal access requires authentication. Database access is controlled by row-level security policies that ensure customers can only access their own data. However, no method of electronic storage or transmission is 100% secure.
          </p>
        </div>

        {/* Insurance Information */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-brandRed">Insurance Information</h2>
          <p className="text-gray-200 leading-relaxed">
            When processing insurance claims, we collect your insurance company name, policy number, claim number, and adjuster contact information. This information is used solely to coordinate your repair with your insurance provider. We share this information only with your designated insurance company and their authorized representatives as needed to process your claim.
          </p>
        </div>

        {/* Children's Privacy */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-brandRed">Children's Privacy</h2>
          <p className="text-gray-200 leading-relaxed">
            Our website and services are not directed to children under the age of 13. We do not knowingly collect personal information from children.
          </p>
        </div>

        {/* Your Rights */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-brandRed">Your Rights</h2>
          <p className="text-gray-200 leading-relaxed mb-4">You have the right to:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-200">
            <li>Request access to the personal information we hold about you</li>
            <li>Request correction of inaccurate information</li>
            <li>Request deletion of your personal information and customer portal account</li>
            <li>Opt out of SMS or email notifications</li>
          </ul>
          <p className="text-gray-200 leading-relaxed mt-4">
            To exercise any of these rights, contact us at carscollisionhouston@gmail.com or call (832) 885-3055.
          </p>
        </div>

        {/* Changes */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-brandRed">Changes to This Policy</h2>
          <p className="text-gray-200 leading-relaxed">
            We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated date.
          </p>
        </div>

        {/* Contact */}
        <div className="mb-10 bg-white/5 border-l-4 border-brandRed rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p className="text-gray-200 leading-relaxed mb-2">
            Questions about this Privacy Policy? Contact us:
          </p>
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
