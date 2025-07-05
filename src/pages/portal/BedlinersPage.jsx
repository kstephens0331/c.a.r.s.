import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

export default function BedlinersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2c1b14] via-[#3e1f1c] to-black text-white px-4 py-20">
      <Helmet>
        <title>Spray-In Bedliners | C.A.R.S. Collision & Refinish</title>
        <meta
          name="description"
          content="Premium spray-in truck bedliners and accessory installs in Spring, TX. C.A.R.S. offers chemical-resistant, UV-stable, textured liners with lifetime performance."
        />
      </Helmet>

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-start">
        {/* LEFT: Content */}
        <div className="space-y-10 text-base text-gray-300 leading-relaxed">
          <motion.h1
            className="text-4xl font-bold text-white"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Spray-In Bedliners & Accessories
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            If you use your truck for work, hauling, or outdoor adventure, protecting the bed is essential.
            At C.A.R.S. Collision & Refinish, our premium spray-in bedliners aren’t just rugged—they’re designed
            to last for the lifetime of your vehicle. We use high-pressure, hot-spray polyurethane materials
            that form a watertight, textured, chemical-resistant barrier.
          </motion.p>

          <motion.div
            className="space-y-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ staggerChildren: 0.2 }}
            variants={{
              hidden: {},
              visible: {},
            }}
          >
            {[
              {
                title: 'Why Choose Spray-In Over Drop-In Liners?',
                content:
                  'Unlike cheap plastic drop-in liners that crack, shift, or trap moisture, spray-in liners are applied directly to the surface of your truck bed. This creates a perfect seal that protects against rust, corrosion, and abrasion. They’re quieter, more durable, and textured to prevent cargo from sliding around.',
              },
              {
                title: 'Custom Coverage for Every Vehicle',
                content:
                  'We apply spray-in liners to more than just truck beds. Fender flares, rockers, bumpers, interior cargo panels, wheel wells, and trailers can all benefit from the same protective coating. If it can be masked and sprayed—we can coat it.',
              },
              {
                title: 'UV Stability and Chemical Resistance',
                content:
                  'Our spray-on bedliners are UV-stable and colorfast, meaning they won’t fade, chalk, or crack even under the intense Texas sun. The surface resists gas, oil, salt, cleaning chemicals, fertilizer, and solvents, making it ideal for work trucks, ranch vehicles, and equipment haulers.',
              },
              {
                title: 'Textured Grip + Easy Cleaning',
                content:
                  'We texture each liner to provide the right balance between grip and easy clean-up. Dirt and mud rinse off easily, and the liner surface resists buildup or gunk—ideal for landscapers, contractors, mechanics, and weekend warriors alike.',
              },
              {
                title: 'Installed In-House by Professionals',
                content:
                  'Every liner is applied inside our shop using professional-grade equipment. We prep the surface, mask all lines, spray under high heat and pressure, and inspect for even coverage and proper thickness. Our process avoids common issues like overspray, undercut edges, or cracking.',
              },
              {
                title: 'Accessory Installs + Add-Ons',
                content:
                  'Looking to upgrade more than just your bed? We install a wide range of accessories including tonneau covers, step rails, toolbox systems, LED lighting kits, grille guards, and more. Whether it’s functional or aesthetic, our team installs it cleanly and securely.',
              },
              {
                title: 'Lifetime Durability',
                content:
                  'A properly applied spray-in bedliner doesn’t just protect—it extends the life of your truck. Scratches, gouges, corrosion, and chemical damage are virtually eliminated, and your bed retains higher resale value. We’ve applied liners to trucks that have lasted over a decade with no peeling, cracking, or failure.',
              },
              {
                title: 'Fast Turnaround + Scheduling',
                content:
                  'Bedliners are typically applied in a single day. Drop off in the morning and pick up in the afternoon. Need it done alongside body repairs or paintwork? We can schedule both together for maximum efficiency.',
              },
              {
                title: 'Locally Owned, Veteran Operated',
                content:
                  'We’re proud to be part of the Spring, TX community and even prouder to serve our customers with honesty and precision. Our veteran-operated team treats your truck like it’s our own—with craftsmanship you can count on.',
              },
            ].map((section, i) => (
              <motion.div
                key={i}
                className="space-y-2"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <h2 className="text-xl font-semibold text-white">{section.title}</h2>
                <p>{section.content}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="pt-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            viewport={{ once: true }}
          >
            <a
              href="/contact"
              className="inline-block bg-brandRed text-white px-6 py-3 rounded hover:bg-red-700 transition"
            >
              Schedule Your Bedliner Install
            </a>
          </motion.div>
        </div>

        {/* RIGHT: Embedded Video */}
        <motion.div
          className="aspect-[9/16] rounded-lg shadow-md overflow-hidden bg-black"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          <iframe
            src="https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F698341123083591%2F&show_text=false&width=267&t=0"
            width="100%"
            height="100%"
            loading="lazy"
            className="w-full h-full"
            style={{ border: 'none', overflow: 'hidden' }}
            scrolling="no"
            frameBorder="0"
            allowFullScreen
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          ></iframe>
        </motion.div>
      </div>
    </div>
  );
}
