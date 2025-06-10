import { Helmet } from 'react-helmet-async';

export default function Invoices() {
  return (
    <>
      <Helmet>
        <title>Invoices | Collision & Refinish Shop</title>
        <meta
          name="description"
          content="Upload and track invoices from parts vendors. Scanned line items will sync to inventory."
        />
      </Helmet>

      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Invoices</h1>
        <p className="text-lg">Upload vendor invoices and track incoming parts.</p>

        {/* Upload Form */}
        <form className="bg-accent p-4 rounded shadow space-y-4 max-w-xl">
          <input
            type="file"
            accept="application/pdf,image/*"
            className="block w-full p-2 border rounded"
          />
          <button
            type="submit"
            className="bg-primary text-white px-6 py-2 rounded font-semibold hover:bg-black"
          >
            Upload Invoice
          </button>
        </form>

        {/* Placeholder invoice table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 mt-8">
            <thead className="bg-accent text-left">
              <tr>
                <th className="p-3 border-b">Invoice #</th>
                <th className="p-3 border-b">Supplier</th>
                <th className="p-3 border-b">Date</th>
                <th className="p-3 border-b">File</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-3 border-b">INV-4021</td>
                <td className="p-3 border-b">Keystone</td>
                <td className="p-3 border-b">2025-06-01</td>
                <td className="p-3 border-b">
                  <a href="#" className="text-brandRed hover:underline">View PDF</a>
                </td>
              </tr>
              <tr>
                <td className="p-3 border-b">INV-4018</td>
                <td className="p-3 border-b">LKQ</td>
                <td className="p-3 border-b">2025-05-28</td>
                <td className="p-3 border-b">
                  <a href="#" className="text-brandRed hover:underline">View PDF</a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
