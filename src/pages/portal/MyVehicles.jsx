import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient.js'; // Correct path to supabaseClient
import { useNavigate } from "react-router-dom";


export default function MyVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customerId, setCustomerId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomerVehicles = async () => {
      setLoading(true);
      try {
        const {
          data: { user },
          error: sessionError,
        } = await supabase.auth.getUser();

        if (sessionError) throw sessionError;
        if (!user) return navigate("/login");

        const { data: customer, error: customerError } = await supabase
          .from("customers")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (customerError || !customer) throw new Error("Customer not found");

        setCustomerId(customer.id);

        const { data: vehiclesData, error: vehiclesError } = await supabase
          .from("vehicles")
          .select("*")
          .eq("customer_id", customer.id)
          .order("created_at", { ascending: false });

        if (vehiclesError) throw vehiclesError;

        setVehicles(vehiclesData);
      } catch (err) {
        console.error("Failed to fetch vehicles:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerVehicles();
  }, [navigate]);

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