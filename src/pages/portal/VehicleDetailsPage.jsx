import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient.js'; // Ensure path is correct

export default function VehicleDetailsPage() {
  const { id: vehicleId } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [workOrders, setWorkOrders] = useState([]);
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
    const fetchVehicleDetails = async () => {
      setLoading(true);
      setError(null);

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData?.session?.user) {
        setError('You must be logged in to view vehicle details.');
        setLoading(false);
        return;
      }
      const userId = sessionData.session.user.id;

      try {
        const { data: vehicleData, error: vehicleError } = await supabase
          .from('vehicles')
          .select('*')
          .eq('id', vehicleId)
          .single();

        if (vehicleError) {
          setError('Vehicle not found or you do not have permission to view it.');
          setLoading(false);
          return;
        }

        // Confirm the vehicle belongs to this customer
        const { data: customer } = await supabase
          .from('customers')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();

        if (!customer || vehicleData.customer_id !== customer.id) {
          setError('You do not have permission to view this vehicle.');
          setLoading(false);
          return;
        }

        setVehicle(vehicleData);

        const { data: woData, error: woError } = await supabase
          .from('work_orders')
          .select(`
            id,
            work_order_number,
            current_status,
            created_at,
            updated_at,
            description,
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
          .eq('vehicle_id', vehicleId)
          .order('created_at', { ascending: false });

        if (woError) throw woError;

        const workOrdersWithPhotos = await Promise.all(
          woData.map(async (order) => {
            const { data: files, error: storageError } = await supabase.storage
              .from('repair-photos')
              .list(`work_orders/${order.id}/`, {
                sortBy: { column: 'name', order: 'asc' },
              });

            const photoUrls = [];

            if (!storageError && files?.length) {
              for (const file of files) {
                if (file.name !== '.emptyFolderPlaceholder') {
                  const { data: publicUrlData } = supabase.storage
                    .from('repair-photos')
                    .getPublicUrl(`work_orders/${order.id}/${file.name}`);
                  if (publicUrlData?.publicUrl) {
                    photoUrls.push(publicUrlData.publicUrl);
                  }
                }
              }
            }

            return { ...order, photos: photoUrls };
          })
        );

        setWorkOrders(workOrdersWithPhotos);
      } catch (err) {
        console.error(err);
        setError('An unexpected error occurred while loading vehicle details.');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicleDetails();
  }, [vehicleId]);

  return (
    <div className="p-6 max-w-4xl mx-auto text-primary">
      <Helmet>
        <title>
          {vehicle ? `Vehicle Details – ${vehicle.make} ${vehicle.model}` : 'Vehicle Details'}
        </title>
        <meta
          name="description"
          content={
            vehicle
              ? `Track your ${vehicle.make} ${vehicle.model} repair progress.`
              : 'View your vehicle and repair updates.'
          }
        />
      </Helmet>

      <h1 className="text-2xl font-bold mb-4">Vehicle Details</h1>

      {loading && <p>Loading vehicle data...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {vehicle && (
        <div className="mb-6 bg-white rounded shadow p-4">
          <h2 className="text-xl font-semibold mb-2">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h2>
          <p><strong>VIN:</strong> {vehicle.vin}</p>
          <p><strong>Plate:</strong> {vehicle.license_plate}</p>
          <p><strong>Color:</strong> {vehicle.color}</p>
        </div>
      )}

      {workOrders.length > 0 && (
        <div className="space-y-8">
          {workOrders.map((wo) => (
            <div key={wo.id} className="bg-white rounded shadow p-4">
              <h3 className="text-lg font-bold mb-1">Work Order #{wo.work_order_number}</h3>
              <p className="text-sm text-gray-600 mb-2">
                Status: <strong>{wo.current_status}</strong>
              </p>
              <p>{wo.description}</p>

              {wo.photos && wo.photos.length > 0 && (
                <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                  {wo.photos.map((url, i) => (
                    <img key={i} src={url} alt={`Repair Photo ${i + 1}`} className="rounded border" />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {vehicle && workOrders.length === 0 && (
        <p className="mt-4 text-gray-600">No work orders found for this vehicle yet.</p>
      )}

      <div className="mt-6">
        <Link to="/portal/my-vehicles" className="text-brandRed hover:underline">
          &larr; Back to My Vehicles
        </Link>
      </div>
    </div>
  );
}