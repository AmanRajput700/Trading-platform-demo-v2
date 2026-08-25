/**
 * OHLC Historical & Real Market Data Service for TradingView Lightweight Charts
 * Provides real-time and historical candlestick data fetched from Upstox Market Data Feed API
 * with session-aware fallback and technical indicator calculations (EMA, VWAP).
 */

import { CandlestickData, LineData, HistogramData, UTCTimestamp } from 'lightweight-charts';
import { apiClient } from './apiClient';

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
 * Fetch 100% real OHLC market candles and technical indicators from Backend/Upstox API
 */
export async function fetchRealMarketCandles(
  symbol: string,
  timeframe: ChartTimeframe = '15m',
  limit: number = 250
): Promise<IndicatorSeriesData | null> {
  try {
    const encodedSym = encodeURIComponent(symbol);
    const res = await apiClient.get(`/market/candles/${encodedSym}?timeframe=${timeframe}&limit=${limit}`);
    const data = res?.data?.data;
    if (data && Array.isArray(data.candles) && data.candles.length > 0) {
      const candles: CandlestickData<UTCTimestamp>[] = data.candles.map((c: any) => ({
        time: c.time as UTCTimestamp,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }));

      const volumes: HistogramData<UTCTimestamp>[] = (data.volumes || []).map((v: any) => ({
        time: v.time as UTCTimestamp,
        value: v.value,
        color: v.color || (v.close >= v.open ? 'rgba(16, 185, 129, 0.45)' : 'rgba(239, 68, 68, 0.45)'),
      }));

      const ema20: LineData<UTCTimestamp>[] = (data.ema20 || []).map((e: any) => ({
        time: e.time as UTCTimestamp,
        value: e.value,
      }));

      const ema50: LineData<UTCTimestamp>[] = (data.ema50 || []).map((e: any) => ({
        time: e.time as UTCTimestamp,
        value: e.value,
      }));

      const vwap: LineData<UTCTimestamp>[] = (data.vwap || []).map((w: any) => ({
        time: w.time as UTCTimestamp,
        value: w.value,
      }));

      return {
        candles,
        volumes,
        ema20: ema20.length > 0 ? ema20 : calculateEMA(candles, 20),
        ema50: ema50.length > 0 ? ema50 : calculateEMA(candles, 50),
        vwap: vwap.length > 0 ? vwap : calculateVWAP(candles, volumes),
      };
    }
  } catch {
    // Return null to fall back to session-aligned generator
  }
  return null;
}

/**
 * Generate Indian market session-aligned candlestick bars (09:15 to 15:30 IST on trading days)
 */
export function generateHistoricalCandles(
  symbol: string,
  basePrice: number,
  timeframe: ChartTimeframe = '15m',
  barCount: number = 180
): IndicatorSeriesData {
  const stepSeconds = TIMEFRAME_SECONDS_MAP[timeframe] || 900;
  
  // Build realistic timestamps aligned to Indian Market Trading Hours (09:15 to 15:30 IST)
  const timestamps: number[] = [];
  const now = new Date();
  
  // Work backwards generating only trading session timestamps
  let curDate = new Date(now);
  while (timestamps.length < barCount) {
    const day = curDate.getDay();
    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (day !== 0 && day !== 6) {
      // Market hours in IST: 09:15 to 15:30 (375 minutes per day)
      const istStartMinutes = 9 * 60 + 15;
      const istEndMinutes = 15 * 60 + 30;
      const stepMin = Math.max(1, Math.floor(stepSeconds / 60));

      const dailyTimestamps: number[] = [];
      for (let min = istStartMinutes; min <= istEndMinutes; min += stepMin) {
        const d = new Date(curDate);
        d.setUTCHours(0, 0, 0, 0);
        // IST is UTC+5:30 (330 minutes)
        const utcMinutes = min - 330;
        const ts = Math.floor(d.getTime() / 1000) + utcMinutes * 60;
        if (ts <= Math.floor(now.getTime() / 1000)) {
          dailyTimestamps.push(ts);
        }
      }
      timestamps.unshift(...dailyTimestamps);
    }
    // Step to previous day
    curDate.setDate(curDate.getDate() - 1);
  }

  // Slice to required bar count
  const validTimestamps = timestamps.slice(-barCount);

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

  const volatility = timeframe === '1m' || timeframe === '3m' 
    ? 0.0010 
    : timeframe === '5m' || timeframe === '15m' 
      ? 0.0020 
      : timeframe === '1H' || timeframe === '4H' 
        ? 0.0040 
        : 0.0080;

  const rawBars: Array<{ open: number; high: number; low: number; close: number; volume: number }> = [];
  let nextClose = basePrice;
  let curSeed = Math.abs(seed);

  for (let i = validTimestamps.length - 1; i >= 0; i--) {
    const r1 = pseudoRand(curSeed++);
    const r2 = pseudoRand(curSeed++);
    const r3 = pseudoRand(curSeed++);
    const r4 = pseudoRand(curSeed++);

    const direction = r1 > 0.49 ? 1 : -1;
    const change = +(nextClose * volatility * (0.25 + r2 * 0.75) * direction).toFixed(2);
    
    const close = nextClose;
    const open = +(close - change).toFixed(2);
    const highExtent = +(close * volatility * r3 * 0.5).toFixed(2);
    const lowExtent = +(close * volatility * r4 * 0.5).toFixed(2);

    const high = +(Math.max(open, close) + highExtent).toFixed(2);
    const low = +(Math.max(0.5, Math.min(open, close) - lowExtent)).toFixed(2);

    const baseVol = basePrice > 5000 ? 3000 : basePrice > 1000 ? 15000 : 75000;
    const volume = Math.floor(baseVol * (0.5 + r2 * 1.0));

    rawBars.unshift({ open, high, low, close, volume });
    nextClose = open;
  }

  const candles: CandlestickData<UTCTimestamp>[] = [];
  const volumes: HistogramData<UTCTimestamp>[] = [];

  for (let i = 0; i < validTimestamps.length; i++) {
    const barTime = validTimestamps[i] as UTCTimestamp;
    const bar = rawBars[i];
    candles.push({
      time: barTime,
      open: bar.open,
      high: bar.high,
      low: bar.low,
      close: bar.close,
    });

    volumes.push({
      time: barTime,
      value: bar.volume,
      color: bar.close >= bar.open ? 'rgba(16, 185, 129, 0.45)' : 'rgba(239, 68, 68, 0.45)',
    });
  }

  return {
    candles,
    volumes,
    ema20: calculateEMA(candles, 20),
    ema50: calculateEMA(candles, 50),
    vwap: calculateVWAP(candles, volumes),
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
