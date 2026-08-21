// Types for Indian Trading Platform Demo

export type MarketType = 'NSE' | 'BSE';
export type InstrumentType = 'STOCK' | 'INDEX' | 'FUTURES' | 'OPTIONS';
export type SignalType = 'BUY' | 'SELL' | 'WATCH';
export type OrderSide = 'BUY' | 'SELL';
export type OrderType = 'MARKET' | 'LIMIT';
export type ProductType = 'CNC' | 'MIS' | 'NRML';
export type OrderStatus = 'SUBMITTED' | 'PENDING' | 'FILLED' | 'CANCELLED' | 'REJECTED';
export type StrategyStatus = 'ACTIVE' | 'PAUSED' | 'DRAFT';

export interface Instrument {
  symbol: string;
  name: string;
  exchange: MarketType;
  type: InstrumentType;
  sector?: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  prevClose: number;
  volume: number;
  avgVolume: number;
  marketCap?: string;
  pe?: number;
  eps?: number;
  divYield?: number;
  bookValue?: number;
  roe?: number;
  debtToEquity?: number;
  lotSize?: number;
  // Technical Indicators
  rsi: number;
  ema20: number;
  ema50: number;
  ema200: number;
  sma20: number;
  sma50: number;
  vwap: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
  };
  atr: number;
  matchedStrategy?: {
    strategyName: string;
    matchedTime: string;
    signal: SignalType;
    reasons: string[];
    matchScore: string; // e.g. "3/3"
  };
  lastTickDirection?: 'UP' | 'DOWN' | 'NONE';
}

export interface OptionContract {
  strike: number;
  expiry: string;
  call: {
    symbol: string;
    ltp: number;
    change: number;
    changePercent: number;
    bid: number;
    ask: number;
    iv: number;
    volume: number;
    oi: number;
    oiChange: number;
  };
  put: {
    symbol: string;
    ltp: number;
    change: number;
    changePercent: number;
    bid: number;
    ask: number;
    iv: number;
    volume: number;
    oi: number;
    oiChange: number;
  };
}

export type IndicatorName = 
  | 'RSI' 
  | 'Close Price' 
  | 'Open Price' 
  | 'High Price' 
  | 'Low Price' 
  | 'SMA 20' 
  | 'SMA 50' 
  | 'EMA 20' 
  | 'EMA 50' 
  | 'VWAP' 
  | 'Volume' 
  | 'Average Volume' 
  | 'MACD' 
  | 'Bollinger Upper' 
  | 'Bollinger Lower' 
  | 'ATR' 
  | '% Change'
  | 'Order Book Imbalance'
  | 'Buy/Sell Ratio'
  | 'Bid/Ask Spread';

export type ComparisonOperator = 
  | '<' 
  | '<=' 
  | '>' 
  | '>=' 
  | '==' 
  | 'crosses above' 
  | 'crosses below';

export interface StrategyCondition {
  id: string;
  leftIndicator: IndicatorName;
  operator: ComparisonOperator;
  rightType: 'VALUE' | 'INDICATOR' | 'MULTIPLIER';
  rightValue: string | number;
  rightIndicator?: IndicatorName;
}

export interface ConditionGroup {
  id: string;
  logicalOperator: 'AND' | 'OR';
  conditions: StrategyCondition[];
}

export interface Strategy {
  id: string;
  name: string;
  market: MarketType;
  instrumentType: 'Stocks' | 'Futures' | 'Options' | 'All';
  timeframe: '1 min' | '5 min' | '15 min' | '1 hour' | '1 day';
  status: StrategyStatus;
  lastRun: string;
  matchCount: number;
  groups: ConditionGroup[];
  description?: string;
}

export interface StrategyMatchResult {
  instrument: Instrument;
  signal: SignalType;
  rsi: number;
  volumeRatio: number;
  matchScore: string;
  reasons: string[];
  matchedAt: string;
}

export interface Order {
  id: string;
  symbol: string;
  name: string;
  exchange: MarketType;
  side: OrderSide;
  orderType: OrderType;
  product: ProductType;
  quantity: number;
  price: number;
  avgPrice?: number;
  status: OrderStatus;
  timestamp: string;
  rejectionReason?: string;
}

export interface Position {
  id: string;
  symbol: string;
  name: string;
  exchange: MarketType;
  product: ProductType;
  quantity: number;
  avgPrice: number;
  ltp: number;
  pnl: number;
  dayPnl: number;
  pnlPercent: number;
}

