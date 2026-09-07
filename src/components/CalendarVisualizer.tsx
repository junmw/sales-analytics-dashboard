import React, { useState, useMemo } from 'react';
import { SaleRecord } from '../types';
import { Calendar as CalendarIcon, Info } from 'lucide-react';

interface Props {
  records: SaleRecord[];
}

export const CalendarVisualizer: React.FC<Props> = ({ records }) => {
  const [selectedDate, setSelectedDate] = useState<string | null>('2025-09-05');
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  // Group records by day
  const dailyMap = useMemo(() => {
    const map = new Map<
      string,
      { revenue: number; units: number; orders: Set<string>; items: SaleRecord[] }
    >();
    records.forEach((r) => {
      let entry = map.get(r.date);
      if (!entry) {
        entry = { revenue: 0, units: 0, orders: new Set(), items: [] };
        map.set(r.date, entry);
      }
      entry.revenue += r.price;
      entry.units += 1;
      entry.orders.add(r.orderNumber);
      entry.items.push(r);
    });
    return map;
  }, [records]);

  // Max daily revenue for scaling intensity
  const maxRevenue = useMemo(() => {
    let max = 1;
    dailyMap.forEach((v) => {
      if (v.revenue > max) max = v.revenue;
    });
    return max;
  }, [dailyMap]);

  // Generate days between Aug 15 and Oct 07
  const calendarMonths = useMemo(() => {
    // August 2025 (15 to 31)
    // September 2025 (1 to 30)
    // October 2025 (1 to 07)
    const months = [
      { name: 'August 2025', year: 2025, month: 7, daysInMonth: 31, startDay: 15, endDay: 31 },
      { name: 'September 2025', year: 2025, month: 8, daysInMonth: 30, startDay: 1, endDay: 30 },
      { name: 'October 2025', year: 2025, month: 9, daysInMonth: 31, startDay: 1, endDay: 7 },
    ];

    return months.map((m) => {
      // First day of this month
      const firstDayOfWeek = new Date(m.year, m.month, 1).getDay(); // 0 = Sun
      const daySlots: Array<{ dayNumber: number; dateStr: string; inRange: boolean } | null> = [];

      // Pre-fill blanks for days before day 1 of month
      for (let i = 0; i < firstDayOfWeek; i++) {
        daySlots.push(null);
      }

      // Add each day of the month
      for (let d = 1; d <= m.daysInMonth; d++) {
        const dateStr = `${m.year}-${String(m.month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const inRange = d >= m.startDay && d <= m.endDay;
        daySlots.push({ dayNumber: d, dateStr, inRange });
      }

      return {
        ...m,
        daySlots,
      };
    });
  }, []);

  const activeDate = hoveredDate || selectedDate;
  const activeDayDetails = activeDate ? dailyMap.get(activeDate) : null;

  return (
    <div id="calendar-visualizer-card" className="bg-white rounded-xl border border-zinc-200/80 p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-zinc-700" />
            Calendar Sales Activity Heatmap
          </h2>
          <p className="text-xs text-zinc-500">
            Daily revenue intensity matrix across the 8-week sales window
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
          <span className="text-[11px]">Less</span>
          <span className="w-3 h-3 rounded-xs bg-zinc-100 border border-zinc-200" />
          <span className="w-3 h-3 rounded-xs bg-emerald-200" />
          <span className="w-3 h-3 rounded-xs bg-emerald-400" />
          <span className="w-3 h-3 rounded-xs bg-emerald-600" />
          <span className="text-[11px]">More ($300+)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Calendar Months Grids */}
        <div className="lg:col-span-8 space-y-5">
          {calendarMonths.map((m) => (
            <div key={m.name} className="space-y-1.5">
              <div className="text-xs font-bold text-zinc-700">{m.name}</div>
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 text-[10px] text-zinc-400 font-medium text-center">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                  <div key={i}>{d}</div>
                ))}
              </div>
              {/* Days grid */}
              <div className="grid grid-cols-7 gap-1">
                {m.daySlots.map((slot, idx) => {
                  if (!slot) {
                    return <div key={`empty-${idx}`} className="h-9 rounded-md bg-transparent" />;
                  }

                  const dayData = dailyMap.get(slot.dateStr);
                  const revenue = dayData ? dayData.revenue : 0;
                  const intensity = revenue > 0 ? revenue / maxRevenue : 0;

                  // Pick color based on intensity
                  let bgColor = 'bg-zinc-50 text-zinc-400';
                  if (slot.inRange && dayData) {
                    if (intensity > 0.65) bgColor = 'bg-emerald-600 text-white font-bold';
                    else if (intensity > 0.35) bgColor = 'bg-emerald-400 text-zinc-900 font-semibold';
                    else bgColor = 'bg-emerald-200 text-emerald-950 font-medium';
                  } else if (slot.inRange && !dayData) {
                    bgColor = 'bg-zinc-100 text-zinc-400';
                  } else {
                    bgColor = 'opacity-25 bg-zinc-50 text-zinc-300';
                  }

                  const isSelected = selectedDate === slot.dateStr;

                  return (
                    <button
                      key={slot.dateStr}
                      disabled={!slot.inRange}
                      onClick={() => slot.inRange && setSelectedDate(slot.dateStr)}
                      onMouseEnter={() => slot.inRange && setHoveredDate(slot.dateStr)}
                      onMouseLeave={() => setHoveredDate(null)}
                      className={`h-9 rounded-md flex flex-col items-center justify-center p-0.5 text-xs transition-all relative ${bgColor} ${
                        isSelected ? 'ring-2 ring-zinc-900 ring-offset-1 z-10' : ''
                      } ${slot.inRange ? 'cursor-pointer hover:scale-105' : 'cursor-default'}`}
                      title={`${slot.dateStr}: $${revenue.toFixed(2)} (${dayData?.units || 0} items)`}
                    >
                      <span className="text-[10px] leading-none">{slot.dayNumber}</span>
                      {revenue > 0 && (
                        <span className="text-[9px] leading-tight opacity-90 truncate max-w-full px-0.5">
                          ${Math.round(revenue)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Selected Day Inspector Sidecard */}
        <div className="lg:col-span-4 bg-zinc-50 border border-zinc-200 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1 text-zinc-500 text-xs font-medium uppercase tracking-wider mb-1">
              <Info className="w-3.5 h-3.5" /> Day Details
            </div>
            <h3 className="text-base font-bold text-zinc-900">{activeDate || 'Select a day'}</h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Breakdown of customer orders processed on this date
            </p>

            {activeDayDetails ? (
              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-zinc-200">
                    <span className="text-zinc-400 block text-[11px]">Revenue</span>
                    <span className="text-sm font-bold text-emerald-600">
                      ${activeDayDetails.revenue.toFixed(2)}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-zinc-200">
                    <span className="text-zinc-400 block text-[11px]">Orders</span>
                    <span className="text-sm font-bold text-zinc-900">
                      {activeDayDetails.orders.size} checkout(s)
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-semibold text-zinc-700 block mb-1.5">
                    Items Billed ({activeDayDetails.items.length})
                  </span>
                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    {activeDayDetails.items.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white p-2 rounded-lg border border-zinc-200 text-xs flex justify-between items-center"
                      >
                        <div>
                          <div className="font-semibold text-zinc-900">{item.product}</div>
                          <div className="text-[10px] text-zinc-400 font-mono">
                            {item.orderNumber} • {item.paymentMethod}
                          </div>
                        </div>
                        <div className="font-bold text-zinc-900 font-mono">
                          ${item.price.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-zinc-400 italic mt-6">
                No orders registered on this day.
              </div>
            )}
          </div>

          <div className="text-[11px] text-zinc-400 mt-4 pt-3 border-t border-zinc-200">
            Click any active calendar date above to view its transaction ledger.
          </div>
        </div>
      </div>
    </div>
  );
};
