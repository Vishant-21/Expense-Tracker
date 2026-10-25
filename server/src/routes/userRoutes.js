import express from 'express';
import { body } from 'express-validator';
import { updateBudget, updateCurrency, ALLOWED_CURRENCIES } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';

const router = express.Router();

const budgetValidation = [
  body('monthlyBudget')
    .notEmpty()
    .withMessage('Monthly budget is required')
    .isFloat({ min: 0 })
    .withMessage('Monthly budget must be a positive number'),
  validateRequest,
];

const currencyValidation = [
  body('currency')
    .notEmpty()
    .withMessage('Currency is required')
    .isIn(ALLOWED_CURRENCIES)
    .withMessage(`Invalid currency. Allowed currencies: ${ALLOWED_CURRENCIES.join(', ')}`),
  validateRequest,
];

router.put('/budget', protect, budgetValidation, updateBudget);
router.put('/currency', protect, currencyValidation, updateCurrency);

export default router;
