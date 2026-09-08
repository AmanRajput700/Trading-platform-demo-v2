// Types for Indian Trading Platform Demo

export type MarketType = 'NSE' | 'BSE';
export type InstrumentType = 'STOCK' | 'INDEX' | 'FUTURES' | 'OPTIONS';
export type SignalType = 'BUY' | 'SELL' | 'WATCH';
export type OrderSide = 'BUY' | 'SELL';
export type OrderType = 'MARKET' | 'LIMIT';
export type ProductType = 'CNC' | 'MIS' | 'NRML';
export type OrderStatus = 'SUBMITTED' | 'PENDING' | 'FILLED' | 'CANCELLED' | 'REJECTED';
export type StrategyStatus = 'ACTIVE' | 'PAUSED' | 'DRAFT';

// Role-based Access Control
export type UserRole = 'superadmin' | 'admin' | 'user';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarText: string;
  roleLabel: string;
  description: string;
}

export interface TraderClient {
  id: string;
  name: string;
  email: string;
  clientId: string;
  phone: string;
  broker: string;
  balance: number;
  openPositionsCount: number;
  totalPnl: number;
  status: 'ACTIVE' | 'BLOCKED';
  joinedDate: string;
  lastActive: string;
}

export interface Instrument {
  symbol: string;
  name: string;
  exchange: MarketType;
  type: InstrumentType;
  sector?: string;
  indices?: string[];
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

export type SupportedBrokerId = 'broker-zerodha' | 'broker-angel' | 'broker-groww' | 'broker-motilal' | 'broker-upstox';

export interface BrokerCredentials {
  clientId: string;
  apiKey: string;
  apiSecret: string;
  totpSecret?: string;
  password?: string;
  redirectUrl?: string;
  environment?: 'LIVE' | 'SANDBOX';
}

export interface BrokerConnection {
  id: string;
  name: string;
  logoText: string;
  brandColor?: string;
  tagline?: string;
  connected: boolean;
  accountNumber?: string;
  clientId?: string;
  lastSync?: string;
  status: 'Connected' | 'Not Connected' | 'Syncing' | 'Session Expired' | 'Error';
  brokerType: 'ZERODHA' | 'ANGEL' | 'GROWW' | 'MOTILAL' | 'UPSTOX';
  credentials?: BrokerCredentials;
  marginSynced?: number;
  latencyMs?: number;
  executionRoute?: string;
  features?: string[];
  docUrl?: string;
  disabled?: boolean;
  disabledReason?: string;
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

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'reconnecting' | 'stale' | 'market_closed';


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

export type BrokerState = 'Connected' | 'Not Connected' | 'Syncing' | 'Session Expired';

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

// ==========================================
// AuraTrade Backend API V1 Interface Definitions
// ==========================================

export interface ApiSuccessResponse<T> {
  data: T;
  pagination?: PaginationInfo;
}

export interface ApiErrorDetail {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorDetail;
}

export interface PaginationInfo {
  total: number;
  page: number;
  per_page: number;
}

// 1. Auth Register
export interface RegisterRequestPayload {
  email: string;
  name: string;
  password: string;
}

export interface RegisterResponseData {
  user_id: string;
  email: string;
  name: string;
  role: UserRole;
}

// 2. Auth Login
export interface LoginRequestPayload {
  email: string;
  password: string;
}

export interface UserProfileData {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  role_label: string;
  avatar_text: string;
  status: 'ACTIVE' | 'BLOCKED';
  last_login_at?: string;
}

export interface LoginResponseData {
  access_token: string;
  refresh_token: string;
  token_type: 'bearer';
  expires_in: number;
  user: UserProfileData;
}

// 3. Auth Refresh
export interface RefreshTokenRequestPayload {
  refresh_token: string;
}

export interface RefreshTokenResponseData {
  access_token: string;
  refresh_token: string;
  token_type: 'bearer';
  expires_in: number;
}

// 4. Logout
export interface LogoutRequestPayload {
  refresh_token: string;
}

// 5. User Settings
export interface UserSettingsData {
  trading_mode: TradingMode;
  theme: 'dark' | 'light';
}

export interface UpdateUserSettingsRequest {
  trading_mode?: TradingMode;
  theme?: 'dark' | 'light';
}

// 6. Client List
export interface ClientListItem {
  id: string;
  name: string;
  email: string;
  client_id: string;
  phone: string | null;
  broker: string;
  balance: number;
  open_positions_count: number;
  total_pnl: number;
  status: 'ACTIVE' | 'BLOCKED';
  joined_date: string;
  last_active: string;
}

export interface ClientListResponseData {
  data: ClientListItem[];
  pagination: PaginationInfo;
}

// 7. Update Client Status
export interface UpdateClientStatusRequest {
  status: 'ACTIVE' | 'BLOCKED';
}

export interface UpdateClientStatusResponseData {
  id: string;
  name: string;
  status: 'ACTIVE' | 'BLOCKED';
}

// ==========================================
// NSE Instruments & Indices API Definitions
// ==========================================

export type MarketIndexCategory = 'BROAD_MARKET' | 'SECTORAL' | 'THEMATIC' | 'STRATEGY' | 'OTHER';

export interface BackendInstrument {
  id: string;
  symbol: string;
  name: string;
  exchange: string;
  series: string;
  isin: string | null;
  scrip_code?: string | null;
  sector?: string | null;
  industry?: string | null;
  market_cap_cr?: number | null;
  current_price?: number | null;
  change?: number | null;
  change_percent?: number | null;
  open_price?: number | null;
  high_price?: number | null;
  low_price?: number | null;
  close_price?: number | null;
  volume?: number | null;
  pe_ratio?: number | null;
  week_52_high?: number | null;
  week_52_low?: number | null;
  listing_date: string | null;
  face_value: number | null;
  paid_up_value: number | null;
  market_lot: number;
  is_active: boolean;
  indices: string[];
  available_exchanges?: string[];
  cross_exchange_details?: Record<string, any>;
}

export interface PaginatedInstruments {
  items: BackendInstrument[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface MarketIndexSummary {
  id: string;
  symbol: string;
  name: string;
  exchange: string;
  category: MarketIndexCategory;
  constituents_count: number;
  is_active: boolean;
}

export interface MarketIndexDetail {
  id: string;
  symbol: string;
  name: string;
  exchange: string;
  category: string;
  is_active: boolean;
  constituents: BackendInstrument[];
}

export interface SyncInstrumentsResponse {
  status: 'success' | 'error';
  message: string;
  total_stocks_synced: number;
  total_indices_synced: number;
  duration_seconds: number;
}

export type MarketSessionStatus = 'OPEN' | 'CLOSED' | 'PRE_OPEN' | 'POST_CLOSE';

export interface MarketSegmentsStatus {
  equity: string;
  fno: string;
  currency: string;
  commodity: string;
}

export interface MarketHoursConfig {
  pre_open: string;
  open: string;
  close: string;
  timezone: string;
}

export interface MarketStatus {
  is_open: boolean;
  status: MarketSessionStatus;
  status_message: string;
  current_time_ist?: string;
  segments?: MarketSegmentsStatus;
  market_hours?: MarketHoursConfig;
  is_holiday: boolean;
  holiday_name?: string | null;
  next_market_open: string;
}

