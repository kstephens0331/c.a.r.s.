import { Helmet } from 'react-helmet-async';

export default function Inventory() {
  return (
    <>
      <Helmet>
        <title>Inventory | Collision & Refinish Shop</title>
        <meta
          name="description"
          content="Track and manage all parts used in repairs. View quantity, pricing, and suppliers."
        />
      </Helmet>

      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Parts Inventory</h1>
        <p className="text-lg">Monitor available parts and add or adjust inventory as needed.</p>

        {/* Placeholder table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead className="bg-accent text-left">
              <tr>
                <th className="p-3 border-b">Part #</th>
                <th className="p-3 border-b">Description</th>
                <th className="p-3 border-b">Quantity</th>
                <th className="p-3 border-b">Price</th>
                <th className="p-3 border-b">Supplier</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-3 border-b">12345-A</td>
                <td className="p-3 border-b">Front Bumper Cover</td>
                <td className="p-3 border-b">3</td>
                <td className="p-3 border-b">$128.75</td>
                <td className="p-3 border-b">Keystone</td>
              </tr>
              <tr>
                <td className="p-3 border-b">67890-Z</td>
                <td className="p-3 border-b">Passenger Side Mirror</td>
                <td className="p-3 border-b">1</td>
                <td className="p-3 border-b">$85.00</td>
                <td className="p-3 border-b">LKQ</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
