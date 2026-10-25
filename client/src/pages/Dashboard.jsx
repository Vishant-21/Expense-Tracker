import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import {
  Sparkles,
  PlusCircle,
  Plus,
  TrendingUp,
  Receipt,
  Award,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Inbox,
  PieChart as PieIcon,
  BarChart3,
  Calendar,
  Wallet,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { getCategoryMeta } from '../utils/categories';
import { formatCurrency, getCurrencySymbol } from '../utils/formatCurrency';
import { ExpenseModal } from '../components/expenses/ExpenseModal';
import toast from 'react-hot-toast';

// Skeleton Loader Component for Dashboard
const DashboardSkeleton = () => (
  <div className="space-y-6 sm:space-y-8 animate-pulse" id="dashboard-skeleton">
    {/* Header Skeleton */}
    <div className="space-y-2">
      <div className="h-8 w-48 sm:w-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      <div className="h-4 w-72 sm:w-96 bg-slate-200/70 dark:bg-slate-800/60 rounded-lg" />
    </div>

    {/* Metric Cards Skeleton */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3"
        >
          <div className="flex justify-between items-center">
            <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded-md" />
            <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="h-8 w-36 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="h-3 w-48 bg-slate-200/70 dark:bg-slate-800/60 rounded-md" />
        </div>
      ))}
    </div>

    {/* Budget Bar Skeleton */}
    <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
      <div className="flex justify-between items-center">
        <div className="h-5 w-44 bg-slate-200 dark:bg-slate-800 rounded-md" />
        <div className="h-5 w-24 bg-slate-200 dark:bg-slate-800 rounded-full" />
      </div>
      <div className="h-3.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full" />
      <div className="h-4 w-60 bg-slate-200/70 dark:bg-slate-800/60 rounded-md" />
    </div>

    {/* Charts Skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4"
        >
          <div className="h-5 w-40 bg-slate-200 dark:bg-slate-800 rounded-md" />
          <div className="h-64 rounded-xl bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center">
            <div className="w-28 h-28 rounded-full border-4 border-slate-200 dark:border-slate-700/60" />
          </div>
        </div>
      ))}
    </div>

    {/* Recent Expenses Skeleton */}
    <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
      <div className="h-5 w-36 bg-slate-200 dark:bg-slate-800 rounded-md" />
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="py-3.5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800" />
              <div className="space-y-1.5">
                <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded-md" />
                <div className="h-3 w-20 bg-slate-200/70 dark:bg-slate-800/60 rounded-md" />
              </div>
            </div>
            <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const Dashboard = () => {
  const { user } = useAuth();
  const { theme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [barWidth, setBarWidth] = useState(0);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard');
      if (res.data.success) {
        setDashboardData(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const currency = user?.currency || 'INR';
  const monthlyBudget = Number(user?.monthlyBudget) || 0;
  const isDark = theme === 'dark';

  // Budget calculations
  const totalSpent = dashboardData?.totalThisMonth || 0;
  const budgetRatio = monthlyBudget > 0 ? (totalSpent / monthlyBudget) * 100 : 0;
  const isOver100 = monthlyBudget > 0 && totalSpent >= monthlyBudget;
  const isWarning80 = monthlyBudget > 0 && totalSpent >= monthlyBudget * 0.8 && totalSpent < monthlyBudget;
  const isSafe = monthlyBudget > 0 && totalSpent < monthlyBudget * 0.8;

  // Animate the budget progress bar fill
  useEffect(() => {
    if (dashboardData) {
      setBarWidth(0);
      const timer = setTimeout(() => {
        setBarWidth(Math.min(budgetRatio, 100));
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [dashboardData, budgetRatio]);

  const handleSaveExpense = async (formData) => {
    try {
      const res = await api.post('/expenses', formData);
      if (res.data.success) {
        toast.success('Expense added successfully!');
        setModalOpen(false);
        fetchDashboard();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add expense');
    }
  };

  // Custom Recharts Tooltip for Pie
  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      return (
        <div className="p-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl text-xs">
          <p className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ backgroundColor: item.payload.fill }}
            />
            {item.name}
          </p>
          <p className="mt-1 text-slate-700 dark:text-slate-300 font-semibold">
            {formatCurrency(item.value, currency)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom Recharts Tooltip for Bar
  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl text-xs">
          <p className="font-bold text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-1 text-sm font-extrabold text-brand-600 dark:text-brand-400">
            {formatCurrency(payload[0].value, currency)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Check if completely empty
  const hasNoExpenses =
    dashboardData &&
    (dashboardData.totalExpensesAllTime === 0 ||
      (dashboardData.expenseCount === 0 && (!dashboardData.recent5 || dashboardData.recent5.length === 0)));

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Welcome, {user?.name || 'Explorer'}!
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-brand-500 animate-pulse" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Here is your spending overview, budget tracking, and financial breakdown.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={() => setModalOpen(true)}
            id="dashboard-add-expense-btn"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 active:scale-95 shadow-md shadow-brand-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Add Expense
          </button>
        </div>
      </div>

      {loading ? (
        <DashboardSkeleton />
      ) : hasNoExpenses ? (
        /* Empty State */
        <div
          id="dashboard-empty-state"
          className="py-14 sm:py-20 px-4 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm"
        >
          <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto mb-4">
            <Inbox className="w-8 h-8" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            No expenses yet. Add one!
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-2 leading-relaxed">
            Start tracking your transactions to unlock your monthly spending breakdown, category charts, and budget limit notifications.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setModalOpen(true)}
              id="empty-add-expense-btn"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 active:scale-95 shadow-md shadow-brand-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Add Expense
            </button>
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 transition-all"
            >
              <Wallet className="w-4 h-4" />
              Set Monthly Budget
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {/* 1. Total Spent This Month */}
            <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-brand-500/40 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Total Spent (This Month)
                </span>
                <div className="p-2.5 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {formatCurrency(totalSpent, currency)}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Current calendar month expenditure
                </p>
              </div>
            </div>

            {/* 2. Number of Expenses */}
            <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-indigo-500/40 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Number of Expenses
                </span>
                <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                  <Receipt className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {dashboardData?.expenseCount || 0}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Recorded transactions this month
                </p>
              </div>
            </div>

            {/* 3. Highest Category */}
            <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-amber-500/40 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Highest Category
                </span>
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                  <Award className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {dashboardData?.topCategory || 'None'}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Highest expenditure category this month
                </p>
              </div>
            </div>
          </div>

          {/* Budget Progress Bar & Warning Section */}
          <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Monthly Budget Progress
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Track your spending against your configured target limit
                  </p>
                </div>
              </div>

              {monthlyBudget > 0 ? (
                <div className="flex items-center gap-2 text-xs">
                  {isOver100 ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 shadow-sm">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      100%+ Limit Reached
                    </span>
                  ) : isWarning80 ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800 shadow-sm">
                      <AlertCircle className="w-3.5 h-3.5" />
                      80%+ Warning
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shadow-sm">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Within Budget
                    </span>
                  )}
                </div>
              ) : (
                <Link
                  to="/profile"
                  className="text-xs font-semibold text-brand-600 hover:text-brand-500 dark:text-brand-400 inline-flex items-center gap-1 focus-visible:outline-none focus-visible:underline"
                >
                  Configure Budget in Profile &rarr;
                </Link>
              )}
            </div>

            {monthlyBudget > 0 ? (
              <>
                {/* Animated Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span>Spent: {formatCurrency(totalSpent, currency)}</span>
                    <span>
                      Budget: {formatCurrency(monthlyBudget, currency)} ({budgetRatio.toFixed(1)}%)
                    </span>
                  </div>

                  <div className="w-full h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 shadow-inner">
                    <div
                      id="budget-progress-indicator"
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${isOver100
                        ? 'bg-rose-500 shadow-sm shadow-rose-500/50'
                        : isWarning80
                          ? 'bg-amber-500 shadow-sm shadow-amber-500/50'
                          : 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                        }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>

                {/* Warning Alert Boxes */}
                {isOver100 && (
                  <div
                    id="budget-red-warning"
                    className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 flex items-start gap-3 text-xs text-rose-800 dark:text-rose-300 animate-in fade-in"
                  >
                    <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold">Critical Budget Alert (100%+):</strong> You have exceeded your monthly budget of{' '}
                      {formatCurrency(monthlyBudget, currency)} by{' '}
                      <span className="font-bold underline">
                        {formatCurrency(totalSpent - monthlyBudget, currency)}
                      </span>
                      . Consider pausing non-essential expenses.
                    </div>
                  </div>
                )}

                {isWarning80 && (
                  <div
                    id="budget-yellow-warning"
                    className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-300 animate-in fade-in"
                  >
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold">Caution (80%+ Limit Warning):</strong> You have utilized{' '}
                      <span className="font-bold">{budgetRatio.toFixed(1)}%</span> of your monthly budget. Only{' '}
                      <span className="font-bold">
                        {formatCurrency(monthlyBudget - totalSpent, currency)}
                      </span>{' '}
                      remains for the rest of the month.
                    </div>
                  </div>
                )}

                {isSafe && (
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    You have <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(monthlyBudget - totalSpent, currency)}</span> remaining in your monthly budget.
                  </p>
                )}
              </>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="text-slate-600 dark:text-slate-400">
                  <span className="font-bold text-slate-800 dark:text-slate-200">No monthly budget set.</span>{' '}
                  Define a monthly budget to activate the progress bar and receive 80% & 100% threshold alert notifications.
                </div>
                <Link
                  to="/profile"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 active:scale-95 transition-all whitespace-nowrap"
                >
                  Set Budget
                </Link>
              </div>
            )}
          </div>

          {/* Charts Section: Pie Chart & Bar Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Category Pie Chart */}
            <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
                    <PieIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Spending by Category
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Distribution across expense categories this month
                    </p>
                  </div>
                </div>
              </div>

              {dashboardData?.byCategory && dashboardData.byCategory.length > 0 ? (
                <div className="h-64 sm:h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dashboardData.byCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="amount"
                        nameKey="category"
                      >
                        {dashboardData.byCategory.map((entry) => {
                          const meta = getCategoryMeta(entry.category);
                          return (
                            <Cell
                              key={`cell-${entry.category}`}
                              fill={meta.chartColor}
                              stroke={isDark ? '#0f172a' : '#ffffff'}
                              strokeWidth={2}
                            />
                          );
                        })}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(val) => (
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                            {val}
                          </span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-center p-4">
                  <p className="text-xs text-slate-400">No category breakdown for this month yet.</p>
                </div>
              )}
            </div>

            {/* 2. Monthly Trend Bar Chart */}
            <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Monthly Spending Trend
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Total expenses over the last 6 months
                    </p>
                  </div>
                </div>
              </div>

              <div className="h-64 sm:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dashboardData?.byMonth || []}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}

                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={isDark ? '#334155' : '#f1f5f9'}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="month"
                      stroke={isDark ? '#94a3b8' : '#64748b'}
                      fontSize={11}
                      tickLine={false}
                    />
                    <YAxis
                      stroke={isDark ? '#94a3b8' : '#64748b'}
                      fontSize={11}
                      tickLine={false}
                      width={48}
                      tickFormatter={(val) => {
                        if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
                        return val;
                      }}
                    />
                    <Tooltip cursor={{ fill: 'rgba(148,163,184,0.12)' }} content={<CustomBarTooltip />} />
                    <Bar
                      dataKey="amount"
                      fill="#0284c7"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={45}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent 5 Expenses Section */}
          <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Recent 5 Expenses
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Latest transactions recorded across all categories
                </p>
              </div>
              <Link
                to="/expenses"
                className="text-xs font-semibold text-brand-600 hover:text-brand-500 dark:text-brand-400 flex items-center gap-1 group focus-visible:outline-none focus-visible:underline"
              >
                View All Expenses
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {dashboardData?.recent5 && dashboardData.recent5.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {dashboardData.recent5.map((expense) => {
                  const meta = getCategoryMeta(expense.category);
                  const CategoryIcon = meta.icon;

                  return (
                    <div
                      key={expense._id}
                      className="py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 px-2 rounded-xl transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${meta.badgeClass}`}
                        >
                          <CategoryIcon className={`w-5 h-5 ${meta.iconClass}`} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
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
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {formatCurrency(expense.amount, currency)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">
                No recent expenses to show.
              </p>
            )}
          </div>
        </>
      )}

      {/* Floating "+" Button (mobile-first, visible always at bottom-right) */}
      <button
        id="fab-add-expense"
        onClick={() => setModalOpen(true)}
        aria-label="Add Expense"
        title="Add Expense"
        className="fixed bottom-20 right-4 sm:bottom-8 sm:right-8 z-40 w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-brand-600 to-sky-500 hover:from-brand-500 hover:to-sky-400 active:scale-90 text-white shadow-xl shadow-brand-500/35 flex items-center justify-center focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30 transition-all cursor-pointer group md:hidden"
      >
        <Plus className="w-6 h-6 stroke-[2.5] group-hover:rotate-90 transition-transform duration-200" />
      </button>

      {/* Add Expense Modal */}
      <ExpenseModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveExpense}
      />
    </div>
  );
};
