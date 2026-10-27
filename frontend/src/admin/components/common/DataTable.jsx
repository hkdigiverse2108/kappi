import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Filter,
  Trash2,
  CheckCircle,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Leaf
} from 'lucide-react';
import { bulkBarVariants, staggerContainer, rowVariants } from '../../lib/motion';

export const DataTable = ({
  columns,
  data,
  searchPlaceholder = 'Search records...',
  searchField = 'title',
  onRowClick,
  bulkActions,
  filters,
  activeFilter,
  onFilterChange,
  extraHeaderActions
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filter & Search
  const filteredData = useMemo(() => {
    let result = [...data];

    // Filter tab if provided
    if (activeFilter && activeFilter !== 'all' && activeFilter !== 'All') {
      result = result.filter((item) => {
        const itemStatus = (item.status || item.category || '').toLowerCase();
        return itemStatus === activeFilter.toLowerCase();
      });
    }

    // Search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter((item) => {
        return Object.values(item).some((val) => {
          if (typeof val === 'string') return val.toLowerCase().includes(q);
          if (typeof val === 'number') return val.toString().includes(q);
          if (typeof val === 'object' && val !== null) {
            return Object.values(val).some(
              (sub) => typeof sub === 'string' && sub.toLowerCase().includes(q)
            );
          }
          return false;
        });
      });
    }

    // Sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, activeFilter, sortConfig]);

  // Back to the first page when the list itself changes (e.g. a filter outside the table)
  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage]);

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(paginatedData.map((d) => d.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const exportCSV = () => {
    if (!filteredData.length) return;
    const headers = columns.map((c) => c.header).join(',');
    const rows = filteredData.map((row) =>
      columns
        .map((c) => {
          const val = c.accessor ? row[c.accessor] : '';
          return `"${String(val || '').replace(/"/g, '""')}"`;
        })
        .join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kapee-export-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-sm">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-4 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-ink dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
            />
          </div>

          {filters && filters.length > 0 && (
            <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-1 rounded-xl">
              {filters.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => {
                    onFilterChange(f.key);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeFilter === f.key
                      ? 'bg-white dark:bg-stone-900 text-emerald-deep dark:text-emerald-300 shadow-sm'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {extraHeaderActions}
          <button
            type="button"
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-50 hover:bg-stone-100 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-semibold transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-stone-50/80 dark:bg-stone-800/50 border-b border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 font-medium text-xs uppercase tracking-wider">
                <th className="py-3.5 px-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={
                      paginatedData.length > 0 &&
                      paginatedData.every((d) => selectedIds.includes(d.id))
                    }
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded accent-emerald-700 text-emerald-deep focus:ring-emerald-500 border-stone-300 cursor-pointer"
                  />
                </th>
                {columns.map((col) => (
                  <th
                    key={col.header}
                    onClick={() => col.accessor && handleSort(col.accessor)}
                    className={`py-3.5 px-4 font-semibold ${
                      col.accessor ? 'cursor-pointer select-none hover:text-ink dark:hover:text-stone-100' : ''
                    } ${col.className || ''}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.header}</span>
                      {col.accessor && (
                        <span className="text-stone-400">
                          {sortConfig.key === col.accessor ? (
                            sortConfig.direction === 'asc' ? (
                              <ArrowUp className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <ArrowDown className="w-3.5 h-3.5 text-emerald-600" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-40 hover:opacity-100" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <motion.tbody
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="divide-y divide-stone-100 dark:divide-stone-800/60"
            >
              <AnimatePresence>
                {paginatedData.length > 0 ? (
                  paginatedData.map((row) => {
                    const isSelected = selectedIds.includes(row.id);
                    return (
                      <motion.tr
                        key={row.id}
                        variants={rowVariants}
                        layout
                        className={`hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors group ${
                          isSelected ? 'bg-emerald-50/60 dark:bg-emerald-950/40' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectRow(row.id)}
                            className="w-4 h-4 rounded accent-emerald-700 text-emerald-deep focus:ring-emerald-500 border-stone-300 cursor-pointer"
                          />
                        </td>
                        {columns.map((col) => (
                          <td
                            key={col.header}
                            onClick={() => !col.disableRowClick && onRowClick && onRowClick(row)}
                            className={`py-3.5 px-4 text-stone-800 dark:text-stone-200 ${
                              !col.disableRowClick && onRowClick ? 'cursor-pointer' : ''
                            } ${col.className || ''}`}
                          >
                            {col.cell ? col.cell(row) : row[col.accessor]}
                          </td>
                        ))}
                      </motion.tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={columns.length + 1} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
                          <Leaf className="w-6 h-6 animate-float" />
                        </div>
                        <h4 className="font-serif font-bold text-ink dark:text-stone-100 text-base">
                          No matching records found
                        </h4>
                        <p className="text-xs text-muted dark:text-stone-400 max-w-xs">
                          Try adjusting your search keywords, clearing your filters, or adding a new record.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </motion.tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="px-4 py-3 bg-stone-50/50 dark:bg-stone-800/30 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs text-muted dark:text-stone-400">
          <div>
            Showing <span className="font-semibold text-stone-700 dark:text-stone-200">{paginatedData.length ? (currentPage - 1) * pageSize + 1 : 0}</span> to{' '}
            <span className="font-semibold text-stone-700 dark:text-stone-200">
              {Math.min(currentPage * pageSize, filteredData.length)}
            </span>{' '}
            of <span className="font-semibold text-stone-700 dark:text-stone-200">{filteredData.length}</span> records
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Bottom Bulk Action Bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && bulkActions && (
          <motion.div
            variants={bulkBarVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-ink text-white dark:bg-stone-900 border border-stone-700 shadow-2xl rounded-2xl px-5 py-3 flex items-center gap-4 backdrop-blur-md"
          >
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-deep text-white">
              {selectedIds.length} Selected
            </span>

            <div className="h-4 w-px bg-stone-700" />

            <div className="flex items-center gap-2">
              {bulkActions(selectedIds, () => setSelectedIds([]))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
