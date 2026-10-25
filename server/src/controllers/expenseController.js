import { Expense, CATEGORIES } from '../models/Expense.js';

// @desc    Create a new expense
// @route   POST /api/expenses
// @access  Private
export const createExpense = async (req, res, next) => {
  try {
    const { title, amount, category, date, note } = req.body;

    const expense = await Expense.create({
      user: req.user._id,
      title: title.trim(),
      amount: Number(amount),
      category,
      date: date ? new Date(date) : new Date(),
      note: note ? note.trim() : '',
    });

    return res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      expense,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all expenses for logged-in user with filters, search, sort, and pagination
// @route   GET /api/expenses
// @access  Private
export const getExpenses = async (req, res, next) => {
  try {
    const {
      search,
      category,
      range,
      from,
      to,
      sort = 'date',
      order = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    const query = { user: req.user._id };

    // Search filter (title or note)
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: searchRegex }, { note: searchRegex }];
    }

    // Category filter
    if (category && category !== 'All' && CATEGORIES.includes(category)) {
      query.category = category;
    }

    // Date range filter
    const now = new Date();
    if (range === 'week') {
      const startOfWeek = new Date(now);
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Monday
      startOfWeek.setDate(diff);
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      query.date = { $gte: startOfWeek, $lte: endOfWeek };
    } else if (range === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      query.date = { $gte: startOfMonth, $lte: endOfMonth };
    } else if (range === 'custom' || from || to) {
      query.date = {};
      if (from) {
        const fromDate = new Date(from);
        fromDate.setHours(0, 0, 0, 0);
        query.date.$gte = fromDate;
      }
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        query.date.$lte = toDate;
      }
      if (Object.keys(query.date).length === 0) {
        delete query.date;
      }
    }

    // Sorting
    const sortField = sort === 'amount' ? 'amount' : 'date';
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortOptions = { [sortField]: sortOrder };

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Expense.countDocuments(query);
    const expenses = await Expense.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    const totalPages = Math.ceil(total / limitNum) || 1;

    return res.status(200).json({
      success: true,
      count: expenses.length,
      total,
      page: pageNum,
      totalPages,
      expenses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single expense by ID
// @route   GET /api/expenses/:id
// @access  Private
export const getExpenseById = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    return res.status(200).json({
      success: true,
      expense,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
export const updateExpense = async (req, res, next) => {
  try {
    const { title, amount, category, date, note } = req.body;

    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    if (title !== undefined) expense.title = title.trim();
    if (amount !== undefined) expense.amount = Number(amount);
    if (category !== undefined) expense.category = category;
    if (date !== undefined) expense.date = new Date(date);
    if (note !== undefined) expense.note = note ? note.trim() : '';

    await expense.save();

    return res.status(200).json({
      success: true,
      message: 'Expense updated successfully',
      expense,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
export const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Expense deleted successfully',
      id: req.params.id,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export expenses as CSV (RFC 4180 format)
// @route   GET /api/expenses/export
// @access  Private
export const exportExpensesCSV = async (req, res, next) => {
  try {
    const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1 });

    // Format RFC 4180 CSV
    const escapeCsv = (str) => {
      if (str === null || str === undefined) return '""';
      const formatted = String(str).replace(/"/g, '""');
      return `"${formatted}"`;
    };

    const headers = ['Title', 'Amount', 'Category', 'Date', 'Note'];
    const rows = expenses.map((exp) => [
      escapeCsv(exp.title),
      exp.amount.toFixed(2),
      escapeCsv(exp.category),
      escapeCsv(new Date(exp.date).toISOString().split('T')[0]),
      escapeCsv(exp.note || ''),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    const filename = `spendwise_expenses_${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    return res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};
