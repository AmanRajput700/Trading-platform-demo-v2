import { 
  Order, 
  Position, 
  Holding, 
  PortfolioSummary, 
  BrokerConnection,
  TradeRecord,
  AppNotification,
  UserAccount,
  TraderClient
} from '../types';

export const MOCK_USERS: UserAccount[] = [
  {
    id: 'user-superadmin',
    name: 'Dev SuperAdmin',
    email: 'superadmin@auratrade.dev',
    role: 'superadmin',
    avatarText: 'SA',
    roleLabel: 'Superadmin (Developer)',
    description: 'Full developer access: Create & edit algorithmic strategies, adjust indicator models, access all stats & telemetry'
  },
  {
    id: 'user-admin',
    name: 'Client Desk Admin',
    email: 'admin@clientdesk.com',
    role: 'admin',
    avatarText: 'CA',
    roleLabel: 'Admin (Client Desk)',
    description: 'Client admin privileges: Control all stats, monitor client users, view risk thresholds, execute strategies & brokers'
  },
  {
    id: 'user-retail',
    name: 'Aman Rajput',
    email: 'aman@trader.com',
    role: 'user',
    avatarText: 'AR',
    roleLabel: 'Standard Trader (User)',
    description: 'Retail trading account: Market Terminal, Orders, Positions, Holdings, Option Chain (Strategy creation restricted to Admin)'
  }
];

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
    brandColor: '#FF5722',
    tagline: 'Kite Connect 3.0 API (India’s leading retail discount broker)',
    connected: true,
    accountNumber: '****1234',
    clientId: 'ZR8942',
    lastSync: '10:42:18 AM',
    status: 'Connected',
    brokerType: 'ZERODHA',
    marginSynced: 215000.00,
    latencyMs: 12,
    executionRoute: 'Direct Market Access (DMA FIX)',
    features: ['Direct DMA Engine', 'Real-time WebSocket Ticks', 'Instant Margin Sync', 'Multi-Leg Options'],
    docUrl: 'https://kite.trade/docs/connect/v3/',
    credentials: {
      clientId: 'ZR8942',
      apiKey: 'kite_prod_99214ae87bc',
      apiSecret: '••••••••••••••••••••••••',
      totpSecret: '••••••••',
      environment: 'LIVE'
    }
  },
  {
    id: 'broker-angel',
    name: 'Angel One',
    logoText: 'AO',
    brandColor: '#0052FE',
    tagline: 'SmartAPI Gateway (Full suite algorithmic trading broker)',
    connected: false,
    clientId: 'A128941',
    status: 'Not Connected',
    brokerType: 'ANGEL',
    marginSynced: 0,
    latencyMs: 18,
    executionRoute: 'SmartAPI REST + Webhook',
    features: ['Free Algorithmic API', 'Historical Data Feed', 'Smart Order Routing', 'Rule Engine'],
    docUrl: 'https://smartapi.angelbroking.com/',
    credentials: {
      clientId: '',
      apiKey: '',
      apiSecret: '',
      totpSecret: '',
      environment: 'LIVE'
    }
  },
  {
    id: 'broker-groww',
    name: 'Groww Invest',
    logoText: 'GW',
    brandColor: '#00D09C',
    tagline: 'Groww Direct Trading Terminal & Stock API',
    connected: false,
    status: 'Not Connected',
    brokerType: 'GROWW',
    marginSynced: 0,
    latencyMs: 24,
    executionRoute: 'Groww Cloud API Gateway',
    features: ['Zero Account Maintenance', 'Fast Equity Delivery', 'Instant UPI Payin', 'F&O Terminal'],
    docUrl: 'https://groww.in/trade-api',
    credentials: {
      clientId: '',
      apiKey: '',
      apiSecret: '',
      totpSecret: '',
      environment: 'LIVE'
    }
  },
  {
    id: 'broker-motilal',
    name: 'Motilal Oswal',
    logoText: 'MO',
    brandColor: '#FFB800',
    tagline: 'MO Trader API & Wealth Matrix Gateway',
    connected: false,
    status: 'Not Connected',
    brokerType: 'MOTILAL',
    marginSynced: 0,
    latencyMs: 15,
    executionRoute: 'MO Enterprise Institutional Route',
    features: ['Institutional DMA', 'Research Recommendation Feed', 'High Leverage MTF', 'Demat Pledging'],
    docUrl: 'https://www.motilaloswal.com/open-demat-account/algo-trading',
    credentials: {
      clientId: '',
      apiKey: '',
      apiSecret: '',
      totpSecret: '',
      environment: 'LIVE'
    }
  },
  {
    id: 'broker-upstox',
    name: 'Upstox Pro',
    logoText: 'UP',
    brandColor: '#7A35C1',
    tagline: 'Upstox Pro Developer API v2',
    connected: false,
    status: 'Not Connected',
    brokerType: 'UPSTOX',
    marginSynced: 0,
    latencyMs: 16,
    executionRoute: 'Upstox HFT Colocation Route',
    features: ['Ultra-low Latency HFT', 'Option Greek Feeds', 'GTT Trigger Engine', 'OCO Bracket Orders'],
    docUrl: 'https://upstox.com/developer/api-documentation/',
    credentials: {
      clientId: '',
      apiKey: '',
      apiSecret: '',
      totpSecret: '',
      environment: 'LIVE'
    }
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
  }
];

