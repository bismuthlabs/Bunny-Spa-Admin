export const formatCurrency = (amount: number | string): string => {
  const num = typeof amount === "string" ? Number.parseFloat(amount) : amount
  return `₵${num.toFixed(2)}`
}

export const CURRENCY_SYMBOL = "₵"
