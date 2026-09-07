import React, { useState, useMemo } from 'react';
import { DayData } from '../utils/analytics';
import { TrendingUp, DollarSign, Calendar, Layers } from 'lucide-react';

interface Props {
  dailyData: DayData[];
}

type MetricType = 'revenue' | 'units' | 'orders';
type ModeType = 'standard' | 'cumulative' | 'movingAvg';

export const TrendVisualizer: React.FC<Props> = ({ dailyData }) => {
  const [metric, setMetric] = useState<MetricType>('revenue');
  const [mode, setMode] = useState<ModeType>('standard');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Compute processed data points
  const chartPoints = useMemo(() => {
    if (dailyData.length === 0) return [];

    let runningCumulative = 0;
    return dailyData.map((d, i) => {
      let rawVal = metric === 'revenue' ? d.revenue : metric === 'units' ? d.units : d.orderCount;
      runningCumulative += rawVal;

      let value = rawVal;
      if (mode === 'cumulative') {
        value = runningCumulative;
      } else if (mode === 'movingAvg') {
        // 5-point moving average
        const start = Math.max(0, i - 2);
        const end = Math.min(dailyData.length - 1, i + 2);
        let sum = 0;
        for (let j = start; j <= end; j++) {
          sum +=
            metric === 'revenue'
              ? dailyData[j].revenue
              : metric === 'units'
              ? dailyData[j].units
              : dailyData[j].orderCount;
        }
        value = sum / (end - start + 1);
      }

      return {
        ...d,
        computedValue: value,
        rawVal,
      };
    });
  }, [dailyData, metric, mode]);

  if (chartPoints.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-zinc-200/80 p-8 text-center text-zinc-500 text-sm">
        No sales data available for the selected filters.
      </div>
    );
  }

  // SVG dimensions & math
  const width = 800;
  const height = 300;
  const paddingLeft = 60;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 40;

  const innerWidth = width - paddingLeft - paddingRight;
  const innerHeight = height - paddingTop - paddingBottom;

  const maxVal = Math.max(...chartPoints.map((p) => p.computedValue), 1);
  const minVal = 0;

  const getX = (index: number) => {
    if (chartPoints.length === 1) return paddingLeft + innerWidth / 2;
    return paddingLeft + (index / (chartPoints.length - 1)) * innerWidth;
  };

  const getY = (val: number) => {
    return paddingTop + innerHeight - ((val - minVal) / (maxVal - minVal)) * innerHeight;
  };

  // Build SVG path
  const linePoints = chartPoints.map((p, i) => `${getX(i)},${getY(p.computedValue)}`).join(' ');
  const areaPath = `M ${getX(0)},${getY(0)} L ${linePoints.replace(/ /g, ' L ')} L ${getX(
    chartPoints.length - 1
  )},${getY(0)} Z`;

  // Summary stats
  const totalInView = chartPoints.reduce((acc, p) => acc + p.rawVal, 0);
  const peakDay = chartPoints.reduce((max, p) => (p.rawVal > max.rawVal ? p : max), chartPoints[0]);
  const avgPerDay = totalInView / chartPoints.length;

  return (
    <div id="trend-visualizer-card" className="bg-white rounded-xl border border-zinc-200/80 p-5 shadow-xs space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-zinc-700" />
            Time Series & Trend Analysis
          </h2>
          <p className="text-xs text-zinc-500">
            Timeline progression from Aug 15 to Oct 7 with interactive data points
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Metric Selector */}
          <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg text-xs font-medium text-zinc-600">
            <button
              onClick={() => setMetric('revenue')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                metric === 'revenue' ? 'bg-white text-zinc-900 shadow-xs font-semibold' : 'hover:text-zinc-900'
              }`}
            >
              Revenue ($)
            </button>
            <button
              onClick={() => setMetric('units')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                metric === 'units' ? 'bg-white text-zinc-900 shadow-xs font-semibold' : 'hover:text-zinc-900'
              }`}
            >
              Units
            </button>
            <button
              onClick={() => setMetric('orders')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                metric === 'orders' ? 'bg-white text-zinc-900 shadow-xs font-semibold' : 'hover:text-zinc-900'
              }`}
            >
              Orders
            </button>
          </div>

          {/* Mode Selector */}
          <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg text-xs font-medium text-zinc-600">
            <button
              onClick={() => setMode('standard')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                mode === 'standard' ? 'bg-white text-zinc-900 shadow-xs font-semibold' : 'hover:text-zinc-900'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setMode('movingAvg')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                mode === 'movingAvg' ? 'bg-white text-zinc-900 shadow-xs font-semibold' : 'hover:text-zinc-900'
              }`}
            >
              5-Day Avg
            </button>
            <button
              onClick={() => setMode('cumulative')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                mode === 'cumulative' ? 'bg-white text-zinc-900 shadow-xs font-semibold' : 'hover:text-zinc-900'
              }`}
            >
              Cumulative
            </button>
          </div>
        </div>
      </div>

      {/* Metric Mini Highlights */}
      <div className="grid grid-cols-3 gap-3 py-2 px-3 bg-zinc-50 rounded-lg text-xs">
        <div>
          <span className="text-zinc-500">Period Total:</span>{' '}
          <strong className="text-zinc-900">
            {metric === 'revenue' ? `$${totalInView.toFixed(2)}` : totalInView.toLocaleString()}
          </strong>
        </div>
        <div>
          <span className="text-zinc-500">Daily Average:</span>{' '}
          <strong className="text-zinc-900">
            {metric === 'revenue' ? `$${avgPerDay.toFixed(2)}` : avgPerDay.toFixed(1)}
          </strong>
        </div>
        <div>
          <span className="text-zinc-500">Peak Single Day:</span>{' '}
          <strong className="text-zinc-900">
            {metric === 'revenue' ? `$${peakDay.rawVal.toFixed(2)}` : peakDay.rawVal} on{' '}
            {peakDay.date.slice(5)}
          </strong>
        </div>
      </div>

      {/* Responsive SVG Chart */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto max-h-[340px] select-none"
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines (horizontal) */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = paddingTop + innerHeight * (1 - ratio);
            const val = minVal + ratio * (maxVal - minVal);
            return (
              <g key={ratio}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#e4e4e7"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[10px] fill-zinc-400 font-mono"
                >
                  {metric === 'revenue'
                    ? `$${Math.round(val)}`
                    : Math.round(val).toString()}
                </text>
              </g>
            );
          })}

          {/* Filled Area */}
          <path d={areaPath} fill="url(#areaGradient)" />

          {/* Line Stroke */}
          <polyline
            fill="none"
            stroke="#2563eb"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={linePoints}
          />

          {/* Data Points and Hover Target hitboxes */}
          {chartPoints.map((p, i) => {
            const cx = getX(i);
            const cy = getY(p.computedValue);
            const isHovered = hoveredIndex === i;

            return (
              <g
                key={p.date}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Vertical hover indicator line */}
                {isHovered && (
                  <line
                    x1={cx}
                    y1={paddingTop}
                    x2={cx}
                    y2={height - paddingBottom}
                    stroke="#94a3b8"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                )}

                {/* Point Circle */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 5 : 3}
                  fill={isHovered ? '#1d4ed8' : '#ffffff'}
                  stroke="#2563eb"
                  strokeWidth={isHovered ? 2.5 : 1.5}
                />

                {/* Larger transparent hitbox for easy mouse targeting */}
                <rect
                  x={cx - 8}
                  y={paddingTop}
                  width={16}
                  height={innerHeight}
                  fill="transparent"
                />
              </g>
            );
          })}

          {/* X Axis Dates (sample every 6-7 days) */}
          {chartPoints.map((p, i) => {
            const step = Math.max(1, Math.floor(chartPoints.length / 7));
            if (i % step === 0 || i === chartPoints.length - 1) {
              const x = getX(i);
              return (
                <text
                  key={p.date}
                  x={x}
                  y={height - paddingBottom + 18}
                  textAnchor="middle"
                  className="text-[10px] fill-zinc-500 font-mono"
                >
                  {p.date.slice(5)}
                </text>
              );
            }
            return null;
          })}
        </svg>

        {/* Floating Tooltip if hovering a point */}
        {hoveredIndex !== null && chartPoints[hoveredIndex] && (
          <div
            className="absolute z-20 bg-zinc-900 text-white text-xs rounded-lg p-2.5 shadow-xl pointer-events-none transition-all duration-75"
            style={{
              left: `${(getX(hoveredIndex) / width) * 100}%`,
              top: `${Math.max(10, (getY(chartPoints[hoveredIndex].computedValue) / height) * 100 - 30)}%`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div className="font-semibold text-zinc-200 border-b border-zinc-700 pb-1 mb-1">
              {chartPoints[hoveredIndex].date}
            </div>
            <div className="space-y-0.5">
              <div className="flex justify-between gap-4">
                <span className="text-zinc-400">Day Revenue:</span>
                <span className="font-medium text-emerald-400">
                  ${chartPoints[hoveredIndex].revenue.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-zinc-400">Units Billed:</span>
                <span className="font-medium">{chartPoints[hoveredIndex].units}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-zinc-400">Orders:</span>
                <span className="font-medium">{chartPoints[hoveredIndex].orderCount}</span>
              </div>
              {mode !== 'standard' && (
                <div className="flex justify-between gap-4 pt-1 border-t border-zinc-700/60 text-zinc-300">
                  <span>{mode === 'cumulative' ? 'Cumulative:' : '5-Day Avg:'}</span>
                  <span className="font-mono">
                    {metric === 'revenue'
                      ? `$${chartPoints[hoveredIndex].computedValue.toFixed(2)}`
                      : chartPoints[hoveredIndex].computedValue.toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
