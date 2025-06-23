import { Helmet } from 'react-helmet-async';
import Logo from "../../assets/logo.png";

export default function ContactPage() {
  return (
    <>
      <Helmet>
        <title>Contact & Schedule | Collision & Refinish Shop</title>
        <meta
          name="description"
          content="Book your collision repair estimate or service appointment online. Call, email, or use our Calendly link to get started."
        />
      </Helmet>

      <div className="bg-white text-primary">
        {/* Header */}
        <section className="bg-primary text-white py-20 px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Schedule an Estimate</h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto">
            Book your estimate, drop-off, or repair appointment right here. No calls needed.
          </p>
        </section>

       {/* Contact Form + Info Side-by-Side */}
<section className="py-16 px-4 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
  {/* Form */}
  <form
    action="https://formspree.io/f/mdkzwdjg"
    method="POST"
    className="bg-white shadow-lg rounded-xl p-6 space-y-4"
  >
    <h2 className="text-3xl font-bold mb-4 text-center">Contact Us</h2>

    <div>
      <label className="block text-sm font-medium text-gray-700">Name</label>
      <input
        type="text"
        name="name"
        required
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700">Email</label>
      <input
        type="email"
        name="email"
        required
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700">Phone</label>
      <input
        type="tel"
        name="phone"
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700">Message</label>
      <textarea
        name="message"
        rows="5"
        required
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      ></textarea>
    </div>

    <button
      type="submit"
      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition"
    >
      Send Message
    </button>
  </form>

  {/* Contact Info */}
  <div className="bg-gray-100 rounded-xl shadow-md p-6 text-gray-800 space-y-4">
    <h2 className="text-2xl font-bold mb-2">Contact Information</h2>

    <p>📍 2530 Old Louetta Loop #114, Spring, TX 77388</p>
    <p>📞 <a href="tel:8328853055" className="text-blue-600 hover:underline">832-885-3055</a></p>
    <p>✉️ <a href="mailto:collisionandrefinishshop@gmail.com" className="text-blue-600 hover:underline">collisionandrefinishshop@gmail.com</a></p>
    <p>🕒 Mon–Fri: 9am–6pm</p>
    <p>🕒 Sat: 9am–1pm · Sun: Closed</p>

    <div className="mt-6 flex justify-center">
      <img src={Logo} alt="Logo" className="w-50 h-auto" />
    </div>
  </div>
</section>

        {/* Calendly Embed */}
        <section className="py-12 px-4 bg-accent">
          <h2 className="text-2xl font-bold text-center mb-6">Book an Appointment</h2>
          <div className="max-w-4xl mx-auto">
            <div className="aspect-w-16 aspect-h-9">
              <iframe
                src="https://calendly.com/collisionandrefinishshop"
                title="Schedule via Calendly"
                className="w-full h-[720px] border-none rounded shadow"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </section>

        {/* Optional FAQs */}
        <section className="py-16 px-4 max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-8 text-left text-sm md:text-base">
            <div>
              <h3 className="font-semibold mb-2">Do you work with my insurance?</h3>
              <p>Yes — we handle all communication with your adjuster and help streamline approvals.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">How long will repairs take?</h3>
              <p>It depends on parts availability and severity, but we keep you updated at every step.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Can I drop off after hours?</h3>
              <p>Yes! Just let us know and we’ll coordinate a safe drop-off time and instructions.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">What if I need help getting a rental?</h3>
              <p>We’ll work with your rental provider or help arrange a loaner when possible.</p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
