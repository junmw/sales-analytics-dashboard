import React from 'react';
import { BasketStat } from '../utils/analytics';
import { ShoppingCart, PieChart, Layers, Tag } from 'lucide-react';

interface Props {
  basketStats: BasketStat;
}

export const OrderBasketVisualizer: React.FC<Props> = ({ basketStats }) => {
  const totalOrders = basketStats.singleItemOrders + basketStats.multiItemOrders;
  const singlePct = totalOrders > 0 ? (basketStats.singleItemOrders / totalOrders) * 100 : 0;
  const multiPct = totalOrders > 0 ? (basketStats.multiItemOrders / totalOrders) * 100 : 0;

  const maxTierCount = Math.max(...basketStats.priceTiers.map((t) => t.count), 1);
  const totalTierRevenue = basketStats.priceTiers.reduce((acc, t) => acc + t.revenue, 0);

  return (
    <div id="order-basket-visualizer-card" className="bg-white rounded-xl border border-zinc-200/80 p-5 shadow-xs space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-zinc-700" />
          Order Basket & Price Tier Analysis
        </h2>
        <p className="text-xs text-zinc-500">
          Distribution of multi-item checkouts and customer spending brackets
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left Card: Basket Size Distribution */}
        <div className="p-4 rounded-xl border border-zinc-200/80 bg-zinc-50/50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-zinc-500" /> Checkout Basket Size
            </span>
            <span className="text-xs font-mono text-zinc-500">{totalOrders} total orders</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded-lg border border-zinc-200">
              <span className="text-xs text-zinc-500 block">Single-Item</span>
              <span className="text-lg font-bold text-zinc-900">
                {basketStats.singleItemOrders}
              </span>
              <span className="text-[11px] text-zinc-400 block mt-0.5">
                {singlePct.toFixed(1)}% of orders
              </span>
            </div>

            <div className="bg-white p-3 rounded-lg border border-zinc-200">
              <span className="text-xs text-zinc-500 block">Multi-Item (2+)</span>
              <span className="text-lg font-bold text-blue-600">
                {basketStats.multiItemOrders}
              </span>
              <span className="text-[11px] text-zinc-400 block mt-0.5">
                {multiPct.toFixed(1)}% of orders
              </span>
            </div>
          </div>

          {/* Comparative visual bar */}
          <div className="w-full bg-zinc-200 h-3 rounded-full overflow-hidden flex">
            <div
              className="bg-zinc-800 h-full transition-all"
              style={{ width: `${singlePct}%` }}
              title={`Single item: ${singlePct.toFixed(1)}%`}
            />
            <div
              className="bg-blue-600 h-full transition-all"
              style={{ width: `${multiPct}%` }}
              title={`Multi-item: ${multiPct.toFixed(1)}%`}
            />
          </div>
          <div className="flex justify-between text-[11px] text-zinc-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-zinc-800" /> Single-item ({singlePct.toFixed(1)}%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-600" /> Multi-item ({multiPct.toFixed(1)}%)
            </span>
          </div>
        </div>

        {/* Right Card: Price Tier Distribution */}
        <div className="p-4 rounded-xl border border-zinc-200/80 bg-zinc-50/50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-zinc-500" /> Item Price Brackets
            </span>
            <span className="text-xs text-zinc-500 font-mono">Volume by Bracket</span>
          </div>

          <div className="space-y-2">
            {basketStats.priceTiers.map((tier) => {
              const widthPct = (tier.count / maxTierCount) * 100;
              const revShare = totalTierRevenue > 0 ? (tier.revenue / totalTierRevenue) * 100 : 0;

              return (
                <div key={tier.tier} className="bg-white p-2.5 rounded-lg border border-zinc-200/70">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-zinc-800">{tier.tier}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-500">{tier.count} items</span>
                      <span className="font-mono font-bold text-zinc-900">
                        ${tier.revenue.toFixed(0)}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-1 flex justify-between">
                    <span>{revShare.toFixed(1)}% of catalog revenue</span>
                    <span>Avg ~${tier.count > 0 ? (tier.revenue / tier.count).toFixed(0) : 0}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
