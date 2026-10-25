import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  ReceiptText,
  Sparkles,
  Inbox,
} from 'lucide-react';
import { CATEGORIES, getCategoryMeta } from '../utils/categories';
import { ExpenseModal } from '../components/expenses/ExpenseModal';
import { DeleteConfirmModal } from '../components/expenses/DeleteConfirmModal';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatCurrency';
import toast from 'react-hot-toast';

// Skeleton Loader for Expenses (Both Mobile Card List & Desktop Table)
const ExpensesSkeleton = () => (
  <div className="space-y-4 animate-pulse p-4 sm:p-6" id="expenses-skeleton">
    {/* Mobile Card Skeletons */}
    <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800/80">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="py-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800" />
              <div className="space-y-1.5">
                <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded-md" />
                <div className="h-3 w-20 bg-slate-200/70 dark:bg-slate-800/60 rounded-md" />
              </div>
            </div>
            <div className="h-5 w-20 bg-slate-200 dark:bg-slate-800 rounded-md" />
          </div>
          <div className="h-3 w-44 bg-slate-100 dark:bg-slate-800/40 rounded-md" />
        </div>
      ))}
    </div>

    {/* Desktop Table Rows Skeleton */}
    <div className="hidden md:block space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800/60"
        >
          <div className="flex items-center gap-4">
            <div className="h-4 w-44 bg-slate-200 dark:bg-slate-800 rounded-md" />
            <div className="h-5 w-20 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          </div>
          <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded-md" />
          <div className="h-5 w-24 bg-slate-200 dark:bg-slate-800 rounded-md" />
          <div className="h-4 w-14 bg-slate-200 dark:bg-slate-800 rounded-md" />
        </div>
      ))}
    </div>
  </div>
);

