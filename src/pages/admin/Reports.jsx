import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  Users,
  FileText,
  Package,
  Clock,
  Calendar,
  Download
} from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

/**
 * Reports Component
 * Comprehensive analytics and reporting dashboard for business insights
 */
const Reports = () => {
  const [dateRange, setDateRange] = useState('30days');
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalWorkOrders: 0,
    completedWorkOrders: 0,
    averageCompletionTime: 0,
    totalCustomers: 0,
    newCustomersThisMonth: 0,
    totalRevenue: 0,
    topParts: [],
    statusBreakdown: {},
    revenueByMonth: [],
  });

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const now = new Date();
      let startDate;

      switch (dateRange) {
        case '7days':
          startDate = subDays(now, 7);
          break;
        case '30days':
          startDate = subDays(now, 30);
          break;
        case '90days':
          startDate = subDays(now, 90);
          break;
        case 'thisMonth':
          startDate = startOfMonth(now);
          break;
        default:
          startDate = subDays(now, 30);
      }

      // Fetch work orders
      const { data: workOrders } = await supabase
        .from('work_orders')
        .select('*, work_order_parts(*)')
        .gte('created_at', startDate.toISOString());

      // Fetch customers
      const { data: allCustomers } = await supabase
        .from('customers')
        .select('*');

      const { data: newCustomers } = await supabase
        .from('customers')
        .select('*')
        .gte('created_at', startOfMonth(now).toISOString());

      // Calculate analytics
      const completed = workOrders?.filter(wo => wo.current_status === 'completed') || [];
      const totalRevenue = workOrders?.reduce((sum, wo) => {
        const partsTotal = wo.work_order_parts?.reduce((partSum, part) =>
          partSum + (part.unit_price * part.quantity), 0) || 0;
        return sum + partsTotal;
      }, 0) || 0;

      // Status breakdown
      const statusBreakdown = workOrders?.reduce((acc, wo) => {
        acc[wo.current_status] = (acc[wo.current_status] || 0) + 1;
        return acc;
      }, {}) || {};

      // Top parts used
      const partsMap = {};
      workOrders?.forEach(wo => {
        wo.work_order_parts?.forEach(part => {
          if (partsMap[part.part_number]) {
            partsMap[part.part_number].quantity += part.quantity;
            partsMap[part.part_number].revenue += part.unit_price * part.quantity;
          } else {
            partsMap[part.part_number] = {
              part_number: part.part_number,
              description: part.description,
              quantity: part.quantity,
              revenue: part.unit_price * part.quantity,
            };
          }
        });
      });

      const topParts = Object.values(partsMap)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      // Calculate average completion time
      const completionTimes = completed
        .map(wo => {
          const created = new Date(wo.created_at);
          const updated = new Date(wo.updated_at);
          return (updated - created) / (1000 * 60 * 60 * 24); // days
        })
        .filter(time => time > 0);

      const avgCompletionTime = completionTimes.length > 0
        ? completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length
        : 0;

      setAnalytics({
        totalWorkOrders: workOrders?.length || 0,
        completedWorkOrders: completed.length,
        averageCompletionTime: avgCompletionTime.toFixed(1),
        totalCustomers: allCustomers?.length || 0,
        newCustomersThisMonth: newCustomers?.length || 0,
        totalRevenue,
        topParts,
        statusBreakdown,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    const csvContent = [
      ['C.A.R.S Business Report', `Generated: ${format(new Date(), 'PPP')}`],
      [''],
      ['Metric', 'Value'],
      ['Total Work Orders', analytics.totalWorkOrders],
      ['Completed Work Orders', analytics.completedWorkOrders],
      ['Completion Rate', `${((analytics.completedWorkOrders / analytics.totalWorkOrders) * 100).toFixed(1)}%`],
      ['Average Completion Time (days)', analytics.averageCompletionTime],
      ['Total Customers', analytics.totalCustomers],
      ['New Customers This Month', analytics.newCustomersThisMonth],
      ['Total Revenue', `$${analytics.totalRevenue.toFixed(2)}`],
      [''],
      ['Status Breakdown'],
      ...Object.entries(analytics.statusBreakdown).map(([status, count]) => [status, count]),
      [''],
      ['Top Parts by Revenue'],
      ['Part Number', 'Description', 'Quantity Used', 'Revenue'],
      ...analytics.topParts.map(part => [
        part.part_number,
        part.description,
        part.quantity,
        `$${part.revenue.toFixed(2)}`
      ]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cars-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Business insights and performance metrics</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Date range selector */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="thisMonth">This Month</option>
          </select>

          {/* Export button */}
          <button
            onClick={exportReport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download size={20} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Work Orders */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Work Orders</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.totalWorkOrders}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FileText size={24} className="text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {analytics.completedWorkOrders} completed (
            {analytics.totalWorkOrders > 0
              ? ((analytics.completedWorkOrders / analytics.totalWorkOrders) * 100).toFixed(1)
              : 0}%)
          </p>
        </div>

        {/* Average Completion Time */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Completion Time</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {analytics.averageCompletionTime} <span className="text-lg">days</span>
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Clock size={24} className="text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">From intake to completion</p>
        </div>

        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                ${analytics.totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <DollarSign size={24} className="text-yellow-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">From parts sales</p>
        </div>

        {/* Customers */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.totalCustomers}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Users size={24} className="text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            +{analytics.newCustomersThisMonth} this month
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Work Order Status</h2>
          <div className="space-y-3">
            {Object.entries(analytics.statusBreakdown).map(([status, count]) => {
              const percentage = analytics.totalWorkOrders > 0
                ? (count / analytics.totalWorkOrders) * 100
                : 0;

              const statusColors = {
                'pending': 'bg-yellow-500',
                'in-progress': 'bg-blue-500',
                'awaiting-parts': 'bg-orange-500',
                'ready-for-pickup': 'bg-green-500',
                'completed': 'bg-emerald-600',
                'cancelled': 'bg-red-500',
              };

              return (
                <div key={status}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium capitalize">{status.replace(/-/g, ' ')}</span>
                    <span className="text-gray-600">{count} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${statusColors[status] || 'bg-gray-500'}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Parts */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Top Parts by Revenue</h2>
          <div className="space-y-2">
            {analytics.topParts.slice(0, 5).map((part, index) => (
              <div
                key={part.part_number}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-bold text-sm">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-sm">{part.part_number}</p>
                    <p className="text-xs text-gray-600">{part.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">${part.revenue.toFixed(2)}</p>
                  <p className="text-xs text-gray-600">{part.quantity} units</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
