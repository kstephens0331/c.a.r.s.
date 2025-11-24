import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

const iframe = "https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1070545104957849%2F&show_text=false&width=267&t=0";

export default function LightMechanicalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2c1b14] via-[#3e1f1c] to-black text-white py-20 px-6">
      <Helmet>
        <title>Light Mechanical Repairs | C.A.R.S. Collision & Refinish</title>
        <meta
          name="description"
          content="In-house light mechanical services in Spring, TX including A/C repair, brakes, suspension, diagnostics, and more. Streamlined with body work. Veteran-owned."
        />
      </Helmet>

      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-start">
        {/* LEFT TEXT CONTENT */}
        <div className="space-y-10 text-sm md:text-base text-gray-300 leading-relaxed">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h1 className="text-4xl font-bold text-white mb-4">
              Light Mechanical Services—Done In-House
            </h1>
            <p>
              At C.A.R.S. Collision & Refinish, we don’t just focus on bodywork. Our in-house team handles a wide range of light mechanical repairs so you can get everything done under one roof. Whether it’s A/C not blowing cold or a grinding noise in your brakes, we’ll diagnose the issue and fix it with care and precision. We use OEM-quality components, dealer-level scanners, and real-world experience to get it right the first time.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold text-white mb-2">What We Service</h2>
            <ul className="list-disc list-inside pl-4 space-y-2">
              <li>A/C diagnostics and repair</li>
              <li>Brake pad and rotor replacement</li>
              <li>Suspension checks (shocks, struts, bushings)</li>
              <li>Headlight bulb and lens replacement</li>
              <li>Wiper motor repair and washer systems</li>
              <li>Battery and alternator checks</li>
              <li>Drive belt and serpentine replacement</li>
              <li>Basic electrical diagnostics</li>
              <li>Fluid top-off and coolant leak detection</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold text-white mb-2">Streamlined with Your Collision Work</h2>
            <p>
              If your car is already in the shop for collision repair, this is the perfect time to get those nagging mechanical issues fixed. Our team coordinates repairs to save you time, money, and hassle—no second shop visit needed. We’ll handle both body and mechanical work in sync and deliver your vehicle fully road-ready.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold text-white mb-2">Local Trust, Veteran-Owned Values</h2>
            <p>
              Our Spring TX facility is trusted by thousands of local drivers. As a veteran-owned business, we believe in honesty, accountability, and getting the job done right. We won’t oversell you. If a repair isn’t needed, we’ll tell you. If it is—we’ll explain why and show you the issue.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold text-white mb-2">Convenient Scheduling and Walk-Ins</h2>
            <p>
              You don’t need an appointment to get a repair quote. Just stop by—we’ll take a look and get you an estimate, fast. If you're bringing your vehicle in for body work, just let us know what else it needs and we’ll add it to your work order.
            </p>
            <a
              href="/contact"
              className="inline-block mt-4 bg-brandRedDark text-white px-6 py-3 rounded hover:bg-red-700 transition"
            >
              Schedule or Get an Estimate
            </a>
          </motion.div>
        </div>

        {/* RIGHT VIDEO IFRAME */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="w-full max-w-md mx-auto shadow-lg rounded-lg overflow-hidden bg-black aspect-[9/16]"
        >
          <iframe
            src={iframe}
            width="100%"
            height="100%"
            loading="lazy"
            className="w-full h-full"
            style={{
              border: 'none',
              overflow: 'hidden',
            }}
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
