// Currency utility functions
export const getCurrencySymbol = () => {
  return process.env.REACT_APP_CURRENCY_SYMBOL || '₱';
};

export const getCurrencyCode = () => {
  return process.env.REACT_APP_CURRENCY_CODE || 'PHP';
};

// Global currency symbol for easy access
export const CURRENCY = getCurrencySymbol();

export const formatCurrency = (amount, options = {}) => {
  const {
    symbol = getCurrencySymbol(),
    decimals = 2,
    showSymbol = true
  } = options;

  const formattedAmount = Number(amount).toFixed(decimals);
  
  if (showSymbol) {
    return `${symbol}${formattedAmount}`;
  }
  
  return formattedAmount;
};

export const parseCurrency = (currencyString) => {
  // Remove currency symbol and parse as float
  const symbol = getCurrencySymbol();
  const cleanString = currencyString.replace(symbol, '').replace(/,/g, '');
  return parseFloat(cleanString) || 0;
};
