import { Helmet } from 'react-helmet-async';

export default function WorkOrders() {
  return (
    <>
      <Helmet>
        <title>Work Orders | Collision & Refinish Shop</title>
        <meta
          name="description"
          content="Manage repair status for each active vehicle. Update progress and notify customers in real-time."
        />
      </Helmet>

      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Work Orders</h1>
        <p className="text-lg">Update repair status and track all active jobs in the shop.</p>

        {/* Placeholder work order cards */}
        <div className="space-y-4">
          <div className="border p-4 rounded shadow">
            <h2 className="text-xl font-semibold">Work Order #2047 – 2021 Ford F-150</h2>
            <p className="text-sm text-gray-500 mb-2">Customer: John Smith</p>

            <label className="block mb-2 font-medium">Current Status</label>
            <select className="border rounded px-3 py-2 w-full md:w-1/2">
              <option>Parts Ordered</option>
              <option>Parts Received</option>
              <option>Repairs Started</option>
              <option>Paint</option>
              <option>Complete</option>
              <option>Ready for Pickup</option>
            </select>
          </div>

          <div className="border p-4 rounded shadow">
            <h2 className="text-xl font-semibold">Work Order #1992 – 2019 Toyota Camry</h2>
            <p className="text-sm text-gray-500 mb-2">Customer: Amy Johnson</p>

            <label className="block mb-2 font-medium">Current Status</label>
            <select className="border rounded px-3 py-2 w-full md:w-1/2">
              <option>Parts Ordered</option>
              <option>Parts Received</option>
              <option>Repairs Started</option>
              <option>Paint</option>
              <option selected>Complete</option>
              <option>Ready for Pickup</option>
            </select>
          </div>
        </div>
      </div>
    </>
  );
}
