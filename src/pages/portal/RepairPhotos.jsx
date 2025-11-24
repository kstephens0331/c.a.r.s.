import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient.js'; // <= Verify this path and filename/extension
import LazyImage from '../../components/LazyImage';

export default function RepairPhotos() {
  const [groupedPhotos, setGroupedPhotos] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
  const fetchRepairPhotos = async () => {
    setLoading(true);
    setError(null);
    setGroupedPhotos({});

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user) {
      setError('You must be logged in to view repair photos.');
      setLoading(false);
      return;
    }

    const userId = session.user.id;

    try {
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (customerError || !customer) {
        setError('No customer record found for your account.');
        setLoading(false);
        return;
      }

      // Get customer vehicles
      const { data: vehicles, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('id, make, model, year')
        .eq('customer_id', customer.id);

      if (vehiclesError) throw new Error(vehiclesError.message);
      if (!vehicles.length) {
        setError('No vehicles found for your account.');
        setLoading(false);
        return;
      }

      const vehicleIds = vehicles.map(v => v.id);

      // Get work orders
      const { data: workOrders, error: woError } = await supabase
        .from('work_orders')
        .select('id, work_order_number, vehicle_id')
        .in('vehicle_id', vehicleIds)
        .order('created_at', { ascending: false });

      if (woError) throw new Error(woError.message);

      // Get repair photos from customer_documents
      const { data: documents, error: docError } = await supabase
        .from('customer_documents')
        .select('id, document_url, file_name, work_order_id')
        .eq('document_type', 'repair_photo')
        .in('work_order_id', workOrders.map(wo => wo.id));

      if (docError) throw new Error(docError.message);

      // Group repair photos by work order
      const grouped = {};
      for (const wo of workOrders) {
        const vehicle = vehicles.find(v => v.id === wo.vehicle_id);
        const title = `${vehicle?.year || ''} ${vehicle?.make || ''} ${vehicle?.model || ''} (Work Order #${wo.work_order_number})`;

        grouped[wo.id] = {
          title,
          photos: documents.filter(doc => doc.work_order_id === wo.id).map(doc => doc.document_url),
        };
      }

      setGroupedPhotos(grouped);

    } catch (err) {
      console.error('Error fetching repair photos:', err);
      setError(`Failed to load your repair photos: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  fetchRepairPhotos();
}, []);

  if (loading) {
    return (
      <div className="space-y-6 p-4">
        <h1 className="text-3xl font-bold">Repair Photos</h1>
        <p className="text-gray-600">Loading repair photos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-4">
        <h1 className="text-3xl font-bold">Repair Photos</h1>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Repair Photos | C.A.R.S Collision & Refinish Shop</title>
        <meta
          name="description"
          content="View uploaded repair photos by work order. See your vehicle’s progress visually from start to finish."
        />
      </Helmet>

      <div className="space-y-6 p-4">
        <h1 className="text-3xl font-bold">Repair Photos</h1>
        <p className="text-lg">Browse images uploaded by the shop during your repair process.</p>

        {Object.keys(groupedPhotos).length === 0 ? (
          <p className="text-gray-500">No repair photos available for your vehicles yet.</p>
        ) : (
          Object.keys(groupedPhotos).map((workOrderId) => (
            <div key={workOrderId} className="mb-10">
              <h2 className="text-xl font-semibold mb-4 text-primary">
                {groupedPhotos[workOrderId].title}
              </h2>
              {groupedPhotos[workOrderId].photos.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {groupedPhotos[workOrderId].photos.map((photoUrl, index) => (
                    <LazyImage
                      key={index}
                      src={photoUrl}
                      alt={`Repair photo ${index + 1} for ${groupedPhotos[workOrderId].title}`}
                      className="rounded shadow-lg w-full h-48 object-cover transition-transform duration-200 hover:scale-105"
                      placeholderClassName="rounded"
                      onError={(e) => {
                        e.target.onerror = null; // Prevent infinite loop
                        e.target.src = `https://placehold.co/300x200/cccccc/000000?text=Image+Error`;
                      }}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No photos uploaded for this work order yet.</p>
              )}
            </div>
          ))
        )}
      </div>
    </>
  );
}