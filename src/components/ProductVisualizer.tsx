import React, { useState } from 'react';
import { ProductStat } from '../utils/analytics';
import { SaleRecord } from '../types';
import { Package, ArrowUpDown, Info } from 'lucide-react';

interface Props {
  productStats: ProductStat[];
  allRecords: SaleRecord[];
  onSelectProduct?: (productName: string) => void;
}

type SortBy = 'revenue' | 'units' | 'price';

export const ProductVisualizer: React.FC<Props> = ({ productStats, allRecords }) => {
  const [sortBy, setSortBy] = useState<SortBy>('revenue');
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  const sortedStats = [...productStats].sort((a, b) => {
    if (sortBy === 'revenue') return b.revenue - a.revenue;
    if (sortBy === 'units') return b.units - a.units;
    return b.averagePrice - a.averagePrice;
  });

  const maxRevenue = Math.max(...sortedStats.map((s) => s.revenue), 1);
  const maxUnits = Math.max(...sortedStats.map((s) => s.units), 1);

  // Selected product details
  const activeProduct = selectedProduct
    ? sortedStats.find((p) => p.product === selectedProduct)
    : sortedStats[0];

  const activeProductOrders = activeProduct
    ? allRecords.filter((r) => r.product === activeProduct.product)
    : [];

  return (
    <div id="product-visualizer-card" className="bg-white rounded-xl border border-zinc-200/80 p-5 shadow-xs space-y-4">
      {/* Header & Sort Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
            <Package className="w-4 h-4 text-zinc-700" />
            Product Catalog Performance
          </h2>
          <p className="text-xs text-zinc-500">
            Comparative revenue and unit volume across catalog apparel items
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-zinc-100 p-0.5 rounded-lg text-xs font-medium text-zinc-600">
          <span className="text-zinc-400 px-1.5 flex items-center gap-1 text-[11px]">
            <ArrowUpDown className="w-3 h-3" /> Sort:
          </span>
          <button
            onClick={() => setSortBy('revenue')}
            className={`px-2 py-1 rounded-md transition-colors ${
              sortBy === 'revenue' ? 'bg-white text-zinc-900 shadow-xs font-semibold' : 'hover:text-zinc-900'
            }`}
          >
            By Revenue
          </button>
          <button
            onClick={() => setSortBy('units')}
            className={`px-2 py-1 rounded-md transition-colors ${
              sortBy === 'units' ? 'bg-white text-zinc-900 shadow-xs font-semibold' : 'hover:text-zinc-900'
            }`}
          >
            By Units
          </button>
          <button
            onClick={() => setSortBy('price')}
            className={`px-2 py-1 rounded-md transition-colors ${
              sortBy === 'price' ? 'bg-white text-zinc-900 shadow-xs font-semibold' : 'hover:text-zinc-900'
            }`}
          >
            By Unit Price
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Horizontal Bar Charts */}
        <div className="lg:col-span-2 space-y-2.5">
          {sortedStats.map((stat, index) => {
            const revPercent = (stat.revenue / maxRevenue) * 100;
            const isSelected = activeProduct?.product === stat.product;

            return (
              <div
                key={stat.product}
                onClick={() => setSelectedProduct(stat.product)}
                className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/40'
                    : 'border-zinc-200/60 hover:border-zinc-300 hover:bg-zinc-50/60'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 font-mono text-zinc-400 text-[11px]">
                      #{index + 1}
                    </span>
                    <span className="font-semibold text-zinc-900">{stat.product}</span>
                    <span className="text-[11px] px-1.5 py-0.2 bg-zinc-100 text-zinc-600 rounded">
                      ${stat.averagePrice.toFixed(0)}/ea
                    </span>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <span className="text-zinc-500 font-mono">{stat.units} units</span>
                    <strong className="font-semibold text-zinc-900 font-mono">
                      ${stat.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </strong>
                  </div>
                </div>

                {/* Progress bar representing revenue percentage */}
                <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden flex">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${revPercent}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[10px] text-zinc-400 mt-1">
                  <span>{stat.shareOfTotalRevenue.toFixed(1)}% of total revenue</span>
                  <span>{((stat.units / maxUnits) * 100).toFixed(0)}% of max unit sales</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Col: Product Drilldown Detail Box */}
        {activeProduct && (
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-1.5 text-zinc-500 text-xs font-medium uppercase tracking-wider mb-1">
                <Info className="w-3.5 h-3.5" /> Product Spotlight
              </div>
              <h3 className="text-base font-bold text-zinc-900">{activeProduct.product}</h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Detailed metrics for this apparel catalog item
              </p>

              <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                <div className="bg-white p-2.5 rounded-lg border border-zinc-200/80">
                  <span className="text-zinc-400 block text-[11px]">Total Revenue</span>
                  <span className="text-sm font-bold text-zinc-900">
                    ${activeProduct.revenue.toFixed(2)}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-zinc-200/80">
                  <span className="text-zinc-400 block text-[11px]">Units Sold</span>
                  <span className="text-sm font-bold text-zinc-900">
                    {activeProduct.units} items
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-zinc-200/80">
                  <span className="text-zinc-400 block text-[11px]">Unit Price</span>
                  <span className="text-sm font-bold text-zinc-900">
                    ${activeProduct.averagePrice.toFixed(2)}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-zinc-200/80">
                  <span className="text-zinc-400 block text-[11px]">Revenue Share</span>
                  <span className="text-sm font-bold text-zinc-900">
                    {activeProduct.shareOfTotalRevenue.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Payment Methods used for this specific product */}
              <div className="mt-4">
                <h4 className="text-xs font-semibold text-zinc-700 mb-2">
                  Payment Channels for {activeProduct.product.split(' ')[0]}
                </h4>
                <div className="space-y-1.5 text-xs">
                  {(['Credit Card', 'eWallet', 'Debit Card', 'Cash'] as const).map((method) => {
                    const count = activeProductOrders.filter((r) => r.paymentMethod === method).length;
                    const pct = activeProductOrders.length > 0 ? (count / activeProductOrders.length) * 100 : 0;
                    return (
                      <div key={method} className="flex items-center justify-between text-[11px]">
                        <span className="text-zinc-600">{method}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-zinc-800">{count}x</span>
                          <span className="text-zinc-400 w-9 text-right font-mono">
                            {pct.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Recent Orders of this item */}
            <div className="pt-3 border-t border-zinc-200">
              <span className="text-[11px] font-semibold text-zinc-600 block mb-1.5">
                Recent Orders ({activeProductOrders.length} total)
              </span>
              <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                {activeProductOrders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between text-[11px] bg-white px-2 py-1 rounded border border-zinc-200/70"
                  >
                    <span className="font-mono font-medium text-zinc-700">{order.orderNumber}</span>
                    <span className="text-zinc-400">{order.date}</span>
                    <span className="text-zinc-600">{order.paymentMethod}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
