export interface CalculatorResult {
  totalInvestment: number;
  buyCost: number;
  sellValue: number;
  sellBrokerage: number;
  netRevenue: number;
  profitOrLoss: number;
  breakEvenPrice: number;
}

export function calculateStock(
  purchasePrice: number,
  shares: number,
  brokerage: number,
  isBrokeragePercent: boolean,
  otherCharges: number,
  sellingPrice: number
): CalculatorResult {
  // If no shares, return 0 for everything
  if (!shares || shares <= 0) {
    return {
      totalInvestment: 0,
      buyCost: 0,
      sellValue: 0,
      sellBrokerage: 0,
      netRevenue: 0,
      profitOrLoss: 0,
      breakEvenPrice: 0,
    };
  }

  const totalInvestment = purchasePrice * shares;

  // Calculate buy brokerage based on percentage or fixed amount
  const buyBrokerageAmt = isBrokeragePercent
    ? (totalInvestment * brokerage) / 100
    : brokerage;

  const buyCost = totalInvestment + buyBrokerageAmt;

  const sellValue = sellingPrice * shares;

  const sellBrokerageAmt = isBrokeragePercent
    ? (sellValue * brokerage) / 100
    : brokerage;

  const netRevenue = sellValue - sellBrokerageAmt - otherCharges;
  const profitOrLoss = netRevenue - buyCost;

  // Break-even price calculation:
  // We want: sellingPrice * shares - sellBrokerageAmt - otherCharges - buyCost = 0
  let breakEvenPrice = 0;
  if (isBrokeragePercent) {
    // sellingPrice * shares * (1 - brokerage / 100) = buyCost + otherCharges
    const factor = 1 - brokerage / 100;
    if (factor > 0) {
      breakEvenPrice = (buyCost + otherCharges) / (shares * factor);
    }
  } else {
    // sellingPrice * shares - brokerage - otherCharges - buyCost = 0
    breakEvenPrice = (buyCost + otherCharges + brokerage) / shares;
  }

  return {
    totalInvestment,
    buyCost,
    sellValue,
    sellBrokerage: sellBrokerageAmt,
    netRevenue,
    profitOrLoss,
    breakEvenPrice,
  };
}
