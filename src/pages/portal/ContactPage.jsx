import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function ContactPage() {
  const [openFAQ, setOpenFAQ] = useState(null);

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const faqs = [
    {
      question: 'Do I need an appointment for an estimate?',
      answer:
        'Appointments are preferred but not required. You’re welcome to walk in during business hours, or schedule ahead using our embedded calendar below.',
    },
    {
      question: 'Can you work with my insurance?',
      answer:
        'Yes, we work with all major insurance providers. We can assist with documentation, supplements, and photo proof throughout the repair process.',
    },
    {
      question: 'What if I want to pay out of pocket?',
      answer:
        'No problem at all. We’ll provide an honest estimate and work within your budget. No pressure, no upselling.',
    },
    {
      question: 'Do you only paint cars?',
      answer:
        'Nope. If it fits in our booth, we’ll paint it. That includes motorcycles, golf carts, signs, metal parts, even small trailers.',
    },
    {
      question: 'How long do repairs usually take?',
      answer:
        'Timeframes vary by job, but we’ll give you an accurate turnaround estimate upfront—and keep you updated throughout. Many jobs are completed in just a few days.',
    },
    {
      question: 'Do you offer spray-in bedliners?',
      answer:
        'Yes, we install rugged spray-in bedliners that are UV-stable and resistant to scratches, oil, and chemicals. Ask us about color options too.',
    },
    {
      question: 'Where are you located?',
      answer:
        'We’re located at 2530 Old Louetta Loop #114, Spring, TX 77388. You can get directions using the map below.',
    },
    {
      question: 'What are your business hours?',
      answer:
        'We’re open Monday through Friday from 8am to 6pm. Saturday appointments available upon request.',
    },
    {
      question: 'What services do you offer?',
      answer:
        'We handle collision repair, refinishing, dent removal, custom paint, spray-in bedliners, mechanical work (A/C, brakes, etc.), and more.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2c1b14] via-[#3e1f1c] to-black text-white px-4 py-20">
      <Helmet>
        <title>Contact Us | C.A.R.S. Collision & Refinish</title>
      </Helmet>

      <section className="max-w-6xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-center">Contact Us</h1>
        <p className="text-center max-w-2xl mx-auto text-gray-300 mb-10">
          Whether you need an estimate, want to schedule an appointment, or just have a few questions—our team is here to help. Call us at{' '}
          <a href="tel:8328853055" className="text-brandRed hover:underline font-medium">832-885-3055</a>{' '}
          or use the form below to get started.
        </p>

        <div className="grid md:grid-cols-2 gap-12 mb-20">
          <form
            action="https://formspree.io/f/mdkzwdjg"
            method="POST"
            className="space-y-6"
          >
            <input type="text" name="name" placeholder="Your Name" required className="w-full bg-[#1a1a1a] text-white px-4 py-3 rounded" />
            <input type="email" name="email" placeholder="Your Email" required className="w-full bg-[#1a1a1a] text-white px-4 py-3 rounded" />
            <textarea name="message" placeholder="Message" rows="5" required className="w-full bg-[#1a1a1a] text-white px-4 py-3 rounded" />
            <button type="submit" className="bg-brandRed px-6 py-3 rounded text-white hover:bg-red-700 transition">
              Send Message
            </button>
          </form>

          <div className="space-y-4 text-sm text-gray-300">
            <p><strong>📍 Address:</strong> 2530 Old Louetta Loop #114, Spring, TX 77388</p>
            <p><strong>📞 Phone:</strong> <a href="tel:8328853055" className="text-brandRed hover:underline">832-885-3055</a></p>
            <p><strong>📧 Email:</strong> <a href="mailto:carscollisionhouston@gmail.com" className="text-brandRed hover:underline">carscollisionhouston@gmail.com</a></p>
            <p><strong>🕐 Hours:</strong> Mon–Fri: 8am – 6pm, Sat by appt.</p>
          </div>
        </div>

        {/* Calendly Embed */}
        <div className="mb-20">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center">Schedule an Appointment</h2>
          <div className="overflow-hidden rounded-lg shadow-lg">
            <iframe
              src="https://calendly.com/collisionandrefinishshop"
              width="100%"
              height="700"
              frameBorder="0"
              scrolling="no"
              title="Schedule with Calendly"
              className="w-full rounded-md min-h-[500px] md:min-h-[700px]"
            ></iframe>
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-[#1f1f1f] rounded-lg shadow-md transition-all duration-300"
              >
                <button
                  onClick={() => toggleFAQ(i)}
                  className="w-full flex justify-between items-center px-6 py-4 text-left"
                >
                  <span className="text-lg font-medium text-white">{faq.question}</span>
                  <ChevronDown
                    className={`transform transition-transform duration-300 ${
                      openFAQ === i ? 'rotate-180' : ''
                    } text-brandRed`}
                  />
                </button>
                {openFAQ === i && (
                  <div className="px-6 pb-4 text-gray-300">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <section className="bg-white py-16 px-6 text-center">
  <h2 className="text-2xl font-bold mb-6">Financing Available</h2>
  <a
    href="https://snapf.in/Iqkca1U"
    target="_blank"
    rel="noopener noreferrer"
  >
    <img
      src="https://merchant-banners-s3.snapfinance.com/Loans/EN/A160x600.jpeg"
      alt="Snap Finance - Apply Here"
      style={{ boxShadow: '4px 2px 6px #010101', border: 'none' }}
      className="mx-auto rounded-lg"
    />
  </a>
</section>

        {/* Map */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold mb-4 text-center">Find Us</h2>
          <div className="overflow-hidden rounded-lg shadow-lg">
            <iframe
              src="https://www.google.com/maps?q=2530+Old+Louetta+Loop+%23114,+Spring,+TX+77388&output=embed"
              width="100%"
              height="400"
              loading="lazy"
              className="w-full rounded-md"
              allowFullScreen
              title="Map to C.A.R.S."
            ></iframe>
          </div>
          <div className="text-center mt-4">
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=2530+Old+Louetta+Loop+%23114,+Spring,+TX+77388"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 bg-brandRed text-white px-6 py-3 rounded hover:bg-red-700 transition"
            >
              Get Directions
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
