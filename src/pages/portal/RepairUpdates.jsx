import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient.js'; // Ensure path is correct

export default function RepairUpdates() {
  const [customerWorkOrders, setCustomerWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const statuses = [
    'Estimate Scheduled',
    'Parts Ordered',
    'Parts Received',
    'Repairs Started',
    'Paint',
    'Quality Check',
    'Complete',
    'Ready for Pickup'
  ];

  useEffect(() => {
    const fetchCustomerWorkOrders = async () => {
      setLoading(true);
      setError(null);

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user) {
        setError('You must be logged in to view repair updates.');
        setLoading(false);
        return;
      }

      const userId = session.user.id;

      try {
        // First, get the customer record for this user
        const { data: customer, error: customerError } = await supabase
          .from('customers')
          .select('id')
          .eq('user_id', userId)
          .single();

        if (customerError) throw new Error(customerError.message);
        if (!customer) {
          setCustomerWorkOrders([]);
          setLoading(false);
          return;
        }

        // Now get only this customer's vehicles
        const { data: vehicles, error: vehiclesError } = await supabase
          .from('vehicles')
          .select('id')
          .eq('customer_id', customer.id);

        if (vehiclesError) throw new Error(vehiclesError.message);

        const vehicleIds = vehicles.map(v => v.id);

        if (vehicleIds.length === 0) {
          setCustomerWorkOrders([]);
          setLoading(false);
          return;
        }

        const { data: workOrders, error: woError } = await supabase
          .from('work_orders')
          .select(`
            id,
            work_order_number,
            current_status,
            vehicles (
              make,
              model,
              year
            ),
            work_order_parts (
              part_number,
              quantity_used,
              description
            ),
            customer_documents (
              document_type,
              document_url,
              file_name,
              created_at
            )
          `)
          .in('vehicle_id', vehicleIds)
          .order('created_at', { ascending: false });

        if (woError) throw new Error(woError.message);

        setCustomerWorkOrders(workOrders);

      }
      catch (err) {
        console.error('Error fetching customer work orders:', err);
        setError(`Failed to load your repair updates: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerWorkOrders();
  }, []);

  const getStatusClass = (orderStatus, listItemStatus) => {
    const orderStatusIndex = statuses.indexOf(orderStatus);
    const listItemStatusIndex = statuses.indexOf(listItemStatus);

    if (orderStatusIndex >= listItemStatusIndex) {
      if (orderStatus === listItemStatus) {
        return 'font-bold text-brandRed';
      } else {
        return 'text-gray-500';
      }
    } else {
      return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Repair Updates | Collision & Refinish Shop</title>
          <meta name="description" content="Track the status of your repairs from parts ordering to pickup — all in one place." />
        </Helmet>
        <div className="space-y-6 p-4">
          <h1 className="text-3xl font-bold">Repair Progress</h1>
          <p>Loading your repair updates...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Helmet>
          <title>Repair Updates | Collision & Refinish Shop</title>
          <meta name="description" content="Track the status of your repairs from parts ordering to pickup — all in one place." />
        </Helmet>
        <div className="space-y-6 p-4">
          <h1 className="text-3xl font-bold">Repair Progress</h1>
          <p className="text-red-600">{error}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Repair Updates | Collision & Refinish Shop</title>
        <meta
          name="description"
          content="Track the status of your repairs from parts ordering to pickup — all in one place."
        />
      </Helmet>

      <div className="space-y-6 p-4">
        <h1 className="text-3xl font-bold">Repair Progress</h1>
        <p className="text-lg">See the latest updates on each of your active work orders.</p>

        {customerWorkOrders.length === 0 ? (
          <p className="text-gray-500">No active repair updates for your vehicles.</p>
        ) : (
          customerWorkOrders.map((order) => (
            <div key={order.id} className="border rounded p-4 shadow mb-6">
              <h2 className="text-xl font-semibold mb-2">
                {order.vehicles?.year} {order.vehicles?.make} {order.vehicles?.model} (Work Order #{order.work_order_number})
              </h2>
              <ol className="list-decimal list-inside text-sm space-y-1 mb-4">
                {statuses.map((statusItem) => (
                  <li key={statusItem} className={getStatusClass(order.current_status, statusItem)}>
                    {statusItem}
                    {order.current_status === statusItem && ' — In Progress'}
                  </li>
                ))}
              </ol>

              {/* Display Parts Used */}
              {order.work_order_parts && order.work_order_parts.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h3 className="text-md font-semibold mb-2">Parts Used:</h3>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {order.work_order_parts.map((part, index) => (
                      <li key={index}>
                        {part.part_number} - {part.description} (Qty: {part.quantity_used})
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Display Customer Documents (Quotes/Paid Invoices) */}
              {order.customer_documents && order.customer_documents.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h3 className="text-md font-semibold mb-2">Documents:</h3>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {order.customer_documents.map((doc, index) => (
                      <li key={index}>
                        <a href={doc.document_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {doc.file_name || doc.document_type.toUpperCase()} ({doc.document_type})
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </>
  );
}