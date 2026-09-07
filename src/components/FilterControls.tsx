import React from 'react';
import { FilterState, PaymentMethod } from '../types';
import { ALL_PAYMENT_METHODS, ALL_PRODUCTS } from '../data/salesData';
import { Search, RotateCcw, Filter, Calendar } from 'lucide-react';

interface Props {
  filters: FilterState;
  onFilterChange: (updater: (prev: FilterState) => FilterState) => void;
  onReset: () => void;
  totalFilteredCount: number;
  totalDatasetCount: number;
}

export const FilterControls: React.FC<Props> = ({
  filters,
  onFilterChange,
  onReset,
  totalFilteredCount,
  totalDatasetCount,
}) => {
  const isFiltered =
    filters.dateRange !== 'all' ||
    filters.paymentMethods.length > 0 ||
    filters.products.length > 0 ||
    filters.searchQuery.trim() !== '' ||
    Boolean(filters.startDate) ||
    Boolean(filters.endDate);

  const togglePaymentMethod = (pm: PaymentMethod) => {
    onFilterChange((prev) => {
      const exists = prev.paymentMethods.includes(pm);
      return {
        ...prev,
        paymentMethods: exists
          ? prev.paymentMethods.filter((m) => m !== pm)
          : [...prev.paymentMethods, pm],
      };
    });
  };

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    onFilterChange((prev) => ({
      ...prev,
      products: val ? [val] : [],
    }));
  };

  return (
    <div id="filter-controls-card" className="bg-white rounded-xl border border-zinc-200/80 p-4 shadow-xs space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Quick Date Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-medium text-zinc-500 mr-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-zinc-400" /> Date:
          </span>
          {[
            { id: 'all', label: 'All Time' },
            { id: '2025-08', label: 'Aug 2025' },
            { id: '2025-09', label: 'Sep 2025' },
            { id: '2025-10', label: 'Oct 2025' },
            { id: 'custom', label: 'Custom' },
          ].map((item) => (
            <button
              key={item.id}
              id={`filter-date-${item.id}`}
              onClick={() =>
                onFilterChange((prev) => ({
                  ...prev,
                  dateRange: item.id as FilterState['dateRange'],
                }))
              }
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                filters.dateRange === item.id
                  ? 'bg-zinc-900 text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200/70'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Right: Search & Reset */}
        <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end">
          <div className="relative min-w-[200px] max-w-xs w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              id="search-input"
              type="text"
              placeholder="Search product or order..."
              value={filters.searchQuery}
              onChange={(e) =>
                onFilterChange((prev) => ({ ...prev, searchQuery: e.target.value }))
              }
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-800 placeholder-zinc-400 focus:outline-hidden focus:ring-1 focus:ring-zinc-400 focus:bg-white"
            />
          </div>

          {isFiltered && (
            <button
              id="reset-filters-btn"
              onClick={onReset}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors shrink-0"
              title="Reset all filters"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Row 2: Secondary filter selectors */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-100">
        {/* Payment Methods Filter */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-medium text-zinc-500 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-zinc-400" /> Payment:
          </span>
          {ALL_PAYMENT_METHODS.map((pm) => {
            const isSelected = filters.paymentMethods.includes(pm);
            return (
              <button
                key={pm}
                id={`filter-pm-${pm.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => togglePaymentMethod(pm)}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-zinc-800 text-white'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200/70'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    pm === 'Credit Card'
                      ? 'bg-blue-400'
                      : pm === 'eWallet'
                      ? 'bg-emerald-400'
                      : pm === 'Debit Card'
                      ? 'bg-violet-400'
                      : 'bg-amber-400'
                  }`}
                />
                {pm}
              </button>
            );
          })}
        </div>

        {/* Product Filter dropdown & Custom Date range inputs */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Custom Date Inputs if 'custom' is selected */}
          {filters.dateRange === 'custom' && (
            <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 px-2 py-1 rounded-lg">
              {/* ponytail: browser has native date picker */}
              <input
                id="custom-start-date"
                type="date"
                value={filters.startDate || '2025-08-15'}
                min="2025-08-15"
                max="2025-10-07"
                onChange={(e) =>
                  onFilterChange((prev) => ({ ...prev, startDate: e.target.value }))
                }
                className="text-xs bg-transparent text-zinc-700 outline-hidden"
              />
              <span className="text-zinc-400 text-xs">to</span>
              <input
                id="custom-end-date"
                type="date"
                value={filters.endDate || '2025-10-07'}
                min="2025-08-15"
                max="2025-10-07"
                onChange={(e) =>
                  onFilterChange((prev) => ({ ...prev, endDate: e.target.value }))
                }
                className="text-xs bg-transparent text-zinc-700 outline-hidden"
              />
            </div>
          )}

          {/* Product Dropdown */}
          <select
            id="filter-product-select"
            value={filters.products[0] || ''}
            onChange={handleProductChange}
            className="text-xs py-1.5 px-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-700 focus:outline-hidden focus:ring-1 focus:ring-zinc-400"
          >
            <option value="">All Products ({ALL_PRODUCTS.length})</option>
            {ALL_PRODUCTS.map((prod) => (
              <option key={prod} value={prod}>
                {prod}
              </option>
            ))}
          </select>

          {/* Filter count status */}
          <span className="text-xs text-zinc-500 whitespace-nowrap">
            Showing <strong className="text-zinc-900">{totalFilteredCount}</strong> of{' '}
            {totalDatasetCount} items
          </span>
        </div>
      </div>
    </div>
  );
};
