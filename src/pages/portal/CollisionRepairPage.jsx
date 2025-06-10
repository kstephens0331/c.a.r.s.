import { Helmet } from 'react-helmet-async';

export default function CollisionRepairPage() {
  return (
    <>
      <Helmet>
        <title>Collision Repair Services | Spring, TX</title>
        <meta
          name="description"
          content="OEM-quality auto body repair, insurance coordination, and expert refinishing in Spring, TX. Veteran & family-owned."
        />
      </Helmet>

      <div className="bg-white text-primary">
        {/* Header */}
        <section className="bg-primary text-white py-20 px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Collision Repair Services</h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto">
            Full-service auto body repair done right — no shortcuts, no surprises. From dents to major damage, we restore vehicles to pre-accident condition and keep you informed at every step.
          </p>
        </section>

        {/* What We Handle */}
        <section className="py-16 px-4 max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">What We Handle</h2>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div>
              <h3 className="text-xl font-semibold mb-2">Frame & Structural Repair</h3>
              <p>We use advanced measurement systems to restore factory specs, ensuring strength, alignment, and safety.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Dent & Panel Work</h3>
              <p>From hail damage to door dings, we expertly repair or replace panels for a seamless finish.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">OEM Color Match Paint</h3>
              <p>Our computerized paint system guarantees a perfect color match — no blotches, no fade lines.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Insurance Claims Assistance</h3>
              <p>We coordinate directly with your insurance company to streamline approvals and reduce your stress.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Glass & Trim Replacement</h3>
              <p>Broken windows, cracked mirrors, damaged bumpers — we restore them all with factory-quality replacements.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Lifetime Workmanship Guarantee</h3>
              <p>If something isn’t right, we make it right. Our repairs are built to last — and we stand behind them.</p>
            </div>
          </div>
        </section>

        {/* Process Overview */}
        <section className="bg-accent py-16 px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Our Repair Process</h2>
          <ol className="max-w-3xl mx-auto text-left space-y-4 list-decimal list-inside text-sm md:text-base">
            <li><strong>Estimate & Scheduling:</strong> Get a clear quote and pick a repair date.</li>
            <li><strong>Insurance Coordination:</strong> We work with your adjuster to get approvals fast.</li>
            <li><strong>Parts Ordered:</strong> OEM or certified parts based on your preference.</li>
            <li><strong>Repair & Paint:</strong> Our techs restore the structure, fit, and finish with precision.</li>
            <li><strong>Quality Check:</strong> Final inspection to verify workmanship and safety.</li>
            <li><strong>Pickup:</strong> We notify you via SMS/email when it’s ready to go.</li>
          </ol>
        </section>

        {/* CTA */}
        <section className="py-20 px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Let’s Get You Back on the Road</h2>
          <p className="mb-6 text-lg">Book your estimate today. We’ll take care of the rest.</p>
          <a
            href="/contact"
            className="bg-primary text-white px-6 py-3 rounded font-semibold hover:bg-black"
          >
            Schedule an Estimate
          </a>
        </section>
      </div>
    </>
  );
}
