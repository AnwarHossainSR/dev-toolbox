"use client";

import React, { useState, useEffect, useMemo } from "react";
import { calculateStock, CalculatorResult } from "@/utils/stockCalculator";
import { 
  TrendingUp, 
  TrendingDown, 
  Calculator, 
  Percent,
  Banknote,
  PieChart,
  RefreshCcw,
  ArrowRight
} from "lucide-react";

export function StockMarketCalculator() {
  const [mounted, setMounted] = useState(false);
  
  // States
  const [purchasePrice, setPurchasePrice] = useState<string>("100");
  const [shares, setShares] = useState<string>("50");
  const [brokerage, setBrokerage] = useState<string>("0.1");
  const [isBrokeragePercent, setIsBrokeragePercent] = useState<boolean>(true);
  const [otherCharges, setOtherCharges] = useState<string>("0");
  const [sellingPricesStr, setSellingPricesStr] = useState<string>("110, 120, 95");

  // Load from local storage securely
  useEffect(() => {
    try {
      const saved = localStorage.getItem("stockCalculatorState");
      if (saved) {
        const parsed = JSON.parse(saved);
        setPurchasePrice(parsed.purchasePrice || "100");
        setShares(parsed.shares || "50");
        setBrokerage(parsed.brokerage || "0.1");
        setIsBrokeragePercent(parsed.isBrokeragePercent ?? true);
        setOtherCharges(parsed.otherCharges || "0");
        setSellingPricesStr(parsed.sellingPricesStr || "110, 120, 95");
      }
    } catch (e) {
      console.error("Failed to load state from localStorage");
    }
    setMounted(true);
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("stockCalculatorState", JSON.stringify({
        purchasePrice,
        shares,
        brokerage,
        isBrokeragePercent,
        otherCharges,
        sellingPricesStr
      }));
    }
  }, [purchasePrice, shares, brokerage, isBrokeragePercent, otherCharges, sellingPricesStr, mounted]);

  const parsedSellingPrices = useMemo(() => {
    return sellingPricesStr
      .split(",")
      .map(s => s.trim())
      .filter(s => s !== "" && !isNaN(Number(s)))
      .map(Number);
  }, [sellingPricesStr]);

  // Primary selling price is either the first valid one or the purchase price itself
  const primarySellingPrice = parsedSellingPrices.length > 0 ? parsedSellingPrices[0] : Number(purchasePrice);

  const numPurchase = Number(purchasePrice) || 0;
  const numShares = Number(shares) || 0;
  const numBrokerage = Number(brokerage) || 0;
  const numOther = Number(otherCharges) || 0;

  const result = useMemo(() => calculateStock(
    numPurchase,
    numShares,
    numBrokerage,
    isBrokeragePercent,
    numOther,
    primarySellingPrice
  ), [numPurchase, numShares, numBrokerage, isBrokeragePercent, numOther, primarySellingPrice]);

  if (!mounted) return null; // Avoid hydration mismatch on initial load

  const isProfit = result.profitOrLoss >= 0;
  
  return (
    <div className="min-h-full bg-background p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent inline-flex items-center gap-3">
          <Calculator className="w-8 h-8 text-amber-500" />
          Pro Stock Calculator
        </h1>
        <p className="text-muted-foreground text-sm max-w-2xl">
          Instantly calculate total costs, projected revenues, and net profits across multiple target selling scenarios.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Settings */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm shadow-black/5 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-amber-600" />
            
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-6">
              <RefreshCcw className="w-5 h-5 text-amber-500" />
              Trade Details
            </h2>

            <div className="space-y-5">
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Purchase Price per Share</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 w-10 flex items-center justify-center pointer-events-none">
                    <span className="text-muted-foreground font-semibold">৳</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background/50 pl-10 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Number of Shares</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <PieChart className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={shares}
                    onChange={(e) => setShares(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background/50 pl-10 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">Brokerage Fee</label>
                  <button 
                    onClick={() => setIsBrokeragePercent(!isBrokeragePercent)}
                    className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 transition-colors"
                  >
                    Toggle to {isBrokeragePercent ? 'Fixed' : '%'}
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {isBrokeragePercent ? (
                      <Percent className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <span className="text-muted-foreground font-semibold">৳</span>
                    )}
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={brokerage}
                    onChange={(e) => setBrokerage(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background/50 pl-10 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Other Charges (Fixed)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Banknote className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={otherCharges}
                    onChange={(e) => setOtherCharges(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background/50 pl-10 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 transition-colors"
                  />
                </div>
              </div>

              <div className="border-t border-border mt-4 pt-4">
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Target Selling Prices (comma separated)
                </label>
                <textarea
                  rows={2}
                  value={sellingPricesStr}
                  onChange={(e) => setSellingPricesStr(e.target.value)}
                  placeholder="e.g. 110, 120, 150"
                  className="flex w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 transition-colors resize-none"
                />
              </div>

            </div>
          </div>
        </div>

        {/* Right Column: Output & Visualization */}
        <div className="lg:col-span-8 space-y-6">
          {/* Primary Result Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            <StatCard 
              title="Total Investment" 
              value={result.totalInvestment} 
            />
            <StatCard 
              title="Buy Cost (Incl. Fees)" 
              value={result.buyCost} 
            />
            <StatCard 
              title="Sell Value" 
              value={result.sellValue} 
            />
            <StatCard 
              title="Total Fees & Charges" 
              value={result.sellBrokerage + (isBrokeragePercent ? (result.totalInvestment * numBrokerage)/100 : numBrokerage) + numOther} 
              isWarning={true}
            />

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Profit Card */}
            <div className={`relative overflow-hidden rounded-2xl p-6 border shadow-sm transition-all duration-300 transform hover:-translate-y-1 ${
              isProfit 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400' 
                : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400'
            }`}>
              <div className="flex justify-between items-start mb-4">
                <div className="text-sm font-medium opacity-80 uppercase tracking-widest">
                  {isProfit ? 'Net Profit' : 'Net Loss'}
                </div>
                {isProfit ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              </div>
              <div className="text-4xl font-extrabold tracking-tight">
                ৳{Math.abs(result.profitOrLoss).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </div>
              <div className="mt-4 pt-4 border-t border-current/10 flex items-center gap-2 text-sm">
                <ArrowRight className="w-4 h-4 opacity-70" />
                <span className="opacity-90">Net Revenue: <strong>৳{result.netRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong></span>
              </div>
            </div>

            {/* Break-Even Info */}
            <div className="relative overflow-hidden rounded-2xl p-6 border border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-orange-500/5 shadow-sm">
              <div className="text-sm font-medium text-amber-700 dark:text-amber-500 opacity-80 uppercase tracking-widest mb-4">
                Break-Even Target
              </div>
              <div className="text-3xl font-bold text-foreground">
                ৳{result.breakEvenPrice > 0 ? result.breakEvenPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '0.00'}
              </div>
              <p className="mt-2 text-balance text-sm text-muted-foreground pt-4 border-t border-border/50">
                Minimum selling price per share to cover all brokerage and other charges.
              </p>
            </div>

          </div>

          {/* Multi-Scenario Table */}
          {parsedSellingPrices.length > 1 && (
            <div className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm shadow-black/5 mt-8 animate-in slide-in-from-bottom-4 duration-500">
              <div className="px-6 py-4 bg-muted/40 border-b border-border/60 flex items-center justify-between">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  Scenario Analysis
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/20">
                    <tr>
                      <th scope="col" className="px-6 py-3 font-medium">Selling Price</th>
                      <th scope="col" className="px-6 py-3 font-medium">Net Revenue</th>
                      <th scope="col" className="px-6 py-3 font-medium text-right">Profit / Loss</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedSellingPrices.map((price, idx) => {
                      const scenarioResult = calculateStock(
                        numPurchase,
                        numShares,
                        numBrokerage,
                        isBrokeragePercent,
                        numOther,
                        price
                      );
                      const isScenarioProfit = scenarioResult.profitOrLoss >= 0;
                      return (
                        <tr key={idx} className="border-b border-border/40 hover:bg-muted/10 transition-colors">
                          <td className="px-6 py-4 font-semibold text-foreground">
                            ৳{price.toFixed(2)}
                          </td>
                          <td className="px-6 py-4">
                            ৳{scenarioResult.netRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                          </td>
                          <td className={`px-6 py-4 text-right font-bold ${isScenarioProfit ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {isScenarioProfit ? '+' : '-'}৳{Math.abs(scenarioResult.profitOrLoss).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, isWarning = false }: { title: string, value: number, isWarning?: boolean }) {
  return (
    <div className={`p-4 rounded-xl border flex flex-col gap-1 transition-colors ${isWarning ? 'border-amber-500/20 bg-amber-50/30 dark:bg-amber-950/20 hover:border-amber-500/40' : 'border-border/60 bg-card hover:border-primary/30'}`}>
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</span>
      <span className="text-xl font-bold tabular-nums text-foreground">
        ৳{value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
      </span>
    </div>
  );
}
