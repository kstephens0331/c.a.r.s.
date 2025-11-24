import { Helmet } from 'react-helmet-async';

export default function FinancingPage() {
  return (
    <>
      <Helmet>
        <title>Financing | C.A.R.S Collision & Refinish Shop</title>
        <meta
          name="description"
          content="Flexible financing options with Snap Finance to make auto repairs affordable and stress-free."
        />
      </Helmet>

      {/* Hero Section with Gradient Overlay */}
      <section className="relative text-center py-16 px-6 bg-gradient-to-b from-gray-900/70 to-transparent">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-white drop-shadow-lg">Financing Options</h1>
        <p className="max-w-3xl mx-auto text-lg text-gray-100 mb-4 drop-shadow-md">
          We've partnered with Snap Finance to provide flexible financing for your repairs.
          Apply today and get back on the road with confidence.
        </p>
        <p className="max-w-2xl mx-auto text-base text-gray-200 drop-shadow-md">
          Get approved for up to <span className="font-bold text-green-400">$5,000</span> in minutes, regardless of your credit score.
        </p>
      </section>

      {/* Benefits Section */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Benefit 1 */}
          <div className="bg-white/60 backdrop-blur-md p-6 rounded-lg shadow-lg text-center border border-white/30">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">Quick Approval</h3>
            <p className="text-gray-800">
              Get a decision in minutes, not days. Apply online or in-store with just a few simple steps.
            </p>
          </div>

          {/* Benefit 2 */}
          <div className="bg-white/60 backdrop-blur-md p-6 rounded-lg shadow-lg text-center border border-white/30">
            <div className="text-4xl mb-4">💳</div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">Flexible Payments</h3>
            <p className="text-gray-800">
              Choose a payment plan that works for your budget. No hidden fees or surprises.
            </p>
          </div>

          {/* Benefit 3 */}
          <div className="bg-white/60 backdrop-blur-md p-6 rounded-lg shadow-lg text-center border border-white/30">
            <div className="text-4xl mb-4">✅</div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">Bad Credit? No Problem</h3>
            <p className="text-gray-800">
              Snap Finance considers more than just your credit score. Get approved even with less-than-perfect credit.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white/60 backdrop-blur-md p-6 md:p-8 rounded-lg shadow-lg mb-12 border border-white/30">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-900">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-brandRedDark text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 text-xl font-bold">1</div>
              <h4 className="font-semibold mb-2 text-gray-900">Apply Online</h4>
              <p className="text-sm text-gray-800">Click the banner below or visit snapfinance.com</p>
            </div>
            <div className="text-center">
              <div className="bg-brandRedDark text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 text-xl font-bold">2</div>
              <h4 className="font-semibold mb-2 text-gray-900">Get Approved</h4>
              <p className="text-sm text-gray-800">Receive a decision in minutes, up to $5,000</p>
            </div>
            <div className="text-center">
              <div className="bg-brandRedDark text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 text-xl font-bold">3</div>
              <h4 className="font-semibold mb-2 text-gray-900">Schedule Service</h4>
              <p className="text-sm text-gray-800">Bring your vehicle in for the repairs you need</p>
            </div>
            <div className="text-center">
              <div className="bg-brandRedDark text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 text-xl font-bold">4</div>
              <h4 className="font-semibold mb-2 text-gray-900">Pay Over Time</h4>
              <p className="text-sm text-gray-800">Make affordable payments that fit your budget</p>
            </div>
          </div>
        </div>

        {/* Apply Now Section */}
        <div className="bg-white/60 backdrop-blur-md p-6 md:p-8 rounded-lg shadow-xl text-center border border-white/30">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900">Ready to Get Started?</h2>
          <p className="text-lg text-gray-800 mb-6">
            Click below to apply with Snap Finance and get approved in minutes.
          </p>
          <a
            href="https://snapf.in/Iqkca1U"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
          >
            <img
              src="https://merchant-banners-s3.snapfinance.com/Loans/EN/A160x600.jpeg"
              alt="Snap Finance - Apply Here"
              style={{ boxShadow: '4px 2px 6px #010101', border: 'none' }}
              className="mx-auto rounded-lg hover:scale-105 transition-transform duration-300"
            />
          </a>
          <p className="text-sm text-gray-700 mt-6">
            Questions? Call us at <a href="tel:832-885-3055" className="text-brandRed hover:underline font-semibold">832-885-3055</a> or visit our shop.
          </p>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 bg-white/60 backdrop-blur-md p-8 rounded-lg shadow-lg border border-white/30">
          <h2 className="text-3xl font-bold mb-6 text-center text-gray-900">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-lg text-gray-900 mb-2">What do I need to apply?</h4>
              <p className="text-gray-800">
                You'll need a valid ID, checking account, phone number, and a steady source of income. The entire application takes just a few minutes.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-lg text-gray-900 mb-2">Will this affect my credit score?</h4>
              <p className="text-gray-800">
                Snap Finance does not perform a hard credit check during the application process, so applying won't hurt your credit score.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-lg text-gray-900 mb-2">How much can I finance?</h4>
              <p className="text-gray-800">
                You can be approved for up to $5,000, depending on your qualifications. Most collision repairs fall within this range.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-lg text-gray-900 mb-2">How long do I have to pay it back?</h4>
              <p className="text-gray-800">
                Snap Finance offers flexible payment plans. The exact terms will be provided during your approval process.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}