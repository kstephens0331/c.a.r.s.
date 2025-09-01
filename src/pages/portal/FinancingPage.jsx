import { Helmet } from 'react-helmet-async';

export default function FinancingPage() {
  return (
    <>
      <Helmet>
        <title>Financing | C.A.R.S Collision & Refinish Shop</title>
        <meta
          name="description"
          content="Flexible financing options with Snap Finance to make auto repairs affordable and stress-free."
        />
      </Helmet>

      <section className="bg-black text-white text-center py-20 px-6">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Financing Options</h1>
        <p className="max-w-2xl mx-auto text-lg text-gray-300 mb-8">
          We’ve partnered with Snap Finance to provide flexible financing for your repairs. 
          Apply today and get back on the road with confidence.
        </p>

        <a
          href="https://snapf.in/Iqkca1U"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block"
        >
          <img
            src="https://merchant-banners-s3.snapfinance.com/Loans/EN/A160x600.jpeg"
            alt="Snap Finance - Apply Here"
            style={{ boxShadow: '4px 2px 6px #010101', border: 'none' }}
            className="mx-auto rounded-lg"
          />
        </a>
      </section>
    </>
  );
}