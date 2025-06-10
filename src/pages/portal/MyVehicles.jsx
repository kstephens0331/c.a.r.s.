import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient.js'; // Correct path to supabaseClient
import { Link } from 'react-router-dom'; // Import Link

export default function MyVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserVehicles = async () => {
      setLoading(true);
      setError(null);
      const { data: userSession, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !userSession?.session?.user) {
        setError('User not authenticated or session expired.');
        setLoading(false);
        return;
      }

      const userId = userSession.session.user.id;

      const { data, error: fetchError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('customer_id', userId);

      if (fetchError) {
        console.error('Error fetching vehicles:', fetchError.message);
        setError(`Failed to load vehicles: ${fetchError.message}`);
      } else {
        setVehicles(data);
      }
      setLoading(false);
    };

    fetchUserVehicles();
  }, []);

  if (loading) {
    return (
      <>
        <Helmet>
          <title>My Vehicles | C.A.R.S Collision & Refinish Shop</title>
          <meta name="description" content="View your registered vehicles, VIN details, and linked repair jobs in one place." />
        </Helmet>
        <div className="space-y-6 p-4">
          <h1 className="text-3xl font-bold">My Vehicles</h1>
          <p>Loading your vehicles...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Helmet>
          <title>My Vehicles | Collision & Refinish Shop</title>
          <meta name="description" content="View your registered vehicles, VIN details, and linked repair jobs in one place." />
        </Helmet>
        <div className="space-y-6 p-4">
          <h1 className="text-3xl font-bold">My Vehicles</h1>
          <p className="text-red-600">{error}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>My Vehicles | C.A.R.S Collision & Refinish Shop</title>
        <meta
          name="description"
          content="View your registered vehicles, VIN details, and linked repair jobs in one place."
        />
      </Helmet>

      <div className="space-y-6 p-4">
        <h1 className="text-3xl font-bold">My Vehicles</h1>
        <p className="text-lg">These vehicles are linked to your customer account. Click a vehicle to see its details.</p>

        {vehicles.length === 0 ? (
          <p className="text-gray-500">No vehicles registered to your account yet. <Link to="/portal/add-vehicle" className="text-brandRed hover:underline">Add one now!</Link></p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {vehicles.map((vehicle) => (
              // Make the entire card clickable
              <Link to={`/portal/vehicles/${vehicle.id}`} key={vehicle.id} className="block">
                <div className="border p-4 rounded shadow hover:shadow-lg transition-shadow duration-200 cursor-pointer">
                  <h2 className="text-xl font-semibold mb-2">{vehicle.year} {vehicle.make} {vehicle.model}</h2>
                  <p className="text-sm">VIN: {vehicle.vin}</p>
                  <p className="text-sm">License Plate: {vehicle.license_plate}</p>
                  {/* Status from work_orders would go here, if available */}
                  {/* <p className="text-sm">Status: In Progress</p> */}
                  <p className="text-sm text-gray-500 mt-2">Click for details</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
