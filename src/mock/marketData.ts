import { Instrument, OptionContract } from '../types';

export const INITIAL_INSTRUMENTS: Instrument[] = [
  {
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd.',
    exchange: 'NSE',
    type: 'STOCK',
    sector: 'Oil & Gas / Conglomerate',
    price: 1482.30,
    change: 34.80,
    changePercent: 2.41,
    open: 1452.00,
    high: 1489.50,
    low: 1448.10,
    prevClose: 1447.50,
    volume: 12450800,
    avgVolume: 6917000,
    marketCap: '₹19,85,420 Cr',
    pe: 27.8,
    eps: 53.30,
    divYield: 0.67,
    bookValue: 680.40,
    roe: 9.4,
    debtToEquity: 0.38,
    lotSize: 250,
    rsi: 34.2,
    ema20: 1461.20,
    ema50: 1435.50,
    ema200: 1390.10,
    sma20: 1458.00,
    sma50: 1430.20,
    vwap: 1475.40,
    macd: { macd: 8.4, signal: 5.1, histogram: 3.3 },
    bollingerBands: { upper: 1510.00, middle: 1460.00, lower: 1410.00 },
    atr: 24.60,
    matchedStrategy: {
      strategyName: 'Momentum Breakout',
      matchedTime: '10:31 AM',
      signal: 'BUY',
      reasons: [
        'RSI below 35 (34.2) showing oversold bounce setup',
        'Price (₹1,482.30) crossed above 20 EMA (₹1,461.20)',
        'Volume 1.8× 20-day average volume (1.24 Cr vs 69.1 L)'
      ],
      matchScore: '3/3'
    }
  },
  {
    symbol: 'HDFCBANK',
    name: 'HDFC Bank Ltd.',
    exchange: 'NSE',
    type: 'STOCK',
    sector: 'Banking & Financials',
    price: 1965.10,
    change: 35.15,
    changePercent: 1.82,
    open: 1935.00,
    high: 1972.40,
    low: 1930.00,
    prevClose: 1929.95,
    volume: 18450200,
    avgVolume: 8780000,
    marketCap: '₹14,92,300 Cr',
    pe: 19.4,
    eps: 101.20,
    divYield: 1.02,
    bookValue: 540.80,
    roe: 16.8,
    debtToEquity: 0.95,
    lotSize: 550,
    rsi: 31.8,
    ema20: 1942.00,
    ema50: 1915.60,
    ema200: 1850.00,
    sma20: 1938.50,
    sma50: 1910.00,
    vwap: 1958.20,
    macd: { macd: 12.1, signal: 8.4, histogram: 3.7 },
    bollingerBands: { upper: 1990.00, middle: 1940.00, lower: 1890.00 },
    atr: 28.50,
    matchedStrategy: {
      strategyName: 'Momentum Breakout',
      matchedTime: '10:35 AM',
      signal: 'BUY',
      reasons: [
        'RSI oversold reversal at 31.8',
        'Price broke above 20 EMA with bullish candle',
        'Volume surge 2.1× 20-day average'
      ],
      matchScore: '3/3'
    }
  },
  {
    symbol: 'INFY',
    name: 'Infosys Ltd.',
    exchange: 'NSE',
    type: 'STOCK',
    sector: 'Information Technology',
    price: 1742.20,
    change: 21.30,
    changePercent: 1.24,
    open: 1724.00,
    high: 1750.00,
    low: 1720.00,
    prevClose: 1720.90,
    volume: 9340000,
    avgVolume: 6220000,
    marketCap: '₹7,22,800 Cr',
    pe: 26.5,
    eps: 65.70,
    divYield: 2.18,
    bookValue: 215.30,
    roe: 31.2,
    debtToEquity: 0.08,
    lotSize: 400,
    rsi: 38.4,
    ema20: 1728.40,
    ema50: 1705.00,
    ema200: 1620.00,
    sma20: 1725.00,
    sma50: 1700.00,
    vwap: 1738.10,
    macd: { macd: 6.2, signal: 4.8, histogram: 1.4 },
    bollingerBands: { upper: 1765.00, middle: 1725.00, lower: 1685.00 },
    atr: 22.10,
    matchedStrategy: {
      strategyName: 'Momentum Breakout',
      matchedTime: '10:38 AM',
      signal: 'BUY',
      reasons: [
        'RSI stabilizing at 38.4 after pullback',
        'Trading comfortably above 20 EMA and VWAP',
        'Volume 1.5× average'
      ],
      matchScore: '3/3'
    }
  },
  {
    symbol: 'TCS',
    name: 'Tata Consultancy Services Ltd.',
    exchange: 'NSE',
    type: 'STOCK',
    sector: 'Information Technology',
    price: 3924.50,
    change: 35.40,
    changePercent: 0.91,
    open: 3895.00,
    high: 3938.00,
    low: 3888.00,
    prevClose: 3889.10,
    volume: 2450000,
    avgVolume: 2227000,
    marketCap: '₹14,20,100 Cr',
    pe: 31.2,
    eps: 125.80,
    divYield: 1.45,
    bookValue: 275.60,
    roe: 48.5,
    debtToEquity: 0.05,
    lotSize: 175,
    rsi: 41.2,
    ema20: 3910.00,
    ema50: 3880.00,
    ema200: 3750.00,
    sma20: 3905.00,
    sma50: 3875.00,
    vwap: 3918.00,
    macd: { macd: 9.4, signal: 8.9, histogram: 0.5 },
    bollingerBands: { upper: 3960.00, middle: 3910.00, lower: 3860.00 },
    atr: 42.00,
    matchedStrategy: {
      strategyName: 'Momentum Breakout',
      matchedTime: '10:40 AM',
      signal: 'WATCH',
      reasons: [
        'Price above 20 EMA (₹3,910.00)',
        'Volume slightly above average (1.1×)',
        'RSI at 41.2 (target range < 35)'
      ],
      matchScore: '2/3'
    }
  },
  {
    symbol: 'ICICIBANK',
    name: 'ICICI Bank Ltd.',
    exchange: 'NSE',
    type: 'STOCK',
    sector: 'Banking & Financials',
    price: 1248.80,
    change: 18.20,
    changePercent: 1.48,
    open: 1232.00,
    high: 1254.00,
    low: 1229.50,
    prevClose: 1230.60,
    volume: 14200000,
    avgVolume: 11500000,
    marketCap: '₹8,78,200 Cr',
    pe: 18.2,
    eps: 68.60,
    divYield: 0.88,
    bookValue: 345.20,
    roe: 18.6,
    debtToEquity: 0.82,
    lotSize: 700,
    rsi: 33.6,
    ema20: 1238.00,
    ema50: 1215.00,
    ema200: 1140.00,
    sma20: 1235.00,
    sma50: 1210.00,
    vwap: 1244.50,
    macd: { macd: 7.8, signal: 5.2, histogram: 2.6 },
    bollingerBands: { upper: 1265.00, middle: 1235.00, lower: 1205.00 },
    atr: 18.40,
    matchedStrategy: {
      strategyName: 'Momentum Breakout',
      matchedTime: '10:28 AM',
      signal: 'BUY',
      reasons: [
        'RSI oversold rebound (33.6)',
        'Price broke above EMA 20 (₹1,238.00)',
        'Volume 1.23× average volume'
      ],
      matchScore: '3/3'
    }
  },
  {
    symbol: 'SBIN',
    name: 'State Bank of India',
    exchange: 'NSE',
    type: 'STOCK',
    sector: 'Banking & Financials',
    price: 812.45,
    change: -4.30,
    changePercent: -0.53,
    open: 818.00,
    high: 821.50,
    low: 809.20,
    prevClose: 816.75,
    volume: 11200000,
    avgVolume: 14000000,
    marketCap: '₹7,25,080 Cr',
    pe: 10.4,
    eps: 78.10,
    divYield: 1.68,
    bookValue: 460.00,
    roe: 17.2,
    debtToEquity: 1.10,
    lotSize: 750,
    rsi: 54.2,
    ema20: 815.00,
    ema50: 808.00,
    ema200: 760.00,
    sma20: 814.00,
    sma50: 806.00,
    vwap: 814.20,
    macd: { macd: -1.2, signal: 0.4, histogram: -1.6 },
    bollingerBands: { upper: 830.00, middle: 814.00, lower: 798.00 },
    atr: 12.30
  },
  {
    symbol: 'TATAMOTORS',
    name: 'Tata Motors Ltd.',
    exchange: 'NSE',
    type: 'STOCK',
    sector: 'Automobile',
    price: 984.60,
    change: 22.40,
    changePercent: 2.33,
    open: 965.00,
    high: 991.00,
    low: 962.10,
    prevClose: 962.20,
    volume: 16800000,
    avgVolume: 10200000,
    marketCap: '₹3,62,400 Cr',
    pe: 11.2,
    eps: 87.90,
    divYield: 0.61,
    bookValue: 280.00,
    roe: 28.4,
    debtToEquity: 0.65,
    lotSize: 500,
    rsi: 34.8,
    ema20: 970.00,
    ema50: 948.00,
    ema200: 890.00,
    sma20: 968.00,
    sma50: 945.00,
    vwap: 980.20,
    macd: { macd: 8.9, signal: 5.5, histogram: 3.4 },
    bollingerBands: { upper: 1005.00, middle: 970.00, lower: 935.00 },
    atr: 19.80,
    matchedStrategy: {
      strategyName: 'Momentum Breakout',
      matchedTime: '10:41 AM',
      signal: 'BUY',
      reasons: [
        'RSI at 34.8 exiting oversold band',
        'Close above EMA 20 by 1.5%',
        'Volume 1.65× 20-day average'
      ],
      matchScore: '3/3'
    }
  },
  {
    symbol: 'LT',
    name: 'Larsen & Toubro Ltd.',
    exchange: 'NSE',
    type: 'STOCK',
    sector: 'Infrastructure & Capital Goods',
    price: 3640.80,
    change: -14.20,
    changePercent: -0.39,
    open: 3660.00,
    high: 3675.00,
    low: 3625.00,
    prevClose: 3655.00,
    volume: 1850000,
    avgVolume: 2100000,
    marketCap: '₹5,00,600 Cr',
    pe: 34.1,
    eps: 106.70,
    divYield: 0.93,
    bookValue: 690.00,
    roe: 15.6,
    debtToEquity: 0.72,
    lotSize: 150,
    rsi: 48.6,
    ema20: 3650.00,
    ema50: 3610.00,
    ema200: 3420.00,
    sma20: 3645.00,
    sma50: 3605.00,
    vwap: 3648.00,
    macd: { macd: 1.5, signal: 2.1, histogram: -0.6 },
    bollingerBands: { upper: 3720.00, middle: 3650.00, lower: 3580.00 },
    atr: 48.00
  },
  {
    symbol: 'ITC',
    name: 'ITC Ltd.',
    exchange: 'NSE',
    type: 'STOCK',
    sector: 'FMCG',
    price: 504.15,
    change: 4.85,
    changePercent: 0.97,
    open: 500.00,
    high: 506.40,
    low: 498.80,
    prevClose: 499.30,
    volume: 13900000,
    avgVolume: 12500000,
    marketCap: '₹6,28,400 Cr',
    pe: 29.8,
    eps: 16.90,
    divYield: 2.82,
    bookValue: 62.40,
    roe: 28.9,
    debtToEquity: 0.01,
    lotSize: 1600,
    rsi: 58.2,
    ema20: 498.50,
    ema50: 492.00,
    ema200: 465.00,
    sma20: 497.00,
    sma50: 490.00,
    vwap: 502.80,
    macd: { macd: 3.2, signal: 2.4, histogram: 0.8 },
    bollingerBands: { upper: 512.00, middle: 498.00, lower: 484.00 },
    atr: 6.80
  },
  {
    symbol: 'BHARTIARTL',
    name: 'Bharti Airtel Ltd.',
    exchange: 'NSE',
    type: 'STOCK',
    sector: 'Telecommunication',
    price: 1685.40,
    change: 14.60,
    changePercent: 0.87,
    open: 1672.00,
    high: 1692.00,
    low: 1668.00,
    prevClose: 1670.80,
    volume: 6400000,
    avgVolume: 5800000,
    marketCap: '₹9,80,400 Cr',
    pe: 58.4,
    eps: 28.80,
    divYield: 0.52,
    bookValue: 180.00,
    roe: 14.8,
    debtToEquity: 1.42,
    lotSize: 475,
    rsi: 61.4,
    ema20: 1660.00,
    ema50: 1625.00,
    ema200: 1480.00,
    sma20: 1655.00,
    sma50: 1620.00,
    vwap: 1681.20,
    macd: { macd: 14.5, signal: 11.2, histogram: 3.3 },
    bollingerBands: { upper: 1710.00, middle: 1660.00, lower: 1610.00 },
    atr: 24.50
  },
  {
    symbol: 'AXISBANK',
    name: 'Axis Bank Ltd.',
    exchange: 'NSE',
    type: 'STOCK',
    sector: 'Banking & Financials',
    price: 1184.20,
    change: 16.80,
    changePercent: 1.44,
    open: 1170.00,
    high: 1190.00,
    low: 1165.00,
    prevClose: 1167.40,
    volume: 8700000,
    avgVolume: 7200000,
    marketCap: '₹3,66,000 Cr',
    pe: 13.8,
    eps: 85.80,
    divYield: 0.08,
    bookValue: 510.00,
    roe: 17.5,
    debtToEquity: 0.90,
    lotSize: 625,
    rsi: 33.1,
    ema20: 1175.00,
    ema50: 1155.00,
    ema200: 1110.00,
    sma20: 1172.00,
    sma50: 1150.00,
    vwap: 1180.50,
    macd: { macd: 6.4, signal: 4.1, histogram: 2.3 },
    bollingerBands: { upper: 1205.00, middle: 1175.00, lower: 1145.00 },
    atr: 18.20,
    matchedStrategy: {
      strategyName: 'Momentum Breakout',
      matchedTime: '10:33 AM',
      signal: 'BUY',
      reasons: [
        'RSI low at 33.1',
        'Price crossed EMA 20 (₹1,175.00)',
        'Volume 1.21× average'
      ],
      matchScore: '3/3'
    }
  },
  {
    symbol: 'MARUTI',
    name: 'Maruti Suzuki India Ltd.',
    exchange: 'NSE',
    type: 'STOCK',
    sector: 'Automobile',
    price: 12240.00,
    change: -110.00,
    changePercent: -0.89,
    open: 12360.00,
    high: 12400.00,
    low: 12180.00,
    prevClose: 12350.00,
    volume: 480000,
    avgVolume: 550000,
    marketCap: '₹3,85,000 Cr',
    pe: 28.4,
    eps: 430.50,
    divYield: 1.02,
    bookValue: 2600.00,
    roe: 16.8,
    debtToEquity: 0.02,
    lotSize: 50,
    rsi: 44.5,
    ema20: 12310.00,
    ema50: 12180.00,
    ema200: 11600.00,
    sma20: 12300.00,
    sma50: 12150.00,
    vwap: 12280.00,
    macd: { macd: -15.0, signal: 5.0, histogram: -20.0 },
    bollingerBands: { upper: 12600.00, middle: 12300.00, lower: 12000.00 },
    atr: 160.00
  }
];

