import { Helmet } from 'react-helmet-async';
import TonyImage from '../../assets/tony.png';

export default function AboutUs() {
  return (
    <>
      <Helmet>
        <title>About Us | C.A.R.S Collision & Refinish</title>
        <meta
          name="description"
          content="Learn about C.A.R.S Collision & Refinish: veteran-owned, community-trusted, and committed to quality workmanship."
        />
      </Helmet>

      <section className="bg-black text-white text-center py-20 px-6 animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 transition duration-700 ease-out transform hover:scale-105 animate-fade-in">A Reputation Built on Trust</h1>
        <p className="max-w-2xl mx-auto text-lg text-gray-300">
          We’re more than a repair shop. We’re a team of skilled technicians and family-first people who believe in delivering honest, high-quality work—every time.
        </p>
      </section>

      <section className="bg-white py-16 px-6 animate-fade-in">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center animate-fade-in">Our Story</h2>
<p className="text-center max-w-3xl mx-auto text-gray-700 mb-8">
  The C.A.R.S. journey is rooted in experience, growth, and a commitment to quality. From humble beginnings to a full-service facility, each milestone reflects our dedication to building trust and delivering top-tier craftsmanship for every customer who walks through our doors.
</p>
          <p className="text-gray-700 mb-8 leading-relaxed">
  What began as a single technician’s commitment to doing things the right way has grown into one of Spring, TX’s most trusted full-service repair shops. Tony started in the industry with a passion for high-end paint correction and vehicle aesthetics. Over the years, that commitment to precision expanded to include mechanical diagnostics, routine maintenance, accessory installs, and advanced electrical troubleshooting. 
</p>
<p className="text-gray-700 mb-8 leading-relaxed">
  C.A.R.S. was officially established in 2016, and the shop quickly gained a reputation for honesty, follow-through, and keeping customers informed. With the addition of customer photo updates, online quote tracking, and the ability to log in and manage your vehicle repair status digitally, C.A.R.S. now blends old-school craftsmanship with modern communication and tech. Our mission has never changed: serve the community with integrity, and deliver results we’d be proud to put our name on.
</p>
<ul className="space-y-6 text-gray-700">
            <li><strong>2007:</strong> Tony begins working in auto repair with a focus on paint and finish restoration.</li>
            <li><strong>2016:</strong> C.A.R.S is founded in Spring, TX to serve the local community with integrity and precision.</li>
            <li><strong>2020:</strong> Expanded into full-service mechanical repairs, diagnostics, and custom accessories.</li>
            <li><strong>2024:</strong> Introduced online repair tracking and digital vehicle onboarding.</li>
          </ul>
        </div>
      </section>

      <section className="bg-gray-100 py-16 px-6">
        <h2 className="text-2xl font-bold mb-10 text-center animate-fade-in">Our Values</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto text-center transition-opacity duration-700 animate-fade-in">
          <div>
            <h3 className="text-lg font-semibold mb-2">Integrity</h3>
            <p className="text-sm text-gray-700">We stand behind every repair and every quote. No upsells. No games.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Precision</h3>
            <p className="text-sm text-gray-700">Our repairs meet or exceed OEM standards and reflect our pride in every detail.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Transparency</h3>
            <p className="text-sm text-gray-700">We show our work—literally—with photo updates and full access to repair history.</p>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 px-6 text-center animate-fade-in">
        <h2 className="text-2xl font-bold mb-6 animate-fade-in">Meet the Owner</h2>
        <img src={TonyImage} alt="Tony - Owner" className="w-40 h-40 object-cover rounded-full mx-auto mb-6 shadow-md" />
        <p className="max-w-3xl mx-auto text-gray-700 text-lg leading-relaxed">
          “After nearly a decade in the industry, I built C.A.R.S. to be a shop that customers could trust without hesitation. Our name is on every vehicle that leaves the bay—and we take that seriously.”
        </p>
        <p className="mt-4 font-semibold text-brandRed">– Tony, Owner & Lead Technician</p>
      </section>

      <section className="bg-black text-white text-center py-20 px-6">
        <h2 className="text-2xl font-bold mb-4 animate-fade-in">Proud to Serve Our Community</h2>
        <p className="max-w-2xl mx-auto text-lg text-gray-300">
          As a veteran-owned local business, we serve not only families but also commercial fleets, first responders, and small business owners who depend on reliability.
        </p>
      </section>
    </>
  );
}
