import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

const iframeSrc = "https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1070545104957849%2F&show_text=false&width=267&t=0";

const FadeInUp = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
    viewport={{ once: true }}
  >
    {children}
  </motion.div>
);

export default function PaintRefinishPage() {
  return (
    <div className="bg-gradient-to-br from-[#2c1b14] via-[#3e1f1c] to-black text-white min-h-screen py-20 px-6">
      <Helmet>
        <title>Paint & Refinish | C.A.R.S. Collision & Refinish</title>
      </Helmet>

      <div className="max-w-6xl mx-auto space-y-20">
        <FadeInUp>
          <section className="text-center mb-10">
            <h1 className="text-4xl font-bold mb-4">Professional Auto Paint & Refinish</h1>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto">
              A flawless finish. Precision-matched color. Zero overspray. Our Paint & Refinish department delivers showroom-level quality with every job—whether you’re touching up a panel, repairing a collision, or transforming a vehicle entirely.
            </p>
          </section>
        </FadeInUp>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* LEFT - Content */}
          <div className="space-y-10 text-sm md:text-base leading-relaxed text-gray-300">

            <FadeInUp delay={0.1}>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">High-End Refinish Capabilities</h2>
                <p>
                  At C.A.R.S., we operate a state-of-the-art downdraft bake booth that provides full environmental control for temperature, dust, and humidity—ensuring each coat cures perfectly. We use industry-leading brands like BASF, PPG, and Sherwin-Williams automotive lines depending on customer and insurance preference.
                </p>
              </div>
            </FadeInUp>

            <FadeInUp delay={0.2}>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">OEM Color Match Guarantee</h2>
                <p>
                  Our computerized color-matching system guarantees an exact match to your factory finish. Whether your vehicle is a 2023 F-150 or a 1990s import, we can replicate even difficult metallics, pearls, and tri-coats with remarkable accuracy.
                </p>
              </div>
            </FadeInUp>

            <FadeInUp delay={0.3}>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Beyond Cars: Full Booth Utility</h2>
                <p>
                  If it fits in our booth, we’ll paint it. From motorcycle tanks and fenders to golf carts, trailers, signage, or industrial frames—we bring that same perfectionist process to every surface. Restoration? Custom showpieces? We’ve got you covered.
                </p>
              </div>
            </FadeInUp>

            <FadeInUp delay={0.4}>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Paint Prep Matters</h2>
                <p>
                  A stunning finish starts long before paint. Our detail-focused prep process includes panel sanding, high-build primer, feathering, and degreasing—all done with precision and care. The result? No fisheyes, no orange peel, no waves—just a perfectly smooth finish.
                </p>
              </div>
            </FadeInUp>

            <FadeInUp delay={0.5}>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Insurance or Custom? We Handle Both.</h2>
                <p>
                  Whether you're repairing post-collision damage or investing in a full color change, our estimators walk you through every step. We document all work, offer multiple finish options (gloss, satin, matte), and provide photo updates during refinishing.
                </p>
              </div>
            </FadeInUp>

            <FadeInUp delay={0.6}>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Serving Spring and Beyond</h2>
                <p>
                  We proudly serve drivers from Spring, Klein, Tomball, The Woodlands, and the greater North Houston area. Our paint work turns heads on the freeway and earns trust in the neighborhood. Locally owned. Veteran operated. Quality guaranteed.
                </p>
              </div>
            </FadeInUp>

            <FadeInUp delay={0.7}>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Schedule or Estimate Your Refinish Project</h2>
                <p className="mb-4">
                  Ready to bring your vision to life? Whether it’s a repaint or an off-menu item you’d like coated, we’d love to help.
                </p>
                <div className="flex gap-4 flex-wrap">
                  <a href="/contact" className="bg-brandRedDark text-white px-5 py-3 rounded hover:bg-red-700 transition">Get an Estimate</a>
                  <a href="/contact" className="bg-white text-brandRed px-5 py-3 rounded hover:bg-gray-100 transition">Schedule Now</a>
                </div>
              </div>
            </FadeInUp>
          </div>

          {/* RIGHT - Iframe video */}
          <FadeInUp delay={0.3}>
            <div className="relative aspect-[9/16] overflow-hidden rounded-lg shadow-xl bg-black">
              <iframe
                src={iframeSrc}
                width="100%"
                height="100%"
                className="absolute inset-0 w-full h-full"
                loading="lazy"
                style={{ border: 'none', overflow: 'hidden' }}
                scrolling="no"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
          </FadeInUp>
        </div>
      </div>
    </div>
  );
}
