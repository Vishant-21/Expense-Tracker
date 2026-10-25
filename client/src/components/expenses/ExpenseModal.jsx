import React, { useState, useEffect } from 'react';
import { X, Calendar, FileText, Tag, Loader2, Sparkles } from 'lucide-react';
import { CATEGORIES, getCategoryMeta } from '../../utils/categories';
import { useAuth } from '../../context/AuthContext';
import { getCurrencySymbol } from '../../utils/formatCurrency';
import toast from 'react-hot-toast';

export const ExpenseModal = ({ isOpen, onClose, onSave, expenseToEdit }) => {
  const { user } = useAuth();
  const currency = user?.currency || 'INR';
  const currencySymbol = getCurrencySymbol(currency);
  const isEditing = Boolean(expenseToEdit);

  const initialForm = {
    title: '',
    amount: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    note: '',
  };

  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (expenseToEdit) {
      setFormData({
        title: expenseToEdit.title || '',
        amount: expenseToEdit.amount || '',
        category: expenseToEdit.category || 'Food',
        date: expenseToEdit.date
          ? new Date(expenseToEdit.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        note: expenseToEdit.note || '',
      });
    } else {
      setFormData(initialForm);
    }
    setErrors({});
  }, [expenseToEdit, isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than zero';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSave({
        ...formData,
        amount: parseFloat(formData.amount),
      });
      onClose();
    } catch (err) {
      // Error handled by parent with toast
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCategoryMeta = getCategoryMeta(formData.category);
  const CategoryIcon = selectedCategoryMeta.icon;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 id="modal-title" className="text-lg font-bold text-slate-900 dark:text-white">
                {isEditing ? 'Edit Expense' : 'Add New Expense'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEditing ? 'Modify your expense record' : 'Keep your spending ledger updated'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label
              htmlFor="expense-title"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Title *
            </label>
            <input
              id="expense-title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Grocery shopping, Metro card"
              className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 transition-all ${
                errors.title
                  ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500'
                  : 'border-slate-200 dark:border-slate-700 focus:ring-brand-500/20 focus:border-brand-500'
              }`}
            />
            {errors.title && (
              <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
                {errors.title}
              </p>
            )}
          </div>

          {/* Amount & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Amount */}
            <div>
              <label
                htmlFor="expense-amount"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Amount ({currency}) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-semibold text-xs">
                  {currencySymbol}
                </div>
                <input
                  id="expense-amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.amount
                      ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500'
                      : 'border-slate-200 dark:border-slate-700 focus:ring-brand-500/20 focus:border-brand-500'
                  }`}
                />
              </div>
              {errors.amount && (
                <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
                  {errors.amount}
                </p>
              )}
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="expense-category"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Category *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CategoryIcon className={`w-4 h-4 ${selectedCategoryMeta.iconClass}`} />
                </div>
                <select
                  id="expense-category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all appearance-none cursor-pointer"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                  <Tag className="w-3.5 h-3.5" />
                </div>
              </div>
              {errors.category && (
                <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
                  {errors.category}
                </p>
              )}
            </div>
          </div>

          {/* Date */}
          <div>
            <label
              htmlFor="expense-date"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Date *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                id="expense-date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 transition-all ${
                  errors.date
                    ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500'
                    : 'border-slate-200 dark:border-slate-700 focus:ring-brand-500/20 focus:border-brand-500'
                }`}
              />
            </div>
            {errors.date && (
              <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
                {errors.date}
              </p>
            )}
          </div>

          {/* Note */}
          <div>
            <label
              htmlFor="expense-note"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Note (Optional)
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3 flex items-center pointer-events-none text-slate-400">
                <FileText className="w-4 h-4" />
              </div>
              <textarea
                id="expense-note"
                name="note"
                rows="2"
                value={formData.note}
                onChange={handleChange}
                placeholder="Additional details or memo..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-none"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="expense-modal-submit-btn"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-md shadow-brand-500/20 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEditing ? 'Save Changes' : 'Add Expense'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
