import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Paintbrush, Wrench, Camera, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const iframes = [
  "https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F698341123083591%2F&show_text=false&width=267&t=0",
  "https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1070545104957849%2F&show_text=false&width=267&t=0",
  "https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2F61565873026881%2Fvideos%2F1425835415229456%2F&show_text=false&width=267&t=0",
  "https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F612963948577555%2F&show_text=false&width=267&t=0",
  "https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F676994771956665%2F&show_text=false&width=267&t=0",
  "https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F706074591835663%2F&show_text=false&width=267&t=0",
  "https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1325162185442282%2F&show_text=false&width=267&t=0",
  "https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F10098478310175227%2F&show_text=false&width=267&t=0",
  "https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1208566310993338%2F&show_text=false&width=267&t=0"
];

export default function RepairGallery() {
  const [loaded, setLoaded] = useState([]);

  useEffect(() => {
    setLoaded(Array(iframes.length).fill(false));
  }, []);

  const handleLoad = (index) => {
    setLoaded((prev) => {
      const updated = [...prev];
      updated[index] = true;
      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2c1b14] via-[#3e1f1c] to-black text-white py-20 px-4">
      <Helmet>
        <title>Repair Gallery | C.A.R.S. Collision & Refinish</title>
      </Helmet>

  <section className="max-w-5xl mx-auto px-4 py-12 text-center">
  <h1 className="text-3xl md:text-4xl font-bold mb-4">Craftsmanship You Can See</h1>
  <p className="text-lg text-gray-300">
    From twisted metal to factory-fresh finishes, this gallery captures the transformation behind every repair. 
    Our video reels showcase real work on real vehicles—completed by skilled technicians right here in Spring, TX. 
    Whether it’s a fender bender or a full respray, you’ll see why so many drivers trust C.A.R.S. Collision & Refinish.
  </p>
</section>

      <div className="flex justify-center gap-6 mb-10 text-brandRed text-sm">
        <button className="flex items-center gap-2 hover:text-white transition"><Wrench size={18} />Collision</button>
        <button className="flex items-center gap-2 hover:text-white transition"><Paintbrush size={18} />Painting</button>
        <button className="flex items-center gap-2 hover:text-white transition"><RefreshCw size={18} />Maintenance</button>
        <button className="flex items-center gap-2 hover:text-white transition"><Camera size={18} />All</button>
      </div>

      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-start">
        {/* LEFT COLUMN */}
        <div className="space-y-16 text-sm md:text-base leading-relaxed text-gray-300">
          {[
            {
              title: "Collision Repair Done Right",
              text: "From light panel damage to full-frame realignment, we restore your vehicle using OEM parts, factory weld points, and manufacturer-certified procedures. Our skilled team has experience across all makes and models, ensuring your vehicle not only looks perfect—but performs like it should after any accident."
            },
            {
              title: "Paint & Refinishing",
              text: "We use advanced refinishing systems with climate-controlled booths, laser color matching, and premium-grade urethane clearcoats. Whether you're covering a scratch, blending panels, or fully respraying a vehicle—we make sure the finish is flawless and built to last."
            },
            {
              title: "Precision Paint Matching—For More Than Just Cars",
              text: "We can paint anything that fits in our booth—from motorcycles and wheels to trailers, furniture, or commercial signage. If you need industrial-grade coatings or specialty paint projects, our team has the tools and experience to deliver perfect results."
            },
            {
              title: "Serving the Greater Spring Area",
              text: "Our shop proudly serves Spring, Klein, The Woodlands, Tomball, and North Houston. Local drivers count on us for quality work, transparent pricing, and fast turnaround—every time."
            },
            {
              title: "Insurance & Self-Pay Options",
              text: "We’ll guide you through the insurance claim process or work with you directly for out-of-pocket repairs. Either way, we offer honest pricing, photos throughout the job, and full documentation for your peace of mind."
            },
            {
              title: "More Than Just Body Work",
              text: "We also offer light mechanical service, brake jobs, A/C repair, headlight restoration, and bedliner installs. Want to upgrade with custom accessories or get a bumper replacement? We've got you covered."
            },
            {
              title: "Why Customers Choose Us",
              text: "We’re veteran-owned and locally trusted. You’ll never deal with sales pressure—just real service from real people. Our customers stick with us because we deliver what we promise and treat every vehicle like our own."
            },
            {
              title: "Let’s Get You Back on the Road",
              text: "Need an estimate? Stop by anytime—walk-ins welcome. We’ll take a look, answer your questions, and often start same-day. We make the process easy, start to finish.",
              button: true
            }
          ].map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.5 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold text-white">{section.title}</h2>
              <p>{section.text}</p>
              {section.button && (
                <a
                  href="/contact"
                  className="inline-block mt-2 bg-brandRedDark text-white px-6 py-3 rounded hover:bg-red-700 transition"
                >
                  Get an Estimate
                </a>
              )}
            </motion.div>
          ))}
        </div>

        {/* RIGHT COLUMN: VIDEOS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {iframes.map((src, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative aspect-[9/16] overflow-hidden rounded-lg shadow-md bg-black"
            >
              <iframe
                src={src}
                width="100%"
                height="100%"
                loading="lazy"
                className="absolute inset-0 w-full h-full"
                style={{
                  border: 'none',
                  overflow: 'hidden'
                }}
                scrolling="no"
                frameBorder="0"
                allowFullScreen
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                onLoad={() => handleLoad(index)}
              ></iframe>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
