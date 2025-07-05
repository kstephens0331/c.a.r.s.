import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

export default function Services() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2c1b14] via-[#3e1f1c] to-black text-white px-6 py-20">
      <Helmet>
        <title>Our Services | C.A.R.S. Collision & Refinish</title>
      </Helmet>

      <section className="max-w-5xl mx-auto text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Auto Body & Paint Services</h1>
        <p className="text-lg text-gray-300">
          At C.A.R.S. Collision & Refinish, we deliver expert results backed by decades of experience.
          Whether you’re dealing with collision damage, custom paint needs, or just want to upgrade your ride—
          our team brings it back better than before.
        </p>
      </section>

      <div className="max-w-6xl mx-auto space-y-14 text-gray-200 text-base leading-relaxed">
        <div>
          <h2 className="text-2xl font-semibold text-white mb-2">Collision Repair</h2>
          <p>
            From minor fender benders to full-frame structural repairs, we handle all levels of collision damage using OEM parts
            and manufacturer-approved procedures. Our team will document the damage, communicate with your insurance company,
            and provide photo updates every step of the way. When the repair is complete, your vehicle is restored to pre-accident condition—or better.
          </p>
          <Link to="/services/collision-repair" className="text-brandRed underline mt-2 inline-block">Learn more</Link>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-white mb-2">Paint & Refinish Services</h2>
          <p>
            We offer premium refinishing with computerized color-matching, OEM-grade paint systems, and downdraft bake booths for a flawless finish.
            Whether it’s a panel respray or full vehicle repaint, we eliminate overspray, match your factory color,
            and return your car with a showroom-quality finish.
          </p>
          <Link to="/services/paint-refinish" className="text-brandRed underline mt-2 inline-block">Learn more</Link>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-white mb-2">Custom Paint & Unique Projects</h2>
          <p>
            Got something that’s not a car? If it fits in our professional-grade paint booth, we can refinish it. That includes motorcycles,
            golf carts, trailers, signage, metal components, and custom body panels. Our paint specialists handle everything from restoration
            blends to full custom projects.
          </p>
          <Link to="/services/custom-paint" className="text-brandRed underline mt-2 inline-block">Learn more</Link>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-white mb-2">Paintless Dent Repair (PDR)</h2>
          <p>
            For minor dents and dings that haven’t cracked the paint, PDR offers a fast, affordable, and non-invasive solution.
            We gently massage dents out from the inside using specialized tools, preserving your vehicle’s factory finish.
          </p>
          <Link to="/services/paintless-dent-repair" className="text-brandRed underline mt-2 inline-block">Learn more</Link>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-white mb-2">Spray-In Bedliners & Accessories</h2>
          <p>
            Our rugged spray-in bedliners are chemical resistant, UV stable, and textured for grip.
            We also install tonneau covers, step rails, lighting kits, and custom body accessories.
            Everything is installed in-house with precision.
          </p>
          <Link to="/services/bedliners-accessories" className="text-brandRed underline mt-2 inline-block">Learn more</Link>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-white mb-2">Light Mechanical Repairs</h2>
          <p>
            In addition to collision work, we handle basic mechanical service including A/C repair, brakes,
            suspension checks, headlight restoration, and more. We can complete these repairs alongside your body work,
            saving time and extra trips to the mechanic.
          </p>
          <Link to="/services/light-mechanical" className="text-brandRed underline mt-2 inline-block">Learn more</Link>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-white mb-2">Serving Spring, TX and Surrounding Areas</h2>
          <p>
            Based in Spring, TX, we proudly serve drivers from Klein, The Woodlands, Tomball, and North Houston.
            We’re known for integrity, communication, and consistent results that speak for themselves.
            Our shop is locally owned and veteran-operated—your satisfaction is our mission.
          </p>
          <Link to="/contact" className="text-brandRed underline mt-2 inline-block">Schedule your estimate</Link>
        </div>
      </div>

      <div className="mt-16 text-center">
        <a
          href="/contact"
          className="inline-block bg-brandRed text-white px-6 py-3 rounded hover:bg-red-700 transition"
        >
          Request Estimate
        </a>
      </div>

      {/* Google Map Embed */}
      <div className="mt-20">
        <iframe
          title="CARS Location"
          src="https://www.google.com/maps?q=2530+Old+Louetta+Loop+%23114,+Spring,+TX+77388&output=embed"
          width="100%"
          height="400"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
        ></iframe>
        <div className="text-center mt-4">
          <a
            href="https://www.google.com/maps/dir/?api=1&destination=2530+Old+Louetta+Loop+%23114,+Spring,+TX+77388"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brandRed underline"
          >
            Show Directions
          </a>
        </div>
      </div>
    </div>
  );
}
