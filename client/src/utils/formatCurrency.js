export const CURRENCY_OPTIONS = [
  { code: 'INR', label: 'INR (₹) - Indian Rupee', symbol: '₹' },
  { code: 'USD', label: 'USD ($) - US Dollar', symbol: '$' },
  { code: 'EUR', label: 'EUR (€) - Euro', symbol: '€' },
  { code: 'GBP', label: 'GBP (£) - British Pound', symbol: '£' },
  { code: 'JPY', label: 'JPY (¥) - Japanese Yen', symbol: '¥' },
  { code: 'AUD', label: 'AUD ($) - Australian Dollar', symbol: 'A$' },
  { code: 'CAD', label: 'CAD ($) - Canadian Dollar', symbol: 'C$' },
  { code: 'AED', label: 'AED (د.إ) - UAE Dirham', symbol: 'AED' },
  { code: 'SGD', label: 'SGD ($) - Singapore Dollar', symbol: 'S$' },
];

export const formatCurrency = (amount, currency = 'INR') => {
  const numericAmount = typeof amount === 'number' ? amount : Number(amount) || 0;
  const curr = currency || 'INR';

  const localeMap = {
    INR: 'en-IN',
    USD: 'en-US',
    EUR: 'de-DE',
    GBP: 'en-GB',
    JPY: 'ja-JP',
    AUD: 'en-AU',
    CAD: 'en-CA',
    AED: 'en-AE',
    SGD: 'en-SG',
  };

  const locale = localeMap[curr] || (curr === 'INR' ? 'en-IN' : 'en-US');

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: curr,
      maximumFractionDigits: curr === 'JPY' ? 0 : 2,
      minimumFractionDigits: curr === 'JPY' ? 0 : 2,
    }).format(numericAmount);
  } catch (error) {
    return `${curr} ${numericAmount.toFixed(2)}`;
  }
};

export const getCurrencySymbol = (currency = 'INR') => {
  const curr = currency || 'INR';
  const found = CURRENCY_OPTIONS.find((c) => c.code === curr);
  return found ? found.symbol : curr;
};
