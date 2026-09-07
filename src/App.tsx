import React, { useState, useMemo } from 'react';
import { INITIAL_DATA, RAW_CSV_DATA, parseSalesCsv } from './data/salesData';
import { SaleRecord, FilterState, VisualizationView, PaymentMethod } from './types';
import {
  computeKPIs,
  computeDailyTrends,
  computeProductStats,
  computePaymentStats,
  computeBasketStats,
} from './utils/analytics';
import { KPIBanner } from './components/KPIBanner';
import { FilterControls } from './components/FilterControls';
import { TrendVisualizer } from './components/TrendVisualizer';
import { ProductVisualizer } from './components/ProductVisualizer';
import { PaymentVisualizer } from './components/PaymentVisualizer';
import { CalendarVisualizer } from './components/CalendarVisualizer';
import { OrderBasketVisualizer } from './components/OrderBasketVisualizer';
import { LedgerTable } from './components/LedgerTable';
import {
  LayoutDashboard,
  TrendingUp,
  Package,
  CreditCard,
  Calendar,
  ShoppingCart,
  Table,
  Upload,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

const INITIAL_FILTERS: FilterState = {
  dateRange: 'all',
  paymentMethods: [],
  products: [],
  searchQuery: '',
};

export default function App() {
  const [data, setData] = useState<SaleRecord[]>(INITIAL_DATA);
  const [activeView, setActiveView] = useState<VisualizationView>('overview');
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [pastedCsv, setPastedCsv] = useState('');

  // Reset filters
  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  // Reset to original sample data
  const handleResetToSample = () => {
    setData(INITIAL_DATA);
    setFilters(INITIAL_FILTERS);
  };

  // Filter application
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Date filter
      if (filters.dateRange === '2025-08') {
        if (!item.date.startsWith('2025-08')) return false;
      } else if (filters.dateRange === '2025-09') {
        if (!item.date.startsWith('2025-09')) return false;
      } else if (filters.dateRange === '2025-10') {
        if (!item.date.startsWith('2025-10')) return false;
      } else if (filters.dateRange === 'custom') {
        if (filters.startDate && item.date < filters.startDate) return false;
        if (filters.endDate && item.date > filters.endDate) return false;
      }

      // Payment method filter
      if (filters.paymentMethods.length > 0) {
        if (!filters.paymentMethods.includes(item.paymentMethod)) return false;
      }

      // Product filter
      if (filters.products.length > 0) {
        if (!filters.products.includes(item.product)) return false;
      }

      // Search Query
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        const matchesProduct = item.product.toLowerCase().includes(query);
        const matchesOrder = item.orderNumber.toLowerCase().includes(query);
        const matchesPayment = item.paymentMethod.toLowerCase().includes(query);
        if (!matchesProduct && !matchesOrder && !matchesPayment) return false;
      }

      return true;
    });
  }, [data, filters]);

  // Aggregated analytics metrics
  const kpis = useMemo(() => computeKPIs(filteredData), [filteredData]);
  const dailyTrends = useMemo(() => computeDailyTrends(filteredData), [filteredData]);
  const productStats = useMemo(
    () => computeProductStats(filteredData, kpis.totalRevenue),
    [filteredData, kpis.totalRevenue]
  );
  const paymentStats = useMemo(
    () => computePaymentStats(filteredData, kpis.totalRevenue),
    [filteredData, kpis.totalRevenue]
  );
  const basketStats = useMemo(() => computeBasketStats(filteredData), [filteredData]);

  // File upload handler
  // ponytail: browser FileReader handles client CSV parsing with zero backend
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const parsed = parseSalesCsv(content);
        if (parsed.length > 0) {
          setData(parsed);
          setFilters(INITIAL_FILTERS);
          setShowImportDialog(false);
        }
      }
    };
    reader.readAsText(file);
  };

  const handleApplyPastedCsv = () => {
    if (!pastedCsv.trim()) return;
    const parsed = parseSalesCsv(pastedCsv);
    if (parsed.length > 0) {
      setData(parsed);
      setFilters(INITIAL_FILTERS);
      setShowImportDialog(false);
      setPastedCsv('');
    }
  };

  const navTabs: { id: VisualizationView; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'All-In-One Overview', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
    { id: 'trends', label: 'Trends & Revenue', icon: <TrendingUp className="w-3.5 h-3.5" /> },
    { id: 'products', label: 'Product Performance', icon: <Package className="w-3.5 h-3.5" /> },
    { id: 'payments', label: 'Payment Methods', icon: <CreditCard className="w-3.5 h-3.5" /> },
    { id: 'calendar', label: 'Calendar Heatmap', icon: <Calendar className="w-3.5 h-3.5" /> },
    { id: 'orders', label: 'Basket & Tiers', icon: <ShoppingCart className="w-3.5 h-3.5" /> },
    { id: 'ledger', label: 'Item Ledger', icon: <Table className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="min-h-screen bg-zinc-100/70 text-zinc-900 font-sans antialiased pb-12">
      {/* Top Application Header */}
      <header id="main-header" className="bg-white border-b border-zinc-200/80 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo / Title */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                <LayoutDashboard className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm font-bold text-zinc-900 leading-tight">
                    Sales Analytics Dashboard
                  </h1>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                    {data.length} items loaded
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 hidden sm:block">
                  Interactive multi-view visualization of retail sales transactions
                </p>
              </div>
            </div>

            {/* Actions: Import CSV / Reset */}
            <div className="flex items-center gap-2">
              <button
                id="btn-open-import"
                onClick={() => setShowImportDialog(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
                title="Upload or paste custom CSV dataset"
              >
                <Upload className="w-3.5 h-3.5 text-zinc-600" />
                <span className="hidden sm:inline">Import Data</span>
              </button>

              {data.length !== INITIAL_DATA.length && (
                <button
                  id="btn-reset-sample"
                  onClick={handleResetToSample}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
                  title="Reload original 108 sample records"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span className="hidden sm:inline">Reset Sample</span>
                </button>
              )}
            </div>
          </div>

          {/* Visualization Mode Selector Navigation Bar */}
          <div className="flex items-center space-x-1 overflow-x-auto py-1 border-t border-zinc-100 scrollbar-none">
            {navTabs.map((tab) => {
              const isActive = activeView === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-tab-${tab.id}`}
                  onClick={() => setActiveView(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-zinc-900 text-white shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 space-y-5">
        {/* KPI Banner always visible */}
        <KPIBanner kpis={kpis} />

        {/* Global Filter Toolbar */}
        <FilterControls
          filters={filters}
          onFilterChange={setFilters}
          onReset={handleResetFilters}
          totalFilteredCount={filteredData.length}
          totalDatasetCount={data.length}
        />

        {/* Dynamic Views based on activeView */}
        {activeView === 'overview' && (
          <div className="space-y-5">
            {/* Primary Visualizations Grid: Trend & Product Performance */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <TrendVisualizer dailyData={dailyTrends} />
              <ProductVisualizer productStats={productStats} allRecords={filteredData} />
            </div>

            {/* Secondary Visualizations Grid: Payment Donut & Basket Tiers */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <PaymentVisualizer paymentStats={paymentStats} />
              <OrderBasketVisualizer basketStats={basketStats} />
            </div>

            {/* Heatmap Section */}
            <CalendarVisualizer records={filteredData} />

            {/* Detailed Ledger Section */}
            <LedgerTable records={filteredData} />
          </div>
        )}

        {activeView === 'trends' && <TrendVisualizer dailyData={dailyTrends} />}

        {activeView === 'products' && (
          <ProductVisualizer productStats={productStats} allRecords={filteredData} />
        )}

        {activeView === 'payments' && <PaymentVisualizer paymentStats={paymentStats} />}

        {activeView === 'calendar' && <CalendarVisualizer records={filteredData} />}

        {activeView === 'orders' && <OrderBasketVisualizer basketStats={basketStats} />}

        {activeView === 'ledger' && <LedgerTable records={filteredData} />}
      </main>

      {/* Import CSV Modal Dialog (native HTML dialog style) */}
      {showImportDialog && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                <Upload className="w-4 h-4 text-zinc-700" />
                Import Sales Data
              </h3>
              <button
                onClick={() => setShowImportDialog(false)}
                className="text-zinc-400 hover:text-zinc-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-zinc-500">
              Upload a CSV file or paste raw CSV text containing columns:{' '}
              <code className="bg-zinc-100 px-1 py-0.5 rounded text-zinc-700">
                Order Number,Product,Price,Date,Payment Method
              </code>
            </p>

            {/* File upload input */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Upload CSV File
              </label>
              {/* ponytail: native file input */}
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                className="block w-full text-xs text-zinc-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-zinc-900 file:text-white hover:file:bg-zinc-800 cursor-pointer"
              />
            </div>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-zinc-200 w-full" />
              <span className="bg-white px-2 text-[11px] text-zinc-400 absolute">OR PASTE CSV</span>
            </div>

            {/* Paste textarea */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Paste CSV Text
              </label>
              <textarea
                rows={5}
                placeholder="Order Number,Product,Price,Date,Payment Method&#10;TT-1001,Slim-Fit Denim Jeans,$88.00,2025-08-15,Credit Card..."
                value={pastedCsv}
                onChange={(e) => setPastedCsv(e.target.value)}
                className="w-full text-xs font-mono p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-800 focus:outline-hidden focus:ring-1 focus:ring-zinc-400"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100">
              <button
                onClick={() => setShowImportDialog(false)}
                className="px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyPastedCsv}
                disabled={!pastedCsv.trim()}
                className="px-3 py-1.5 text-xs bg-zinc-900 text-white rounded-lg font-semibold hover:bg-zinc-800 disabled:opacity-40"
              >
                Apply Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
