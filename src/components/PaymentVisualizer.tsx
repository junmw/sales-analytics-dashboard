import React, { useState } from 'react';
import { PaymentStat } from '../utils/analytics';
import { CreditCard, Wallet, Banknote, Smartphone } from 'lucide-react';
import { PaymentMethod } from '../types';

interface Props {
  paymentStats: PaymentStat[];
}

const METHOD_CONFIG: Record<
  PaymentMethod,
  { color: string; hoverColor: string; icon: React.ReactNode; bgLight: string }
> = {
  'Credit Card': {
    color: '#3b82f6', // blue-500
    hoverColor: '#1d4ed8',
    icon: <CreditCard className="w-4 h-4 text-blue-600" />,
    bgLight: 'bg-blue-50',
  },
  'Debit Card': {
    color: '#8b5cf6', // violet-500
    hoverColor: '#6d28d9',
    icon: <Banknote className="w-4 h-4 text-violet-600" />,
    bgLight: 'bg-violet-50',
  },
  eWallet: {
    color: '#10b981', // emerald-500
    hoverColor: '#047857',
    icon: <Smartphone className="w-4 h-4 text-emerald-600" />,
    bgLight: 'bg-emerald-50',
  },
  Cash: {
    color: '#f59e0b', // amber-500
    hoverColor: '#b45309',
    icon: <Wallet className="w-4 h-4 text-amber-600" />,
    bgLight: 'bg-amber-50',
  },
};

export const PaymentVisualizer: React.FC<Props> = ({ paymentStats }) => {
  const [hoveredMethod, setHoveredMethod] = useState<PaymentMethod | null>(null);
  const [metric, setMetric] = useState<'revenue' | 'units'>('revenue');

  const totalRevenue = paymentStats.reduce((acc, s) => acc + s.revenue, 0);
  const totalUnits = paymentStats.reduce((acc, s) => acc + s.units, 0);

  // SVG Donut Calculations
  // Radius = 70, StrokeWidth = 28, Circumference = 2 * PI * 70 ≈ 439.82
  const radius = 70;
  const strokeWidth = 28;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercent = 0;
  const donutSegments = paymentStats.map((stat) => {
    const value = metric === 'revenue' ? stat.revenue : stat.units;
    const total = metric === 'revenue' ? totalRevenue : totalUnits;
    const fraction = total > 0 ? value / total : 0;
    const dashLength = fraction * circumference;
    const strokeDashoffset = -cumulativePercent * circumference;

    cumulativePercent += fraction;

    return {
      method: stat.method,
      fraction,
      dashLength,
      strokeDashoffset,
      value,
      stat,
    };
  });

  const activeStat = hoveredMethod
    ? paymentStats.find((p) => p.method === hoveredMethod)
    : null;

  return (
    <div id="payment-visualizer-card" className="bg-white rounded-xl border border-zinc-200/80 p-5 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-zinc-700" />
            Payment Method Breakdown
          </h2>
          <p className="text-xs text-zinc-500">
            Payment channel distribution across Credit Card, Debit Card, eWallet, and Cash
          </p>
        </div>

        {/* Toggle Revenue vs Units for Donut */}
        <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg text-xs font-medium text-zinc-600">
          <button
            onClick={() => setMetric('revenue')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              metric === 'revenue' ? 'bg-white text-zinc-900 shadow-xs font-semibold' : 'hover:text-zinc-900'
            }`}
          >
            By Revenue ($)
          </button>
          <button
            onClick={() => setMetric('units')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              metric === 'units' ? 'bg-white text-zinc-900 shadow-xs font-semibold' : 'hover:text-zinc-900'
            }`}
          >
            By Unit Count
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Donut Chart (SVG) */}
        <div className="md:col-span-5 flex flex-col items-center justify-center relative">
          <div className="relative w-48 h-48">
            <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
              {/* Background circle track */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke="#f4f4f5"
                strokeWidth={strokeWidth}
              />
              {/* Segments */}
              {donutSegments.map((seg) => {
                const isHovered = hoveredMethod === seg.method;
                const config = METHOD_CONFIG[seg.method];
                return (
                  <circle
                    key={seg.method}
                    cx="100"
                    cy="100"
                    r={radius}
                    fill="none"
                    stroke={isHovered ? config.hoverColor : config.color}
                    strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                    strokeDasharray={`${seg.dashLength} ${circumference}`}
                    strokeDashoffset={seg.strokeDashoffset}
                    className="transition-all duration-200 cursor-pointer"
                    onMouseEnter={() => setHoveredMethod(seg.method)}
                    onMouseLeave={() => setHoveredMethod(null)}
                  />
                );
              })}
            </svg>

            {/* Donut Center Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              {activeStat ? (
                <>
                  <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                    {activeStat.method}
                  </span>
                  <span className="text-lg font-extrabold text-zinc-900">
                    {metric === 'revenue'
                      ? `$${activeStat.revenue.toFixed(0)}`
                      : `${activeStat.units} units`}
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    {(metric === 'revenue'
                      ? activeStat.revenueShare
                      : activeStat.unitShare
                    ).toFixed(1)}
                    %
                  </span>
                </>
              ) : (
                <>
                  <span className="text-[11px] font-medium text-zinc-400">Total Billed</span>
                  <span className="text-lg font-bold text-zinc-900">
                    {metric === 'revenue'
                      ? `$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 0 })}`
                      : `${totalUnits} items`}
                  </span>
                  <span className="text-[10px] text-zinc-400">Hover slice for details</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Breakdown Cards for each payment method */}
        <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {paymentStats.map((stat) => {
            const config = METHOD_CONFIG[stat.method];
            const isHovered = hoveredMethod === stat.method;
            const avgPerTransaction = stat.units > 0 ? stat.revenue / stat.units : 0;

            return (
              <div
                key={stat.method}
                onMouseEnter={() => setHoveredMethod(stat.method)}
                onMouseLeave={() => setHoveredMethod(null)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isHovered
                    ? 'border-zinc-400 bg-zinc-50 shadow-xs'
                    : 'border-zinc-200/80 bg-white hover:border-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`p-1.5 rounded-lg ${config.bgLight}`}>
                      {config.icon}
                    </span>
                    <span className="text-xs font-bold text-zinc-800">{stat.method}</span>
                  </div>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${config.color}15`,
                      color: config.color,
                    }}
                  >
                    {stat.revenueShare.toFixed(1)}%
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Revenue:</span>
                    <span className="font-semibold text-zinc-900">
                      ${stat.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Items Sold:</span>
                    <span className="font-mono text-zinc-700">{stat.units} units</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Orders:</span>
                    <span className="font-mono text-zinc-700">{stat.ordersCount}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-zinc-100 text-[11px]">
                    <span className="text-zinc-400">Avg / Item:</span>
                    <span className="font-medium text-zinc-600">
                      ${avgPerTransaction.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