export const Expenses = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    count: 0,
  });

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [range, setRange] = useState('all'); // all, week, month, custom
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [sortField, setSortField] = useState('date'); // date or amount
  const [sortOrder, setSortOrder] = useState('desc'); // desc or asc

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Fetch expenses from API
  const fetchExpenses = useCallback(
    async (currentPage = 1) => {
      setLoading(true);
      try {
        const params = {
          page: currentPage,
          limit: 10,
          sort: sortField,
          order: sortOrder,
        };

        if (search.trim()) params.search = search.trim();
        if (category !== 'All') params.category = category;
        if (range === 'week' || range === 'month') {
          params.range = range;
        } else if (range === 'custom') {
          if (fromDate) params.from = fromDate;
          if (toDate) params.to = toDate;
        }

        const res = await api.get('/expenses', { params });
        if (res.data.success) {
          setExpenses(res.data.expenses);
          setPagination({
            page: res.data.page,
            totalPages: res.data.totalPages,
            total: res.data.total,
            count: res.data.count,
          });
        }
      } catch (err) {
        toast.error('Failed to load expenses');
      } finally {
        setLoading(false);
      }
    },
    [search, category, range, fromDate, toDate, sortField, sortOrder]
  );

  // Trigger fetch when filters or sort changes
  useEffect(() => {
    fetchExpenses(1);
  }, [fetchExpenses]);

  // Handle Save (Create or Update)
  const handleSaveExpense = async (formData) => {
    try {
      if (expenseToEdit) {
        const res = await api.put(`/expenses/${expenseToEdit._id}`, formData);
        if (res.data.success) {
          toast.success('Expense updated successfully!');
          fetchExpenses(pagination.page);
        }
      } else {
        const res = await api.post('/expenses', formData);
        if (res.data.success) {
          toast.success('Expense added successfully!');
          fetchExpenses(1);
        }
      }
      setModalOpen(false);
      setExpenseToEdit(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save expense');
    }
  };

  // Handle Delete
  const handleConfirmDelete = async () => {
    if (!expenseToDelete) return;
    setDeleting(true);
    try {
      const res = await api.delete(`/expenses/${expenseToDelete._id}`);
      if (res.data.success) {
        toast.success('Expense deleted successfully!');
        setDeleteModalOpen(false);
        setExpenseToDelete(null);
        fetchExpenses(pagination.page);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete expense');
    } finally {
      setDeleting(false);
    }
  };

  // Handle CSV Export
  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const res = await api.get('/expenses/export', { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `spendwise_expenses_${new Date().toISOString().split('T')[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Expenses exported to CSV!');
    } catch (err) {
      toast.error('Failed to export CSV');
    } finally {
      setExporting(false);
    }
  };

  // Sort toggle helper
  const handleSortToggle = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 max-w-full overflow-x-hidden">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400">
              <ReceiptText className="w-6 h-6" />
            </div>
            Expense Manager
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Search, filter, categorize, and track all your personal expenses.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            disabled={exporting || expenses.length === 0}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 hover:shadow-sm active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 transition-all disabled:opacity-50 cursor-pointer"
            title="Download CSV"
          >
            <Download className="w-4 h-4 text-brand-600" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            id="add-expense-btn"
            onClick={() => {
              setExpenseToEdit(null);
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-sky-500 hover:from-brand-500 hover:to-sky-400 active:scale-95 shadow-md shadow-brand-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
          {/* Search Box */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              id="expense-search-input"
              type="text"
              placeholder="Search title or note..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            />
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <select
              id="expense-category-filter"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Preset */}
          <div>
            <select
              id="expense-range-filter"
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer"
            >
              <option value="all">All Dates</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Sort Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSortToggle('date')}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${sortField === 'date'
                ? 'bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-950/60 dark:text-brand-300 dark:border-brand-800 font-bold'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                }`}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Date {sortField === 'date' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}</span>
            </button>
            <button
              onClick={() => handleSortToggle('amount')}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${sortField === 'amount'
                ? 'bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-950/60 dark:text-brand-300 dark:border-brand-800 font-bold'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                }`}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Amount {sortField === 'amount' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}</span>
            </button>
          </div>
        </div>

        {/* Custom Date Pickers when 'custom' is selected */}
        {range === 'custom' && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-xs font-medium text-slate-500 whitespace-nowrap">From:</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div className="flex items-center gap-2 flex-1">
              <span className="text-xs font-medium text-slate-500 whitespace-nowrap">To:</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* Expenses Content: Table (Desktop) / Card List (Mobile) */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <ExpensesSkeleton />
        ) : expenses.length === 0 ? (
          /* Empty state */
          <div className="py-16 px-4 text-center" id="expenses-empty-state">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto mb-4">
              <Inbox className="w-8 h-8" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              No expenses yet. Add one!
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-2 leading-relaxed">
              Start recording your transactions to gain clear insights into your monthly spending habits.
            </p>
            <button
              onClick={() => {
                setExpenseToEdit(null);
                setModalOpen(true);
              }}
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 active:scale-95 shadow-md shadow-brand-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Expense
            </button>
          </div>
        ) : (
          <>
            {/* 1. Mobile Card List View (Visible on < md / 375px screens) */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800/80">
              {expenses.map((expense) => {
                const meta = getCategoryMeta(expense.category);
                const CategoryIcon = meta.icon;
                return (
                  <div
                    key={expense._id}
                    className="p-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${meta.badgeClass}`}
                        >
                          <CategoryIcon className={`w-5 h-5 ${meta.iconClass}`} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                            {expense.title}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                            <span className="font-medium text-slate-600 dark:text-slate-400">{expense.category}</span>
                            <span>•</span>
                            <span>
                              {new Date(expense.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className="font-extrabold text-slate-900 dark:text-white text-base">
                          {formatCurrency(expense.amount, user?.currency)}
                        </span>
                      </div>
                    </div>

                    {expense.note && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl line-clamp-2">
                        {expense.note}
                      </p>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                      <button
                        onClick={() => {
                          setExpenseToEdit(expense);
                          setModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/60 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setExpenseToDelete(expense);
                          setDeleteModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 2. Desktop Table View (Visible on md: and above) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-slate-800">
                  <tr>
                    <th scope="col" className="px-6 py-3.5">
                      Expense & Note
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-right">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {expenses.map((expense) => {
                    const meta = getCategoryMeta(expense.category);
                    const CategoryIcon = meta.icon;
                    return (
                      <tr
                        key={expense._id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        {/* Title & Note */}
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {expense.title}
                          </p>
                          {expense.note && (
                            <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                              {expense.note}
                            </p>
                          )}
                        </td>

                        {/* Category Badge */}
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${meta.badgeClass}`}
                          >
                            <CategoryIcon className={`w-3.5 h-3.5 ${meta.iconClass}`} />
                            {expense.category}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4 text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {new Date(expense.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>

                        {/* Amount */}
                        <td className="px-6 py-4 text-right">
                          <span className="font-bold text-slate-900 dark:text-white text-base">
                            {formatCurrency(expense.amount, user?.currency)}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                setExpenseToEdit(expense);
                                setModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 transition-colors cursor-pointer"
                              title="Edit expense"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setExpenseToDelete(expense);
                                setDeleteModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 transition-colors cursor-pointer"
                              title="Delete expense"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
              <p>
                Showing <span className="font-semibold">{expenses.length}</span> of{' '}
                <span className="font-semibold">{pagination.total}</span> expenses
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchExpenses(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Previous
                </button>
                <span className="px-2 font-semibold text-slate-700 dark:text-slate-300">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => fetchExpenses(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Floating "+" Button (mobile-first, visible always at bottom-right) */}
      <button
        id="fab-add-expense"
        onClick={() => {
          setExpenseToEdit(null);
          setModalOpen(true);
        }}
        aria-label="Add Expense"
        title="Add Expense"
        className="fixed bottom-20 right-4 sm:bottom-8 sm:right-8 z-40 w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-brand-600 to-sky-500 hover:from-brand-500 hover:to-sky-400 active:scale-90 text-white shadow-xl shadow-brand-500/35 flex items-center justify-center focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30 transition-all cursor-pointer group md:hidden"
      >
        <Plus className="w-6 h-6 stroke-[2.5] group-hover:rotate-90 transition-transform duration-200" />
      </button>

      {/* Add / Edit Expense Modal */}
      <ExpenseModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setExpenseToEdit(null);
        }}
        onSave={handleSaveExpense}
        expenseToEdit={expenseToEdit}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setExpenseToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        expense={expenseToDelete}
        deleting={deleting}
      />
    </div>
  );
};
