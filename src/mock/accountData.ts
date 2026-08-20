import { Order, Position, Holding, PortfolioSummary, BrokerConnection } from '../types';

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-20260820-10421',
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd.',
    exchange: 'NSE',
    side: 'BUY',
    orderType: 'MARKET',
    product: 'CNC',
    quantity: 10,
    price: 1482.30,
    avgPrice: 1482.30,
    status: 'FILLED',
    timestamp: '10:42:15 AM'
  },
  {
    id: 'ORD-20260820-10118',
    symbol: 'NIFTY26AUG25400CE',
    name: 'NIFTY 25400 CALL',
    exchange: 'NSE',
    side: 'BUY',
    orderType: 'LIMIT',
    product: 'MIS',
    quantity: 75,
    price: 130.00,
    avgPrice: 130.00,
    status: 'FILLED',
    timestamp: '10:11:04 AM'
  },
  {
    id: 'ORD-20260820-09350',
    symbol: 'HDFCBANK',
    name: 'HDFC Bank Ltd.',
    exchange: 'NSE',
    side: 'BUY',
    orderType: 'LIMIT',
    product: 'CNC',
    quantity: 25,
    price: 1950.00,
    status: 'PENDING',
    timestamp: '09:35:12 AM'
  },
  {
    id: 'ORD-20260819-15201',
    symbol: 'TCS',
    name: 'Tata Consultancy Services Ltd.',
    exchange: 'NSE',
    side: 'SELL',
    orderType: 'MARKET',
    product: 'CNC',
    quantity: 5,
    price: 3915.00,
    avgPrice: 3915.00,
    status: 'FILLED',
    timestamp: '19 Aug, 03:20 PM'
  },
  {
    id: 'ORD-20260819-14110',
    symbol: 'TATAMOTORS',
    name: 'Tata Motors Ltd.',
    exchange: 'NSE',
    side: 'BUY',
    orderType: 'LIMIT',
    product: 'MIS',
    quantity: 100,
    price: 950.00,
    status: 'CANCELLED',
    timestamp: '19 Aug, 02:11 PM'
  }
];

export const INITIAL_POSITIONS: Position[] = [
  {
    id: 'pos-1',
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd.',
    exchange: 'NSE',
    product: 'CNC',
    quantity: 10,
    avgPrice: 1450.00,
    ltp: 1482.30,
    pnl: 323.00,
    dayPnl: 145.00,
    pnlPercent: 2.23
  },
  {
    id: 'pos-2',
    symbol: 'NIFTY FUT',
    name: 'NIFTY 28AUG FUT',
    exchange: 'NSE',
    product: 'NRML',
    quantity: 75,
    avgPrice: 25320.00,
    ltp: 25420.35,
    pnl: 7526.25,
    dayPnl: 2250.00,
    pnlPercent: 0.40
  },
  {
    id: 'pos-3',
    symbol: 'NIFTY26AUG25400CE',
    name: 'NIFTY 25400 CALL',
    exchange: 'NSE',
    product: 'MIS',
    quantity: 75,
    avgPrice: 130.00,
    ltp: 132.80,
    pnl: 210.00,
    dayPnl: 210.00,
    pnlPercent: 2.15
  }
];

export const INITIAL_HOLDINGS: Holding[] = [
  {
    id: 'hld-1',
    symbol: 'INFY',
    name: 'Infosys Ltd.',
    exchange: 'NSE',
    quantity: 100,
    avgPrice: 1540.00,
    currentPrice: 1742.20,
    investedValue: 154000.00,
    currentValue: 174220.00,
    totalReturn: 20220.00,
    totalReturnPercent: 13.13,
    todayReturn: 2130.00,
    todayReturnPercent: 1.24
  },
  {
    id: 'hld-2',
    symbol: 'HDFCBANK',
    name: 'HDFC Bank Ltd.',
    exchange: 'NSE',
    quantity: 150,
    avgPrice: 1780.00,
    currentPrice: 1965.10,
    investedValue: 267000.00,
    currentValue: 294765.00,
    totalReturn: 27765.00,
    totalReturnPercent: 10.40,
    todayReturn: 5272.50,
    todayReturnPercent: 1.82
  },
  {
    id: 'hld-3',
    symbol: 'TCS',
    name: 'Tata Consultancy Services Ltd.',
    exchange: 'NSE',
    quantity: 35,
    avgPrice: 3620.00,
    currentPrice: 3924.50,
    investedValue: 126700.00,
    currentValue: 137357.50,
    totalReturn: 10657.50,
    totalReturnPercent: 8.41,
    todayReturn: 1239.00,
    todayReturnPercent: 0.91
  },
  {
    id: 'hld-4',
    symbol: 'ITC',
    name: 'ITC Ltd.',
    exchange: 'NSE',
    quantity: 450,
    avgPrice: 445.00,
    currentPrice: 504.15,
    investedValue: 200250.00,
    currentValue: 226867.50,
    totalReturn: 26617.50,
    totalReturnPercent: 13.29,
    todayReturn: 2182.50,
    todayReturnPercent: 0.97
  }
];

export const INITIAL_PORTFOLIO: PortfolioSummary = {
  portfolioValue: 842650.00,
  todayPnl: 12450.00,
  todayPnlPercent: 1.50,
  overallPnl: 64320.00,
  overallPnlPercent: 8.26,
  availableFunds: 215000.00,
  usedMargin: 65000.00,
  availableMargin: 150000.00,
  collateral: 150000.00,
  payIn: 50000.00,
  payOut: 0.00
};

export const INITIAL_BROKERS: BrokerConnection[] = [
  {
    id: 'broker-zerodha',
    name: 'Zerodha Kite',
    logoText: 'ZK',
    connected: true,
    accountNumber: 'ZR8942',
    lastSync: '10:42:18 AM',
    status: 'Connected'
  },
  {
    id: 'broker-groww',
    name: 'Groww Invest',
    logoText: 'GW',
    connected: false,
    status: 'Not Connected'
  },
  {
    id: 'broker-angel',
    name: 'Angel One',
    logoText: 'AO',
    connected: true,
    accountNumber: 'A19402',
    lastSync: '10:30:00 AM',
    status: 'Connected'
  },
  {
    id: 'broker-upstox',
    name: 'Upstox Pro',
    logoText: 'UP',
    connected: false,
    status: 'Not Connected'
  }
];
