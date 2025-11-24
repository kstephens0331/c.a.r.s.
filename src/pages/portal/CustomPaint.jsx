import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

export default function CustomPaint() {
  return (
    <div className="bg-gradient-to-br from-[#2c1b14] via-[#3e1f1c] to-black text-white py-20 px-4">
      <Helmet>
        <title>Custom Paint & Specialty Refinishing | C.A.R.S. Collision & Refinish</title>
        <meta name="description" content="Custom paint services in Spring TX. From motorcycles to trailers, our expert refinishing delivers flawless, showroom-quality finishes for any project." />
      </Helmet>

      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-start">
        {/* LEFT: CONTENT */}
        <div className="space-y-10 text-sm md:text-base leading-relaxed text-gray-300">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Custom Paint & Specialty Refinishing</h1>
            <p>
              Not everything we paint has four doors and a VIN number. At C.A.R.S. Collision & Refinish, we bring
              the same precision, durability, and visual impact to everything from motorcycles and trailers to signage, sculptures, and custom metal parts.
              If it fits in our booth, we can refinish it to perfection.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="text-2xl font-bold text-white mb-2">The Process</h2>
            <p>
              We start with a deep clean and prep of the surface, followed by sanding, repair (if needed), and primer application.
              Using premium basecoat-clearcoat or single-stage systems, we deliver consistent, durable finishes that last. Whether it's gloss,
              matte, satin, or metallic flake, our experienced paint techs handle every layer with care and precision.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h2 className="text-2xl font-bold text-white mb-2">What We Paint</h2>
            <ul className="list-disc list-inside">
              <li>Motorcycles, fairings, tanks & frames</li>
              <li>Utility trailers, enclosed trailers, camper panels</li>
              <li>Golf carts, ATVs, and small off-road vehicles</li>
              <li>Toolboxes, signage, mailboxes, and custom decor</li>
              <li>Steel & aluminum parts, panels, gates, and fencing</li>
              <li>Hoods, bumpers, and aftermarket panels</li>
            </ul>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <h2 className="text-2xl font-bold text-white mb-2">Why It Matters</h2>
            <p>
              Custom paint is more than color—it’s identity. We’re passionate about delivering finishes that turn heads and
              last for years. Whether you need branding for your business or a deep gloss for your cruiser,
              we use premium products and equipment to get it right.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <h2 className="text-2xl font-bold text-white mb-2">Color Matching</h2>
            <p>
              We use computerized color systems for perfect matches on automotive or industrial shades. From OEM to custom
              hues, we mix in-house and run test panels to ensure accuracy. We can replicate nearly any color—even
              discontinued or specialty formulas.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <h2 className="text-2xl font-bold text-white mb-2">Durability You Can Count On</h2>
            <p>
              Every project is finished with professional-grade clear coats and cured in our downdraft bake booth for a long-lasting, chip-resistant result.
              Your project won’t just look good—it will hold up to sun, weather, use, and time.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
            <h2 className="text-2xl font-bold text-white mb-2">Need a Quote?</h2>
            <p className="mb-4">
              If you have something unique in mind or a surface that needs professional finishing, bring it by for a custom quote.
              You can also send pictures through our Contact form.
            </p>
            <a href="/contact" className="inline-block bg-brandRedDark text-white px-6 py-3 rounded hover:bg-red-700 transition">
              Request a Quote
            </a>
          </motion.div>
        </div>

        {/* RIGHT: VIDEO SAMPLE */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="relative aspect-[9/16] overflow-hidden rounded-lg shadow-lg bg-black">
            <iframe
              src="https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F698341123083591%2F&show_text=false&width=267&t=0"
              width="100%"
              height="100%"
              className="absolute inset-0 w-full h-full"
              style={{ border: 'none', overflow: 'hidden' }}
              scrolling="no"
              frameBorder="0"
              allowFullScreen
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              loading="lazy"
            ></iframe>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
