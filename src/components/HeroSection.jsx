import { Link } from 'react-router-dom';
import logo from '../assets/logo-no-bg-gold.png';

export default function HeroSection() {
  return (
    <section className="relative w-full min-h-[90vh] bg-gradient-to-br from-[#2c1b14] via-[#3e1f1c] to-black text-[#f8f1e7] flex flex-col items-center justify-center text-center px-6 py-20">
      {/* Background Texture Overlay (Optional) */}
      <div className="absolute inset-0 bg-[url('/textures/rust-grain.png')] bg-cover bg-center opacity-10 pointer-events-none z-0" />

      {/* Logo */}
      <img
        src={logo}
        alt="C.A.R.S Logo"
        className="relative z-10 w-48 md:w-64 mb-6 drop-shadow-xl"
      />

      {/* Headline */}
      <h1 className="relative z-10 text-4xl md:text-6xl font-extrabold tracking-wide mb-4">
        C.A.R.S COLLISION & REFINISH
      </h1>

      {/* Tagline */}
      <p className="relative z-10 text-lg md:text-xl max-w-xl mx-auto mb-8 text-[#e8ded5]">
        Trusted repairs. Industrial precision. Backed by real craftsmanship and pride.
      </p>

      {/* CTA Buttons */}
      <div className="relative z-10 flex flex-wrap justify-center gap-4">
        <Link
          to="/contact"
          className="bg-red-700 hover:bg-red-800 text-white px-6 py-3 rounded font-semibold shadow-lg transition"
        >
          Schedule Estimate
        </Link>
        <Link
          to="/collision-repair"
          className="border border-white text-white hover:text-black hover:bg-white px-6 py-3 rounded font-semibold transition"
        >
          View Services
        </Link>
      </div>
    </section>
  );
}