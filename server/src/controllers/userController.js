import { User } from '../models/User.js';

export const ALLOWED_CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'AED', 'SGD'];

// @desc    Update user monthly budget
// @route   PUT /api/users/budget
// @access  Private
export const updateBudget = async (req, res, next) => {
  try {
    const { monthlyBudget } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.monthlyBudget = Number(monthlyBudget);
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Monthly budget updated successfully',
      monthlyBudget: user.monthlyBudget,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        monthlyBudget: user.monthlyBudget,
        currency: user.currency || 'INR',
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user preferred currency
// @route   PUT /api/users/currency
// @access  Private
export const updateCurrency = async (req, res, next) => {
  try {
    const { currency } = req.body;

    if (!currency || !ALLOWED_CURRENCIES.includes(currency)) {
      return res.status(400).json({
        success: false,
        message: `Invalid currency. Allowed currencies: ${ALLOWED_CURRENCIES.join(', ')}`,
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.currency = currency;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Currency updated successfully',
      currency: user.currency,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        monthlyBudget: user.monthlyBudget,
        currency: user.currency,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};