export const MAJOR_INDICES = [
  { symbol: 'NIFTY 50', name: 'NIFTY 50', price: 25420.35, change: 181.50, changePercent: 0.72, status: 'OPEN' },
  { symbol: 'SENSEX', name: 'BSE SENSEX', price: 83540.20, change: 530.40, changePercent: 0.64, status: 'OPEN' },
  { symbol: 'BANK NIFTY', name: 'NIFTY BANK', price: 57320.40, change: 635.80, changePercent: 1.12, status: 'OPEN' },
  { symbol: 'NIFTY IT', name: 'NIFTY IT', price: 41230.15, change: -74.20, changePercent: -0.18, status: 'OPEN' },
  { symbol: 'FINNIFTY', name: 'NIFTY FINANCIAL SERVICES', price: 24110.80, change: 108.30, changePercent: 0.45, status: 'OPEN' },
];

export const SECTOR_PERFORMANCE = [
  { sector: 'Nifty Bank', changePercent: 1.12, advDec: '10/2' },
  { sector: 'Nifty Auto', changePercent: 1.05, advDec: '11/4' },
  { sector: 'Nifty Energy', changePercent: 0.88, advDec: '8/2' },
  { sector: 'Nifty FMCG', changePercent: 0.42, advDec: '9/6' },
  { sector: 'Nifty Pharma', changePercent: 0.15, advDec: '12/8' },
  { sector: 'Nifty IT', changePercent: -0.18, advDec: '4/6' },
  { sector: 'Nifty Metal', changePercent: -0.45, advDec: '5/10' },
  { sector: 'Nifty Realty', changePercent: -0.62, advDec: '3/7' }
];

