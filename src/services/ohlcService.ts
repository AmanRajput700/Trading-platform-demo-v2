/**
 * OHLC Historical Data Service for TradingView Lightweight Charts
 * Provides candlestick history and technical indicator series (EMA, SMA, VWAP)
 * formatted for Lightweight Charts (UTCTimestamp seconds).
 */

import { CandlestickData, LineData, HistogramData, UTCTimestamp } from 'lightweight-charts';

export interface TVBar extends CandlestickData<UTCTimestamp> {
  volume: number;
}

export interface IndicatorSeriesData {
  candles: CandlestickData<UTCTimestamp>[];
  volumes: HistogramData<UTCTimestamp>[];
  ema20: LineData<UTCTimestamp>[];
  ema50: LineData<UTCTimestamp>[];
  vwap: LineData<UTCTimestamp>[];
}

export type ChartTimeframe = '1m' | '3m' | '5m' | '15m' | '30m' | '1H' | '4H' | '1D' | '1W';

export const TIMEFRAME_SECONDS_MAP: Record<ChartTimeframe, number> = {
  '1m': 60,
  '3m': 180,
  '5m': 300,
  '15m': 900,
  '30m': 1800,
  '1H': 3600,
  '4H': 14400,
  '1D': 86400,
  '1W': 604800,
};

export const TIMEFRAME_LABELS: { id: ChartTimeframe; label: string; intervalMinutes: number }[] = [
  { id: '1m', label: '1m', intervalMinutes: 1 },
  { id: '3m', label: '3m', intervalMinutes: 3 },
  { id: '5m', label: '5m', intervalMinutes: 5 },
  { id: '15m', label: '15m', intervalMinutes: 15 },
  { id: '30m', label: '30m', intervalMinutes: 30 },
  { id: '1H', label: '1H', intervalMinutes: 60 },
  { id: '4H', label: '4H', intervalMinutes: 240 },
  { id: '1D', label: '1D', intervalMinutes: 1440 },
  { id: '1W', label: '1W', intervalMinutes: 10080 },
];

/**
 * Generate historical candlestick bars seeded from current instrument base price
 */
export function generateHistoricalCandles(
  symbol: string,
  basePrice: number,
  timeframe: ChartTimeframe = '15m',
  barCount: number = 180
): IndicatorSeriesData {
  const stepSeconds = TIMEFRAME_SECONDS_MAP[timeframe] || 900;
  const nowSeconds = Math.floor(Date.now() / 1000);
  // Align to step boundary
  const currentBarTime = Math.floor(nowSeconds / stepSeconds) * stepSeconds;
  const startTime = currentBarTime - (barCount - 1) * stepSeconds;

  // Derive pseudo-random seed from symbol string
  let seed = 0;
  for (let i = 0; i < symbol.length; i++) {
    seed = (seed << 5) - seed + symbol.charCodeAt(i);
    seed |= 0;
  }
  const pseudoRand = (s: number) => {
    const x = Math.sin(s++) * 10000;
    return x - Math.floor(x);
  };

  const candles: CandlestickData<UTCTimestamp>[] = [];
  const volumes: HistogramData<UTCTimestamp>[] = [];

  // Volatility scaling by timeframe
  const volatility = timeframe === '1m' || timeframe === '3m' 
    ? 0.0018 
    : timeframe === '5m' || timeframe === '15m' 
      ? 0.0035 
      : timeframe === '1H' || timeframe === '4H' 
        ? 0.007 
        : 0.015;

  let lastClose = +(basePrice * (1 - (barCount * 0.0006))).toFixed(2);
  let curSeed = Math.abs(seed);

  for (let i = 0; i < barCount; i++) {
    const barTime = (startTime + i * stepSeconds) as UTCTimestamp;
    const r1 = pseudoRand(curSeed++);
    const r2 = pseudoRand(curSeed++);
    const r3 = pseudoRand(curSeed++);
    const r4 = pseudoRand(curSeed++);

    // Upward bias or slight trend
    const direction = r1 > 0.48 ? 1 : -1;
    const change = lastClose * volatility * (0.2 + r2 * 0.8) * direction;
    const open = lastClose;
    const close = +(open + change).toFixed(2);

    const highExtent = lastClose * volatility * r3 * 0.6;
    const lowExtent = lastClose * volatility * r4 * 0.6;

    const high = +(Math.max(open, close) + highExtent).toFixed(2);
    const low = +(Math.max(0.5, Math.min(open, close) - lowExtent)).toFixed(2);

    const baseVol = basePrice > 5000 ? 5000 : basePrice > 1000 ? 25000 : 120000;
    const volume = Math.floor(baseVol * (0.4 + r2 * 1.2));

    candles.push({
      time: barTime,
      open,
      high,
      low,
      close,
    });

    const isUp = close >= open;
    volumes.push({
      time: barTime,
      value: volume,
      color: isUp ? 'rgba(16, 185, 129, 0.45)' : 'rgba(239, 68, 68, 0.45)',
    });

    lastClose = close;
  }

  // Ensure last candle close strictly matches current live base price
  if (candles.length > 0) {
    const last = candles[candles.length - 1];
    last.close = basePrice;
    last.high = Math.max(last.high, basePrice);
    last.low = Math.min(last.low, basePrice);
  }

  // Calculate Technical Indicators
  const ema20 = calculateEMA(candles, 20);
  const ema50 = calculateEMA(candles, 50);
  const vwap = calculateVWAP(candles, volumes);

  return {
    candles,
    volumes,
    ema20,
    ema50,
    vwap,
  };
}

/**
 * Exponential Moving Average calculation
 */
export function calculateEMA(
  candles: CandlestickData<UTCTimestamp>[],
  period: number
): LineData<UTCTimestamp>[] {
  if (candles.length < period) return [];

  const results: LineData<UTCTimestamp>[] = [];
  const multiplier = 2 / (period + 1);

  // Initial SMA for first value
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += candles[i].close;
  }
  let prevEMA = sum / period;

  results.push({
    time: candles[period - 1].time,
    value: +prevEMA.toFixed(2),
  });

  for (let i = period; i < candles.length; i++) {
    const close = candles[i].close;
    const currentEMA = (close - prevEMA) * multiplier + prevEMA;
    results.push({
      time: candles[i].time,
      value: +currentEMA.toFixed(2),
    });
    prevEMA = currentEMA;
  }

  return results;
}

/**
 * Volume Weighted Average Price (VWAP) calculation
 */
export function calculateVWAP(
  candles: CandlestickData<UTCTimestamp>[],
  volumes: HistogramData<UTCTimestamp>[]
): LineData<UTCTimestamp>[] {
  const results: LineData<UTCTimestamp>[] = [];
  let cumTypicalVol = 0;
  let cumVol = 0;

  for (let i = 0; i < candles.length; i++) {
    const c = candles[i];
    const v = volumes[i]?.value || 1000;
    const typicalPrice = (c.high + c.low + c.close) / 3;

    cumTypicalVol += typicalPrice * v;
    cumVol += v;

    const vwapVal = cumVol > 0 ? cumTypicalVol / cumVol : typicalPrice;

    results.push({
      time: c.time,
      value: +vwapVal.toFixed(2),
    });
  }

  return results;
}
