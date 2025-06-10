import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>Collision & Refinish Shop | Quality Auto Body Repairs in Spring, TX</title>
        <meta
          name="description"
          content="Veteran & family-owned collision repair shop in Spring, TX. Fast, honest, and guaranteed repairs from bumper to bumper."
        />
      </Helmet>

      <div className="bg-white text-primary">
        {/* Hero Section */}
        <section className="bg-primary text-white py-20 px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Collision & Refinish Experts</h1>
          <p className="text-lg md:text-xl mb-6 max-w-2xl mx-auto">
            Veteran and family-owned. Quality repairs, honest work, and no surprises.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <a
              href="#schedule"
              className="bg-white text-primary px-6 py-3 rounded font-semibold shadow hover:bg-gray-100"
            >
              Schedule Estimate
            </a>
            <Link
              to="/collision-repair"
              className="bg-brandRed text-white px-6 py-3 rounded font-semibold hover:bg-red-600"
            >
              View Services
            </Link>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16 px-4 text-center bg-accent">
          <h2 className="text-3xl font-bold mb-6">Why Choose Collision & Refinish Shop?</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto text-left">
            <div>
              <h3 className="font-semibold text-xl mb-2">Veteran-Owned & Operated</h3>
              <p>We bring military-level precision and integrity to every repair.</p>
            </div>
            <div>
              <h3 className="font-semibold text-xl mb-2">Customer First, Always</h3>
              <p>No runaround. Transparent updates and zero pressure from start to finish.</p>
            </div>
            <div>
              <h3 className="font-semibold text-xl mb-2">Pro-Grade Workmanship</h3>
              <p>OEM parts. Expert color matching. Fast turnaround. Guaranteed satisfaction.</p>
            </div>
          </div>
        </section>

        {/* Shop Preview */}
        <section className="py-16 px-4 max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">What We Repair</h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="p-4 border rounded shadow">
              <h4 className="font-bold mb-2">Collision Damage</h4>
              <p>Bumper-to-bumper collision repair with insurance support.</p>
            </div>
            <div className="p-4 border rounded shadow">
              <h4 className="font-bold mb-2">Paint & Refinishing</h4>
              <p>Color match technology and flawless paint correction.</p>
            </div>
            <div className="p-4 border rounded shadow">
              <h4 className="font-bold mb-2">Bedliners & Accessories</h4>
              <p>Protect and customize your ride with pro-grade upgrades.</p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section id="schedule" className="py-20 px-4 bg-primary text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="mb-6 text-lg">Book an estimate or repair appointment now—no phone call required.</p>
          <a
            href="/contact"
            className="bg-white text-primary px-6 py-3 rounded font-semibold hover:bg-gray-100"
          >
            Schedule Now
          </a>
        </section>
      </div>
    </>
  );
}
