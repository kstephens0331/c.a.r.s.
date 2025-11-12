import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';

/**
 * Custom hook to fetch work orders for the currently logged-in customer
 * Eliminates duplicate work order fetching logic across portal pages
 *
 * @returns {Object} { workOrders, loading, error, refetch }
 */
export function useCustomerWorkOrders() {
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWorkOrders = useCallback(async () => {
    let isCancelled = false;

    try {
      setLoading(true);
      setError(null);

      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        throw new Error('You must be logged in to view work orders');
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
          setWorkOrders([]);
        }
        return;
      }

      // Get vehicles for this customer
      const { data: vehicles, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('id')
        .eq('customer_id', customer.id);

      if (vehiclesError) throw vehiclesError;

      const vehicleIds = vehicles.map(v => v.id);

      if (vehicleIds.length === 0) {
        if (!isCancelled) {
          setWorkOrders([]);
        }
        return;
      }

      // Fetch work orders for these vehicles
      const { data: workOrdersData, error: woError } = await supabase
        .from('work_orders')
        .select(`
          id,
          work_order_number,
          current_status,
          created_at,
          updated_at,
          estimated_completion_date,
          description,
          vehicles (
            make,
            model,
            year,
            vin,
            license_plate
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

      if (woError) throw woError;

      if (!isCancelled) {
        setWorkOrders(workOrdersData || []);
      }
    } catch (err) {
      if (!isCancelled) {
        console.error('Error fetching customer work orders:', err);
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
    fetchWorkOrders();
  }, [fetchWorkOrders]);

  return {
    workOrders,
    loading,
    error,
    refetch: fetchWorkOrders
  };
}

/**
 * Custom hook to fetch a single work order by ID
 *
 * @param {string} workOrderId - The work order ID to fetch
 * @returns {Object} { workOrder, loading, error, refetch }
 */
export function useWorkOrder(workOrderId) {
  const [workOrder, setWorkOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWorkOrder = useCallback(async () => {
    if (!workOrderId) {
      setLoading(false);
      return;
    }

    let isCancelled = false;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('work_orders')
        .select(`
          *,
          vehicles (
            *,
            customers (
              name,
              email,
              phone
            )
          ),
          work_order_parts (
            *,
            inventory (
              part_number,
              description
            )
          ),
          customer_documents (
            *
          )
        `)
        .eq('id', workOrderId)
        .single();

      if (fetchError) throw fetchError;

      if (!isCancelled) {
        setWorkOrder(data);
      }
    } catch (err) {
      if (!isCancelled) {
        console.error('Error fetching work order:', err);
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
  }, [workOrderId]);

  useEffect(() => {
    fetchWorkOrder();
  }, [fetchWorkOrder]);

  return {
    workOrder,
    loading,
    error,
    refetch: fetchWorkOrder
  };
}
