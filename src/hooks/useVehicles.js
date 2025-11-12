import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';

/**
 * Custom hook to fetch vehicles for the currently logged-in customer
 * Eliminates duplicate vehicle fetching logic across portal pages
 *
 * @returns {Object} { vehicles, loading, error, refetch }
 */
export function useCustomerVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVehicles = useCallback(async () => {
    let isCancelled = false;

    try {
      setLoading(true);
      setError(null);

      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        throw new Error('You must be logged in to view vehicles');
      }

      const userId = session.user.id;

      // First, get the customer record for this user
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (customerError) throw customerError;
      if (!customer) {
        if (!isCancelled) {
          setVehicles([]);
        }
        return;
      }

      // Fetch vehicles for this customer
      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false });

      if (vehiclesError) throw vehiclesError;

      if (!isCancelled) {
        setVehicles(vehiclesData || []);
      }
    } catch (err) {
      if (!isCancelled) {
        console.error('Error fetching customer vehicles:', err);
        setError(err.message);
      }
    } finally {
      if (!isCancelled) {
        setLoading(false);
      }
    }

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  return {
    vehicles,
    loading,
    error,
    refetch: fetchVehicles
  };
}

/**
 * Custom hook to fetch vehicles by customer ID (for admin use)
 *
 * @param {string} customerId - The customer ID to fetch vehicles for
 * @returns {Object} { vehicles, loading, error, refetch }
 */
export function useVehiclesByCustomerId(customerId) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVehicles = useCallback(async () => {
    if (!customerId) {
      setLoading(false);
      return;
    }

    let isCancelled = false;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      if (!isCancelled) {
        setVehicles(data || []);
      }
    } catch (err) {
      if (!isCancelled) {
        console.error('Error fetching vehicles:', err);
        setError(err.message);
      }
    } finally {
      if (!isCancelled) {
        setLoading(false);
      }
    }

    return () => {
      isCancelled = true;
    };
  }, [customerId]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  return {
    vehicles,
    loading,
    error,
    refetch: fetchVehicles
  };
}

/**
 * Custom hook to fetch a single vehicle by ID
 *
 * @param {string} vehicleId - The vehicle ID to fetch
 * @returns {Object} { vehicle, loading, error, refetch }
 */
export function useVehicle(vehicleId) {
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVehicle = useCallback(async () => {
    if (!vehicleId) {
      setLoading(false);
      return;
    }

    let isCancelled = false;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('vehicles')
        .select(`
          *,
          customers (
            name,
            email,
            phone
          )
        `)
        .eq('id', vehicleId)
        .single();

      if (fetchError) throw fetchError;

      if (!isCancelled) {
        setVehicle(data);
      }
    } catch (err) {
      if (!isCancelled) {
        console.error('Error fetching vehicle:', err);
        setError(err.message);
      }
    } finally {
      if (!isCancelled) {
        setLoading(false);
      }
    }

    return () => {
      isCancelled = true;
    };
  }, [vehicleId]);

  useEffect(() => {
    fetchVehicle();
  }, [fetchVehicle]);

  return {
    vehicle,
    loading,
    error,
    refetch: fetchVehicle
  };
}
