import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Wallet,
  LayoutDashboard,
  ReceiptText,
  User,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Expenses', path: '/expenses', icon: ReceiptText },
    { name: 'Profile & Budget', mobileName: 'Profile', path: '/profile', icon: User },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* 1. Desktop Top Navbar (hidden on mobile) */}
      <nav
        id="top-nav"
        className="hidden md:block sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              to="/dashboard"
              className="flex items-center gap-2.5 font-bold text-xl tracking-tight text-slate-900 dark:text-white group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-xl"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <Wallet className="w-5 h-5" />
              </div>
              <span>
                Spend<span className="text-brand-600 dark:text-brand-400">Wise</span>
              </span>
            </Link>

            {/* Desktop Nav Items */}
            <div className="flex items-center gap-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${active
                        ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 font-semibold shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/60'
                      }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-brand-600 dark:text-brand-400' : ''}`} />
                    {item.name}
                  </Link>
                );
              })}
            </div>

            {/* Right actions: Theme toggle, User badge, Logout */}
            <div className="flex items-center gap-3">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 transition-colors cursor-pointer"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-amber-400 hover:rotate-45 transition-transform" />
                ) : (
                  <Moon className="w-5 h-5 text-slate-600 hover:-rotate-12 transition-transform" />
                )}
              </button>

              {/* User Info */}
              <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-slate-800">
                <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 flex items-center justify-center font-bold text-xs uppercase border border-brand-200 dark:border-brand-700">
                  {user?.name ? user.name.charAt(0) : 'U'}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                    {user?.name}
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 max-w-[130px] truncate leading-tight">
                    {user?.email}
                  </span>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  aria-label="Logout"
                  className="ml-1 p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 transition-colors cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* 2. Mobile Compact Top Header (No nav links - only logo & theme toggle) */}
      <header className="md:hidden sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 h-14 flex items-center justify-between transition-colors">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 font-bold text-lg tracking-tight text-slate-900 dark:text-white"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-sky-400 flex items-center justify-center text-white shadow-sm">
            <Wallet className="w-4 h-4" />
          </div>
          <span>
            Spend<span className="text-brand-600 dark:text-brand-400">Wise</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600" />
            )}
          </button>

          {/* User Initial Avatar */}
          <Link
            to="/profile"
            aria-label="View profile"
            className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 flex items-center justify-center font-bold text-xs uppercase border border-brand-200 dark:border-brand-700"
          >
            {user?.name ? user.name.charAt(0) : 'U'}
          </Link>
        </div>
      </header>

      {/* 3. Mobile Bottom Tab Bar (Dashboard, Expenses, Profile) */}
      <nav
        id="bottom-tab-bar"
        aria-label="Mobile Navigation Bar"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800 px-3 py-1.5 safe-area-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.4)] flex items-center justify-around"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              id={`tab-${item.mobileName ? item.mobileName.toLowerCase() : item.name.toLowerCase()}`}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-2 rounded-xl text-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-95 ${active
                  ? 'text-brand-600 dark:text-brand-400 font-bold bg-brand-50/90 dark:bg-brand-950/60'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${active ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              <span className="text-[11px] tracking-tight">{item.mobileName || item.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
};
