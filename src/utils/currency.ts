/**
 * Currency utility for Philippine Peso (₱)
 */

export function formatPeso(amount: number, options?: { showSign?: boolean; showSymbol?: boolean }): string {
  const showSign = options?.showSign ?? false;
  const showSymbol = options?.showSymbol ?? true;

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  const formattedNumber = absAmount.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const symbol = showSymbol ? '₱' : '';

  if (showSign) {
    if (isNegative) {
      return `-${symbol}${formattedNumber}`;
    } else if (amount > 0) {
      return `+${symbol}${formattedNumber}`;
    }
    return `${symbol}${formattedNumber}`;
  }

  return isNegative ? `-${symbol}${formattedNumber}` : `${symbol}${formattedNumber}`;
}

export function parsePesoInput(val: string): number {
  const cleaned = val.replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}
