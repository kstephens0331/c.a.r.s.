import { Helmet } from 'react-helmet-async';

export default function RepairPhotos() {
  return (
    <>
      <Helmet>
        <title>Repair Photos | Collision & Refinish Shop</title>
        <meta
          name="description"
          content="View uploaded repair photos by work order. See your vehicle’s progress visually from start to finish."
        />
      </Helmet>

      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Repair Photos</h1>
        <p className="text-lg">Browse images uploaded by the shop during your repair process.</p>

        {/* Sample Group */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-2">Work Order #2047 – 2021 Ford F-150</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <img src="https://via.placeholder.com/300x200" alt="repair 1" className="rounded shadow" />
            <img src="https://via.placeholder.com/300x200" alt="repair 2" className="rounded shadow" />
            <img src="https://via.placeholder.com/300x200" alt="repair 3" className="rounded shadow" />
            <img src="https://via.placeholder.com/300x200" alt="repair 4" className="rounded shadow" />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Work Order #1992 – 2019 Toyota Camry</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <img src="https://via.placeholder.com/300x200" alt="camry 1" className="rounded shadow" />
            <img src="https://via.placeholder.com/300x200" alt="camry 2" className="rounded shadow" />
          </div>
        </div>
      </div>
    </>
  );
}
