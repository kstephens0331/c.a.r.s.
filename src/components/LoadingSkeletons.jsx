import React from 'react';

/**
 * Loading Skeleton Components
 * Provides smooth loading animations instead of "Loading..." text
 * Improves perceived performance and user experience
 */

/**
 * Base skeleton animation component
 */
const SkeletonBase = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

/**
 * Table Skeleton - For data tables (CustomerList, Inventory, WorkOrders, Invoices)
 * @param {number} rows - Number of skeleton rows to display (default: 5)
 * @param {number} columns - Number of columns in the table (default: 5)
 */
export const TableSkeleton = ({ rows = 5, columns = 5 }) => {
  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {Array.from({ length: columns }).map((_, idx) => (
              <th key={idx} className="px-6 py-3 text-left">
                <SkeletonBase className="h-4 w-24" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <tr key={rowIdx} className="hover:bg-gray-50">
              {Array.from({ length: columns }).map((_, colIdx) => (
                <td key={colIdx} className="px-6 py-4">
                  <SkeletonBase
                    className={`h-4 ${colIdx === 0 ? 'w-32' : colIdx === columns - 1 ? 'w-20' : 'w-24'}`}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * Card Skeleton - For dashboard cards and detail views
 */
export const CardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <SkeletonBase className="h-6 w-40" />
          <SkeletonBase className="h-8 w-24 rounded-full" />
        </div>

        {/* Content lines */}
        <div className="space-y-3">
          <SkeletonBase className="h-4 w-full" />
          <SkeletonBase className="h-4 w-5/6" />
          <SkeletonBase className="h-4 w-4/6" />
        </div>

        {/* Footer button */}
        <div className="pt-4">
          <SkeletonBase className="h-10 w-32" />
        </div>
      </div>
    </div>
  );
};

/**
 * Multiple Cards Skeleton - Grid of cards
 * @param {number} count - Number of cards to display (default: 3)
 */
export const CardsGridSkeleton = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <CardSkeleton key={idx} />
      ))}
    </div>
  );
};

/**
 * List Item Skeleton - For lists (vehicles, work orders, documents)
 */
export const ListItemSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          {/* Icon/Avatar placeholder */}
          <SkeletonBase className="h-12 w-12 rounded-full flex-shrink-0" />

          {/* Text content */}
          <div className="flex-1 space-y-2">
            <SkeletonBase className="h-5 w-48" />
            <SkeletonBase className="h-4 w-32" />
          </div>
        </div>

        {/* Action button */}
        <SkeletonBase className="h-8 w-24 rounded" />
      </div>
    </div>
  );
};

/**
 * List Skeleton - Multiple list items
 * @param {number} count - Number of items to display (default: 5)
 */
export const ListSkeleton = ({ count = 5 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, idx) => (
        <ListItemSkeleton key={idx} />
      ))}
    </div>
  );
};

/**
 * Form Skeleton - For forms while loading data
 */
export const FormSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="space-y-6">
        {/* Form fields */}
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="space-y-2">
            <SkeletonBase className="h-4 w-24" />
            <SkeletonBase className="h-10 w-full rounded" />
          </div>
        ))}

        {/* Submit button */}
        <div className="flex justify-end space-x-4 pt-4">
          <SkeletonBase className="h-10 w-24 rounded" />
          <SkeletonBase className="h-10 w-24 rounded" />
        </div>
      </div>
    </div>
  );
};

/**
 * Dashboard Stats Skeleton - For dashboard statistics cards
 */
export const StatsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div key={idx} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="space-y-3">
            <SkeletonBase className="h-4 w-24" />
            <SkeletonBase className="h-8 w-16" />
            <SkeletonBase className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Work Order Details Skeleton - For detailed work order view
 */
export const WorkOrderDetailsSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <SkeletonBase className="h-8 w-48" />
            <SkeletonBase className="h-8 w-32 rounded-full" />
          </div>
          <SkeletonBase className="h-4 w-32" />
        </div>
      </div>

      {/* Customer Info */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <SkeletonBase className="h-6 w-40 mb-4" />
        <div className="space-y-3">
          <SkeletonBase className="h-4 w-full" />
          <SkeletonBase className="h-4 w-3/4" />
          <SkeletonBase className="h-4 w-2/3" />
        </div>
      </div>

      {/* Vehicle Info */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <SkeletonBase className="h-6 w-40 mb-4" />
        <div className="space-y-3">
          <SkeletonBase className="h-4 w-full" />
          <SkeletonBase className="h-4 w-3/4" />
        </div>
      </div>

      {/* Parts Table */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <SkeletonBase className="h-6 w-40 mb-4" />
        <TableSkeleton rows={3} columns={4} />
      </div>
    </div>
  );
};

/**
 * Customer Details Skeleton - For customer detail page
 */
export const CustomerDetailsSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Customer Header */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <SkeletonBase className="h-8 w-48" />
          <SkeletonBase className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="space-y-2">
              <SkeletonBase className="h-4 w-24" />
              <SkeletonBase className="h-5 w-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Vehicles Section */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <SkeletonBase className="h-6 w-32" />
          <SkeletonBase className="h-10 w-32" />
        </div>
        <ListSkeleton count={2} />
      </div>

      {/* Work Orders Section */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <SkeletonBase className="h-6 w-32 mb-4" />
        <TableSkeleton rows={3} columns={5} />
      </div>
    </div>
  );
};

/**
 * Image Gallery Skeleton - For photo galleries
 * @param {number} count - Number of images to display (default: 6)
 */
export const ImageGallerySkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden animate-pulse">
          <SkeletonBase className="absolute inset-0 w-full h-full" />
        </div>
      ))}
    </div>
  );
};

/**
 * Timeline Skeleton - For repair status timeline
 */
export const TimelineSkeleton = () => {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, idx) => (
        <div key={idx} className="flex items-start space-x-4">
          {/* Timeline dot */}
          <SkeletonBase className="h-8 w-8 rounded-full flex-shrink-0" />

          {/* Timeline content */}
          <div className="flex-1 space-y-2">
            <SkeletonBase className="h-5 w-40" />
            <SkeletonBase className="h-4 w-full" />
            <SkeletonBase className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Page Header Skeleton - For page titles and breadcrumbs
 */
export const PageHeaderSkeleton = () => {
  return (
    <div className="mb-6 space-y-3">
      <SkeletonBase className="h-8 w-64" />
      <SkeletonBase className="h-4 w-96" />
    </div>
  );
};

/**
 * Search Bar Skeleton
 */
export const SearchBarSkeleton = () => {
  return (
    <div className="flex items-center space-x-4 mb-6">
      <SkeletonBase className="h-10 flex-1 rounded" />
      <SkeletonBase className="h-10 w-32 rounded" />
    </div>
  );
};

export default {
  TableSkeleton,
  CardSkeleton,
  CardsGridSkeleton,
  ListItemSkeleton,
  ListSkeleton,
  FormSkeleton,
  StatsSkeleton,
  WorkOrderDetailsSkeleton,
  CustomerDetailsSkeleton,
  ImageGallerySkeleton,
  TimelineSkeleton,
  PageHeaderSkeleton,
  SearchBarSkeleton
};
