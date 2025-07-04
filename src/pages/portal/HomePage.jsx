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
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-fade';
import { Autoplay, EffectFade } from 'swiper/modules';
import { ClipboardCheck, Car, FileText, CheckCircle, SprayCan, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';



export default function Home() {
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  const services = [
    {
      icon: <Wrench size={32} className="text-brandRed mb-2" />,
      title: 'Collision Repairs – Insurance or Out-of-Pocket',
      description:
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
          <span className="block animate-type2">
            Backed by craftsmanship and pride.
          </span>
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

      <section className="pt-16 pb-16 px-4 text-center">
        <h2 className="text-2xl font-bold mb-8" data-aos="fade-up">What We Repair</h2>
        <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {services.map((item, idx) => (
            <div
              key={idx}
              className="border border-gray-600 rounded-xl p-6 text-left bg-white/5 backdrop-blur-md hover:scale-[1.03] transition duration-300 cursor-pointer shadow-lg"
              onClick={() => setExpanded(expanded === idx ? null : idx)}
              data-aos="fade-up"
              data-aos-delay={idx * 100}
            >
              <div className="flex items-start gap-4">
                <div>{item.icon}</div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-200 leading-snug">{item.desc}</p>
                  {expanded === idx && (
                    <p className="text-sm text-gray-300 mt-2 transition-all duration-300 ease-in-out">
                      {item.detail}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

<section className="relative py-28 text-center" id="how-it-works">
  <h2 className="text-3xl font-bold mb-20 text-white">How It Works</h2>

  {/* Glowing Red Line */}
  <div className="absolute top-1/2 left-0 right-0 h-1 bg-red-600 shadow-[0_0_15px_6px_rgba(255,0,0,0.5)] z-0 rounded-full" />

  {/* Cars Positioned on the Line */}
  <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-7 gap-2 px-4">
    {[
      {
        label: 'Estimate',
        desc: 'No appointment needed. We’ll assess the damage and give you a clear estimate.',
      },
      {
        label: 'Drop-Off',
        desc: 'Quick check-in and we’ll get your repair started. We can help with rental coordination too.',
      },
      {
        label: 'Disassembly',
        desc: 'We fully disassemble affected areas to reveal hidden damage and finalize parts needed.',
      },
      {
        label: 'Updated Estimate',
        desc: 'Your updated estimate is submitted for approval—always with transparency.',
      },
      {
        label: 'Authorization',
        desc: 'Once approved, we order parts and move your vehicle into the workflow for immediate repair.',
      },
      {
        label: 'Repairs Begin',
        desc: 'Certified technicians perform frame, body, and paint work to OEM spec.',
      },
      {
        label: 'Final Inspection',
        desc: 'We clean, test, and document before handing the keys back—better than new.',
      },
    ].map((step, i) => (
      <div key={i} className="flex flex-col items-center relative group">
        {/* Car Icon on the Line */}
        <div className="relative -mb-5 z-10">
          <div className="relative flex items-center justify-center w-10 h-10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="black"
              viewBox="0 0 24 24"
              stroke="white"
              strokeWidth="1.5"
              className="w-8 h-8 drop-shadow-md"
            >
              <path d="M3 13l2-5h14l2 5M5 13v4m14-4v4M8 17h0m8 0h0M7 8h10" />
            </svg>
            <span className="absolute text-[10px] text-white font-bold top-0 right-0 bg-brandRed w-4 h-4 rounded-full flex items-center justify-center">
              {i + 1}
            </span>
          </div>
        </div>

        {/* Label */}
        <p className="text-xs font-semibold text-white mt-6">{step.label}</p>

        {/* Hover Bubble */}
        <div className="absolute bottom-[-100%] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="bg-white text-black text-xs rounded-md shadow-lg p-3 w-48">
            {step.desc}
          </div>
        </div>
      </div>
    ))}
  </div>
</section>


      <section className="pt-0 pb-20 px-4 text-center" data-aos="fade-up">
        <h2 className="text-2xl font-bold mb-6">Before & After</h2>
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
          <div className="max-w-md text-left">
            <h3 className="text-xl font-semibold mb-2">See the Transformation</h3>
            <p className="text-gray-300">
              From dents and damage to flawless finish—our team delivers results
              that speak for themselves. Hover to see the before-and-after difference.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 text-center" data-aos="fade-up">
        <h2 className="text-2xl font-bold mb-10">What Our Customers Say</h2>
        <Swiper
          spaceBetween={30}
          slidesPerView={1}
          autoplay={{ delay: 5000 }}
          effect="fade"
          loop={true}
        >
          {[
            "I recently had the pleasure of working with C.A.R.S. Collision, and I can't recommend them highly enough!",
            "Originally I was going to get my service done at Caliber Collision, but a buddy recommended Tony...",
            "Had my 2018 GMC Terrain serviced for rear suspension. Tony personally worked on it..."
          ].map((text, index) => (
            <SwiperSlide key={index}>
              <div className="max-w-3xl mx-auto bg-white/5 backdrop-blur-md p-6 rounded-lg shadow-lg">
                <p className="italic text-gray-200">“{text}”</p>
                <footer className="mt-4 text-sm font-semibold text-brandRed">– Customer</footer>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
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
        <p className="mt-4 font-semibold text-brandRed">
          – Tony, Owner & Lead Technician
        </p>
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
