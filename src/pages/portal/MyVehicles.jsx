import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient.js'; // Correct path to supabaseClient
import { useNavigate } from "react-router-dom";


export default function MyVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customerId, setCustomerId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
  const fetchVehicles = async () => {
    setLoading(true);
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (!user) return;

    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (customerError || !customer) {
      console.error("Customer not found or error", customerError);
      return;
    }

    const { data: vehiclesData, error: vehicleError } = await supabase
      .from("vehicles")
      .select("*")
      .eq("customer_id", customer.id);

    if (vehicleError) {
      console.error("Error fetching vehicles", vehicleError);
      return;
    }

    setVehicles(vehiclesData);
    setLoading(false);
  };

  fetchVehicles();
}, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Vehicles</h1>
      <p className="mb-4">These vehicles are linked to your customer account. Click a vehicle to see its details.</p>

      {loading ? (
        <p>Loading vehicles...</p>
      ) : vehicles.length === 0 ? (
        <p className="text-gray-500">No vehicles registered to your account yet. Add one now!</p>
      ) : (
        <ul className="space-y-4">
          {vehicles.map((vehicle) => (
            <li
              key={vehicle.id}
              className="border p-4 rounded shadow hover:bg-gray-100 cursor-pointer"
              onClick={() => navigate(`/portal/vehicles/${vehicle.id}`)}
            >
              <p className="font-semibold">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </p>
              <p className="text-sm text-gray-600">VIN: {vehicle.vin}</p>
              <p className="text-sm text-gray-600">Plate: {vehicle.license_plate}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}