import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

export default function CollisionRepair() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2c1b14] via-[#3e1f1c] to-black text-white py-20 px-6">
      <Helmet>
        <title>Collision Repair | C.A.R.S. Collision & Refinish</title>
        <meta
          name="description"
          content="Trusted collision repair in Spring, TX. OEM parts, structural repairs, and seamless insurance coordination at C.A.R.S. Collision & Refinish."
        />
      </Helmet>

      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-5xl mx-auto mb-16 text-center"
      >
        <h1 className="text-4xl font-bold mb-4">Collision Repair Services</h1>
        <p className="text-lg text-gray-300">
          From minor scrapes to full structural realignments, C.A.R.S. Collision & Refinish is your trusted destination for
          top-tier collision repair in Spring, TX and surrounding areas. We restore your vehicle to pre-accident condition—safely,
          correctly, and with full transparency.
        </p>
      </motion.section>

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 1 }}
        className="flex flex-col lg:flex-row gap-10 max-w-7xl mx-auto items-start"
      >
        {/* LEFT COLUMN: LONG SEO CONTENT */}
        <div className="space-y-14 text-base leading-relaxed text-gray-300 w-full lg:w-1/2">
          <p>
            At C.A.R.S. Collision & Refinish, we specialize in complete collision repair—from small fender benders to severe structural
            frame damage. Our certified technicians use OEM replacement parts and manufacturer-approved methods to ensure the integrity,
            performance, and safety of your vehicle is fully restored. Every step of our process is built on transparency, quality, and care.
          </p>
          <p>
            We begin by carefully assessing the damage, documenting each component with photo evidence for you and your insurance provider.
            Whether it's a dented bumper, a crumpled quarter panel, or a compromised unibody, we handle all levels of repair with attention
            to structural accuracy. With computerized measuring systems and laser-guided frame alignment tools, we restore your vehicle
            precisely to factory specifications.
          </p>
          <p>
            Our facility includes dedicated teardown bays, modern welding stations, and a secure staging area for vehicles awaiting parts.
            We keep you updated with photos and progress reports throughout the repair process. Communication matters—and we never leave
            customers wondering what's next.
          </p>
          <p>
            If you’re going through insurance, we coordinate directly with your adjuster and provide all documentation needed to expedite
            approval. If you’re paying out-of-pocket, we offer fair pricing and flexible options without compromising on results. Your safety
            and satisfaction come first.
          </p>
          <p>
            After structural and body repairs are complete, your vehicle is prepped for refinishing in our downdraft paint booth.
            We use OEM-grade paint materials and color-matching technology to restore your vehicle’s appearance perfectly—whether it’s a subtle
            blend or a complete panel repaint.
          </p>
          <p>
            Our team understands that your vehicle represents your freedom, your livelihood, and your safety. That’s why we treat every repair
            with the same care we’d expect for our own families. When you pick up your car from C.A.R.S., it’s more than just fixed—it’s
            restored with pride.
          </p>
          <p>
            Proudly serving Spring, TX, The Woodlands, Klein, and North Houston, we’re a veteran-owned business committed to integrity,
            precision, and top-tier results. Come see why so many local drivers trust C.A.R.S. for all their collision repair needs.
          </p>

          <div className="flex gap-4 flex-wrap mt-6">
            <a
              href="/contact"
              className="bg-brandRed hover:bg-red-700 text-white px-6 py-3 rounded shadow transition"
            >
              Get an Estimate
            </a>
            <a
              href="/contact"
              className="border border-white text-white px-6 py-3 rounded hover:bg-white hover:text-black transition"
            >
              Schedule a Repair
            </a>
          </div>
        </div>

        {/* RIGHT COLUMN: VIDEO */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7, duration: 1 }}
          className="w-full lg:w-1/2"
        >
          <div className="aspect-[9/16] rounded-lg overflow-hidden shadow-lg bg-black">
            <iframe
              src="https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1070545104957849%2F&show_text=false&width=267&t=0"
              width="100%"
              height="100%"
              className="w-full h-full"
              loading="lazy"
              style={{ border: 'none', overflow: 'hidden' }}
              scrolling="no"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </div>
        </motion.div>
      </motion.section>

      {/* MAP SECTION - EMBED ONLY */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="mt-24 max-w-5xl mx-auto"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Visit Our Shop</h2>
        <p className="text-center text-gray-400 mb-4">
          2530 Old Louetta Loop #114, Spring, TX 77388
        </p>
        <div className="flex justify-center mb-6">
          <a
            href="https://www.google.com/maps/dir/?api=1&destination=2530+Old+Louetta+Loop+%23114,+Spring,+TX+77388"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-brandRed px-5 py-2 text-white rounded hover:bg-red-700 transition"
          >
            Show Directions
          </a>
        </div>
        <div className="rounded-lg overflow-hidden shadow-lg h-80">
          <iframe
            title="Shop Map"
            className="w-full h-full"
            frameBorder="0"
            scrolling="no"
            marginHeight="0"
            marginWidth="0"
            loading="lazy"
            src="https://maps.google.com/maps?q=2530%20Old%20Louetta%20Loop%20%23114%2C%20Spring%2C%20TX%2077388&t=&z=15&ie=UTF8&iwloc=&output=embed"
          ></iframe>
        </div>
      </motion.div>
    </div>
  );
}
