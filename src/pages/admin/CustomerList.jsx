import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../../services/supabaseClient.js'; // Ensure path is correct
import { Link } from 'react-router-dom'; // Import Link

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch from the 'profiles' table instead of 'customers'
      const { data, error: fetchError } = await supabase
        .from('customers')
        .select('id, name, phone, address, email, user_id')
        .order('created_at', { ascending: false });

        if (fetchError) {
          throw new Error(fetchError.message);
        }
        setCustomers(data);
      } catch (err) {
        console.error('Error fetching customers:', err);
        setError(`Failed to load customers: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Customers | Collision & Refinish Shop</title>
          <meta name="description" content="View and manage customer accounts and their linked vehicles." />
        </Helmet>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Customer Records</h1>
          <p className="text-gray-600">Loading customers...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Helmet>
          <title>Customers | Collision & Refinish Shop</title>
          <meta name="description" content="View and manage customer accounts and their linked vehicles." />
        </Helmet>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Customer Records</h1>
          <p className="text-red-600">{error}</p>
        </div>
      </>
    );
  }

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

        {customers.length === 0 ? (
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
                    <td className="p-3 border-b">
                      <Link to={`/admin/customers/${cust.user_id}`} className="text-brandRed hover:underline font-semibold">
                        {cust.name || 'N/A'}
                      </Link>
                    </td>
                    <td className="p-3 border-b">{cust.phone || 'N/A'}</td>
                    <td className="p-3 border-b">{cust.email || 'N/A'}</td>
                    <td className="p-3 border-b">{cust.address || 'N/A'}</td>
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
