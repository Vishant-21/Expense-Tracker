import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import {
  User,
  LogOut,
  Wallet,
  Globe,
  Save,
  Loader2,
  Mail,
  Calendar,
  Sun,
  Moon,
} from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { CURRENCY_OPTIONS, formatCurrency, getCurrencySymbol } from '../utils/formatCurrency';

export const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [budget, setBudget] = useState(user?.monthlyBudget ?? 0);
  const [currency, setCurrency] = useState(user?.currency || 'INR');
  const [savingBudget, setSavingBudget] = useState(false);
  const [savingCurrency, setSavingCurrency] = useState(false);

  useEffect(() => {
    if (user) {
      setBudget(user.monthlyBudget ?? 0);
      setCurrency(user.currency || 'INR');
    }
  }, [user]);

  // Handle Monthly Budget Save
  const handleSaveBudget = async (e) => {
    e.preventDefault();
    const numericBudget = Number(budget);
    if (isNaN(numericBudget) || numericBudget < 0) {
      toast.error('Please enter a valid non-negative budget');
      return;
    }

    setSavingBudget(true);
    try {
      const res = await api.put('/users/budget', { monthlyBudget: numericBudget });
      if (res.data.success) {
        updateUser(res.data.user);
        toast.success('Monthly budget updated successfully!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update monthly budget');
    } finally {
      setSavingBudget(false);
    }
  };

  // Handle Currency Save
  const handleSaveCurrency = async (e) => {
    e.preventDefault();
    setSavingCurrency(true);
    try {
      const res = await api.put('/users/currency', { currency });
      if (res.data.success) {
        updateUser(res.data.user);
        toast.success(`Currency changed to ${currency}!`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update currency');
    } finally {
      setSavingCurrency(false);
    }
  };

  const currentSymbol = getCurrencySymbol(currency);

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-300 max-w-full overflow-x-hidden">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400">
            <User className="w-6 h-6" />
          </div>
          Profile & Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 ml-1">
          Manage your personal account, customize monthly spending limits, and select preferred currency.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
        {/* User Profile Card */}
        <div className="md:col-span-1 p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-brand-500/25 mb-4">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white truncate">
              {user?.name || 'Explorer'}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
              <Mail className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{user?.email}</span>
            </div>

            {user?.createdAt && (
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-2">
                <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
              </div>
            )}

            <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Active Budget
                </span>
                <span className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                  {formatCurrency(user?.monthlyBudget || 0, user?.currency)}
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Active Currency
                </span>
                <span className="text-base font-extrabold text-brand-600 dark:text-brand-400">
                  {user?.currency || 'INR'} ({getCurrencySymbol(user?.currency || 'INR')})
                </span>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 rounded-xl transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Settings Forms (Budget, Currency, Appearance) */}
        <div className="md:col-span-2 space-y-5 sm:space-y-6">
          {/* Monthly Budget Card */}
          <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Monthly Budget Target
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Configure your spending cap to enable real-time warning indicators on your Dashboard.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveBudget} className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="monthly-budget-input"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Monthly Budget ({user?.currency || 'INR'})
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-sm">
                    {currentSymbol}
                  </div>
                  <input
                    id="monthly-budget-input"
                    type="number"
                    step="0.01"
                    min="0"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="e.g. 15000"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                  Set to 0 to disable budget tracking. Alert triggers at 80% (yellow warning) and 100% (red warning).
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  id="save-budget-btn"
                  disabled={savingBudget || Number(budget) === (user?.monthlyBudget ?? 0)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-brand-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 transition-all cursor-pointer"
                >
                  {savingBudget ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Budget
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Currency Settings Card */}
          <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Currency Preference
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select your default currency. All transactions and reports will display in this denomination.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveCurrency} className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="currency-select"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Preferred Currency
                </label>
                <div className="relative">
                  <select
                    id="currency-select"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer"
                  >
                    {CURRENCY_OPTIONS.map((opt) => (
                      <option key={opt.code} value={opt.code}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                  Currency amounts are formatted locally using Intl.NumberFormat without modifying underlying numbers.
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  id="save-currency-btn"
                  disabled={savingCurrency || currency === (user?.currency || 'INR')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all cursor-pointer"
                >
                  {savingCurrency ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Currency
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Appearance / Theme Toggle Card */}
          <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Theme Appearance
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Currently using <strong className="capitalize text-slate-800 dark:text-slate-200">{theme}</strong> mode.
                </p>
              </div>
            </div>

            <button
              onClick={toggleTheme}
              id="profile-toggle-theme-btn"
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 active:scale-95 transition-all cursor-pointer"
            >
              Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
