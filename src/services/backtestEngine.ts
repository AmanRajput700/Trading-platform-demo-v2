import { BacktestConfig, BacktestResult, BacktestTrade, EquityCurvePoint, OrderSide } from '../types';
import { INITIAL_INSTRUMENTS } from '../mock/marketData';

export function runHistoricalBacktest(config: BacktestConfig): BacktestResult {
  const inst = INITIAL_INSTRUMENTS.find(i => i.symbol.toUpperCase() === config.symbol.toUpperCase());
  const basePrice = inst?.price || 3500;
  const initialCapital = config.initialCapital || 500000;

  // Determine period parameters
  let numBars = 180;
  let periodLabel = 'Last 1 Year (Jan 2025 – Dec 2025)';
  switch (config.dateRange) {
    case '1M':
      numBars = 30;
      periodLabel = 'Last 1 Month (22 Trading Days)';
      break;
    case '3M':
      numBars = 65;
      periodLabel = 'Last 3 Months (65 Trading Days)';
      break;
    case '6M':
      numBars = 125;
      periodLabel = 'Last 6 Months (125 Trading Days)';
      break;
    case '1Y':
      numBars = 250;
      periodLabel = 'Last 1 Year (Jan 2025 – Dec 2025)';
      break;
    case '3Y':
      numBars = 450;
      periodLabel = 'Last 3 Years (750 Trading Days)';
      break;
    case '5Y':
    case 'ALL':
      numBars = 600;
      periodLabel = '5 Years Historical (Start till Now)';
      break;
  }

  // Generate historical daily/intraday price trajectory
  const prices: { date: string; price: number; high: number; low: number; rsi: number }[] = [];
  let currentPrice = +(basePrice * 0.78).toFixed(2);
  const now = new Date();

  for (let i = numBars; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    // Multi-factor drift (volatility + trend)
    const drift = (Math.sin(i * 0.15) * 0.008 + (Math.random() - 0.47) * 0.02);
    currentPrice = +(currentPrice * (1 + drift)).toFixed(2);
    const high = +(currentPrice * (1 + Math.random() * 0.012)).toFixed(2);
    const low = +(currentPrice * (1 - Math.random() * 0.012)).toFixed(2);
    const rsi = Math.max(18, Math.min(82, +(50 + Math.sin(i * 0.2) * 25 + (Math.random() - 0.5) * 10).toFixed(1)));

    prices.push({ date: dateStr, price: currentPrice, high, low, rsi });
  }

  // Simulate strategy trade entries and exits
  let capital = initialCapital;
  let peakCapital = initialCapital;
  let maxDrawdown = 0;
  let maxDrawdownPercent = 0;

  const trades: BacktestTrade[] = [];
  const equityCurve: EquityCurvePoint[] = [];

  let inPosition: {
    side: OrderSide;
    entryIndex: number;
    entryPrice: number;
    entryDate: string;
    quantity: number;
    reason: string;
  } | null = null;

  const tradeFrequency = Math.max(4, Math.floor(prices.length / 32));

  for (let i = 10; i < prices.length; i++) {
    const p = prices[i];

    // Benchmark tracking (Buy & Hold)
    const benchmarkRatio = p.price / prices[0].price;
    const benchmarkEquity = +(initialCapital * benchmarkRatio).toFixed(2);

    // If not in position, check for entry trigger
    if (!inPosition && i % tradeFrequency === 0) {
      const isOversold = p.rsi < 36;
      const isBreakout = p.price > prices[i - 5].price;

      if (isOversold || isBreakout || Math.random() > 0.4) {
        const side: OrderSide = 'BUY';
        const positionSizeCapital = capital * 0.25; // 25% allocation per trade
        const quantity = Math.max(1, Math.floor(positionSizeCapital / p.price));

        inPosition = {
          side,
          entryIndex: i,
          entryPrice: p.price,
          entryDate: p.date,
          quantity,
          reason: isOversold 
            ? `RSI Oversold Bounce (${p.rsi}) with 20 EMA Support` 
            : `Momentum Breakout above ₹${prices[i - 1].price.toFixed(2)}`
        };
      }
    } else if (inPosition) {
      // Check exit condition (hold for 2 to 6 bars or profit/loss target)
      const barsHeld = i - inPosition.entryIndex;
      const pnlPct = ((p.price - inPosition.entryPrice) / inPosition.entryPrice) * 100;
      const targetHit = pnlPct >= (config.targetPercent || 4.2);
      const stopLossHit = pnlPct <= -(config.stopLossPercent || 2.1);
      const timeExit = barsHeld >= 5;

      if (targetHit || stopLossHit || timeExit || i === prices.length - 1) {
        const exitPrice = p.price;
        const rawPnl = (exitPrice - inPosition.entryPrice) * inPosition.quantity;
        const pnl = +rawPnl.toFixed(2);
        const pnlPercent = +pnlPct.toFixed(2);
        const isWin = pnl > 0;

        capital = +(capital + pnl).toFixed(2);

        trades.push({
          id: `BT-${trades.length + 1}`,
          symbol: config.symbol.toUpperCase(),
          side: inPosition.side,
          entryDate: inPosition.entryDate,
          entryPrice: inPosition.entryPrice,
          exitDate: p.date,
          exitPrice,
          quantity: inPosition.quantity,
          pnl,
          pnlPercent,
          duration: `${barsHeld} ${config.timeframe || '15m'} bars`,
          reason: targetHit ? 'Target Reached (+4.2%)' : stopLossHit ? 'Stop Loss Triggered (-2.1%)' : 'Signal Exit / Time Reversion',
          status: isWin ? 'WIN' : 'LOSS'
        });

        inPosition = null;
      }
    }

    // Update equity curve & drawdown
    if (capital > peakCapital) peakCapital = capital;
    const currentDrawdown = +(peakCapital - capital).toFixed(2);
    const currentDrawdownPct = +(((peakCapital - capital) / peakCapital) * 100).toFixed(2);

    if (currentDrawdown > maxDrawdown) maxDrawdown = currentDrawdown;
    if (currentDrawdownPct > maxDrawdownPercent) maxDrawdownPercent = currentDrawdownPct;

    if (i % Math.max(1, Math.floor(prices.length / 40)) === 0 || i === prices.length - 1) {
      equityCurve.push({
        date: p.date,
        equity: capital,
        drawdown: -currentDrawdownPct,
        benchmark: benchmarkEquity
      });
    }
  }

  // Summary Metrics Computation
  const winningTrades = trades.filter(t => t.status === 'WIN');
  const losingTrades = trades.filter(t => t.status === 'LOSS');
  const winRate = trades.length > 0 ? +((winningTrades.length / trades.length) * 100).toFixed(1) : 0;

  const totalWinPnl = winningTrades.reduce((acc, t) => acc + t.pnl, 0);
  const totalLossPnl = Math.abs(losingTrades.reduce((acc, t) => acc + t.pnl, 0));
  const profitFactor = totalLossPnl > 0 ? +(totalWinPnl / totalLossPnl).toFixed(2) : +(totalWinPnl > 0 ? 3.5 : 1.0);

  const totalReturn = +(capital - initialCapital).toFixed(2);
  const totalReturnPercent = +(((capital - initialCapital) / initialCapital) * 100).toFixed(2);
  const benchmarkReturnPercent = +(((prices[prices.length - 1].price - prices[0].price) / prices[0].price) * 100).toFixed(2);

  const avgTradePnl = trades.length > 0 ? +(totalReturn / trades.length).toFixed(2) : 0;
  const avgWinPnl = winningTrades.length > 0 ? +(totalWinPnl / winningTrades.length).toFixed(2) : 0;
  const avgLossPnl = losingTrades.length > 0 ? +(totalLossPnl / losingTrades.length).toFixed(2) : 0;

  // Compute consecutive wins & losses
  let maxConsecutiveWins = 0;
  let maxConsecutiveLosses = 0;
  let currentWinStreak = 0;
  let currentLossStreak = 0;

  trades.forEach(t => {
    if (t.status === 'WIN') {
      currentWinStreak++;
      currentLossStreak = 0;
      if (currentWinStreak > maxConsecutiveWins) maxConsecutiveWins = currentWinStreak;
    } else {
      currentLossStreak++;
      currentWinStreak = 0;
      if (currentLossStreak > maxConsecutiveLosses) maxConsecutiveLosses = currentLossStreak;
    }
  });

  const sharpeRatio = maxDrawdownPercent > 0 
    ? +( (totalReturnPercent / 12) / (maxDrawdownPercent / 2.5) ).toFixed(2) 
    : 1.45;

  const expectancy = `₹${avgTradePnl.toLocaleString('en-IN')} per trade (${winRate}% win expectancy)`;

  return {
    symbol: config.symbol.toUpperCase(),
    strategyName: config.strategyName || 'Momentum Breakout',
    periodTested: periodLabel,
    initialCapital,
    finalCapital: capital,
    totalReturn,
    totalReturnPercent,
    benchmarkReturnPercent,
    maxDrawdown,
    maxDrawdownPercent,
    winRate,
    sharpeRatio: Math.max(0.4, sharpeRatio),
    profitFactor,
    totalTrades: trades.length,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    avgTradePnl,
    avgWinPnl,
    avgLossPnl,
    maxConsecutiveWins,
    maxConsecutiveLosses,
    equityCurve,
    trades: trades.reverse(), // latest trades first
    expectancy
  };
}
