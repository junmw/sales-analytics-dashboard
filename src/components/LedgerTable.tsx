import React, { useState } from 'react';
import { SaleRecord } from '../types';
import { Download, ArrowUpDown, ChevronLeft, ChevronRight, Table } from 'lucide-react';

interface Props {
  records: SaleRecord[];
}

type SortField = 'orderNumber' | 'product' | 'price' | 'date' | 'paymentMethod';

export const LedgerTable: React.FC<Props> = ({ records }) => {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const pageSize = 15;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedRecords = [...records].sort((a, b) => {
    let comp = 0;
    if (sortField === 'price') {
      comp = a.price - b.price;
    } else if (sortField === 'date') {
      comp = a.date.localeCompare(b.date);
    } else if (sortField === 'orderNumber') {
      comp = a.orderNumber.localeCompare(b.orderNumber);
    } else if (sortField === 'product') {
      comp = a.product.localeCompare(b.product);
    } else if (sortField === 'paymentMethod') {
      comp = a.paymentMethod.localeCompare(b.paymentMethod);
    }
    return sortAsc ? comp : -comp;
  });

  const totalPages = Math.max(1, Math.ceil(sortedRecords.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = sortedRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // ponytail: browser has native Blob and anchor download built-in
  const exportCsv = () => {
    const headers = 'Order Number,Product,Price,Date,Payment Method\n';
    const rows = sortedRecords
      .map((r) => `${r.orderNumber},"${r.product}",$${r.price.toFixed(2)},${r.date},${r.paymentMethod}`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `sales-data-export-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="ledger-table-card" className="bg-white rounded-xl border border-zinc-200/80 p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
            <Table className="w-4 h-4 text-zinc-700" />
            Transaction Ledger & Data Inspector
          </h2>
          <p className="text-xs text-zinc-500">
            Full itemized view with column sorting and raw export
          </p>
        </div>

        <button
          id="export-csv-btn"
          onClick={exportCsv}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors shadow-xs"
        >
          <Download className="w-3.5 h-3.5" /> Export CSV ({records.length})
        </button>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto border border-zinc-200 rounded-lg">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold">
            <tr>
              <th
                onClick={() => handleSort('orderNumber')}
                className="py-2.5 px-3 cursor-pointer hover:bg-zinc-100 transition-colors"
              >
                <div className="flex items-center gap-1">
                  Order # <ArrowUpDown className="w-3 h-3 text-zinc-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('product')}
                className="py-2.5 px-3 cursor-pointer hover:bg-zinc-100 transition-colors"
              >
                <div className="flex items-center gap-1">
                  Product <ArrowUpDown className="w-3 h-3 text-zinc-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('price')}
                className="py-2.5 px-3 cursor-pointer hover:bg-zinc-100 transition-colors text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  Price <ArrowUpDown className="w-3 h-3 text-zinc-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('date')}
                className="py-2.5 px-3 cursor-pointer hover:bg-zinc-100 transition-colors"
              >
                <div className="flex items-center gap-1">
                  Date <ArrowUpDown className="w-3 h-3 text-zinc-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('paymentMethod')}
                className="py-2.5 px-3 cursor-pointer hover:bg-zinc-100 transition-colors"
              >
                <div className="flex items-center gap-1">
                  Payment Method <ArrowUpDown className="w-3 h-3 text-zinc-400" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200/70">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-zinc-400">
                  No records match current filter criteria.
                </td>
              </tr>
            ) : (
              paginated.map((r) => (
                <tr key={r.id} className="hover:bg-zinc-50/70 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-medium text-zinc-900">
                    {r.orderNumber}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-zinc-800">{r.product}</td>
                  <td className="py-2.5 px-3 font-mono font-semibold text-zinc-900 text-right">
                    ${r.price.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-zinc-600 font-mono">{r.date}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${
                        r.paymentMethod === 'Credit Card'
                          ? 'bg-blue-50 text-blue-700'
                          : r.paymentMethod === 'eWallet'
                          ? 'bg-emerald-50 text-emerald-700'
                          : r.paymentMethod === 'Debit Card'
                          ? 'bg-violet-50 text-violet-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {r.paymentMethod}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-zinc-500">
        <div>
          Showing{' '}
          <strong className="text-zinc-800">
            {sortedRecords.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
          </strong>{' '}
          to{' '}
          <strong className="text-zinc-800">
            {Math.min(currentPage * pageSize, sortedRecords.length)}
          </strong>{' '}
          of <strong className="text-zinc-800">{sortedRecords.length}</strong> items
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-md border border-zinc-200 text-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 font-mono">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-md border border-zinc-200 text-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
