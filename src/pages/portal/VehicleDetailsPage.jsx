import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient.js'; // Ensure path is correct

export default function VehicleDetailsPage() {
  const { id: vehicleId } = useParams(); // Get vehicle ID from URL
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
        // 1. Fetch vehicle details
        const { data: vehicleData, error: vehicleError } = await supabase
          .from('vehicles')
          .select('*')
          .eq('id', vehicleId)
          .eq('customer_id', userId) // Ensure this vehicle belongs to the logged-in user
          .single();

        if (vehicleError) {
          if (vehicleError.code === 'PGRST116') { // No rows found
            setError('Vehicle not found or you do not have permission to view it.');
          } else {
            throw new Error(`Failed to load vehicle details: ${vehicleError.message}`);
          }
          setLoading(false);
          return;
        }
        setVehicle(vehicleData);

        // 2. Fetch all work orders for this vehicle, including related parts and documents
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

        if (woError) {
          throw new Error(`Failed to load work orders for vehicle: ${woError.message}`);
        }

        // 3. Fetch repair photos from storage for each work order
        const workOrdersWithPhotos = await Promise.all(woData.map(async (order) => {
          const { data: files, error: storageError } = await supabase.storage
            .from('repair-photos') // Your bucket name for repair photos
            .list(`work_orders/${order.id}/`, {
              sortBy: { column: 'name', order: 'asc' },
            });

          let photoUrls = [];
          if (storageError && storageError.message !== 'The specified bucket does not exist.') { // Allow bucket not existing
            console.warn(`Could not list photos for work order ${order.id}:`, storageError.message);
          } else if (files) {
            for (const file of files) {
              if (file.name !== '.emptyFolderPlaceholder' && file.id) {
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
        }));

        setWorkOrders(workOrdersWithPhotos);

      } catch (err) {
        console.error('Error fetching vehicle details and related data:', err);
        setError(`Failed to load vehicle details: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (vehicleId) { // Only fetch if vehicleId is available
      fetchVehicleDetails();
    }
  }, [vehicleId]);

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

  // Fixed Helmet title
  const helmetTitle = vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model} Details` : 'Vehicle Details';
  const helmetDescription = vehicle ? `Details for ${vehicle.year} ${vehicle.make} ${vehicle.model}.` : 'Loading vehicle details.';


  if (loading) {
    return (
      <>
        <Helmet>
          <title>Loading Vehicle Details | Collision & Refinish Shop</title>
          <meta name="description" content="Loading vehicle details, repair updates, photos, and documents." />
        </Helmet>
        <div className="space-y-6 p-4">
          <h1 className="text-3xl font-bold">Vehicle Details</h1>
          <p>Loading vehicle details...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Helmet>
          <title>Error Loading Details | Collision & Refinish Shop</title>
          <meta name="description" content="Error loading vehicle details." />
        </Helmet>
        <div className="space-y-6 p-4">
          <h1 className="text-3xl font-bold">Vehicle Details</h1>
          <p className="text-red-600">{error}</p>
          <Link to="/portal/my-vehicles" className="text-blue-600 hover:underline">Back to My Vehicles</Link>
        </div>
      </>
    );
  }

  if (!vehicle) {
    return (
      <>
        <Helmet>
          <title>Vehicle Not Found | Collision & Refinish Shop</title>
          <meta name="description" content="Vehicle details not found." />
        </Helmet>
        <div className="space-y-6 p-4">
          <h1 className="text-3xl font-bold">Vehicle Not Found</h1>
          <p className="text-gray-500">The vehicle you are looking for could not be found or you do not have permission to view it.</p>
          <Link to="/portal/my-vehicles" className="text-brandRed hover:underline">Back to My Vehicles</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        {/* Use the dynamically generated helmetTitle and helmetDescription */}
        <title>{helmetTitle} | Collision & Refinish Shop</title>
        <meta name="description" content={helmetDescription} />
      </Helmet>

      <div className="space-y-8 p-4">
        <h1 className="text-4xl font-bold text-primary">{vehicle.year} {vehicle.make} {vehicle.model}</h1>
        <p className="text-lg text-gray-700">VIN: {vehicle.vin} | License Plate: {vehicle.license_plate} | Color: {vehicle.color}</p>

        {workOrders.length === 0 ? (
          <p className="text-gray-500">No work orders found for this vehicle yet.</p>
        ) : (
          workOrders.map((order) => (
            <div key={order.id} className="border border-gray-200 p-6 rounded-lg shadow-md mb-8 bg-white">
              <h2 className="text-2xl font-bold text-primary mb-4">Work Order #{order.work_order_number}</h2>
              <p className="text-sm text-gray-600 mb-4">
                Created: {new Date(order.created_at).toLocaleDateString()}
                {order.updated_at && ` | Last Updated: ${new Date(order.updated_at).toLocaleDateString()}`}
              </p>
              {order.description && <p className="mb-4 text-gray-800">{order.description}</p>}

              {/* Repair Updates Section */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Repair Progress:</h3>
                <ol className="list-decimal list-inside text-sm space-y-1">
                  {statuses.map((statusItem) => (
                    <li key={statusItem} className={getStatusClass(order.current_status, statusItem)}>
                      {statusItem}
                      {order.current_status === statusItem && ' — Current Status'}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Parts Used Section */}
              {order.work_order_parts && order.work_order_parts.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h3 className="text-xl font-semibold mb-2">Parts Used:</h3>
                  <ul className="list-disc list-inside text-base space-y-1">
                    {order.work_order_parts.map((part, index) => (
                      <li key={index}>
                        {part.part_number} - {part.description} (Qty: {part.quantity_used})
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Repair Photos Section */}
              {order.photos && order.photos.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h3 className="text-xl font-semibold mb-2">Repair Photos:</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {order.photos.map((photoUrl, index) => (
                      <img
                        key={index}
                        src={photoUrl}
                        alt={`Repair photo ${index + 1} for WO #${order.work_order_number}`}
                        className="rounded-lg shadow-md w-full h-32 md:h-40 object-cover transition-transform duration-200 hover:scale-105 cursor-pointer"
                        // Fallback for broken images
                        onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/300x200/cccccc/000000?text=Image+Error`; }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Customer Documents Section (Quotes/Invoices) */}
              {order.customer_documents && order.customer_documents.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h3 className="text-xl font-semibold mb-2">Documents:</h3>
                  <ul className="list-disc list-inside text-base space-y-1">
                    {order.customer_documents.map((doc, index) => (
                      <li key={index}>
                        <a href={doc.document_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {doc.file_name || `${doc.document_type.charAt(0).toUpperCase() + doc.document_type.slice(1).replace('_', ' ')}`} ({doc.document_type === 'quote' ? 'Quote' : 'Paid Invoice'})
                          <svg className="ml-1 w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
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