export interface Holding {
  id: string;
  symbol: string;
  name: string;
  exchange: MarketType;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  investedValue: number;
  currentValue: number;
  totalReturn: number;
  totalReturnPercent: number;
  todayReturn: number;
  todayReturnPercent: number;
}

export interface PortfolioSummary {
  portfolioValue: number;
  todayPnl: number;
  todayPnlPercent: number;
  overallPnl: number;
  overallPnlPercent: number;
  availableFunds: number;
  usedMargin: number;
  availableMargin: number;
  collateral: number;
  payIn: number;
  payOut: number;
}

export interface BrokerConnection {
  id: string;
  name: string;
  logoText: string;
  connected: boolean;
  accountNumber?: string;
  lastSync?: string;
  status: 'Connected' | 'Not Connected' | 'Syncing' | 'Error';
}

// ==========================================
// Market Depth / Order Book Type Definitions
// ==========================================

export interface DepthLevel {
  price: number;
  quantity: number;
  orders: number;
  total?: number; // Cumulative quantity at this level
}

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'reconnecting' | 'stale';

export interface MarketDepthData {
  symbol: string;
  ltp: number;
  timestamp: string;
  depth: {
    buy: DepthLevel[];
    sell: DepthLevel[];
  };
  totalBuyQuantity: number;
  totalSellQuantity: number;
  totalBuyOrders: number;
  totalSellOrders: number;
  bestBid: number;
  bestAsk: number;
  spread: number;
  spreadPercent: number;
  buySellRatio: number;
  imbalancePercent: number; // e.g. +18.4% (positive = buy bias, negative = sell bias)
  sentiment: 'BUY_PRESSURE' | 'SELL_PRESSURE' | 'NEUTRAL';
  high?: number;
  low?: number;
  volume?: number;
  circuitLimits?: {
    upperCircuit: number;
    lowerCircuit: number;
  };
}

export interface MarketDepthSignal {
  symbol: string;
  type: 'IMBALANCE' | 'WALL' | 'SPREAD_SURGE' | 'LIQUIDITY';
  signal: SignalType;
  strength: number; // 0 to 100
  title: string;
  description: string;
  timestamp: string;
}

// ==========================================
// V1 System, Backtest & Execution Types
// ==========================================

export type TradingMode = 'PAPER' | 'LIVE';

export type BrokerState = 'Connected' | 'Not Connected' | 'Session Expired';

export interface BacktestConfig {
  symbol: string;
  strategyId?: string;
  strategyName: string;
  timeframe: string;
  dateRange: '1M' | '3M' | '6M' | '1Y' | '3Y' | '5Y' | 'ALL';
  initialCapital: number;
  stopLossPercent?: number;
  targetPercent?: number;
}

export interface EquityCurvePoint {
  date: string;
  equity: number;
  drawdown: number;
  benchmark: number;
}

export interface BacktestTrade {
  id: string;
  symbol: string;
  side: OrderSide;
  entryDate: string;
  entryPrice: number;
  exitDate: string;
  exitPrice: number;
  quantity: number;
  pnl: number;
  pnlPercent: number;
  duration: string;
  reason: string;
  status: 'WIN' | 'LOSS';
}

export interface BacktestResult {
  symbol: string;
  strategyName: string;
  periodTested: string;
  initialCapital: number;
  finalCapital: number;
  totalReturn: number;
  totalReturnPercent: number;
  benchmarkReturnPercent: number;
  maxDrawdown: number;
  maxDrawdownPercent: number;
  winRate: number;
  sharpeRatio: number;
  profitFactor: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  avgTradePnl: number;
  avgWinPnl: number;
  avgLossPnl: number;
  maxConsecutiveWins: number;
  maxConsecutiveLosses: number;
  equityCurve: EquityCurvePoint[];
  trades: BacktestTrade[];
  expectancy: string;
}

export interface TradeRecord {
  id: string;
  date: string;
  time: string;
  strategyName: string;
  symbol: string;
  side: OrderSide;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  pnlPercent: number;
  status: 'CLOSED' | 'OPEN';
  orderId: string;
}

export interface OrderTimelineStep {
  title: string;
  timestamp: string;
  status: 'completed' | 'current' | 'failed' | 'pending';
  detail?: string;
}

export interface AppNotification {
  id: string;
  type: 'strategy' | 'order' | 'rejection' | 'broker' | 'risk' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionRoute?: string;
}


