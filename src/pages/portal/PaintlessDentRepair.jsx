import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

export default function PaintlessDentRepair() {
  return (
    <div className="bg-gradient-to-br from-[#2c1b14] via-[#3e1f1c] to-black text-white min-h-screen py-20 px-4">
      <Helmet>
        <title>Paintless Dent Repair | C.A.R.S. Collision & Refinish</title>
        <meta name="description" content="Paintless Dent Repair in Spring TX – Restore your vehicle without repainting. Fast, affordable, and non-invasive dent removal at C.A.R.S. Collision & Refinish." />
      </Helmet>

      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-start">
        {/* TEXT COLUMN */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-10 text-gray-200 leading-relaxed"
        >
          <h1 className="text-4xl font-bold text-white">Paintless Dent Repair (PDR)</h1>

          <p>
            At C.A.R.S. Collision & Refinish, our paintless dent repair (PDR) service provides a fast, affordable, and non-invasive method of eliminating dents and dings from your vehicle’s surface. Unlike traditional bodywork that requires sanding, filling, and repainting, PDR works by gently massaging the metal back into place—preserving your factory finish while saving you time and money.
          </p>

          <p>
            Whether it’s a runaway shopping cart, a hailstorm, or a minor parking lot bump, dents can ruin the look of an otherwise clean vehicle. But not every dent requires paint or body filler. If the paint is still intact and the metal isn't overstretched, PDR may be the perfect solution.
          </p>

          <p>
            Our certified technicians use specialized tools and lighting systems to access the backside of the panel and apply precise pressure to restore the original shape. It's a skillful technique that requires training and patience—and we’ve mastered it.
          </p>

          <h2 className="text-2xl text-white font-semibold mt-6">Why Choose PDR Over Traditional Dent Repair?</h2>

          <ul className="list-disc list-inside pl-4 space-y-2">
            <li><strong>Preserves Your Factory Paint:</strong> No sanding, fillers, or paint involved—your original finish stays intact.</li>
            <li><strong>Faster Turnaround:</strong> Most PDR jobs are completed same-day, depending on severity and access.</li>
            <li><strong>Lower Cost:</strong> No repainting means less labor and material expense.</li>
            <li><strong>Eco-Friendly:</strong> No chemicals, paint, or solvents used.</li>
            <li><strong>Insurance Approved:</strong> Many insurance policies cover PDR for hail and minor impact damage.</li>
          </ul>

          <h2 className="text-2xl text-white font-semibold mt-6">When Is PDR an Option?</h2>

          <p>
            PDR is suitable for many types of dents and dings, but it's not a cure-all. Generally, the technique works best when:
          </p>

          <ul className="list-disc list-inside pl-4 space-y-2">
            <li>The dent is minor to moderate in size (usually less than 6 inches).</li>
            <li>The paint is not cracked or chipped in the affected area.</li>
            <li>The dent is not on a sharp body line or panel edge.</li>
            <li>There’s accessible space behind the panel to apply pressure.</li>
          </ul>

          <p>
            Don’t worry—we’ll inspect your damage and let you know if PDR is possible. If not, we’ll provide options for conventional repair methods.
          </p>

          <h2 className="text-2xl text-white font-semibold mt-6">Hail Damage Repair</h2>

          <p>
            Hailstorms are notorious for leaving vehicles covered in dozens of tiny dents. Paintless dent repair is ideal for repairing hail damage quickly and cost-effectively. We can work with your insurance company to assess the damage, approve the claim, and restore your vehicle with minimal disruption.
          </p>

          <h2 className="text-2xl text-white font-semibold mt-6">What Makes Our PDR Service Different?</h2>

          <p>
            At C.A.R.S., we’re not just a collision shop that offers PDR as an afterthought—we take it seriously. Our techs are trained in the art of precision dent removal and equipped with the latest PDR tools. We use LED reflection lights, metal picks, rods, and advanced glue-pulling techniques to access and massage every dent with care.
          </p>

          <p>
            We're also transparent—if we believe PDR won't give you the result you deserve, we’ll say so and offer a better solution. Honesty is a cornerstone of everything we do.
          </p>

          <h2 className="text-2xl text-white font-semibold mt-6">Free Estimates & Walk-Ins Welcome</h2>

          <p>
            We invite you to stop by our shop for a quick assessment. Many dents can be evaluated and repaired the same day. No appointment needed—just swing by and we’ll take a look.
          </p>

          <div className="flex flex-wrap gap-4 mt-6">
            <a href="/contact" className="bg-brandRed hover:bg-red-700 transition px-6 py-3 rounded text-white font-semibold">
              Request a Free Estimate
            </a>
            <a href="/repairgallery" className="bg-white hover:bg-gray-200 text-black px-6 py-3 rounded font-semibold">
              View Repair Gallery
            </a>
          </div>
        </motion.div>

        {/* VIDEO COLUMN */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="rounded-lg overflow-hidden shadow-xl bg-black"
        >
          <div className="aspect-[9/16]">
            <iframe
              src="https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F706074591835663%2F&show_text=false&width=267&t=0"
              className="w-full h-full"
              style={{ border: 'none', overflow: 'hidden' }}
              scrolling="no"
              frameBorder="0"
              allowFullScreen={true}
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            ></iframe>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
