import { Helmet } from 'react-helmet-async';

export default function RepairUpdates() {
  return (
    <>
      <Helmet>
        <title>Repair Updates | Collision & Refinish Shop</title>
        <meta
          name="description"
          content="Track the status of your repairs from parts ordering to pickup — all in one place."
        />
      </Helmet>

      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Repair Progress</h1>
        <p className="text-lg">See the latest updates on each of your active work orders.</p>

        {/* Example work order timeline */}
        <div className="border rounded p-4 shadow mb-6">
          <h2 className="text-xl font-semibold mb-2">2021 Ford F-150 (Work Order #2047)</h2>
          <ol className="list-decimal list-inside text-sm space-y-1">
            <li className="text-gray-500">Parts Ordered</li>
            <li className="text-gray-500">Parts Received</li>
            <li className="text-gray-500">Repairs Started</li>
            <li className="font-bold text-brandRed">Paint — In Progress</li>
            <li className="text-gray-400">Complete</li>
            <li className="text-gray-400">Ready for Pickup</li>
          </ol>
        </div>

        <div className="border rounded p-4 shadow">
          <h2 className="text-xl font-semibold mb-2">2019 Toyota Camry (Work Order #1992)</h2>
          <ol className="list-decimal list-inside text-sm space-y-1">
            <li className="text-gray-500">Parts Ordered</li>
            <li className="text-gray-500">Parts Received</li>
            <li className="text-gray-500">Repairs Started</li>
            <li className="text-gray-500">Paint</li>
            <li className="text-green-600 font-semibold">Complete</li>
            <li className="text-green-700 font-semibold">Ready for Pickup</li>
          </ol>
        </div>
      </div>
    </>
  );
}
