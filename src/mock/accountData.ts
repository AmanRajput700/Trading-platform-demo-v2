import { 
  Order, 
  Position, 
  Holding, 
  PortfolioSummary, 
  BrokerConnection,
  TradeRecord,
  AppNotification
} from '../types';

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
    accountNumber: '****1234',
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
    accountNumber: '****8942',
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

export const INITIAL_TRADES: TradeRecord[] = [
  {
    id: 'TRD-9041',
    date: '2026-08-21',
    time: '10:42 AM',
    strategyName: 'Momentum Breakout',
    symbol: 'RELIANCE',
    side: 'BUY',
    entryPrice: 1450.00,
    exitPrice: 1482.30,
    quantity: 10,
    pnl: 323.00,
    pnlPercent: 2.23,
    status: 'CLOSED',
    orderId: 'ORD-20260820-10421'
  },
  {
    id: 'TRD-9040',
    date: '2026-08-21',
    time: '10:11 AM',
    strategyName: 'RSI Reversal',
    symbol: 'NIFTY26AUG25400CE',
    side: 'BUY',
    entryPrice: 120.00,
    exitPrice: 132.80,
    quantity: 75,
    pnl: 960.00,
    pnlPercent: 10.67,
    status: 'CLOSED',
    orderId: 'ORD-20260820-10118'
  },
  {
    id: 'TRD-9039',
    date: '2026-08-20',
    time: '03:15 PM',
    strategyName: 'Moving Average Cross',
    symbol: 'TCS',
    side: 'SELL',
    entryPrice: 3940.00,
    exitPrice: 3915.00,
    quantity: 5,
    pnl: 125.00,
    pnlPercent: 0.63,
    status: 'CLOSED',
    orderId: 'ORD-20260819-15201'
  },
  {
    id: 'TRD-9038',
    date: '2026-08-20',
    time: '01:45 PM',
    strategyName: 'Order Book Depth Scalper',
    symbol: 'HDFCBANK',
    side: 'BUY',
    entryPrice: 1945.00,
    exitPrice: 1965.10,
    quantity: 20,
    pnl: 402.00,
    pnlPercent: 1.03,
    status: 'CLOSED',
    orderId: 'ORD-20260820-09350'
  },
  {
    id: 'TRD-9037',
    date: '2026-08-19',
    time: '11:20 AM',
    strategyName: 'Momentum Breakout',
    symbol: 'INFY',
    side: 'BUY',
    entryPrice: 1720.00,
    exitPrice: 1742.20,
    quantity: 15,
    pnl: 333.00,
    pnlPercent: 1.29,
    status: 'CLOSED',
    orderId: 'ORD-20260819-14110'
  },
  {
    id: 'TRD-9036',
    date: '2026-08-19',
    time: '09:45 AM',
    strategyName: 'RSI Reversal',
    symbol: 'TATAMOTORS',
    side: 'BUY',
    entryPrice: 965.00,
    exitPrice: 955.00,
    quantity: 50,
    pnl: -500.00,
    pnlPercent: -1.04,
    status: 'CLOSED',
    orderId: 'ORD-20260819-09450'
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    type: 'strategy',
    title: 'Strategy Signal Triggered',
    message: 'Momentum Breakout triggered a BUY signal on RELIANCE (RSI: 34.2, Volume: 1.8x)',
    timestamp: '10:42 AM',
    read: false,
    actionRoute: 'instrument'
  },
  {
    id: 'notif-2',
    type: 'order',
    title: 'Order Executed',
    message: 'Filled BUY 10 RELIANCE @ ₹1,482.30 via Zerodha Kite adapter.',
    timestamp: '10:42 AM',
    read: false,
    actionRoute: 'orders'
  },
  {
    id: 'notif-3',
    type: 'broker',
    title: 'Broker Token Validated',
    message: 'Zerodha Kite session token active and synced with Direct DMA routing.',
    timestamp: '09:15 AM',
    read: true,
    actionRoute: 'brokers'
  },
  {
    id: 'notif-4',
    type: 'risk',
    title: 'Daily Risk Limit Normal',
    message: 'Current portfolio drawdown is 0.4%, well below the 3.0% daily max loss threshold.',
    timestamp: '09:00 AM',
    read: true,
    actionRoute: 'funds'
  },
  {
    id: 'notif-5',
    type: 'system',
    title: 'NSE Market Session Open',
    message: 'Normal market trading hours active (09:15 to 15:30 IST).',
    timestamp: '09:15 AM',
    read: true,
    actionRoute: 'market'
  }
];

