import { Link } from 'react-router-dom';
import Logo from '../../assets/logo-no-bg-gold.png';
import TonyImage from '../../assets/tony.png';
import BeforeImage from '../../assets/images/1000000697.jpg';
import AfterImage from '../../assets/images/1000000701.jpg';
import { Helmet } from 'react-helmet-async';
import { Wrench, Paintbrush, Truck, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import TestimonialSlider from '../../components/TestimonialSlider';

export default function Home() {
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  const services = [
    {
      icon: <Wrench size={32} className="text-brandRed mb-2" />,
      title: 'Collision Repairs – Insurance or Out-of-Pocket',
      desc:
        "Whether you're going through insurance or paying out of pocket, we’ll restore your vehicle with precision and care.",
      detail:
        'From dents and frame repair to panel replacement and paintless dent removal, our team handles it all using manufacturer specs.',
    },
    {
      icon: <Paintbrush size={32} className="text-brandRed mb-2" />,
      title: 'Paint & Refinishing',
      desc: 'Professionally matched finishes on vehicles, furniture, signage, and more.',
      detail:
        'We use computerized color matching and pro-grade refinishing techniques for a flawless result—if it fits in our booth, we’ll paint it.',
    },
    {
      icon: <Truck size={32} className="text-brandRed mb-2" />,
      title: 'Bedliners & Accessories',
      desc: 'Spray-in bedliners, toolboxes, light bars, and custom add-ons.',
      detail:
        'Protect your truck bed and outfit your vehicle with high-end accessories and hardware.',
    },
    {
      icon: <RefreshCw size={32} className="text-brandRed mb-2" />,
      title: 'Routine Maintenance',
      desc: 'Brakes, suspension, A/C, and oil service—all in one visit.',
      detail:
        'We cover the core systems that keep your vehicle safe, smooth, and reliable between major repairs.',
    },
  ];

  return (
    <div className="bg-site text-white relative overflow-hidden">
      <Helmet>
        <title>C.A.R.S Collision & Refinish | Home</title>
        <meta
          name="description"
          content="Veteran and family-owned. Quality repairs, honest work, and no surprises. Schedule your estimate or explore our services."
        />
      </Helmet>

      <section className="relative z-10 min-h-[85vh] flex flex-col justify-center items-center text-center px-4 py-20">
        <img
          src={Logo}
          alt="C.A.R.S Logo"
          className="w-64 md:w-80 h-auto mb-6 drop-shadow-xl animate-fade-in"
        />
        <h1 className="text-3xl md:text-4xl font-bold max-w-2xl mb-6 leading-snug">
          <span className="block animate-type">Trusted repairs. Industrial precision.</span>
          <span className="block animate-type2">Backed by craftsmanship and pride.</span>
        </h1>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            to="/contact"
            className="bg-brandRed text-white px-6 py-3 rounded font-semibold hover:bg-red-700 transition animate-fade-in"
          >
            Schedule Estimate
          </Link>
          <Link
            to="/collision-repair"
            className="border border-white px-6 py-3 rounded font-semibold hover:bg-white hover:text-black transition animate-fade-in"
          >
            View Services
          </Link>
        </div>
      </section>

      <div className="overflow-x-auto whitespace-nowrap py-3 px-4 text-center text-sm text-gray-300 border-y border-gray-600 animate-marquee">
        Family-Owned • Veteran Operated • No Surprises • Fast Turnaround • OEM Standards • Paint Matching • Local Trusted Experts
      </div>

      {/* What We Repair */}
      <section className="pt-16 pb-16 px-4 text-center">
        <h2 className="text-2xl font-bold mb-2" data-aos="fade-up">
          What We Repair
        </h2>
        <p
          className="text-sm text-gray-400 mb-8"
          data-aos="fade-up"
          data-aos-delay="100"
        >
          Click any service below to learn more.
        </p>

        <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {services.map((item, idx) => (
            <div
              key={idx}
              className={`border border-gray-600 rounded-xl p-6 text-left bg-[#2c1b14]/90 cursor-pointer shadow-lg hover:scale-[1.03] transition-transform duration-200 ${
                expanded === idx ? 'ring-2 ring-brandRed' : ''
              }`}
              onClick={() => setExpanded(expanded === idx ? null : idx)}
              data-aos="fade-up"
              data-aos-delay={idx * 100}
            >
              <div className="flex flex-col h-full justify-between">
                <div className="flex items-start gap-4 mb-2">
                  <div>{item.icon}</div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-200 leading-snug">{item.desc}</p>
                  </div>
                </div>

                {expanded === idx && (
                  <p className="text-sm text-gray-300 mt-2">{item.detail}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="pt-0 pb-20 px-4 text-center" data-aos="fade-up">
        <div className="flex flex-col md:flex-row gap-6 justify-center items-center max-w-5xl mx-auto">
          <div className="relative w-full md:w-1/2 group overflow-hidden rounded-xl shadow-lg">
            <img
              src={BeforeImage}
              alt="Before repair"
              className="w-full h-auto object-cover group-hover:opacity-0 transition duration-500"
            />
            <img
              src={AfterImage}
              alt="After repair"
              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition duration-500"
            />
            <span className="absolute top-2 left-2 bg-black/70 text-xs text-white px-2 py-1 rounded">
              Hover to Reveal
            </span>
          </div>
          <div className="max-w-2xl text-left px-2 md:px-0">
            <h3 className="text-2xl font-bold mb-4">
              Before & After — Real Collision Repair Results
            </h3>
            <p className="text-gray-300 leading-relaxed text-sm md:text-base mb-4">
              This is more than cosmetic work—it’s precision automotive restoration. At C.A.R.S. Collision & Refinish, we repair structural damage, blend factory-matched paint, and deliver OEM-level results. Our team follows manufacturer-approved repair procedures for every collision job, ensuring your car returns to the road looking and performing like it just left the showroom.
            </p>
            <p className="text-gray-300 leading-relaxed text-sm md:text-base mb-4">
              In this example, extensive damage was professionally corrected using high-quality materials and our downdraft paint booths. Whether you’re dealing with bumper scrapes, dented panels, or cracked body lines, we restore vehicles to pre-accident condition—or better. Our before-and-after transformations showcase what’s possible with expert attention to detail and commitment to craftsmanship.
            </p>
            <p className="text-gray-300 leading-relaxed text-sm md:text-base">
              Hover over the image to see the transition from damage to flawless finish. If you're ready to repair your vehicle, <Link to="/contact" className="text-brandRed underline hover:text-white">schedule your estimate now</Link> or <a href="tel:8328853055" className="text-brandRed underline hover:text-white">call us directly at (832) 885-3055</a>.
            </p>
          </div>
        </div>
      </section>

      <section>
        <TestimonialSlider />
      </section>

      <section className="pt-0 pb-16 px-6 text-center relative" data-aos="fade-up">
        <h2 className="text-2xl font-bold mb-6">Meet the Owner</h2>
        <div className="relative w-40 h-40 mx-auto mb-6 rounded-full overflow-hidden grayscale hover:grayscale-0 transition duration-500 shadow-lg">
          <img src={TonyImage} alt="Tony - Owner" className="w-full h-full object-cover" />
        </div>
        <p className="max-w-3xl mx-auto text-gray-200 text-lg leading-relaxed">
          “I started C.A.R.S. to bring honesty and precision back to collision
          repair. Whether you’re a first-time visitor or a long-time client, I
          want you to know that your vehicle is in the hands of people who care.”
        </p>
        <p className="mt-4 font-semibold text-brandRed">– Tony, Owner & Lead Technician</p>
      </section>

      <section className="pt-0 pb-24 text-center px-4" data-aos="fade-up">
        <h2 className="text-2xl font-bold mb-4">Need Help Now?</h2>
        <p className="mb-6">
          We’re ready to get you back on the road. Start your estimate or message our team now.
        </p>
        <Link
          to="/contact"
          className="bg-white text-black px-6 py-3 rounded font-semibold hover:bg-gray-200 transition"
        >
          Book My Estimate
        </Link>
      </section>

      <section className="pt-0 pb-20 px-4 text-center relative overflow-hidden" data-aos="fade-up">
        <h2 className="text-2xl font-bold mb-6 relative z-10">Find Us</h2>

        <div className="max-w-6xl mx-auto mb-4 relative z-10">
          <iframe
            title="C.A.R.S. Location Map"
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

        <p className="text-white text-sm mb-2 relative z-10">
          2530 Old Louetta Loop #114<br />Spring, TX 77388
        </p>

        <a
          href="https://www.google.com/maps/dir/?api=1&destination=2530+Old+Louetta+Loop+%23114%2C+Spring%2C+TX+77388"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-sm text-white underline hover:text-brandRed transition relative z-10"
        >
          Get Directions to C.A.R.S. Collision & Refinish Shop
        </a>

        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-[#2c1b14]/10 to-[#2c1b14] z-0" />
      </section>
    </div>
  );
}
