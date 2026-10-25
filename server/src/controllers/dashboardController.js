import { Expense, CATEGORIES } from '../models/Expense.js';

// @desc    Get dashboard metrics, charts data, and recent expenses
// @route   GET /api/dashboard
// @access  Private
export const getDashboardData = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    // Start & End of current month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // 1. Total this month and expenses this month
    const currentMonthExpenses = await Expense.find({
      user: userId,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    const totalThisMonth = currentMonthExpenses.reduce((sum, item) => sum + item.amount, 0);
    const expenseCount = currentMonthExpenses.length;

    // 2. Spending by category (this month)
    const categoryTotals = {};
    CATEGORIES.forEach((cat) => {
      categoryTotals[cat] = 0;
    });

    currentMonthExpenses.forEach((exp) => {
      if (categoryTotals[exp.category] !== undefined) {
        categoryTotals[exp.category] += exp.amount;
      } else {
        categoryTotals[exp.category] = exp.amount;
      }
    });

    const byCategory = Object.keys(categoryTotals)
      .map((cat) => ({
        category: cat,
        amount: Number(categoryTotals[cat].toFixed(2)),
      }))
      .filter((item) => item.amount > 0);

    // Top category this month
    let topCategory = 'None';
    let maxAmount = 0;
    byCategory.forEach((c) => {
      if (c.amount > maxAmount) {
        maxAmount = c.amount;
        topCategory = c.category;
      }
    });

    // 3. Spending by month (last 6 months)
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const pastExpenses = await Expense.find({
      user: userId,
      date: { $gte: sixMonthsAgo, $lte: endOfMonth },
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyMap = {};

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      monthlyMap[key] = 0;
    }

    pastExpenses.forEach((exp) => {
      const d = new Date(exp.date);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      if (monthlyMap[key] !== undefined) {
        monthlyMap[key] += exp.amount;
      }
    });

    const byMonth = Object.keys(monthlyMap).map((month) => ({
      month,
      amount: Number(monthlyMap[month].toFixed(2)),
    }));

    // 4. Last 5 expenses
    const recent5 = await Expense.find({ user: userId })
      .sort({ date: -1, createdAt: -1 })
      .limit(5);

    const totalExpensesAllTime = await Expense.countDocuments({ user: userId });

    return res.status(200).json({
      success: true,
      data: {
        totalThisMonth: Number(totalThisMonth.toFixed(2)),
        expenseCount,
        totalExpensesAllTime,
        topCategory,
        byCategory,
        byMonth,
        recent5,
      },
    });
  } catch (error) {
    next(error);
  }
};
