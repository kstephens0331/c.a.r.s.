import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const insuranceCompanies = [
  'State Farm', 'GEICO', 'Progressive', 'Allstate', 'USAA',
  'Liberty Mutual', 'Nationwide', 'Farmers', 'Travelers', 'American Family',
  'Erie Insurance', 'Auto-Owners', 'Hartford', 'MetLife', 'Safeco',
  'Mercury', 'Shelter', 'Texas Farm Bureau', 'Other'
];

export default function InsuranceClaimPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    fetch('https://formspree.io/f/mdkzwdjg', {
      method: 'POST',
      body: formData,
      headers: { 'Accept': 'application/json' }
    }).then(res => {
      if (res.ok) {
        setSubmitted(true);
        form.reset();
      }
    });
  };

  return (
    <div className="bg-gradient-to-br from-[#2c1b14] via-[#3e1f1c] to-black text-white overflow-x-hidden">
      <Helmet>
        <title>Insurance Claim | C.A.R.S. Collision & Refinish | Spring TX</title>
        <meta name="description" content="Submit your insurance claim information to C.A.R.S. Collision & Refinish Shop. We work with all major insurance carriers to get your vehicle repaired quickly." />
      </Helmet>

      {/* Hero */}
      <section className="text-center px-6 py-20">
        <h1 className="text-4xl font-bold mb-4">Insurance Claim Intake</h1>
        <p className="max-w-3xl mx-auto text-lg text-gray-200 leading-relaxed">
          We work with all major insurance carriers. Submit your claim details below and our team will coordinate directly with your insurance company to get your repair started as quickly as possible.
        </p>
      </section>

      {/* Form Section */}
      <section className="px-6 py-12 max-w-4xl mx-auto">
        {submitted ? (
          <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-green-400 mb-4">Claim Submitted Successfully</h2>
            <p className="text-gray-200 mb-6">
              Thank you for submitting your insurance claim information. Our team will review your details and contact you within 1 business day to schedule your estimate.
            </p>
            <Link
              to="/"
              className="bg-brandRedDark text-white px-8 py-3 rounded hover:bg-red-700 transition font-semibold inline-block"
            >
              Back to Home
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Hidden field for form type */}
            <input type="hidden" name="_subject" value="New Insurance Claim Submission" />

            {/* Insurance Information */}
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-brandRed">Insurance Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Insurance Company *</label>
                  <select name="insurance_company" required className="w-full bg-[#1a1a1a] text-white px-4 py-3 rounded border border-gray-700 focus:border-brandRed focus:outline-none">
                    <option value="">Select your insurance company</option>
                    {insuranceCompanies.map(company => (
                      <option key={company} value={company}>{company}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Policy Number *</label>
                  <input type="text" name="policy_number" required placeholder="e.g. POL-123456789" className="w-full bg-[#1a1a1a] text-white px-4 py-3 rounded border border-gray-700 focus:border-brandRed focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Claim Number (if assigned)</label>
                  <input type="text" name="claim_number" placeholder="e.g. CLM-987654321" className="w-full bg-[#1a1a1a] text-white px-4 py-3 rounded border border-gray-700 focus:border-brandRed focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Date of Loss *</label>
                  <input type="date" name="date_of_loss" required className="w-full bg-[#1a1a1a] text-white px-4 py-3 rounded border border-gray-700 focus:border-brandRed focus:outline-none" />
                </div>
              </div>
            </div>

            {/* Adjuster Information */}
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-brandRed">Adjuster Information (if available)</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Adjuster Name</label>
                  <input type="text" name="adjuster_name" placeholder="Adjuster's full name" className="w-full bg-[#1a1a1a] text-white px-4 py-3 rounded border border-gray-700 focus:border-brandRed focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Adjuster Phone</label>
                  <input type="tel" name="adjuster_phone" placeholder="(XXX) XXX-XXXX" className="w-full bg-[#1a1a1a] text-white px-4 py-3 rounded border border-gray-700 focus:border-brandRed focus:outline-none" />
                </div>
              </div>
            </div>

            {/* Vehicle Information */}
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-brandRed">Vehicle Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Year *</label>
                  <input type="number" name="vehicle_year" required min="1990" max="2027" placeholder="e.g. 2022" className="w-full bg-[#1a1a1a] text-white px-4 py-3 rounded border border-gray-700 focus:border-brandRed focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Make *</label>
                  <input type="text" name="vehicle_make" required placeholder="e.g. Toyota" className="w-full bg-[#1a1a1a] text-white px-4 py-3 rounded border border-gray-700 focus:border-brandRed focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Model *</label>
                  <input type="text" name="vehicle_model" required placeholder="e.g. Camry" className="w-full bg-[#1a1a1a] text-white px-4 py-3 rounded border border-gray-700 focus:border-brandRed focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Color</label>
                  <input type="text" name="vehicle_color" placeholder="e.g. Silver" className="w-full bg-[#1a1a1a] text-white px-4 py-3 rounded border border-gray-700 focus:border-brandRed focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">VIN (if available)</label>
                  <input type="text" name="vin" placeholder="17-character VIN" maxLength="17" className="w-full bg-[#1a1a1a] text-white px-4 py-3 rounded border border-gray-700 focus:border-brandRed focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">License Plate</label>
                  <input type="text" name="license_plate" placeholder="e.g. ABC-1234" className="w-full bg-[#1a1a1a] text-white px-4 py-3 rounded border border-gray-700 focus:border-brandRed focus:outline-none" />
                </div>
              </div>
            </div>

            {/* Your Contact Info */}
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-brandRed">Your Contact Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Full Name *</label>
                  <input type="text" name="name" required placeholder="Your full name" className="w-full bg-[#1a1a1a] text-white px-4 py-3 rounded border border-gray-700 focus:border-brandRed focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Phone Number *</label>
                  <input type="tel" name="phone" required placeholder="(XXX) XXX-XXXX" className="w-full bg-[#1a1a1a] text-white px-4 py-3 rounded border border-gray-700 focus:border-brandRed focus:outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-300 mb-1">Email *</label>
                  <input type="email" name="email" required placeholder="your@email.com" className="w-full bg-[#1a1a1a] text-white px-4 py-3 rounded border border-gray-700 focus:border-brandRed focus:outline-none" />
                </div>
              </div>
            </div>

            {/* Damage Description */}
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-brandRed">Damage Description</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Describe the damage *</label>
                  <textarea name="damage_description" required rows="4" placeholder="Describe the damage to your vehicle, how the incident occurred, and any other relevant details..." className="w-full bg-[#1a1a1a] text-white px-4 py-3 rounded border border-gray-700 focus:border-brandRed focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Is the vehicle drivable?</label>
                  <select name="vehicle_drivable" className="w-full bg-[#1a1a1a] text-white px-4 py-3 rounded border border-gray-700 focus:border-brandRed focus:outline-none">
                    <option value="yes">Yes, the vehicle is drivable</option>
                    <option value="no">No, the vehicle is not drivable</option>
                    <option value="unsure">Not sure</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Preferred contact method</label>
                  <select name="preferred_contact" className="w-full bg-[#1a1a1a] text-white px-4 py-3 rounded border border-gray-700 focus:border-brandRed focus:outline-none">
                    <option value="phone">Phone call</option>
                    <option value="text">Text message</option>
                    <option value="email">Email</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="text-center pt-4">
              <button
                type="submit"
                className="bg-brandRedDark text-white px-12 py-4 rounded text-lg hover:bg-red-700 transition font-semibold"
              >
                Submit Insurance Claim
              </button>
              <p className="text-gray-400 text-sm mt-4">
                We will contact you within 1 business day to schedule your estimate.
              </p>
            </div>
          </form>
        )}
      </section>

      {/* Info Section */}
      <section className="px-6 py-16 bg-black/30">
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8 text-center">
          <div>
            <h3 className="text-xl font-semibold text-brandRed mb-2">All Insurance Accepted</h3>
            <p className="text-gray-300 text-sm">We work with every major insurance carrier in Texas. No matter who you are insured with, we can handle your claim.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-brandRed mb-2">Direct Coordination</h3>
            <p className="text-gray-300 text-sm">We handle all communication with your insurance adjuster, supplements, and approvals so you do not have to.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-brandRed mb-2">Free Estimates</h3>
            <p className="text-gray-300 text-sm">All estimates are free of charge. We will provide a detailed breakdown of the repairs needed for your vehicle.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
