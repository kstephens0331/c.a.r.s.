import { Helmet } from 'react-helmet-async';

export default function MyVehicles() {
  return (
    <>
      <Helmet>
        <title>My Vehicles | Collision & Refinish Shop</title>
        <meta
          name="description"
          content="View your registered vehicles, VIN details, and linked repair jobs in one place."
        />
      </Helmet>

      <div className="space-y-6">
        <h1 className="text-3xl font-bold">My Vehicles</h1>
        <p className="text-lg">These vehicles are linked to your customer account.</p>

        {/* Example layout — replace with dynamic data */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="border p-4 rounded shadow">
            <h2 className="text-xl font-semibold">2019 Toyota Camry</h2>
            <p>VIN: XXXXX1234</p>
            <p>License Plate: TX ABC123</p>
            <p>Status: In Paint</p>
          </div>

          <div className="border p-4 rounded shadow">
            <h2 className="text-xl font-semibold">2021 Ford F-150</h2>
            <p>VIN: YYYYY5678</p>
            <p>License Plate: TX DEF456</p>
            <p>Status: Complete</p>
          </div>
        </div>
      </div>
    </>
  );
}
