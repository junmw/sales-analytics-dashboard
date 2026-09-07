import React from 'react';
import { KPISummary } from '../utils/analytics';
import { DollarSign, ShoppingBag, Receipt, TrendingUp, Award, CreditCard } from 'lucide-react';

interface Props {
  kpis: KPISummary;
}

export const KPIBanner: React.FC<Props> = ({ kpis }) => {
  return (
    <div id="kpi-banner-grid" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* Total Revenue */}
      <div id="kpi-revenue" className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-xs">
        <div className="flex items-center justify-between text-zinc-500 mb-1">
          <span className="text-xs font-medium uppercase tracking-wider">Revenue</span>
          <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <DollarSign className="w-3.5 h-3.5" />
          </span>
        </div>
        <div className="text-xl font-bold text-zinc-900 tracking-tight">
          ${kpis.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="text-xs text-zinc-500 mt-1">Gross sales</div>
      </div>

      {/* Total Units */}
      <div id="kpi-units" className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-xs">
        <div className="flex items-center justify-between text-zinc-500 mb-1">
          <span className="text-xs font-medium uppercase tracking-wider">Units Sold</span>
          <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
            <ShoppingBag className="w-3.5 h-3.5" />
          </span>
        </div>
        <div className="text-xl font-bold text-zinc-900 tracking-tight">
          {kpis.totalUnits.toLocaleString()}
        </div>
        <div className="text-xs text-zinc-500 mt-1">Total items billed</div>
      </div>

      {/* Unique Orders */}
      <div id="kpi-orders" className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-xs">
        <div className="flex items-center justify-between text-zinc-500 mb-1">
          <span className="text-xs font-medium uppercase tracking-wider">Orders</span>
          <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
            <Receipt className="w-3.5 h-3.5" />
          </span>
        </div>
        <div className="text-xl font-bold text-zinc-900 tracking-tight">
          {kpis.uniqueOrdersCount}
        </div>
        <div className="text-xs text-zinc-500 mt-1">Distinct checkout IDs</div>
      </div>

      {/* Average Order Value */}
      <div id="kpi-aov" className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-xs">
        <div className="flex items-center justify-between text-zinc-500 mb-1">
          <span className="text-xs font-medium uppercase tracking-wider">Avg Order</span>
          <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
            <TrendingUp className="w-3.5 h-3.5" />
          </span>
        </div>
        <div className="text-xl font-bold text-zinc-900 tracking-tight">
          ${kpis.averageOrderValue.toFixed(2)}
        </div>
        <div className="text-xs text-zinc-500 mt-1">Per transaction basket</div>
      </div>

      {/* Top Product */}
      <div id="kpi-top-product" className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-xs">
        <div className="flex items-center justify-between text-zinc-500 mb-1">
          <span className="text-xs font-medium uppercase tracking-wider">Top Product</span>
          <span className="p-1.5 bg-violet-50 text-violet-600 rounded-lg">
            <Award className="w-3.5 h-3.5" />
          </span>
        </div>
        <div className="text-sm font-semibold text-zinc-900 truncate" title={kpis.topProduct.name}>
          {kpis.topProduct.name}
        </div>
        <div className="text-xs text-zinc-500 mt-1">
          ${kpis.topProduct.revenue.toFixed(0)} ({kpis.topProduct.units} units)
        </div>
      </div>

      {/* Top Payment Method */}
      <div id="kpi-top-payment" className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-xs">
        <div className="flex items-center justify-between text-zinc-500 mb-1">
          <span className="text-xs font-medium uppercase tracking-wider">Top Payment</span>
          <span className="p-1.5 bg-teal-50 text-teal-600 rounded-lg">
            <CreditCard className="w-3.5 h-3.5" />
          </span>
        </div>
        <div className="text-sm font-semibold text-zinc-900">
          {kpis.topPaymentMethod.method}
        </div>
        <div className="text-xs text-zinc-500 mt-1">
          ${kpis.topPaymentMethod.revenue.toFixed(0)} ({kpis.topPaymentMethod.percentage.toFixed(1)}%)
        </div>
      </div>
    </div>
  );
};