export const NIFTY_OPTION_CHAIN: OptionContract[] = [
  {
    strike: 25200,
    expiry: '28 AUG 2026',
    call: { symbol: 'NIFTY26AUG25200CE', ltp: 284.50, change: 65.20, changePercent: 29.7, bid: 284.10, ask: 284.90, iv: 13.4, volume: 1845000, oi: 2450000, oiChange: 320000 },
    put: { symbol: 'NIFTY26AUG25200PE', ltp: 42.10, change: -38.40, changePercent: -47.7, bid: 41.80, ask: 42.30, iv: 14.8, volume: 3210000, oi: 5120000, oiChange: 840000 }
  },
  {
    strike: 25300,
    expiry: '28 AUG 2026',
    call: { symbol: 'NIFTY26AUG25300CE', ltp: 202.40, change: 58.10, changePercent: 40.2, bid: 202.00, ask: 202.80, iv: 13.1, volume: 2940000, oi: 3890000, oiChange: 480000 },
    put: { symbol: 'NIFTY26AUG25300PE', ltp: 60.80, change: -42.20, changePercent: -40.9, bid: 60.50, ask: 61.10, iv: 14.2, volume: 4180000, oi: 6420000, oiChange: 1120000 }
  },
  {
    strike: 25400,
    expiry: '28 AUG 2026',
    call: { symbol: 'NIFTY26AUG25400CE', ltp: 132.80, change: 48.50, changePercent: 57.5, bid: 132.50, ask: 133.10, iv: 12.8, volume: 5640000, oi: 5820000, oiChange: 940000 },
    put: { symbol: 'NIFTY26AUG25400PE', ltp: 89.40, change: -48.10, changePercent: -34.9, bid: 89.10, ask: 89.70, iv: 13.8, volume: 6120000, oi: 4950000, oiChange: 650000 }
  },
  {
    strike: 25500,
    expiry: '28 AUG 2026',
    call: { symbol: 'NIFTY26AUG25500CE', ltp: 78.50, change: 32.40, changePercent: 70.2, bid: 78.20, ask: 78.80, iv: 12.6, volume: 8420000, oi: 8940000, oiChange: 1650000 },
    put: { symbol: 'NIFTY26AUG25500PE', ltp: 134.20, change: -56.80, changePercent: -29.7, bid: 133.80, ask: 134.50, iv: 13.5, volume: 3840000, oi: 3410000, oiChange: -210000 }
  },
  {
    strike: 25600,
    expiry: '28 AUG 2026',
    call: { symbol: 'NIFTY26AUG25600CE', ltp: 41.20, change: 18.90, changePercent: 84.7, bid: 41.00, ask: 41.50, iv: 12.9, volume: 6210000, oi: 7120000, oiChange: 1240000 },
    put: { symbol: 'NIFTY26AUG25600PE', ltp: 195.60, change: -68.40, changePercent: -25.9, bid: 195.10, ask: 196.10, iv: 13.9, volume: 1820000, oi: 2150000, oiChange: -180000 }
  },
  {
    strike: 25700,
    expiry: '28 AUG 2026',
    call: { symbol: 'NIFTY26AUG25700CE', ltp: 19.80, change: 9.40, changePercent: 90.3, bid: 19.60, ask: 20.00, iv: 13.5, volume: 3950000, oi: 4850000, oiChange: 760000 },
    put: { symbol: 'NIFTY26AUG25700PE', ltp: 272.30, change: -78.10, changePercent: -22.2, bid: 271.80, ask: 272.80, iv: 14.5, volume: 920000, oi: 1420000, oiChange: -95000 }
  }
];

export interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  ema20?: number;
  sma50?: number;
  vwap?: number;
}

// Generate realistic candlestick data for charts
export function generateCandles(basePrice: number, count: number = 60, _timeframe: string = '15m'): Candle[] {
  const candles: Candle[] = [];
  let currentPrice = basePrice * 0.96;
  const now = new Date();
  
  for (let i = count; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 15 * 60 * 1000);
    const timeStr = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
    
    // Deterministic random walk with slight upward bias towards current price
    const volatility = basePrice * 0.0035;
    const change = (Math.sin(i * 0.5) * 0.5 + (Math.random() - 0.48)) * volatility;
    const open = currentPrice;
    const close = +(open + change).toFixed(2);
    const high = +(Math.max(open, close) + Math.random() * volatility * 0.7).toFixed(2);
    const low = +(Math.min(open, close) - Math.random() * volatility * 0.7).toFixed(2);
    const volume = Math.floor(25000 + Math.random() * 85000 + (Math.abs(change) / volatility) * 45000);
    
    currentPrice = close;
    
    candles.push({
      time: timeStr,
      open,
      high,
      low,
      close,
      volume,
      ema20: +(close * 0.995 + Math.sin(i) * 2).toFixed(2),
      sma50: +(close * 0.990 + Math.cos(i) * 3).toFixed(2),
      vwap: +((high + low + close) / 3 * 0.998).toFixed(2),
    });
  }
  
  // Set last candle close to current actual price
  if (candles.length > 0) {
    candles[candles.length - 1].close = basePrice;
  }
  
  return candles;
}
