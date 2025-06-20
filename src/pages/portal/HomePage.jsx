import { Link } from 'react-router-dom';
import TonyImage from '../../assets/tony.png';
import { Helmet } from 'react-helmet-async';
import { Wrench, Paintbrush, Truck, RefreshCw, Disc3, Zap, MoveDiagonal, Snowflake } from 'lucide-react';
import { useState } from 'react';

export default function Home() {
  const [expanded, setExpanded] = useState(null);

  const services = [
    {
      icon: <Wrench size={32} className="text-brandRed mb-2" />,
      title: 'Collision Damage',
      desc: 'Bumper-to-bumper collision repair with insurance coordination.',
      detail: 'From dents and frame repair to panel replacement, our team handles it all using manufacturer specs.'
    },
    {
      icon: <Paintbrush size={32} className="text-brandRed mb-2" />,
      title: 'Paint & Refinishing',
      desc: 'Factory-matched paint, flawless clear coat, and custom finishes.',
      detail: 'We use computerized color matching and pro-grade refinishing techniques for a seamless look.'
    },
    {
      icon: <Truck size={32} className="text-brandRed mb-2" />,
      title: 'Bedliners & Accessories',
      desc: 'Spray-in bedliners, toolboxes, light bars, and custom add-ons.',
      detail: 'Protect your truck bed and outfit your vehicle with high-end accessories and hardware.'
    },
    {
      icon: <RefreshCw size={32} className="text-brandRed mb-2" />,
      title: 'Routine Maintenance',
      desc: 'Oil changes, fluid services, belts, hoses, and inspections.',
      detail: 'Quick, efficient service to keep your vehicle running strong between major repairs.'
    },
    {
      icon: <Disc3 size={32} className="text-brandRed mb-2" />,
      title: 'Brake Services',
      desc: 'Pad and rotor replacement, fluid flushes, and diagnostics.',
      detail: 'Feel confident with full-service brake repairs and detailed safety inspections.'
    },
    {
      icon: <Zap size={32} className="text-brandRed mb-2" />,
      title: 'Diagnostics & Electrical',
      desc: 'Battery, alternator, lighting, sensor, and check engine issues.',
      detail: 'Our diagnostic tools read all makes/models for fast electrical troubleshooting and repair.'
    },
    {
      icon: <MoveDiagonal size={32} className="text-brandRed mb-2" />,
      title: 'Suspension & Steering',
      desc: 'Shocks, struts, alignments, control arms, and bushings.',
      detail: 'We repair handling issues and ride comfort with precision suspension work.'
    },
    {
      icon: <Snowflake size={32} className="text-brandRed mb-2" />,
      title: 'A/C & Heating',
      desc: 'Recharge, compressor repair, and airflow optimization.',
      detail: 'Stay comfortable year-round with A/C diagnostics, fixes, and heating repair.'
    }
  ];

  const testimonials = [
    {
      name: 'Samuel B',
      text: "I recently had the pleasure of working with C.A.R.S. Collision, and I can't recommend them highly enough! Tony and his team were absolutely fantastic in fixing my catering van after it sustained some damage. The turnaround time for the repairs was impressive, and the final results exceeded my expectations. The attention to detail and craftsmanship truly stand out."
    },
    {
      name: 'Luis P',
      text: "Originally I was going to get my service done at Caliber Collision, but a buddy recommended Tony. I'm truly so glad I did. He communicated every step and sent daily updates with photos. The process was smooth and exceeded expectations."
    },
    {
      name: 'Kyle S',
      text: "Had my 2018 GMC Terrain serviced for rear suspension. Tony personally worked on it and kept me updated the whole time. The transparency, pricing, and workmanship were top notch. The car looks better than factory condition now."
    }
  ];

  return (
    <>
      <Helmet>
        <title>C.A.R.S Collision & Refinish | Home</title>
        <meta
          name="description"
          content="Veteran and family-owned. Quality repairs, honest work, and no surprises. Schedule your estimate or explore our services."
        />
      </Helmet>

       <section className="relative w-full h-[60vh] overflow-hidden text-white">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover"
        >
          <source src="/videos/1000000665.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-black bg-opacity-30 z-10" />
        <div className="relative z-20 flex flex-col items-center justify-center h-[60vh] text-center px-4 bg-black bg-opacity-40 rounded-md p-6 backdrop-blur-sm">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Collision & Refinish Experts</h1>
          <p className="text-lg mb-6">Veteran and family-owned. Quality repairs, honest work, and no surprises.</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link to="/contact" className="bg-white text-black px-6 py-3 rounded font-semibold hover:bg-gray-200 transition">
              Schedule Estimate
            </Link>
            <Link to="/collision-repair" className="bg-brandRed text-white px-6 py-3 rounded font-semibold hover:bg-red-700 transition">
              View Services
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 text-center bg-gray-50">
        <h2 className="text-2xl font-bold mb-8">What We Repair</h2>
        <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {services.map((item, idx) => (
            <div
              key={idx}
              className="bg-white border rounded-xl shadow-sm p-6 text-left hover:shadow-md transition duration-300 cursor-pointer"
              onClick={() => setExpanded(expanded === idx ? null : idx)}
            >
              <div className="flex items-start gap-4">
                <div>{item.icon}</div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-600 leading-snug">{item.desc}</p>
                  {expanded === idx && (
                    <p className="text-sm text-gray-500 mt-2 transition-all duration-300 ease-in-out">
                      {item.detail}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-16 px-6 text-center">
  <h2 className="text-2xl font-bold mb-10">What Our Customers Say</h2>
  <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
    {testimonials.map((review, index) => (
      <div
        key={index}
        className="bg-gray-100 rounded-lg p-6 shadow-sm transform transition duration-500 hover:scale-105 hover:shadow-md"
      >
        <p className="italic text-gray-700">“{review.text}”</p>
        <footer className="mt-4 text-sm font-semibold text-brandRed">– {review.name}</footer>
      </div>
    ))}
  </div>
  <div className="mt-12">
    <a
      href="https://www.google.com/search?sca_esv=c00251c694cd13aa&si=AMgyJEtREmoPL4P1I5IDCfuA8gybfVI2d5Uj7QMwYCZHKDZ-E4uMOPX7uMabRXTvbiHEpRIC9mHHHPeo8CFKMDxQ3SgmeG01cRumP7mCaARimdsMBUzTJsfJ2bVEliNW0EVuhmVZ1A-BF12rTJAAc89od6x-Pemd--Wik_v7Xl1BzvalEwKODqw%3D&q=C.A.R.S+collision+and+refinish+shop+Reviews&sa=X&ved=2ahUKEwilu6Lmh_uNAxVmL0QIHREqMgoQ0bkNegQIJRAE&biw=1920&bih=945&dpr=1"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block bg-brandRed text-white px-6 py-3 rounded font-semibold hover:bg-red-700 transition"
    >
      Leave a Review
    </a>
  </div>
</section>

      <section className="bg-gray-100 py-16 px-4 text-center">
  <h2 className="text-2xl font-bold mb-10">How It Works</h2>
  <p className="max-w-2xl mx-auto mb-10 text-gray-700 text-base">
    Whether you're a walk-in customer or referred through insurance, our process is fast and easy. You or a C.A.R.S. technician can load your vehicle details directly into our system. From there, you can track your repairs online, receive updates, and stay informed every step of the way.
  </p>
        <div className="flex flex-col md:flex-row justify-center items-center gap-8 max-w-5xl mx-auto">
          {['Get a Free Estimate', 'Approve & Schedule', 'Track Repairs Online', 'Pick Up & Drive'].map((step, i) => (
            <div key={i} className="flex flex-col items-center max-w-[180px]">
              <div className="w-12 h-12 rounded-full bg-brandRed text-white font-bold flex items-center justify-center mb-2">
                {i + 1}
              </div>
              <p className="text-sm font-semibold text-gray-700">{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-16 px-6 text-center">
  <h2 className="text-2xl font-bold mb-6">Meet the Owner</h2>
  <img src={TonyImage} alt="Tony - Owner" className="w-40 h-40 object-cover rounded-full mx-auto mb-6 shadow-md" />
        <p className="max-w-3xl mx-auto text-gray-700 text-lg leading-relaxed">
          “I started C.A.R.S. to bring honesty and precision back to collision repair. Whether you’re a first-time visitor or a long-time client, I want you to know that your vehicle is in the hands of people who care.”
        </p>
        <p className="mt-4 font-semibold text-brandRed">– Tony, Owner & Lead Technician</p>
      </section>

      <section className="bg-black text-white text-center py-16 px-4">
        <h2 className="text-2xl font-bold mb-4">Need Help Now?</h2>
        <p className="mb-6">We’re ready to get you back on the road. Start your estimate or message our team now.</p>
        <Link to="/contact" className="bg-white text-black px-6 py-3 rounded font-semibold hover:bg-gray-200 transition">
          Book My Estimate
        </Link>
      </section>
    </>
  );
}