export const MOCK_TRADER_CLIENTS: TraderClient[] = [
  {
    id: 'cli-101',
    name: 'Aman Rajput',
    email: 'aman@trader.com',
    clientId: 'AR88219',
    phone: '+91 98765 43210',
    broker: 'Zerodha Kite',
    balance: 248500.00,
    openPositionsCount: 3,
    totalPnl: 14250.00,
    status: 'ACTIVE',
    joinedDate: '12 Jan 2026',
    lastActive: 'Just now'
  },
  {
    id: 'cli-102',
    name: 'Vikramaditya Sharma',
    email: 'vikram.sharma@invest.in',
    clientId: 'VS49201',
    phone: '+91 98210 11223',
    broker: 'Angel One',
    balance: 512000.00,
    openPositionsCount: 6,
    totalPnl: 38400.00,
    status: 'ACTIVE',
    joinedDate: '03 Feb 2026',
    lastActive: '5 mins ago'
  },
  {
    id: 'cli-103',
    name: 'Pooja Hegde',
    email: 'pooja.h@quantdesk.com',
    clientId: 'PH99182',
    phone: '+91 97123 45678',
    broker: 'Motilal Oswal',
    balance: 850000.00,
    openPositionsCount: 4,
    totalPnl: -5200.00,
    status: 'ACTIVE',
    joinedDate: '18 Feb 2026',
    lastActive: '12 mins ago'
  },
  {
    id: 'cli-104',
    name: 'Rahul Singhania',
    email: 'rahul.s@apexalpha.io',
    clientId: 'RS11049',
    phone: '+91 99887 66554',
    broker: 'Groww',
    balance: 145000.00,
    openPositionsCount: 0,
    totalPnl: -12800.00,
    status: 'BLOCKED',
    joinedDate: '01 Mar 2026',
    lastActive: '2 days ago'
  },
  {
    id: 'cli-105',
    name: 'Ananya Deshmukh',
    email: 'ananya.d@fintech.in',
    clientId: 'AD77321',
    phone: '+91 98450 99881',
    broker: 'Upstox Pro',
    balance: 390000.00,
    openPositionsCount: 2,
    totalPnl: 22100.00,
    status: 'ACTIVE',
    joinedDate: '15 Mar 2026',
    lastActive: '18 mins ago'
  },
  {
    id: 'cli-106',
    name: 'Deepak Verma',
    email: 'deepak.v@algoedge.com',
    clientId: 'DV33209',
    phone: '+91 98112 33445',
    broker: 'Zerodha Kite',
    balance: 620000.00,
    openPositionsCount: 5,
    totalPnl: 49500.00,
    status: 'ACTIVE',
    joinedDate: '22 Mar 2026',
    lastActive: '30 mins ago'
  },
  {
    id: 'cli-107',
    name: 'Kavita Menon',
    email: 'kavita.m@wealthcorp.in',
    clientId: 'KM55928',
    phone: '+91 97334 55667',
    broker: 'Angel One',
    balance: 95000.00,
    openPositionsCount: 0,
    totalPnl: -18400.00,
    status: 'BLOCKED',
    joinedDate: '05 Apr 2026',
    lastActive: '5 days ago'
  },
  {
    id: 'cli-108',
    name: 'Siddharth Roy',
    email: 'sid.roy@matrixcap.com',
    clientId: 'SR66410',
    phone: '+91 98990 11223',
    broker: 'Motilal Oswal',
    balance: 780000.00,
    openPositionsCount: 3,
    totalPnl: 31200.00,
    status: 'ACTIVE',
    joinedDate: '20 Apr 2026',
    lastActive: '1 hour ago'
  }
];


