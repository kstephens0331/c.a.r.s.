import { Helmet } from 'react-helmet-async';
import Before1 from '../../assets/images/1000000697.jpg';
import After1 from '../../assets/images/1000000701.jpg';
import Part1 from '../../assets/images/1000000794.jpg';
import Booth1 from '../../assets/images/1000000796.jpg';
import Panel1 from '../../assets/images/1000000934.jpg';
import Bed1 from '../../assets/images/1000001210.jpg';

import {
  Wrench,
  ShieldCheck,
  PackageSearch,
  Hammer,
  CarFront,
  Palette,
  Layers,
  Cpu
} from 'lucide-react';

export default function CollisionRepairPage() {
  return (
    <>
      <Helmet>
        <title>Collision Repair | C.A.R.S Collision & Refinish</title>
        <meta
          name="description"
          content="Explore our full-service collision repair offerings—from frame work to factory finish paint. We help with insurance, track progress online, and deliver results that exceed expectations."
        />
      </Helmet>

      {/* Hero */}
      <section
        className="relative bg-black text-white text-center py-20 px-6 animate-fade-in"
        style={{
          backgroundImage: 'url(../../assets/images/1000000701.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="bg-black bg-opacity-70 p-8 rounded max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Collision Repair Services</h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-300 mb-4">
            Built on precision, trust, and transparency. From major accidents to minor dents, we restore your vehicle with care.
          </p>
          <a
            href="/contact"
            className="inline-block mt-4 bg-white text-black px-6 py-3 rounded font-semibold hover:bg-gray-200 transition"
          >
            Schedule Your Estimate
          </a>
        </div>
      </section>

      {/* Why C.A.R.S. */}
      <section className="bg-white py-16 px-6 text-center">
        <h2 className="text-2xl font-bold mb-6">Why C.A.R.S. for Collision?</h2>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto text-gray-700 text-left">
          <div>
            <p><strong>✅ Transparent Quotes:</strong> Know what you’re paying for — no surprises.</p>
            <p><strong>📸 Photo Updates:</strong> Stay informed with regular progress photos.</p>
          </div>
          <div>
            <p><strong>🚗 Rental Coordination:</strong> We’ll help you stay mobile while we repair.</p>
            <p><strong>⚙️ Paint Match Guarantee:</strong> Factory-match refinishing for seamless repair.</p>
          </div>
        </div>
      </section>

      {/* Repair Process */}
      <section className="bg-gray-100 py-16 px-6 text-center">
        <h2 className="text-2xl font-bold mb-6">Our Collision Repair Process</h2>
        <div className="grid md:grid-cols-6 gap-6 max-w-6xl mx-auto text-sm text-gray-700">
          <div><strong>1. Intake</strong><br /> Drop off your vehicle or request pickup.</div>
          <div><strong>2. Estimate</strong><br /> We document all damage, inside and out.</div>
          <div><strong>3. Disassembly</strong><br /> Hidden damage? We find and confirm it.</div>
          <div><strong>4. Insurance Approval</strong><br /> We work directly with your provider.</div>
          <div><strong>5. Repair & Refinish</strong><br /> OEM fit, factory-matched color, precision work.</div>
          <div><strong>6. Inspection & Delivery</strong><br /> Final polish, customer review, and on your way.</div>
        </div>
      </section>

      {/* What We Offer */}
<section className="bg-white py-20 px-6">
  <h2 className="text-3xl font-bold text-center mb-12">What We Offer</h2>
  <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto text-gray-800">
    <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition">
      <Wrench className="w-8 h-8 mb-4 text-gray-600" />
      <h3 className="font-semibold text-lg mb-2">Frame Repair</h3>
      <p className="text-sm text-gray-600">Structural realignment for safety and precision.</p>
    </div>
    <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition">
      <ShieldCheck className="w-8 h-8 mb-4 text-gray-600" />
      <h3 className="font-semibold text-lg mb-2">Fender Replacement</h3>
      <p className="text-sm text-gray-600">Clean, seamless fit with panel and edge repair.</p>
    </div>
    <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition">
      <PackageSearch className="w-8 h-8 mb-4 text-gray-600" />
      <h3 className="font-semibold text-lg mb-2">OEM Part Matching</h3>
      <p className="text-sm text-gray-600">Factory-grade components. No cheap substitutes.</p>
    </div>
    <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition">
      <Hammer className="w-8 h-8 mb-4 text-gray-600" />
      <h3 className="font-semibold text-lg mb-2">Dent & Paint Correction</h3>
      <p className="text-sm text-gray-600">Panel perfection without overpainting.</p>
    </div>
    <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition">
      <CarFront className="w-8 h-8 mb-4 text-gray-600" />
      <h3 className="font-semibold text-lg mb-2">Bumper Restoration</h3>
      <p className="text-sm text-gray-600">Impact-absorbing restoration for safety and aesthetics.</p>
    </div>
    <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition">
      <Palette className="w-8 h-8 mb-4 text-gray-600" />
      <h3 className="font-semibold text-lg mb-2">Color Match Refinishing</h3>
      <p className="text-sm text-gray-600">Digitally matched blends with flawless finish.</p>
    </div>
    <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition">
      <Layers className="w-8 h-8 mb-4 text-gray-600" />
      <h3 className="font-semibold text-lg mb-2">Full Panel Rebuilds</h3>
      <p className="text-sm text-gray-600">Complete replacement + prep for major damage.</p>
    </div>
    <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition">
      <Cpu className="w-8 h-8 mb-4 text-gray-600" />
      <h3 className="font-semibold text-lg mb-2">Sensor & Light Replacement</h3>
      <p className="text-sm text-gray-600">Modern tech, factory-installed and calibrated.</p>
    </div>
  </div>
</section>

      {/* Before & After Slider */}
      <section className="bg-white py-16 px-6">
        <h2 className="text-2xl font-bold mb-10 text-center">Before & After Showcase</h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="flex flex-col gap-4">
            <img src={Before1} alt="Before - Disassembled vehicle" className="rounded shadow-md object-cover w-full h-80" />
            <img src={Part1} alt="Parts removed and staged" className="rounded shadow-md object-cover w-full h-80" />
            <img src={Panel1} alt="Body panel and paint match" className="rounded shadow-md object-cover w-full h-80" />
          </div>
          <div className="flex flex-col gap-4">
            <img src={After1} alt="After - Fully restored exterior" className="rounded shadow-md object-cover w-full h-80" />
            <img src={Booth1} alt="Freshly painted parts in booth" className="rounded shadow-md object-cover w-full h-80" />
            <img src={Bed1} alt="Bed repair and finish" className="rounded shadow-md object-cover w-full h-80" />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-16 px-6 text-center">
        <h2 className="text-2xl font-bold mb-6">What Our Customers Say</h2>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
          <blockquote className="bg-gray-100 rounded-lg p-6 shadow-sm">
            <p className="italic text-gray-700">
              “Tony and his team were fantastic in fixing my catering van. They gave updates and exceeded expectations.”
            </p>
            <footer className="mt-4 text-sm font-semibold text-brandRed">– Samuel B.</footer>
          </blockquote>
          <blockquote className="bg-gray-100 rounded-lg p-6 shadow-sm">
            <p className="italic text-gray-700">
              “He communicated every step and made the entire experience stress-free. The results speak for themselves.”
            </p>
            <footer className="mt-4 text-sm font-semibold text-brandRed">– Luis P.</footer>
          </blockquote>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-black text-white text-center py-16 px-6">
        <h2 className="text-2xl font-bold mb-4">Need Collision Repair?</h2>
        <p className="mb-6">Start with a free quote or message our team to ask a question. We’re here to help.</p>
        <a
          href="/contact"
          className="inline-block bg-white text-black px-6 py-3 rounded font-semibold hover:bg-gray-200 transition"
        >
          Request Estimate
        </a>
      </section>
    </>
  );
}
