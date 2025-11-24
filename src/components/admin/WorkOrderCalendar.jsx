import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { supabase } from '../../services/supabaseClient';
import { useNavigate } from 'react-router-dom';

// Setup the localizer for react-big-calendar using date-fns
const locales = {
  'en-US': enUS,
};

const localizer = momentLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

/**
 * WorkOrderCalendar Component
 * Visual calendar view of work orders by estimated completion date
 */
const WorkOrderCalendar = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkOrders();
  }, []);

  const fetchWorkOrders = async () => {
    try {
      const { data: workOrders } = await supabase
        .from('work_orders')
        .select(`
          *,
          vehicles (
            make,
            model,
            year,
            customers (
              name
            )
          )
        `)
        .not('estimated_completion_date', 'is', null);

      if (workOrders) {
        const calendarEvents = workOrders.map((wo) => ({
          id: wo.id,
          title: `WO #${wo.work_order_number} - ${wo.vehicles?.year} ${wo.vehicles?.make} ${wo.vehicles?.model}`,
          start: new Date(wo.estimated_completion_date),
          end: new Date(wo.estimated_completion_date),
          resource: wo,
          status: wo.current_status,
        }));

        setEvents(calendarEvents);
      }
    } catch (error) {
      console.error('Error fetching work orders for calendar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEvent = (event) => {
    navigate(`/admin/work-orders/details/${event.id}`);
  };

  const eventStyleGetter = (event) => {
    const statusColors = {
      'pending': { backgroundColor: '#fbbf24', color: '#000' },
      'in-progress': { backgroundColor: '#3b82f6', color: '#fff' },
      'awaiting-parts': { backgroundColor: '#f97316', color: '#fff' },
      'ready-for-pickup': { backgroundColor: '#10b981', color: '#fff' },
      'completed': { backgroundColor: '#059669', color: '#fff' },
      'cancelled': { backgroundColor: '#ef4444', color: '#fff' },
    };

    const style = statusColors[event.status] || { backgroundColor: '#6b7280', color: '#fff' };

    return {
      style: {
        ...style,
        borderRadius: '4px',
        border: 'none',
        display: 'block',
        fontSize: '12px',
        padding: '2px 5px',
      },
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Work Order Calendar</h2>
        <p className="text-gray-600">Estimated completion dates for active work orders</p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#fbbf24' }}></div>
          <span className="text-sm">Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#3b82f6' }}></div>
          <span className="text-sm">In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f97316' }}></div>
          <span className="text-sm">Awaiting Parts</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10b981' }}></div>
          <span className="text-sm">Ready for Pickup</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#059669' }}></div>
          <span className="text-sm">Completed</span>
        </div>
      </div>

      {/* Calendar */}
      <div style={{ height: '600px' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
          views={['month', 'week', 'day', 'agenda']}
          defaultView="month"
          popup
          tooltipAccessor={(event) =>
            `${event.title}\nStatus: ${event.status}\nCustomer: ${event.resource.vehicles?.customers?.name}`
          }
        />
      </div>
    </div>
  );
};

export default WorkOrderCalendar;
