import { Helmet } from 'react-helmet-async';

export default function AboutPage() {
  return (
    <>
      <Helmet>
        <title>About | Collision & Refinish Shop</title>
        <meta
          name="description"
          content="Learn about our story, values, and why we're trusted by drivers across Spring, TX."
        />
      </Helmet>

      <div className="bg-white text-primary">
        {/* Header */}
        <section className="bg-primary text-white py-20 px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Us</h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto">
            Veteran & family-owned. Built on honesty, craftsmanship, and a passion for getting you back on the road — safely and quickly.
          </p>
        </section>

        {/* Our Story */}
        <section className="py-16 px-4 max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Our Story</h2>
          <p className="mb-6">
            Collision and Refinish Shop was born from a commitment to do things right. After years in the industry, we saw the gaps — shady shops, poor communication, rushed repairs. So we decided to build the opposite.
          </p>
          <p>
            Today, we operate with military-grade precision and a customer-first mindset. Whether it’s restoring your vehicle after a collision or adding a custom bedliner, we deliver top-quality work with full transparency.
          </p>
        </section>

        {/* Our Promise */}
        <section className="bg-accent py-16 px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">What You Can Expect</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto text-left">
            <div>
              <h3 className="text-xl font-semibold mb-2">Integrity</h3>
              <p>No upsells, no pressure. Just honest work and clear communication at every step.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Precision</h3>
              <p>From insurance claims to paint match — we sweat every detail so you don’t have to.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Respect</h3>
              <p>We treat your car like it’s ours — because we know how much it matters to you.</p>
            </div>
          </div>
        </section>

        {/* Visit Us */}
        <section className="py-16 px-4 max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Visit Our Shop</h2>
          <p className="mb-4">
            📍 2530 Old Louetta Loop #114, Spring, TX 77388  
          </p>
          <p className="mb-2">📞 832-885-3055</p>
          <p className="mb-2">✉️ collisionandrefinishshop@gmail.com</p>
          <p>Mon–Fri: 9am–6pm · Sat: 9am–1pm · Sun: Closed</p>
        </section>
      </div>
    </>
  );
}
