import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../../services/supabaseClient';

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      const { data, error } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
      if (error) console.error('Error fetching customers:', error.message);
      else setCustomers(data);
      setLoading(false);
    };

    fetchCustomers();
  }, []);

  return (
    <>
      <Helmet>
        <title>Customers | Collision & Refinish Shop</title>
        <meta
          name="description"
          content="View and manage customer accounts and their linked vehicles."
        />
      </Helmet>

      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Customer Records</h1>

        {loading ? (
          <p className="text-gray-600">Loading customers...</p>
        ) : customers.length === 0 ? (
          <p className="text-gray-500">No customers found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 text-sm">
              <thead className="bg-accent text-left">
                <tr>
                  <th className="p-3 border-b">Name</th>
                  <th className="p-3 border-b">Phone</th>
                  <th className="p-3 border-b">Email</th>
                  <th className="p-3 border-b">Address</th>
                  <th className="p-3 border-b">Created</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-gray-50">
                    <td className="p-3 border-b">{cust.name}</td>
                    <td className="p-3 border-b">{cust.phone}</td>
                    <td className="p-3 border-b">{cust.email}</td>
                    <td className="p-3 border-b">{cust.address}</td>
                    <td className="p-3 border-b">
                      {new Date(cust.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
