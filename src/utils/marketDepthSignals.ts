import { MarketDepthData, MarketDepthSignal, StrategyCondition } from '../types';

/**
 * Utility functions for evaluating Level-2 Market Depth algorithmic trading signals.
 * These functions are modular and ready for consumption by automated strategy engines.
 */

/**
 * Calculate Order Book Imbalance ratio and percentage.
 * Formula: (Total Buy Qty - Total Sell Qty) / (Total Buy Qty + Total Sell Qty) * 100
 */
export function calculateOrderBookImbalance(buyQty: number, sellQty: number): {
  imbalancePercent: number;
  ratio: number;
  bias: 'BUY_HEAVY' | 'SELL_HEAVY' | 'BALANCED';
} {
  const total = buyQty + sellQty;
  if (total === 0) return { imbalancePercent: 0, ratio: 1, bias: 'BALANCED' };

  const imbalancePercent = +(((buyQty - sellQty) / total) * 100).toFixed(2);
  const ratio = +(buyQty / (sellQty || 1)).toFixed(2);
  const bias = imbalancePercent > 12 ? 'BUY_HEAVY' : imbalancePercent < -12 ? 'SELL_HEAVY' : 'BALANCED';

  return { imbalancePercent, ratio, bias };
}

/**
 * Detect large Order Book Walls (orders at a single level exceeding normal average by X multiplier).
 */
export function detectOrderBookWalls(
  depthData: MarketDepthData,
  thresholdMultiplier = 3.0
): {
  hasBidWall: boolean;
  bidWallLevel?: { price: number; quantity: number; orders: number };
  hasAskWall: boolean;
  askWallLevel?: { price: number; quantity: number; orders: number };
} {
  const avgBuyQty = depthData.totalBuyQuantity / (depthData.depth.buy.length || 1);
  const avgSellQty = depthData.totalSellQuantity / (depthData.depth.sell.length || 1);

  const bidWall = depthData.depth.buy.find(b => b.quantity >= avgBuyQty * thresholdMultiplier);
  const askWall = depthData.depth.sell.find(s => s.quantity >= avgSellQty * thresholdMultiplier);

  return {
    hasBidWall: !!bidWall,
    bidWallLevel: bidWall,
    hasAskWall: !!askWall,
    askWallLevel: askWall
  };
}

/**
 * Evaluate a strategy condition targeting market depth metrics.
 */
export function evaluateMarketDepthCondition(
  condition: StrategyCondition,
  depthData: MarketDepthData
): { isMatch: boolean; currentValue: number; rationale: string } {
  let currentValue = 0;
  let targetValue = typeof condition.rightValue === 'number' 
    ? condition.rightValue 
    : parseFloat(condition.rightValue) || 0;

  switch (condition.leftIndicator) {
    case 'Order Book Imbalance':
      currentValue = depthData.imbalancePercent;
      break;
    case 'Buy/Sell Ratio':
      currentValue = depthData.buySellRatio;
      break;
    case 'Bid/Ask Spread':
      currentValue = depthData.spread;
      break;
    default:
      return { isMatch: false, currentValue: 0, rationale: 'Unsupported indicator' };
  }

  let isMatch = false;
  switch (condition.operator) {
    case '>':
      isMatch = currentValue > targetValue;
      break;
    case '>=':
      isMatch = currentValue >= targetValue;
      break;
    case '<':
      isMatch = currentValue < targetValue;
      break;
    case '<=':
      isMatch = currentValue <= targetValue;
      break;
    case '==':
      isMatch = Math.abs(currentValue - targetValue) < 0.01;
      break;
    default:
      isMatch = false;
  }

  const rationale = `${condition.leftIndicator} (${currentValue}) ${condition.operator} ${targetValue} ${isMatch ? '✓' : '✗'}`;
  return { isMatch, currentValue, rationale };
}

/**
 * Analyze Market Depth and generate diagnostic signals if extreme conditions are met.
 */
export function analyzeMarketDepthSignals(depthData: MarketDepthData): MarketDepthSignal[] {
  const signals: MarketDepthSignal[] = [];
  const now = new Date().toISOString();

  // 1. Heavy Imbalance Signal
  if (depthData.imbalancePercent >= 25) {
    signals.push({
      symbol: depthData.symbol,
      type: 'IMBALANCE',
      signal: 'BUY',
      strength: Math.min(100, Math.round(depthData.imbalancePercent * 2)),
      title: 'Strong Buy Depth Pressure',
      description: `Bids exceed Asks by ${depthData.imbalancePercent}% (Ratio: ${depthData.buySellRatio}x)`,
      timestamp: now
    });
  } else if (depthData.imbalancePercent <= -25) {
    signals.push({
      symbol: depthData.symbol,
      type: 'IMBALANCE',
      signal: 'SELL',
      strength: Math.min(100, Math.round(Math.abs(depthData.imbalancePercent) * 2)),
      title: 'Heavy Sell Depth Pressure',
      description: `Asks exceed Bids by ${Math.abs(depthData.imbalancePercent)}% (Ratio: ${depthData.buySellRatio}x)`,
      timestamp: now
    });
  }

  // 2. Wall Detection
  const walls = detectOrderBookWalls(depthData, 3.5);
  if (walls.hasBidWall && walls.bidWallLevel) {
    signals.push({
      symbol: depthData.symbol,
      type: 'WALL',
      signal: 'BUY',
      strength: 75,
      title: `Bid Wall Support at ₹${walls.bidWallLevel.price.toFixed(2)}`,
      description: `Large institutional bid wall of ${walls.bidWallLevel.quantity.toLocaleString('en-IN')} shares (${walls.bidWallLevel.orders} orders)`,
      timestamp: now
    });
  }

  if (walls.hasAskWall && walls.askWallLevel) {
    signals.push({
      symbol: depthData.symbol,
      type: 'WALL',
      signal: 'SELL',
      strength: 75,
      title: `Ask Resistance Wall at ₹${walls.askWallLevel.price.toFixed(2)}`,
      description: `Large supply wall of ${walls.askWallLevel.quantity.toLocaleString('en-IN')} shares (${walls.askWallLevel.orders} orders)`,
      timestamp: now
    });
  }

  return signals;
}
