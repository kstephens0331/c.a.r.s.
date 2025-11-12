import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

/**
 * Custom hook to fetch customer data for the currently logged-in user
 * Eliminates duplicate customer fetching logic across portal pages
 *
 * @returns {Object} { customer, loading, error, refetch }
 */
export function useCustomer() {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCustomer = async () => {
    let isCancelled = false;

    try {
      setLoading(true);
      setError(null);

      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;
      if (!session?.user) {
        throw new Error('You must be logged in');
      }

      const userId = session.user.id;

      // Fetch customer record for this user
      const { data, error: fetchError } = await supabase
        .from('customers')
        .select('id, name, phone, email, address, user_id, created_at')
        .eq('user_id', userId)
        .single();

      if (fetchError) {
        // If customer doesn't exist yet, that's okay
        if (fetchError.code === 'PGRST116') {
          if (!isCancelled) {
            setCustomer(null);
            setError(null);
          }
          return;
        }
        throw fetchError;
      }

      if (!isCancelled) {
        setCustomer(data);
      }
    } catch (err) {
      if (!isCancelled) {
        console.error('Error fetching customer:', err);
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
  };

  useEffect(() => {
    fetchCustomer();
  }, []);

  return {
    customer,
    loading,
    error,
    refetch: fetchCustomer
  };
}

/**
 * Custom hook to fetch customer by ID (for admin use)
 *
 * @param {string} customerId - The customer ID to fetch
 * @returns {Object} { customer, loading, error, refetch }
 */
export function useCustomerById(customerId) {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCustomer = async () => {
    if (!customerId) {
      setLoading(false);
      return;
    }

    let isCancelled = false;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single();

      if (fetchError) throw fetchError;

      if (!isCancelled) {
        setCustomer(data);
      }
    } catch (err) {
      if (!isCancelled) {
        console.error('Error fetching customer:', err);
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
  };

  useEffect(() => {
    fetchCustomer();
  }, [customerId]);

  return {
    customer,
    loading,
    error,
    refetch: fetchCustomer
  };
}
