/**
 * Reusable Pagination Component
 *
 * Usage:
 * <Pagination
 *   currentPage={page}
 *   totalItems={totalCount}
 *   itemsPerPage={50}
 *   onPageChange={(newPage) => setPage(newPage)}
 * />
 */

export default function Pagination({ currentPage, totalItems, itemsPerPage, onPageChange }) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Don't show pagination if only 1 page or no items
  if (totalPages <= 1 || totalItems === 0) {
    return null;
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (pageNum) => {
    onPageChange(pageNum);
  };

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page
      pages.push(1);

      // Calculate range around current page
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      // Add ellipsis if needed
      if (startPage > 2) {
        pages.push('...');
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Add ellipsis if needed
      if (endPage < totalPages - 1) {
        pages.push('...');
      }

      // Show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <nav
      className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-200"
      role="navigation"
      aria-label="Pagination navigation"
    >
      {/* Results info */}
      <div className="text-sm text-gray-600" aria-live="polite" aria-atomic="true">
        Showing <span className="font-semibold text-gray-900">{startItem}</span> to{' '}
        <span className="font-semibold text-gray-900">{endItem}</span> of{' '}
        <span className="font-semibold text-gray-900">{totalItems}</span> results
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-2" role="group" aria-label="Pagination controls">
        {/* Previous button */}
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          aria-label="Go to previous page"
          aria-disabled={currentPage === 1}
          className={`
            px-3 py-2 rounded-md text-sm font-medium
            ${currentPage === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }
          `}
        >
          Previous
        </button>

        {/* Page numbers */}
        <div className="hidden sm:flex items-center gap-1">
          {getPageNumbers().map((pageNum, index) => {
            if (pageNum === '...') {
              return (
                <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500">
                  ...
                </span>
              );
            }

            return (
              <button
                key={pageNum}
                onClick={() => handlePageClick(pageNum)}
                aria-label={`Go to page ${pageNum}`}
                aria-current={currentPage === pageNum ? 'page' : undefined}
                className={`
                  px-3 py-2 rounded-md text-sm font-medium
                  ${currentPage === pageNum
                    ? 'bg-brandRed text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }
                `}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Mobile: Just show current page */}
        <div className="sm:hidden px-3 py-2 text-sm font-medium text-gray-700">
          Page {currentPage} of {totalPages}
        </div>

        {/* Next button */}
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          aria-label="Go to next page"
          aria-disabled={currentPage === totalPages}
          className={`
            px-3 py-2 rounded-md text-sm font-medium
            ${currentPage === totalPages
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }
          `}
        >
          Next
        </button>
      </div>
    </nav>
  );
}
