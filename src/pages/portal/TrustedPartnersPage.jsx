import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

const partners = [
  {
    name: 'LotSwap',
    category: 'Automotive Marketplace',
    description:
      'A fee-free dealer-to-dealer vehicle marketplace built to bypass the auction house. LotSwap lets dealers list wholesale inventory, find what they need, and negotiate directly — cutting $1,500 to $2,500 per vehicle in traditional auction fees, transport costs, and holding expenses.',
    url: 'https://lotswap.io',
  },
  {
    name: 'AMW Cooling & Heating',
    category: 'HVAC Services',
    description:
      'A veteran-owned HVAC company right here in the Conroe area. AMW provides expert air conditioning repair, heating installation, preventive maintenance, and 24/7 emergency service — all from licensed, insured technicians who understand what quality workmanship means.',
    url: 'https://amwairconditioning.com',
  },
  {
    name: 'Terracotta Construction',
    category: 'General Contracting',
    description:
      'Licensed and insured professionals handling construction, landscaping, fencing, handyman jobs, apartment turnovers, and around-the-clock emergency repairs in Montgomery County and the Greater Houston area. Built on hard work and a handshake.',
    url: 'https://terracottaconstruction.com',
  },
  {
    name: 'StephensCode LLC',
    category: 'Web Development',
    description:
      'The veteran-owned team behind our website. With fourteen-plus years in the business and over 2,600 projects delivered, StephensCode builds custom websites, web applications, and business automation tools for companies nationwide.',
    url: 'https://stephenscode.dev',
  },
  {
    name: 'SACVPN',
    category: 'VPN & Cybersecurity',
    description:
      'Dedicated VPN infrastructure for businesses, individuals, and gamers who need real privacy. SACVPN provides private server instances with enterprise-level encryption and speeds up to 700 Mbps — no shared servers, no shortcuts. Veteran-owned.',
    url: 'https://sacvpn.com',
  },
  {
    name: 'Forge-X',
    category: 'Contractor Management',
    description:
      'A contractor management platform that puts invoicing, scheduling, payment tracking, and real-time updates in one clean dashboard. Forge-X helps contractors and homeowners manage projects from the first quote to the final walk-through.',
    url: 'https://forge-x.app',
  },
  {
    name: 'ColorFuse Prints',
    category: 'Custom Printing',
    description:
      'Your go-to for high-quality DTF transfers, sublimation printing, and custom apparel. ColorFuse delivers vibrant, durable prints — from ready-to-press transfers to fully custom designs — shipped directly to your door.',
    url: 'https://colorfuseprints.com',
  },
  {
    name: 'Benefit Builder LLC',
    category: 'Employee Benefits',
    description:
      'A benefits brokerage that helps employers set up Section 125 plans and supplemental insurance like life, dental, and vision. Benefit Builder makes it straightforward for business owners and their teams to save on taxes through pre-tax benefit structures.',
    url: 'https://benefitbuilderllc.com',
  },
  {
    name: 'FC Photo Houston',
    category: 'Photography',
    description:
      'A Houston photographer covering portraits, events, headshots, and creative projects. FC Photo Houston brings a personal, hands-on approach to every session — great for anything from professional branding to family milestones.',
    url: 'https://fcphotohouston.com',
  },
  {
    name: 'JustWell Clinical Research',
    category: 'Clinical Research',
    description:
      'Houston\'s go-to for ethical, inclusive clinical trials. JustWell runs IRB-approved studies in cardiology, neurology, dermatology, ophthalmology, and family medicine. Compensation is available for qualified participants.',
    url: 'https://justwellclinical.org',
  },
  {
    name: 'GradeStack',
    category: 'SEO & Website Auditing',
    description:
      'A self-hosted website audit platform that grades your site across performance, SEO, security, accessibility, and best practices — then tells you exactly how to fix each issue. No guesswork, no fluff, just actionable results.',
    url: 'https://gradestack.dev',
  },
  {
    name: 'Get Step Ready',
    category: 'Medical Education',
    description:
      'A study platform built for medical students working toward the USMLE Step 1. With 50,000-plus flashcards, thousands of practice questions, video lectures, and AI-powered tools, Get Step Ready gives future doctors the edge they need.',
    url: 'https://getstepready.com',
  },
  {
    name: 'Lefty Cartel',
    category: 'Sports & Community',
    description:
      'An exclusive community and streetwear brand built by and for left-handed ball players. Lefty Cartel offers curated training resources, a private members store, and a growing brotherhood united by the left side of the plate.',
    url: 'https://leftycartel.net',
  },
];

export default function TrustedPartnersPage() {
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  return (
    <div className="bg-gradient-to-br from-[#2c1b14] via-[#3e1f1c] to-black text-white overflow-x-hidden">
      <Helmet>
        <title>Trusted Local Partners | C.A.R.S Collision & Refinish</title>
        <meta
          name="description"
          content="C.A.R.S Collision & Refinish partners with trusted local businesses across Spring, The Woodlands, and North Houston. See who we recommend."
        />
      </Helmet>

      {/* Hero Section */}
      <section className="text-center px-6 py-20" data-aos="fade-up">
        <h1 className="text-4xl font-bold mb-4">Trusted Local Partners</h1>
        <p className="max-w-3xl mx-auto text-lg text-gray-200 leading-relaxed">
          At C.A.R.S Collision &amp; Refinish, we are proud to be part of a network of hardworking,
          veteran-owned and family-run businesses. These are companies we stand behind — the same
          way they stand behind their work.
        </p>
      </section>

      {/* Partners Grid */}
      <section className="px-6 py-16 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {partners.map((partner, index) => (
            <div
              key={partner.name}
              className="border border-gray-600 rounded-xl p-6 text-left bg-[#2c1b14]/90 shadow-lg hover:shadow-xl transition-shadow duration-300"
              data-aos="fade-up"
              data-aos-delay={index * 50}
            >
              <span className="text-xs uppercase tracking-wider text-gray-400 mb-2 block">
                {partner.category}
              </span>
              <h3 className="text-xl font-semibold mb-2 text-brandRed">
                {partner.name}
              </h3>
              <p className="text-gray-200 text-sm leading-relaxed mb-4">
                {partner.description}
              </p>
              <a
                href={partner.url}
                target="_blank"
                rel="noopener"
                className="inline-block bg-brandRedDark text-white px-5 py-2 rounded font-semibold text-sm hover:bg-red-900 transition"
              >
                Visit Website →
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 pb-24 text-center" data-aos="fade-up">
        <h2 className="text-2xl font-bold mb-4">Need Collision or Paint Work?</h2>
        <p className="text-gray-300 max-w-2xl mx-auto mb-6">
          Whether it is collision repair, custom paint, or a spray-in bedliner, C.A.R.S has you covered.
          Get in touch for a free estimate today.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/contact"
            className="bg-brandRedDark text-white px-6 py-3 rounded font-semibold hover:bg-red-900 transition"
          >
            Get a Free Estimate
          </Link>
          <a
            href="tel:+18328853055"
            className="border border-white px-6 py-3 rounded font-semibold hover:bg-white hover:text-black transition"
          >
            Call (832) 885-3055
          </a>
        </div>
      </section>
    </div>
  );
}
