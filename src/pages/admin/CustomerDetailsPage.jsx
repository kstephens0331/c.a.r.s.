import { Helmet } from 'react-helmet-async';
import { useEffect, useState, useCallback } from 'react'; // Import useCallback
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient.js'; // Ensure path is correct

// Import new sub-components
import CustomerProfileEditor from '../../components/admin/CustomerDetails/CustomerProfileEditor.jsx';
import AdminAddVehicleForm from '../../components/admin/CustomerDetails/AdminAddVehicleForm.jsx';
import AdminWorkOrderCreator from '../../components/admin/CustomerDetails/AdminWorkOrderCreator.jsx';
import AdminWorkOrderManager from '../../components/admin/CustomerDetails/AdminWorkOrderManager.jsx';


export default function CustomerDetailsPage() {
  const { id: customerId } = useParams();
  const [customer, setCustomer] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

  // States for adding a new vehicle
  const [addingVehicle, setAddingVehicle] = useState(false);

  // States for creating a new work order
  const [creatingWorkOrder, setCreatingWorkOrder] = useState(false);
  const [showCreateWoFormForVehicle, setShowCreateWoFormForVehicle] = useState(null); // Stores vehicle ID to show its WO form

  // States for managing a specific work order (add parts, documents)
  const [expandedWorkOrderId, setExpandedWorkOrderId] = useState(null); // Stores WO ID for expanding management section

  // Memoize fetch function to avoid re-creation on every render if not needed
  const fetchCustomerData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch customer profile
      const { data: profile, error: profileError } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', customerId)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') setError('Customer not found.');
        else throw new Error(`Error fetching customer: ${profileError.message}`);
        setLoading(false);
        return;
      }
      setCustomer(profile);

      // Fetch customer's vehicles
      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('id, make, model, year, color, vin, license_plate')
        .eq('customer_id', profile.id)
        .order('year', { ascending: false });

      if (vehiclesError) throw new Error(`Error fetching vehicles: ${vehiclesError.message}`);
      setVehicles(vehiclesData);

      // Fetch all work orders for all of this customer's vehicles
      const customerVehicleIds = vehiclesData.map(v => v.id);
      if (customerVehicleIds.length > 0) {
          const { data: allWoData, error: allWoError } = await supabase
              .from('work_orders')
              .select(`id, work_order_number, current_status, description, vehicle_id`)
              .in('vehicle_id', customerVehicleIds)
              .order('created_at', { ascending: false });
          if (allWoError) throw new Error(`Error fetching all work orders: ${allWoError.message}`);
          setWorkOrders(allWoData);
      } else {
          setWorkOrders([]);
      }


    } catch (err) {
      console.error('Error in CustomerDetailsPage initial fetch:', err);
      setError(`Failed to load customer details: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [customerId]); // Only re-create if customerId changes

  useEffect(() => {
    if (customerId) {
      fetchCustomerData();
    }
  }, [customerId, fetchCustomerData]);


  // Handlers for customer profile updates
  const handleUpdateCustomer = async (formData) => { // Takes formData directly
    setMessage('');
    try {
      const { error: updateError } = await supabase
        .from('customers')
        .update({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
        })
        .eq('user_id', customerId);

      if (updateError) throw new Error(updateError.message);
      setMessage('Customer profile updated successfully!');
      fetchCustomerData(); // Re-fetch to update display
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error updating customer:', err);
      setMessage(`Error updating customer: ${err.message}`);
    }
  };


  // Handlers for adding a new vehicle
  const handleAddNewVehicle = async (newVehicleData) => { // Takes newVehicleData directly
    setAddingVehicle(true);
    setMessage('');
    try {
      const { data: newVehicle, error: insertError } = await supabase
        .from('vehicles')
        .insert({
          customer_id: customerId,
          make: newVehicleData.make,
          model: newVehicleData.model,
          year: parseInt(newVehicleData.year),
          color: newVehicleData.color,
          vin: newVehicleData.vin,
          license_plate: newVehicleData.license_plate,
        })
        .select()
        .single();

      if (insertError) throw new Error(insertError.message);

      setMessage('New vehicle added successfully!');
      fetchCustomerData(); // Re-fetch to update vehicles list
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error adding new vehicle:', err);
      setMessage(`Error adding new vehicle: ${err.message}`);
    } finally {
      setAddingVehicle(false);
    }
  };

  // Handlers for adding a new work order
  const handleCreateNewWorkOrder = async (vehicleId, newWorkOrderData) => { // Takes vehicleId and newWorkOrderData
    setCreatingWorkOrder(true);
    setMessage('');
    try {
      const { data: newWo, error: insertError } = await supabase
        .from('work_orders')
        .insert({
          work_order_number: newWorkOrderData.work_order_number,
          description: newWorkOrderData.description,
          vehicle_id: vehicleId,
          current_status: 'Estimate Scheduled',
        })
        .select()
        .single();

      if (insertError) throw new Error(insertError.message);

      setMessage('New work order created successfully!');
      fetchCustomerData(); // Re-fetch to update work orders list
      setTimeout(() => setMessage(''), 3000);
      setExpandedWorkOrderId(newWo.id); // Automatically expand this new work order for management
      setShowCreateWoFormForVehicle(null); // Hide create form
    } catch (err) {
      console.error('Error creating work order:', err);
      setMessage(`Error creating work order: ${err.message}`);
    } finally {
      setCreatingWorkOrder(false);
    }
  };

  // Handlers for adding parts to a work order
  const handleAddPartToWorkOrder = async (workOrderId, selectedPartId, partQuantity, availableParts, setFormMessage, setFormLoading, setSelectedPartId, setPartQuantity) => {
    setFormLoading(true); // Control loading state in child component
    setFormMessage(''); // Clear child component's message

    const partToAdd = availableParts.find(p => p.id === selectedPartId);
    if (!workOrderId || !selectedPartId || partQuantity <= 0) {
      setFormMessage('Please select a work order, a part, and a valid quantity.');
      setFormLoading(false);
      return;
    }
    if (!partToAdd || partToAdd.quantity < partQuantity) {
        setFormMessage(`Not enough ${partToAdd?.description || 'parts'} in inventory. Available: ${partToAdd?.quantity || 0}`);
        setFormLoading(false);
        return;
    }

    try {
        const { error: addWoPartError } = await supabase
            .from('work_order_parts')
            .insert({
                work_order_id: workOrderId,
                inventory_id: selectedPartId,
                part_number: partToAdd.part_number,
                description: partToAdd.description,
                quantity_used: partQuantity,
                unit_price_at_time: partToAdd.unit_price,
            });

        if (addWoPartError) throw new Error(addWoPartError.message);

        const { error: updateInventoryError } = await supabase
            .from('inventory')
            .update({ quantity: partToAdd.quantity - partQuantity })
            .eq('user_id', selectedPartId);

        if (updateInventoryError) throw new Error(`Failed to update inventory: ${updateInventoryError.message}`);

        setFormMessage(`Added ${partQuantity} x ${partToAdd.description} to WO #${workOrders.find(wo => wo.id === workOrderId)?.work_order_number}.`);
        fetchCustomerData(); // Re-fetch all data to refresh parts lists and counts
        setSelectedPartId('');
        setPartQuantity(1);
        setTimeout(() => setFormMessage(''), 3000);

    } catch (err) {
        console.error('Error adding part:', err);
        setFormMessage(`Error adding part: ${err.message}`);
    } finally {
        setFormLoading(false);
    }
  };

  // Handlers for document upload (quotes/paid invoices)
  const handleDocumentUpload = async (workOrderId, customerId, documentFile, documentType, setFormMessage, setFormLoading, setDocumentFile, setDocumentType) => {
    setFormLoading(true);
    setFormMessage('');
    if (!workOrderId || !documentFile || !documentType) {
      setFormMessage('Please select a work order, a file, and a document type.');
      setFormLoading(false);
      return;
    }
    if (!customerId) {
      setFormMessage('Error: Customer ID not available for document upload.');
      setFormLoading(false);
      return;
    }

    try {
      const fileExtension = documentFile.name.split('.').pop();
      const filePath = `customer_documents/${workOrderId}/${documentType}_${new Date().getTime()}.${fileExtension}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('customer-files')
        .upload(filePath, documentFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw new Error(`File upload failed: ${uploadError.message}`);

      const { data: publicUrlData } = supabase.storage
        .from('customer-files')
        .getPublicUrl(filePath);

      if (!publicUrlData?.publicUrl) throw new Error('Failed to get public URL.');

      const { error: insertDocError } = await supabase
        .from('customer_documents')
        .insert({
          work_order_id: workOrderId,
          customer_id: customerId,
          document_type: documentType,
          document_url: publicUrlData.publicUrl,
          file_name: documentFile.name,
        });

      if (insertDocError) {
        await supabase.storage.from('customer-files').remove([filePath]);
        throw new Error(`Error saving document record: ${insertDocError.message}`);
      }

      setFormMessage(`Document uploaded successfully for WO #${workOrders.find(wo => wo.id === workOrderId)?.work_order_number}.`);
      fetchCustomerData(); // Re-fetch all data to refresh documents list
      setDocumentFile(null);
      setDocumentType('quote');
      setTimeout(() => setFormMessage(''), 3000);
    } catch (err) {
      console.error('Error uploading document:', err);
      setFormMessage(`Error uploading document: ${err.message}`);
    } finally {
      setFormLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="space-y-6 p-4">
        <h1 className="text-3xl font-bold">Customer Details</h1>
        <p>Loading customer details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-4">
        <h1 className="text-3xl font-bold">Error</h1>
        <p className="text-red-600">{error}</p>
        <Link to="/admin/customers" className="text-blue-600 hover:underline">Back to Customer List</Link>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="space-y-6 p-4">
        <h1 className="text-3xl font-bold">Customer Not Found</h1>
        <p className="text-gray-500">The customer you are looking for could not be found.</p>
        <Link to="/admin/customers" className="text-brandRed hover:underline">Back to Customer List</Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{customer.name || 'Customer'} Details | Admin</title>
        <meta name="description" content={`Admin view for ${customer.name}'s details and vehicles.`} />
      </Helmet>

      <div className="space-y-8 p-4">
        <h1 className="text-4xl font-bold text-primary mb-4">{customer.name || 'Customer'}</h1>
        <p className="text-lg text-gray-700 mb-6">
          Email: {customer.email} | Phone: {customer.phone || 'N/A'} | Address: {customer.address || 'N/A'}
        </p>

        {/* --- Customer Profile Edit --- */}
        <CustomerProfileEditor
          customer={customer}
          customerId={customerId}
          onUpdate={handleUpdateCustomer}
          message={message} // Pass message from parent state
        />

        {/* --- Add New Vehicle Section --- */}
        <AdminAddVehicleForm
          customerId={customerId}
          onAddVehicle={handleAddNewVehicle}
          message={message} // Pass message from parent state
          addingVehicle={addingVehicle}
        />

        {/* --- Vehicle List and Work Order Management --- */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Vehicles ({vehicles.length})</h2>
          {vehicles.length === 0 ? (
            <p className="text-gray-500">No vehicles registered for this customer yet.</p>
          ) : (
            <div className="space-y-6">
              {vehicles.map((vehicleItem) => (
                <div key={vehicleItem.id} className="border p-4 rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold mb-2">{vehicleItem.year} {vehicleItem.make} {vehicleItem.model}</h3>
                  <p className="text-sm text-gray-700">VIN: {vehicleItem.vin} | Plate: {vehicleItem.license_plate}</p>

                  {/* Create New Work Order for this Vehicle */}
                  {showCreateWoFormForVehicle === vehicleItem.id ? (
                      <AdminWorkOrderCreator
                          vehicleItem={vehicleItem}
                          onCreateWorkOrder={handleCreateNewWorkOrder}
                          message={message} // Pass message from parent
                          creatingWorkOrder={creatingWorkOrder}
                          onCancel={() => setShowCreateWoFormForVehicle(null)}
                      />
                  ) : (
                      <button
                          onClick={() => setShowCreateWoFormForVehicle(vehicleItem.id)}
                          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm mt-3"
                      >
                          Create New Work Order
                      </button>
                  )}


                  {/* List Existing Work Orders for this Vehicle */}
                  <div className="mt-6">
                    <h4 className="text-xl font-semibold mb-3">Work Orders for this Vehicle:</h4>
                    {workOrders.filter(wo => wo.vehicle_id === vehicleItem.id).length === 0 ? (
                      <p className="text-gray-500 text-sm">No work orders yet for this vehicle.</p>
                    ) : (
                      <div className="space-y-4">
                        {workOrders.filter(wo => wo.vehicle_id === vehicleItem.id).map(wo => (
                          <div key={wo.id} className="border p-3 rounded bg-gray-50">
                            <h5 className="text-lg font-semibold mb-2">WO #{wo.work_order_number} ({wo.current_status})</h5>
                            <p className="text-sm text-gray-700 mb-2">Description: {wo.description}</p>
                            <p className="text-sm text-gray-700 mb-2">Created: {new Date(wo.created_at).toLocaleDateString()}</p>

                            <button
                                onClick={() => setExpandedWorkOrderId(expandedWorkOrderId === wo.id ? null : wo.id)}
                                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 text-sm mt-2"
                            >
                                {expandedWorkOrderId === wo.id ? 'Hide Details' : 'Manage WO Details'}
                            </button>

                            {expandedWorkOrderId === wo.id && (
                                <AdminWorkOrderManager
                                    workOrder={wo}
                                    customerId={customer.id} // Pass customer.id
                                    // Pass handler functions directly. Child components will manage their own loading/messages.
                                    onAddPart={handleAddPartToWorkOrder}
                                    onUploadDocument={handleDocumentUpload}
                                />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}