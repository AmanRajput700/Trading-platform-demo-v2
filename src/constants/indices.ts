/**
 * Standard Exchange Benchmark and Sectoral Indices Registry.
 * Baseline objects updated dynamically with real quotes and snapshots from Upstox.
 */

export interface StandardIndex {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  prevClose: number;
}

export const BASELINE_INDICES: StandardIndex[] = [
  { symbol: 'NIFTY 50', name: 'NIFTY 50 Benchmark', price: 0, change: 0, changePercent: 0, high: 0, low: 0, open: 0, prevClose: 0 },
  { symbol: 'SENSEX', name: 'BSE SENSEX 30', price: 0, change: 0, changePercent: 0, high: 0, low: 0, open: 0, prevClose: 0 },
  { symbol: 'BANK NIFTY', name: 'Nifty Bank Index', price: 0, change: 0, changePercent: 0, high: 0, low: 0, open: 0, prevClose: 0 },
  { symbol: 'NIFTY IT', name: 'Nifty IT Sector', price: 0, change: 0, changePercent: 0, high: 0, low: 0, open: 0, prevClose: 0 },
  { symbol: 'FINNIFTY', name: 'Nifty Financial Services', price: 0, change: 0, changePercent: 0, high: 0, low: 0, open: 0, prevClose: 0 },
];
