import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Logo from '../../assets/logo-no-bg-gold.png';

export default function AboutPage() {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  return (
    <div className="bg-gradient-to-br from-[#2c1b14] via-[#3e1f1c] to-black text-white overflow-x-hidden">
      <Helmet>
        <title>About Us | C.A.R.S. Collision & Refinish</title>
        <meta name="description" content="Learn about C.A.R.S. Collision & Refinish—your local expert for collision repair, refinishing, bedliners, and trusted auto service in Spring, TX." />
      </Helmet>

      <section className="text-center px-6 py-20">
        <img src={Logo} alt="C.A.R.S. Logo" className="w-32 mx-auto mb-6 animate-fade-in" />
        <h1 className="text-4xl font-bold mb-4" data-aos="fade-up">About C.A.R.S. Collision & Refinish</h1>
        <p className="max-w-3xl mx-auto text-lg text-gray-200 leading-relaxed" data-aos="fade-up">
          C.A.R.S. Collision & Refinish is a veteran-owned, family-operated auto repair and refinishing shop proudly serving Spring, TX and surrounding communities. With decades of combined experience, we specialize in full collision repair, custom refinishing, truck accessories, and mechanical services that go beyond what most body shops offer.
        </p>
      </section>

      <section className="px-6 py-16 max-w-6xl mx-auto grid md:grid-cols-2 gap-10 text-left">
        <div data-aos="fade-right">
          <h2 className="text-2xl font-semibold mb-4 text-brandRed">Our Mission</h2>
          <p className="text-gray-200 mb-4">
            Our mission is to restore more than vehicles—we restore trust in the repair process. We believe in honesty, high standards, and precision work. Whether it's insurance-based or out-of-pocket, every repair is done with manufacturer specifications, expert craftsmanship, and zero surprises.
          </p>
          <p className="text-gray-200">
            From paintless dent repair and frame correction to complete repainting and detailing, we provide results you’ll be proud of. Everything is managed in-house—from estimate to final inspection—by a team that treats your vehicle like their own.
          </p>
        </div>
        <div data-aos="fade-left">
          <h2 className="text-2xl font-semibold mb-4 text-brandRed">What We Offer</h2>
          <ul className="text-gray-200 list-disc pl-6 space-y-2">
            <li>Collision repair for all makes and models</li>
            <li>Full refinishing with color-matching</li>
            <li>Spray-in bedliners and truck outfitting</li>
            <li>Insurance handling & out-of-pocket options</li>
            <li>Routine maintenance: brakes, suspension, oil, A/C</li>
            <li>Furniture, equipment, and metal painting services</li>
          </ul>
        </div>
      </section>

      <section className="px-6 py-16 bg-black/10 text-center" data-aos="fade-up">
        <h2 className="text-2xl font-bold mb-6 text-brandRed">Service Areas</h2>
        <p className="max-w-4xl mx-auto text-gray-200">
          Based in Spring, TX, we proudly serve The Woodlands, Klein, Tomball, Cypress, Conroe, and surrounding areas across North Houston. We’re your neighborhood shop with a high-end finish, trusted by locals and known for real results.
        </p>
      </section>

      <section className="px-6 py-16 max-w-6xl mx-auto" data-aos="fade-up">
        <h2 className="text-2xl font-bold mb-6 text-center">Certifications & Milestones</h2>
        <div className="grid md:grid-cols-3 gap-8 text-left">
          <div>
            <h3 className="text-xl font-semibold mb-2 text-brandRed">Certified Technicians</h3>
            <p className="text-gray-200">Our team is I-CAR trained and ASE certified for both structural and non-structural repairs.</p>
          </div>
<div>
  <h3 className="text-xl font-semibold mb-2 text-brandRed">Proven Local Reputation</h3>
  <p className="text-gray-200">
    We’ve built our reputation one vehicle at a time—earning trust through consistent quality, clear communication, and honest pricing for every repair, big or small.
  </p>
</div>
          <div>
            <h3 className="text-xl font-semibold mb-2 text-brandRed">Veteran-Owned</h3>
            <p className="text-gray-200">We operate with discipline, precision, and integrity—values instilled through military service.</p>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 text-center" data-aos="fade-up">
        <h2 className="text-2xl font-bold mb-6">Shop Gallery & Work Samples</h2>
        <p className="max-w-3xl mx-auto text-gray-200 mb-6">
          Want to see what we’re capable of? Check out our real repair photos, before-and-after shots, and final finish examples. Every job is handled with pride and attention to detail.
        </p>
        <Link to="/repair-photos" className="inline-block bg-brandRed text-white px-6 py-3 rounded font-semibold hover:bg-red-700 transition">
          View Repair Gallery
        </Link>
      </section>

      <section className="px-6 py-20 bg-black/10 text-center" data-aos="fade-up">
        <h2 className="text-2xl font-bold mb-4">Where to Find Us</h2>
        <p className="mb-6 text-gray-200">
          Our shop is located in Spring, TX—easy to access and always ready to help.
        </p>
        <div className="max-w-5xl mx-auto mb-6">
          <iframe
            title="Google Map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3433.189927579634!2d-95.45707718487934!3d30.046324426142388!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8647310104e5a27f%3A0x93f2575ff554b20!2s2530%20Old%20Louetta%20Loop%20%23114%2C%20Spring%2C%20TX%2077388!5e0!3m2!1sen!2sus!4v1720000000000!5m2!1sen!2sus"
            width="100%"
            height="400"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="rounded-xl shadow-lg"
          ></iframe>
        </div>
        <a
          href="https://www.google.com/maps/dir/?api=1&destination=2530+Old+Louetta+Loop+%23114,+Spring,+TX+77388"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-sm text-white underline hover:text-brandRed transition"
        >
          Get Directions to Our Shop
        </a>
      </section>

      <section className="px-6 pb-24 text-center" data-aos="fade-up">
        <h2 className="text-2xl font-bold mb-4">Still Have Questions?</h2>
        <p className="mb-6 text-gray-200">Our team is happy to walk you through the repair process, review your insurance, or talk about your vehicle’s needs.</p>
        <Link to="/contact" className="bg-white text-black px-6 py-3 rounded font-semibold hover:bg-gray-200 transition">
          Contact Us
        </Link>
      </section>
    </div>
  );
}
