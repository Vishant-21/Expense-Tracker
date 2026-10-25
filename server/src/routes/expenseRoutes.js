import express from 'express';
import { body, param } from 'express-validator';
import {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  exportExpensesCSV,
} from '../controllers/expenseController.js';
import { protect } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import { CATEGORIES } from '../models/Expense.js';

const router = express.Router();

// All expense routes require authentication
router.use(protect);

// Create expense validation
const expenseValidation = [
  body('title').trim().notEmpty().withMessage('Expense title is required'),
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than zero'),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(CATEGORIES)
    .withMessage(`Category must be one of: ${CATEGORIES.join(', ')}`),
  body('date')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('Date must be a valid date format'),
  body('note').optional().isString(),
  validateRequest,
];

// Update expense validation
const updateValidation = [
  param('id').isMongoId().withMessage('Invalid expense ID'),
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('amount')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than zero'),
  body('category')
    .optional()
    .isIn(CATEGORIES)
    .withMessage(`Category must be one of: ${CATEGORIES.join(', ')}`),
  body('date')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('Date must be a valid date format'),
  body('note').optional().isString(),
  validateRequest,
];

const idValidation = [
  param('id').isMongoId().withMessage('Invalid expense ID'),
  validateRequest,
];

router.get('/export', exportExpensesCSV);
router.post('/', expenseValidation, createExpense);
router.get('/', getExpenses);
router.get('/:id', idValidation, getExpenseById);
router.put('/:id', updateValidation, updateExpense);
router.delete('/:id', idValidation, deleteExpense);

export default router;
