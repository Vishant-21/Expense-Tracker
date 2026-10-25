import {
  UtensilsCrossed,
  Plane,
  BookOpen,
  Home,
  Gamepad2,
  MoreHorizontal,
} from 'lucide-react';

export const CATEGORIES = ['Food', 'Travel', 'Books', 'Rent', 'Fun', 'Other'];

export const CATEGORY_CONFIG = {
  Food: {
    name: 'Food',
    icon: UtensilsCrossed,
    color: '#f97316', // orange
    badgeClass:
      'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800/60',
    iconClass: 'text-orange-500 dark:text-orange-400',
    chartColor: '#f97316',
  },
  Travel: {
    name: 'Travel',
    icon: Plane,
    color: '#0ea5e9', // sky
    badgeClass:
      'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/60',
    iconClass: 'text-sky-500 dark:text-sky-400',
    chartColor: '#0ea5e9',
  },
  Books: {
    name: 'Books',
    icon: BookOpen,
    color: '#8b5cf6', // purple
    badgeClass:
      'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60',
    iconClass: 'text-purple-500 dark:text-purple-400',
    chartColor: '#8b5cf6',
  },
  Rent: {
    name: 'Rent',
    icon: Home,
    color: '#10b981', // emerald
    badgeClass:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60',
    iconClass: 'text-emerald-500 dark:text-emerald-400',
    chartColor: '#10b981',
  },
  Fun: {
    name: 'Fun',
    icon: Gamepad2,
    color: '#ec4899', // pink
    badgeClass:
      'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/40 dark:text-pink-300 dark:border-pink-800/60',
    iconClass: 'text-pink-500 dark:text-pink-400',
    chartColor: '#ec4899',
  },
  Other: {
    name: 'Other',
    icon: MoreHorizontal,
    color: '#64748b', // slate
    badgeClass:
      'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    iconClass: 'text-slate-500 dark:text-slate-400',
    chartColor: '#64748b',
  },
};

export const getCategoryMeta = (category) => {
  return CATEGORY_CONFIG[category] || CATEGORY_CONFIG['Other'];
};
