import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  Instrument,
  MarketType,
  InstrumentType,
  Strategy,
  Order,
  Position,
  Holding,
  PortfolioSummary,
  BrokerConnection,
  OrderSide,
  OrderType,
  ProductType,
  TradingMode,
  BrokerState,
  TradeRecord,
  AppNotification,
  UserAccount,
  UserRole,
  TraderClient,
  UpdateUserSettingsRequest
} from '../types';
import { BASELINE_INDICES } from '../constants/indices';
import { DEFAULT_STRATEGY_TEMPLATES } from '../constants/strategies';
import { PAPER_SANDBOX_PORTFOLIO, PAPER_SANDBOX_BROKERS } from '../constants/paperSandboxDefaults';
import { instrumentService } from '../services/instrumentService';
import { authService } from '../services/authService';
import { settingsService } from '../services/settingsService';
import { clientService, ClientListQueryParams } from '../services/clientService';
import { extractApiErrorMessage, getStoredAccessToken, clearStoredTokens, apiClient } from '../services/apiClient';
import { marketFeedService, LiveMarketTick } from '../services/marketFeedService';
import { marketSessionService, MarketSessionInfo } from '../services/marketSessionService';
import { orderService } from '../services/orderService';


export const ZERO_PORTFOLIO: PortfolioSummary = {
  portfolioValue: 0,
  todayPnl: 0,
  todayPnlPercent: 0,
  overallPnl: 0,
  overallPnlPercent: 0,
  availableFunds: 0,
  usedMargin: 0,
  availableMargin: 0,
  collateral: 0,
  payIn: 0,
  payOut: 0
};

export type PageId =
  | 'dashboard'
  | 'strategies'
  | 'strategy-builder'
  | 'strategy-results'
  | 'circuit-strategy'
  | 'backtester'
  | 'market'
  | 'chart'
  | 'instrument'
  | 'options'
  | 'orders'
  | 'trade-history'
  | 'positions'
  | 'holdings'
  | 'funds'
  | 'brokers'
  | 'users'
  | 'notifications'
  | 'alerts'
  | 'settings';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
}

export interface QuickOrderState {
  isOpen: boolean;
  symbol: string;
  name: string;
  side: OrderSide;
  price: number;
  lotSize?: number;
  initialQty?: number;
}

interface TradingContextType {
  currentPage: PageId;
  setCurrentPage: (page: PageId) => void;
  selectedSymbol: string;
  setSelectedSymbol: (symbol: string) => void;
  navigateToInstrument: (symbol: string) => void;
  navigateToChart: (symbol: string) => void;

  // Theme (Dark / Light)
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Trading Mode (V1 mandate)
  tradingMode: TradingMode;
  setTradingMode: (mode: TradingMode) => void;
  isLiveConfirmOpen: boolean;
  setIsLiveConfirmOpen: (open: boolean) => void;

  // Broker Connection State
  brokerState: BrokerState;
  setBrokerState: (state: BrokerState) => void;
  syncBrokerData: () => Promise<void>;

  // Market Data
  instruments: Instrument[];
  indices: typeof BASELINE_INDICES;
  getInstrument: (symbol: string) => Instrument | undefined;

  // Strategies
  strategies: Strategy[];
  currentStrategyId: string | null;
  setCurrentStrategyId: (id: string | null) => void;
  activeStrategyForResults: Strategy | null;
  setActiveStrategyForResults: (strategy: Strategy | null) => void;
  saveStrategy: (strategy: Strategy) => void;
  runStrategy: (strategy: Strategy) => Promise<void>;
  isScanning: boolean;
  scanProgress: number;

  // Orders, Positions, Holdings, Trades
  orders: Order[];
  positions: Position[];
  holdings: Holding[];
  trades: TradeRecord[];
  portfolio: PortfolioSummary;
  brokers: BrokerConnection[];
  selectedOrderForDetails: Order | null;
  setSelectedOrderForDetails: (order: Order | null) => void;

  // Order & Position Operations
  placeOrder: (params: {
    symbol: string;
    side: OrderSide;
    orderType: OrderType;
    product: ProductType;
    quantity: number;
    price: number;
    strategyName?: string;
    skipConfirmation?: boolean;
  }) => Promise<{ success: boolean; orderId?: string; message: string }> | { success: boolean; orderId?: string; message: string };
  cancelOrder: (orderId: string) => void;
  updateOrder: (orderId: string, updates: { price?: number; quantity?: number }) => void;
  exitPosition: (positionId: string) => void;
  convertPositionProduct: (positionId: string, newProduct: ProductType) => void;
  pledgeHolding: (holdingId: string, qtyToPledge: number) => void;

  // Trade Confirmation & Safeguards (Semi-Automated User Approval)
  isTradeConfirmModalOpen: boolean;
  pendingTradeToConfirm: {
    symbol: string;
    side: OrderSide;
    orderType: OrderType;
    product: ProductType;
    quantity: number;
    price: number;
    strategyName?: string;
  } | null;
  requestTradeApproval: (params: {
    symbol: string;
    side: OrderSide;
    orderType: OrderType;
    product: ProductType;
    quantity: number;
    price: number;
    strategyName?: string;
  }) => void;
  confirmApprovedTrade: () => void;
  cancelPendingTrade: () => void;
  requireUserApproval: boolean;
  setRequireUserApproval: (val: boolean) => void;

  // Funds Operations
  addFunds: (amount: number) => void;
  withdrawFunds: (amount: number) => void;
  toggleBrokerConnection: (brokerId: string) => void;
  connectBrokerWithCredentials: (brokerId: string, credentials: any) => Promise<boolean>;
  disconnectBroker: (brokerId: string) => void;

  // Broker Connect Modal
  isBrokerModalOpen: boolean;
  selectedBrokerForConnect: BrokerConnection | null;
  openBrokerModal: (broker?: BrokerConnection | null) => void;
  closeBrokerModal: () => void;

  // Quick Order Modal
  quickOrder: QuickOrderState;
  openQuickOrder: (params: Omit<QuickOrderState, 'isOpen'>) => void;
  closeQuickOrder: () => void;

  // Global Search Modal
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;

  // Notifications / Toasts
  notifications: AppNotification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id' | 'timestamp'>) => void;
  removeToast: (id: string) => void;

  // Authentication & 3-Tier Role Management (Backend API V1)
  currentUser: UserAccount;
  userRole: UserRole;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  canCreateStrategy: boolean;
  canAccessAdminStats: boolean;
  canManageUsers: boolean;
  clientUsers: TraderClient[];
  isLoadingClients: boolean;
  fetchClients: (params?: ClientListQueryParams) => Promise<void>;
  toggleBlockUser: (clientId: string) => Promise<void>;
  isAuthModalOpen: boolean;
  authModalTab: 'LOGIN' | 'REGISTER' | 'SWITCH';
  setAuthModalTab: (tab: 'LOGIN' | 'REGISTER' | 'SWITCH') => void;
  openAuthModal: (tab?: 'LOGIN' | 'REGISTER' | 'SWITCH') => void;
  closeAuthModal: () => void;
  switchRole: (role: UserRole) => void;
  loginWithCredentials: (email: string, name?: string, role?: UserRole) => void;
  loginApi: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  registerApi: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string; user_id?: string }>;
  logout: () => Promise<void>;
  updateUserSettings: (settings: UpdateUserSettingsRequest) => Promise<void>;

  isBackendConnected: boolean;


  // Authoritative Market Session
  marketSession: MarketSessionInfo | null;
  isMarketOpen: boolean;
  marketStatusLabel: string;
}

const TradingContext = createContext<TradingContextType | undefined>(undefined);


export const VALID_PAGES: PageId[] = [
  'dashboard',
  'alerts',
  'backtester',
  'market',
  'chart',
  'instrument',
  'options',
  'orders',
  'trade-history',
  'positions',
  'holdings',
  'funds',
  'brokers',
  'users',
  'notifications',
  'settings'
];

const getInitialPage = (): PageId => {
  if (typeof window !== 'undefined') {
    const hash = window.location.hash.replace(/^#\/?/, '').split('?')[0] as PageId;
    if (hash === 'strategies' || hash === 'strategy-builder' || hash === 'strategy-results' || hash === 'circuit-strategy') {
      window.history.replaceState(null, '', '#alerts');
      return 'alerts';
    }
    if (VALID_PAGES.includes(hash)) {
      return hash;
    }
    const saved = localStorage.getItem('auratrade-current-page') as PageId;
    if (saved && saved !== 'strategies' && saved !== 'strategy-builder' && saved !== 'strategy-results' && saved !== 'circuit-strategy' && VALID_PAGES.includes(saved)) {
      return saved;
    }
  }
  return 'dashboard';
};


const getInitialSymbol = (): string => {
  if (typeof window !== 'undefined') {
    if (window.location.hash.includes('?')) {
      const hashParams = new URLSearchParams(window.location.hash.split('?')[1]);
      const sym = hashParams.get('symbol');
      if (sym) return sym.toUpperCase();
    }
    const urlParams = new URLSearchParams(window.location.search);
    const symParam = urlParams.get('symbol');
    if (symParam) return symParam.toUpperCase();

    const saved = localStorage.getItem('auratrade-selected-symbol');
    if (saved) return saved.toUpperCase();
  }
  return 'RELIANCE';
};

const getInitialStrategyId = (): string | null => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('auratrade-strategy-id');
    if (saved) return saved;
  }
  return 'strat-1';
};

export const TradingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPageState] = useState<PageId>(getInitialPage);
  const [selectedSymbol, setSelectedSymbolState] = useState<string>(getInitialSymbol);
  const [currentStrategyId, setCurrentStrategyIdState] = useState<string | null>(getInitialStrategyId);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [indices, setIndices] = useState(BASELINE_INDICES);
  const [strategies, setStrategies] = useState<Strategy[]>(DEFAULT_STRATEGY_TEMPLATES);
  const [activeStrategyForResults, setActiveStrategyForResults] = useState<Strategy | null>(DEFAULT_STRATEGY_TEMPLATES[0]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [marketSession, setMarketSession] = useState<MarketSessionInfo | null>(null);
  const isMarketOpen = marketSession?.is_open ?? false;
  const marketStatusLabel = marketSession?.status_label || (isMarketOpen ? 'LIVE MARKET OPEN' : 'MARKET CLOSED');

  const getInstrument = useCallback((symbol: string): Instrument | undefined => {
    if (!symbol) return undefined;
    const normalized = symbol.toUpperCase();
    const found = instruments.find(i => i.symbol.toUpperCase() === normalized);
    if (found) return found;

    // Check Major Market Indices
    const foundIdx = indices.find(idx => idx.symbol.toUpperCase() === normalized);
    if (foundIdx) {
      const indexInst: Instrument = {
        symbol: foundIdx.symbol,
        name: foundIdx.name,
        exchange: (foundIdx.symbol === 'SENSEX' ? 'BSE' : 'NSE') as MarketType,
        type: 'INDEX',
        price: foundIdx.price,
        change: foundIdx.change,
        changePercent: foundIdx.changePercent,
        open: +(foundIdx.price - foundIdx.change * 0.5).toFixed(2),
        high: +(foundIdx.price * 1.008).toFixed(2),
        low: +(foundIdx.price * 0.992).toFixed(2),
        prevClose: +(foundIdx.price - foundIdx.change).toFixed(2),
        volume: 0,
        avgVolume: 0,
        rsi: 50,
        ema20: +(foundIdx.price * 0.99).toFixed(2),
        ema50: +(foundIdx.price * 0.97).toFixed(2),
        ema200: +(foundIdx.price * 0.92).toFixed(2),
        sma20: +(foundIdx.price * 0.99).toFixed(2),
        sma50: +(foundIdx.price * 0.97).toFixed(2),
        vwap: foundIdx.price,
        macd: { macd: 0, signal: 0, histogram: 0 },
        bollingerBands: {
          upper: +(foundIdx.price * 1.02).toFixed(2),
          middle: foundIdx.price,
          lower: +(foundIdx.price * 0.98).toFixed(2)
        },
        atr: 0
      };
      return indexInst;
    }

    return undefined;
  }, [instruments, indices]);

  // Load live stock universe from backend API on mount (Zero Mock)
  useEffect(() => {
    let mounted = true;
    instrumentService.getStocks({ page_size: 100 })
      .then(res => {
        if (!mounted || !res || !res.items) return;
        const loaded: Instrument[] = res.items.map(item => {
          const currentPrice = Number(item.current_price ?? item.close_price ?? 0);
          const changeVal = Number(item.change ?? 0);
          const changePct = Number(item.change_percent ?? 0);
          return {
            symbol: item.symbol,
            name: item.name || item.symbol,
            exchange: (item.exchange as MarketType) || 'NSE',
            type: 'STOCK' as InstrumentType,
            indices: item.indices || [],
            price: currentPrice,
            change: changeVal,
            changePercent: changePct,
            open: Number(item.open_price ?? currentPrice),
            high: Number(item.high_price ?? currentPrice),
            low: Number(item.low_price ?? currentPrice),
            prevClose: Number(item.close_price ?? currentPrice),
            volume: Number(item.volume ?? 0),
            avgVolume: 0,
            lotSize: item.market_lot || 1,
            rsi: 50,
            ema20: 0,
            ema50: 0,
            ema200: 0,
            sma20: 0,
            sma50: 0,
            vwap: 0,
            macd: { macd: 0, signal: 0, histogram: 0 },
            bollingerBands: { upper: +(currentPrice * 1.02).toFixed(2), middle: currentPrice, lower: +(currentPrice * 0.98).toFixed(2) },
            atr: 0
          };
        });
        setInstruments(loaded);
      })
      .catch(err => {
        console.warn('Live instrument initialization notice:', err?.message);
      });
    return () => { mounted = false; };
  }, []);



  const setCurrentPage = useCallback((page: PageId) => {
    setCurrentPageState(page);
    if (typeof window !== 'undefined') {
      localStorage.setItem('auratrade-current-page', page);
      const targetHash = page === 'instrument' ? `#instrument?symbol=${selectedSymbol}` : `#${page}`;
      if (window.location.hash !== targetHash) {
        window.history.replaceState(null, '', targetHash);
      }
    }
  }, [selectedSymbol]);

  const setSelectedSymbol = useCallback((symbol: string) => {
    const upper = symbol.toUpperCase();
    setSelectedSymbolState(upper);
    if (typeof window !== 'undefined') {
      localStorage.setItem('auratrade-selected-symbol', upper);
    }
  }, []);

  const setCurrentStrategyId = useCallback((id: string | null) => {
    setCurrentStrategyIdState(id);
    if (typeof window !== 'undefined') {
      if (id) localStorage.setItem('auratrade-strategy-id', id);
      else localStorage.removeItem('auratrade-strategy-id');
    }
  }, []);

  // Synchronize browser history / URL hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '').split('?')[0] as PageId;
      if (hash === 'strategies' || hash === 'strategy-builder' || hash === 'strategy-results') {
        window.history.replaceState(null, '', '#dashboard');
        setCurrentPageState('dashboard');
        localStorage.setItem('auratrade-current-page', 'dashboard');
        return;
      }
      if (VALID_PAGES.includes(hash)) {
        setCurrentPageState(hash);
        localStorage.setItem('auratrade-current-page', hash);
        if (hash === 'instrument' && window.location.hash.includes('?')) {
          const hashParams = new URLSearchParams(window.location.hash.split('?')[1]);
          const sym = hashParams.get('symbol');
          if (sym) {
            setSelectedSymbolState(sym.toUpperCase());
            localStorage.setItem('auratrade-selected-symbol', sym.toUpperCase());
          }
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Theme (Dark / Light)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('auratrade-theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('auratrade-theme', theme);
  }, [theme]);

  // Trading Mode (LIVE by default with clean zero-state until broker is connected)
  const [tradingMode, setTradingModeState] = useState<TradingMode>('LIVE');
  const [isLiveConfirmOpen, setIsLiveConfirmOpen] = useState<boolean>(false);

  // Toasts / Notifications system
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const recentToastsRef = useRef<Map<string, number>>(new Map());

  const addToast = useCallback((toast: Omit<ToastMessage, 'id' | 'timestamp'>) => {
    const key = `${toast.type}:${toast.title}:${toast.message}`;
    const now = Date.now();
    const lastTime = recentToastsRef.current.get(key) || 0;

    // Suppress duplicate toasts fired within 2.5 seconds
    if (now - lastTime < 2500) {
      return;
    }
    recentToastsRef.current.set(key, now);

    const id = `toast-${now}-${Math.random().toString(36).substr(2, 4)}`;
    const nowDate = new Date();
    const timeStr = nowDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const newToast: ToastMessage = { ...toast, id, timestamp: timeStr };

    setToasts(prev => [...prev.slice(-4), newToast]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const setTradingMode = useCallback((mode: TradingMode) => {
    setTradingModeState(mode);
    if (mode === 'PAPER') {
      // In Paper Sandbox, load clean simulation state
      setPortfolio(PAPER_SANDBOX_PORTFOLIO);
      setHoldings([]);
      setPositions([]);
      setOrders([]);
      setTrades([]);
      addToast({
        type: 'info',
        title: 'Paper Trading Sandbox Activated',
        message: 'Virtual simulation loaded for strategy testing.'
      });
    } else {
      // In Live mode, restore clean zero state until Upstox broker is connected
      setPortfolio(ZERO_PORTFOLIO);
      setHoldings([]);
      setPositions([]);
      setOrders([]);
      setTrades([]);
      addToast({
        type: 'info',
        title: 'Live Trading Mode Active',
        message: 'Zero-state active. Connect your Upstox broker to sync live Demat holdings & margin.'
      });
    }
  }, [addToast]);

  // User Authentication & 3-Tier Role Management
  const [currentUser, setCurrentUser] = useState<UserAccount>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('auratrade-user');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // parse error
        }
      }
    }
    return {
      id: 'default-trader',
      name: 'Trader',
      email: 'trader@auratrade.com',
      role: 'user',
      avatarText: 'TR',
      roleLabel: 'Standard Trader',
      description: 'Retail trading account'
    };
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'LOGIN' | 'REGISTER' | 'SWITCH'>('LOGIN');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return !!getStoredAccessToken() || !!localStorage.getItem('auratrade-user') || window.location.hash.length > 1;
  });
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(false);

  const openAuthModal = useCallback((tab: 'LOGIN' | 'REGISTER' | 'SWITCH' = 'LOGIN') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  }, []);
  const closeAuthModal = useCallback(() => setIsAuthModalOpen(false), []);

  // Client Users (for Admin & Superadmin management)
  const [clientUsers, setClientUsers] = useState<TraderClient[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState<boolean>(false);

  // Fetch client users from backend API (with fallback)
  const fetchClients = useCallback(async (params?: ClientListQueryParams) => {
    setIsLoadingClients(true);
    try {
      const res = await clientService.getClients(params);
      if (res && res.data) {
        // Map backend snake_case to frontend camelCase if needed
        const mappedClients: TraderClient[] = res.data.map(item => ({
          id: item.id,
          name: item.name,
          email: item.email,
          clientId: item.client_id || (item as any).clientId || `TR-${item.id.slice(0, 6).toUpperCase()}`,
          phone: item.phone || '',
          broker: item.broker || 'Zerodha Kite',
          balance: Number(item.balance) || 0,
          openPositionsCount: Number(item.open_positions_count ?? (item as any).openPositionsCount ?? 0),
          totalPnl: Number(item.total_pnl ?? (item as any).totalPnl ?? 0),
          status: item.status,
          joinedDate: item.joined_date || (item as any).joinedDate || new Date().toISOString().slice(0, 10),
          lastActive: item.last_active || (item as any).lastActive || 'Just now',
        }));
        setClientUsers(mappedClients);
        setIsBackendConnected(true);
      }
    } catch (err: any) {
      // Backend not running or offline; keep fallback mock clients
      console.warn('Clients API fetch fallback:', err?.message);
    } finally {
      setIsLoadingClients(false);
    }
  }, []);

  // Synchronize user settings (theme, trading mode) with backend API
  const updateUserSettings = useCallback(async (updates: UpdateUserSettingsRequest) => {
    if (updates.theme) {
      setTheme(updates.theme);
    }
    if (updates.trading_mode) {
      setTradingMode(updates.trading_mode);
    }

    try {
      await settingsService.updateSettings(updates);
      setIsBackendConnected(true);
    } catch (err) {
      // Offline fallback is harmless
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      updateUserSettings({ theme: next });
      return next;
    });
  }, [updateUserSettings]);

  // Initial token verification & profile sync
  useEffect(() => {
    const initAuthAndSettings = async () => {
      const token = getStoredAccessToken();
      if (token) {
        setIsAuthLoading(true);
        try {
          const profile = await authService.getMe();
          setIsBackendConnected(true);
          setIsAuthenticated(true);
          const mappedUser: UserAccount = {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            role: profile.role,
            avatarText: profile.avatar_text || profile.name.slice(0, 2).toUpperCase(),
            roleLabel: profile.role_label || (profile.role === 'superadmin' ? 'Superadmin (Developer)' : profile.role === 'admin' ? 'Admin (Client Desk)' : 'Standard Trader (User)'),
            description: profile.role === 'superadmin' ? 'Full developer access: Algorithm Builder & Engine' : profile.role === 'admin' ? 'Client admin: Stats control & User management' : 'Retail trading account',
          };
          setCurrentUser(mappedUser);
          localStorage.setItem('auratrade-user', JSON.stringify(mappedUser));

          // Fetch Settings
          try {
            const settings = await settingsService.getSettings();
            if (settings.theme) setTheme(settings.theme);
            if (settings.trading_mode) {
              setTradingModeState(settings.trading_mode);
              if (settings.trading_mode === 'PAPER') {
                setPortfolio(PAPER_SANDBOX_PORTFOLIO);
                setHoldings([]);
                setPositions([]);
                setOrders([]);
                setTrades([]);
              } else {
                setPortfolio(ZERO_PORTFOLIO);
                setHoldings([]);
                setPositions([]);
                setOrders([]);
                setTrades([]);
              }
            }
          } catch { }

          // Fetch Clients if role permits
          if (profile.role === 'superadmin' || profile.role === 'admin') {
            fetchClients();
          }
        } catch (err) {
          console.warn('Initial session check failed, using local profile state:', err);
        } finally {
          setIsAuthLoading(false);
        }
      }
    };

    initAuthAndSettings();

    // Listen for token expiration event
    const handleSessionExpired = () => {
      setIsAuthenticated(false);
      addToast({
        type: 'warning',
        title: 'Session Expired',
        message: 'Your session has expired. Please sign in again.'
      });
    };

    window.addEventListener('auratrade:session_expired', handleSessionExpired);
    return () => window.removeEventListener('auratrade:session_expired', handleSessionExpired);
  }, [fetchClients, addToast]);

  // Live Login API
  const loginApi = useCallback(async (email: string, password: string) => {
    setIsAuthLoading(true);
    try {
      const data = await authService.login({ email, password });
      setIsBackendConnected(true);
      setIsAuthenticated(true);

      const user = data.user;
      const mappedUser: UserAccount = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarText: user.avatar_text || user.name.slice(0, 2).toUpperCase(),
        roleLabel: user.role_label || (user.role === 'superadmin' ? 'Superadmin (Developer)' : user.role === 'admin' ? 'Admin (Client Desk)' : 'Standard Trader (User)'),
        description: user.role === 'superadmin'
          ? 'Full developer access: Algorithm Builder & Engine'
          : user.role === 'admin'
            ? 'Client admin: Stats control & User management'
            : 'Retail trading account',
      };

      setCurrentUser(mappedUser);
      localStorage.setItem('auratrade-user', JSON.stringify(mappedUser));
      setIsAuthModalOpen(false);

      if (user.role === 'user' && currentPage === 'strategy-builder') {
        setCurrentPage('strategies');
      }

      addToast({
        type: 'success',
        title: 'Authentication Successful',
        message: `Welcome back, ${user.name}! Logged in as ${mappedUser.roleLabel}.`
      });

      // Load settings and client list
      try {
        const settings = await settingsService.getSettings();
        if (settings.theme) setTheme(settings.theme);
        if (settings.trading_mode) {
          setTradingModeState(settings.trading_mode);
          if (settings.trading_mode === 'PAPER') {
            setPortfolio(PAPER_SANDBOX_PORTFOLIO);
            setHoldings([]);
            setPositions([]);
            setOrders([]);
            setTrades([]);
          } else {
            setPortfolio(ZERO_PORTFOLIO);
            setHoldings([]);
            setPositions([]);
            setOrders([]);
            setTrades([]);
          }
        }
      } catch { }

      if (user.role === 'superadmin' || user.role === 'admin') {
        fetchClients();
      }

      return { success: true };
    } catch (err: any) {
      const msg = extractApiErrorMessage(err);
      return { success: false, error: msg };
    } finally {
      setIsAuthLoading(false);
    }
  }, [currentPage, addToast, fetchClients]);

  // Live Register API
  const registerApi = useCallback(async (name: string, email: string, password: string) => {
    setIsAuthLoading(true);
    try {
      const data = await authService.register({ name, email, password });
      setIsBackendConnected(true);
      addToast({
        type: 'success',
        title: 'Account Registered',
        message: `Account created for ${data.name}. You may now log in.`
      });
      return { success: true, user_id: data.user_id };
    } catch (err: any) {
      const msg = extractApiErrorMessage(err);
      return { success: false, error: msg };
    } finally {
      setIsAuthLoading(false);
    }
  }, [addToast]);

  // Live Logout API
  const logout = useCallback(async () => {
    setIsAuthLoading(true);
    try {
      await authService.logout();
    } catch (err) {
      clearStoredTokens();
    } finally {
      setIsAuthenticated(false);
      setIsAuthLoading(false);
      const defaultUser: UserAccount = {
        id: 'default-trader',
        name: 'Trader',
        email: 'trader@auratrade.com',
        role: 'user',
        avatarText: 'TR',
        roleLabel: 'Standard Trader',
        description: 'Retail trading account'
      };
      setCurrentUser(defaultUser);
      localStorage.removeItem('auratrade-user');
      addToast({
        type: 'info',
        title: 'Logged Out',
        message: 'You have been successfully signed out.'
      });
    }
  }, [addToast]);

  // Demo Switch Role (1-Click Instant Testing)
  const switchRole = useCallback((role: UserRole) => {
    const roleProfiles: Record<UserRole, UserAccount> = {
      superadmin: {
        id: 'usr-dev-superadmin',
        name: 'Alex Mercer (Quant Lead)',
        email: 'alex.mercer@auratrade.io',
        role: 'superadmin',
        avatarText: 'AM',
        roleLabel: 'Superadmin (Developer)',
        description: 'Full developer access: Algorithm Builder & Engine'
      },
      admin: {
        id: 'usr-admin-desk',
        name: 'Sarah Connor (Desk Head)',
        email: 'sarah.connor@auratrade.io',
        role: 'admin',
        avatarText: 'SC',
        roleLabel: 'Admin (Client Desk)',
        description: 'Client admin: Stats control & User management'
      },
      user: {
        id: 'usr-retail-trader',
        name: 'Rahul Sharma',
        email: 'rahul.sharma@gmail.com',
        role: 'user',
        avatarText: 'RS',
        roleLabel: 'Standard Trader (User)',
        description: 'Retail trading account'
      }
    };
    const target = roleProfiles[role] || roleProfiles.user;
    setCurrentUser(target);
    localStorage.setItem('auratrade-user', JSON.stringify(target));
    setIsAuthenticated(true);
    setIsAuthModalOpen(false);

    if (role === 'user' && currentPage === 'strategy-builder') {
      setCurrentPage('strategies');
    }

    addToast({
      type: 'info',
      title: 'Active Profile Switched',
      message: `Logged in as ${target.name} (${target.roleLabel})`
    });
  }, [currentPage, addToast]);

  // Demo Mock Credentials Login
  const loginWithCredentials = useCallback((email: string, name?: string, role?: UserRole) => {
    const userRole: UserRole = role || 'user';
    const newUser: UserAccount = {
      id: `user-${Date.now()}`,
      name: name || email.split('@')[0],
      email,
      role: userRole,
      avatarText: (name || email.split('@')[0]).slice(0, 2).toUpperCase(),
      roleLabel: userRole === 'superadmin' ? 'Superadmin (Developer)' : userRole === 'admin' ? 'Admin (Client Desk)' : 'Standard Trader (User)',
      description: userRole === 'superadmin'
        ? 'Full developer access: Algorithm Builder & Engine'
        : userRole === 'admin'
          ? 'Client admin: Stats control & User management'
          : 'Retail trading account'
    };

    setCurrentUser(newUser);
    localStorage.setItem('auratrade-user', JSON.stringify(newUser));
    setIsAuthenticated(true);
    setIsAuthModalOpen(false);

    if (userRole === 'user' && currentPage === 'strategy-builder') {
      setCurrentPage('strategies');
    }

    addToast({
      type: 'success',
      title: 'Authentication Successful',
      message: `Welcome back, ${newUser.name}! Logged in with ${newUser.roleLabel} permissions.`
    });
  }, [currentPage, addToast]);

  const userRole = currentUser.role;
  const canCreateStrategy = currentUser.role === 'superadmin';
  const canAccessAdminStats = currentUser.role === 'superadmin' || currentUser.role === 'admin';
  const canManageUsers = currentUser.role === 'superadmin' || currentUser.role === 'admin';

  // Toggle Block / Unblock User with backend API call
  const toggleBlockUser = useCallback(async (clientId: string) => {
    const targetUser = clientUsers.find(u => u.id === clientId);
    if (!targetUser) return;
    const nextStatus = targetUser.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';

    // Optimistic UI update
    setClientUsers(prev => prev.map(user => {
      if (user.id === clientId) {
        return { ...user, status: nextStatus };
      }
      return user;
    }));

    try {
      await clientService.updateClientStatus(clientId, nextStatus);
      setIsBackendConnected(true);
      addToast({
        type: nextStatus === 'BLOCKED' ? 'warning' : 'success',
        title: nextStatus === 'BLOCKED' ? 'Trader Account Suspended' : 'Trader Account Activated',
        message: `${targetUser.name} (${targetUser.clientId}) status updated to ${nextStatus} via API.`
      });
    } catch (err: any) {
      // If API fails, notify user but allow demo state
      const errMsg = extractApiErrorMessage(err);
      addToast({
        type: nextStatus === 'BLOCKED' ? 'warning' : 'success',
        title: nextStatus === 'BLOCKED' ? 'Trader Account Suspended (Local)' : 'Trader Account Activated (Local)',
        message: `${targetUser.name} (${targetUser.clientId}) status set to ${nextStatus}. (${errMsg})`
      });
    }
  }, [clientUsers, addToast]);

  // Broker State (Strictly synchronized with backend live token validation)
  const [brokerState, setBrokerState] = useState<BrokerState>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('auratrade-broker-state');
      if (saved === 'Connected' || saved === 'Syncing') return saved as BrokerState;
    }
    return 'Not Connected';
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [trades, setTrades] = useState<TradeRecord[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioSummary>(ZERO_PORTFOLIO);
  const [brokers, setBrokers] = useState<BrokerConnection[]>(PAPER_SANDBOX_BROKERS);
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<Order | null>(null);

  // Notifications State
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [quickOrder, setQuickOrder] = useState<QuickOrderState>({
    isOpen: false,
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd',
    side: 'BUY',
    price: 2450.50
  });

  const [isBrokerModalOpen, setIsBrokerModalOpen] = useState<boolean>(false);
  const [selectedBrokerForConnect, setSelectedBrokerForConnect] = useState<BrokerConnection | null>(null);

  // Trade Confirmation & Safeguards (Semi-Automated User Approval)
  const [requireUserApproval, setRequireUserApproval] = useState<boolean>(true);
  const [isTradeConfirmModalOpen, setIsTradeConfirmModalOpen] = useState<boolean>(false);
  const [pendingTradeToConfirm, setPendingTradeToConfirm] = useState<{
    symbol: string;
    side: OrderSide;
    orderType: OrderType;
    product: ProductType;
    quantity: number;
    price: number;
    strategyName?: string;
  } | null>(null);

  const requestTradeApproval = useCallback((params: {
    symbol: string;
    side: OrderSide;
    orderType: OrderType;
    product: ProductType;
    quantity: number;
    price: number;
    strategyName?: string;
  }) => {
    setPendingTradeToConfirm(params);
    setIsTradeConfirmModalOpen(true);
  }, []);

  const cancelPendingTrade = useCallback(() => {
    setPendingTradeToConfirm(null);
    setIsTradeConfirmModalOpen(false);
  }, []);

  // Real-Time WebSocket Market Feed Tick Consumer (Upstox V3 & Gateway with 60 FPS Micro-Batching)
  useEffect(() => {
    const pendingTicks = new Map<string, LiveMarketTick>();
    let rafId: number | null = null;

    const flushTicks = () => {
      if (pendingTicks.size === 0) {
        rafId = null;
        return;
      }

      const ticksToProcess = new Map(pendingTicks);
      pendingTicks.clear();
      rafId = null;

      // 1. Batch update matching indices
      setIndices(prev => {
        let changed = false;
        const next = prev.map(idx => {
          const sym = idx.symbol.toUpperCase();
          const tick = ticksToProcess.get(sym) ||
                       (sym === 'NIFTY 50' ? ticksToProcess.get('NIFTY') : undefined) ||
                       (sym === 'NIFTY' ? ticksToProcess.get('NIFTY 50') : undefined) ||
                       (sym === 'BANK NIFTY' ? ticksToProcess.get('NIFTY BANK') : undefined) ||
                       (sym === 'NIFTY BANK' ? ticksToProcess.get('BANK NIFTY') : undefined) ||
                       (sym === 'SENSEX' ? ticksToProcess.get('BSE SENSEX') : undefined) ||
                       (sym === 'FINNIFTY' ? (ticksToProcess.get('NIFTY FIN SERVICE') || ticksToProcess.get('NIFTY FINANCIAL SERVICES')) : undefined);
          if (tick && tick.price > 0) {
            changed = true;
            return {
              ...idx,
              price: tick.price,
              change: tick.change,
              changePercent: tick.change_percent,
            };
          }
          return idx;
        });
        return changed ? next : prev;
      });

      // 2. Batch update matching instruments and ingest new active stock ticks
      setInstruments(prev => {
        let changed = false;
        const symbolsInPrev = new Set(prev.map(i => i.symbol.toUpperCase()));
        const next = prev.map(inst => {
          const sym = inst.symbol.toUpperCase();
          const tick = ticksToProcess.get(sym);
          if (tick) {
            changed = true;
            return {
              ...inst,
              price: tick.price,
              change: tick.change,
              changePercent: tick.change_percent,
              high: Math.max(inst.high, tick.high || tick.price),
              low: Math.min(inst.low, tick.low || tick.price),
              volume: tick.volume || inst.volume,
              lastTickDirection: (tick.change >= 0 ? 'UP' : 'DOWN') as 'UP' | 'DOWN',
            };
          }
          return inst;
        });

        // Ingest ticks for any newly subscribed stocks not yet in preloaded list
        ticksToProcess.forEach((tick, tickSym) => {
          if (!symbolsInPrev.has(tickSym) && !indices.some(idx => idx.symbol.toUpperCase() === tickSym)) {
            changed = true;
            symbolsInPrev.add(tickSym);
            next.unshift({
              symbol: tickSym,
              name: tickSym,
              exchange: 'NSE' as MarketType,
              type: 'STOCK' as InstrumentType,
              price: tick.price,
              change: tick.change,
              changePercent: tick.change_percent,
              open: tick.open || tick.price,
              high: tick.high || tick.price,
              low: tick.low || tick.price,
              prevClose: tick.close_price || (tick.price - tick.change),
              volume: tick.volume || 0,
              avgVolume: 0,
              lotSize: 1,
              rsi: 50,
              ema20: 0,
              ema50: 0,
              ema200: 0,
              sma20: 0,
              sma50: 0,
              vwap: 0,
              macd: { macd: 0, signal: 0, histogram: 0 },
              bollingerBands: { upper: +(tick.price * 1.02).toFixed(2), middle: tick.price, lower: +(tick.price * 0.98).toFixed(2) },
              atr: 0,
              lastTickDirection: (tick.change >= 0 ? 'UP' : 'DOWN') as 'UP' | 'DOWN',
            });
          }
        });

        return changed ? next : prev;
      });
    };

    const unsubscribeWs = marketFeedService.subscribeGlobal((tick: LiveMarketTick) => {
      const sym = tick.symbol?.toUpperCase();
      if (!sym) return;

      pendingTicks.set(sym, tick);
      if (!rafId) {
        rafId = requestAnimationFrame(flushTicks);
      }
    });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      unsubscribeWs();
    };
  }, [indices]);


  // Dynamically request live subscription and register the active stock in instruments if not present
  useEffect(() => {
    if (selectedSymbol) {
      const symUpper = selectedSymbol.toUpperCase();
      const unsub = marketFeedService.subscribeSymbols([symUpper]);

      // If not already in instruments list, fetch metadata from backend and register it
      setInstruments(prev => {
        const alreadyPresent = prev.some(i => i.symbol.toUpperCase() === symUpper);
        if (!alreadyPresent) {
          instrumentService.getStockBySymbol(symUpper)
            .then(meta => {
              if (meta) {
                const currentPrice = Number(meta.current_price ?? meta.close_price ?? 0);
                const newInst: Instrument = {
                  symbol: meta.symbol,
                  name: meta.name || meta.symbol,
                  exchange: (meta.exchange as MarketType) || 'NSE',
                  type: 'STOCK' as InstrumentType,
                  indices: meta.indices || [],
                  price: currentPrice,
                  change: Number(meta.change ?? 0),
                  changePercent: Number(meta.change_percent ?? 0),
                  open: Number(meta.open_price ?? currentPrice),
                  high: Number(meta.high_price ?? currentPrice),
                  low: Number(meta.low_price ?? currentPrice),
                  prevClose: Number(meta.close_price ?? currentPrice),
                  volume: Number(meta.volume ?? 0),
                  avgVolume: 0,
                  lotSize: meta.market_lot || 1,
                  rsi: 50,
                  ema20: 0,
                  ema50: 0,
                  ema200: 0,
                  sma20: 0,
                  sma50: 0,
                  vwap: 0,
                  macd: { macd: 0, signal: 0, histogram: 0 },
                  bollingerBands: { upper: +(currentPrice * 1.02).toFixed(2), middle: currentPrice, lower: +(currentPrice * 0.98).toFixed(2) },
                  atr: 0
                };
                setInstruments(innerPrev => {
                  if (innerPrev.some(i => i.symbol.toUpperCase() === symUpper)) return innerPrev;
                  return [newInst, ...innerPrev];
                });
              }
            })
            .catch(console.warn);
        }
        return prev;
      });

      return () => unsub();
    }
  }, [selectedSymbol]);


  // Synchronize live portfolio, positions, holdings, orders & trades from broker
  const syncBrokerData = useCallback(async () => {
    try {
      // 0. Live Upstox Reconcile (synchronizes orders, trades, positions, and holdings into DB)
      try {
        await apiClient.post('/orders/reconcile').catch(() => null);
      } catch {}

      // 1. Live Funds from Broker RMS
      try {
        const fundsRes = await apiClient.get('/brokers/broker-upstox/funds').catch(() =>
          apiClient.get('/brokers/upstox/funds').catch(() => null)
        );
        if (fundsRes?.data?.data) {
          const f = fundsRes.data.data;
          const liveFunds = Number(f.available_funds ?? f.available_margin ?? 0);
          setPortfolio(prev => ({
            ...prev,
            availableFunds: liveFunds,
            availableMargin: liveFunds,
          }));
        }
      } catch {}

      // 2. Live Demat Holdings (CNC Delivery)
      try {
        const holdingsRes = await apiClient.get('/orders/portfolio/holdings').catch(() =>
          apiClient.get('/brokers/broker-upstox/holdings').catch(() => null)
        );
        const rawHoldings = holdingsRes?.data?.data || holdingsRes?.data;
        if (Array.isArray(rawHoldings)) {
          const mappedHoldings: Holding[] = rawHoldings.map((h: any, idx: number) => {
            const qty = Number(h.quantity || 0);
            const avg = Number(h.avg_price || h.avg_buy_price || 0);
            const curPrice = Number(h.current_price || h.ltp || h.last_price || avg);
            const invVal = Number(h.invested_value || (qty * avg));
            const curVal = Number(h.current_value || (qty * curPrice));
            const totRet = Number(h.total_return || h.pnl || (curVal - invVal));
            const totRetPct = invVal > 0 ? Number(((totRet / invVal) * 100).toFixed(2)) : 0;
            const dayRet = Number(h.today_return || h.day_change || 0);
            const dayRetPct = Number(h.today_return_percent || h.day_change_percent || 0);
            return {
              id: `h-${idx}-${h.symbol}`,
              symbol: h.symbol,
              name: h.name || `${h.symbol} Ltd`,
              exchange: (h.exchange || 'NSE') as MarketType,
              quantity: qty,
              avgPrice: avg,
              currentPrice: curPrice,
              investedValue: invVal,
              currentValue: curVal,
              totalReturn: totRet,
              totalReturnPercent: totRetPct,
              todayReturn: dayRet,
              todayReturnPercent: dayRetPct
            };
          });
          setHoldings(mappedHoldings);
        }
      } catch {}

      // 3. Live Intraday Open Positions (MIS & F&O)
      try {
        const positionsRes = await apiClient.get('/orders/portfolio/positions').catch(() =>
          apiClient.get('/brokers/broker-upstox/positions').catch(() => null)
        );
        const rawPositions = positionsRes?.data?.data || positionsRes?.data;
        if (Array.isArray(rawPositions)) {
          const mappedPositions: Position[] = rawPositions.map((p: any, idx: number) => ({
            id: `pos-${idx}-${p.symbol}`,
            symbol: p.symbol,
            name: p.name || p.symbol,
            exchange: (p.exchange || 'NSE') as MarketType,
            product: (p.product_type || p.product || 'MIS') as ProductType,
            quantity: Number(p.quantity || 0),
            avgPrice: Number(p.buy_avg_price || p.buy_price || p.avg_price || 0),
            ltp: Number(p.last_price || p.ltp || 0),
            pnl: Number(p.unrealized_pnl || p.pnl || 0),
            dayPnl: Number(p.realized_pnl || p.day_pnl || 0),
            pnlPercent: Number(p.pnl_percent || 0)
          }));
          setPositions(mappedPositions);
        }
      } catch {}

      // 4. Live Order Book
      try {
        const ordersRes = await apiClient.get('/orders').catch(() =>
          apiClient.get('/brokers/broker-upstox/orders').catch(() => null)
        );
        const rawOrders = ordersRes?.data?.data || ordersRes?.data;
        if (Array.isArray(rawOrders)) {
          const mappedOrders: Order[] = rawOrders.map((o: any) => ({
            id: o.id || o.broker_order_id || `ORD-${Date.now()}`,
            symbol: o.symbol,
            name: o.name || o.symbol,
            exchange: (o.exchange || 'NSE') as MarketType,
            side: (o.transaction_type || o.side || 'BUY') as OrderSide,
            orderType: (o.order_type || 'MARKET') as OrderType,
            product: (o.product_type || o.product || 'MIS') as ProductType,
            quantity: Number(o.quantity || 0),
            price: Number(o.price || 0),
            avgPrice: Number(o.average_price || o.price || 0),
            status: (o.status || 'SUBMITTED') as any,
            timestamp: o.created_at ? new Date(o.created_at).toLocaleTimeString() : new Date().toLocaleTimeString()
          }));
          setOrders(mappedOrders);
        }
      } catch {}

      // 5. Live Trade Book Fills
      try {
        const tradesRes = await apiClient.get('/orders/history/trades').catch(() => null);
        const rawTrades = tradesRes?.data?.data || tradesRes?.data;
        if (Array.isArray(rawTrades)) {
          const mappedTrades: TradeRecord[] = rawTrades.map((t: any) => ({
            id: t.id || t.broker_trade_id || `TRD-${Date.now()}`,
            date: t.created_at ? t.created_at.slice(0, 10) : new Date().toISOString().slice(0, 10),
            time: t.created_at ? new Date(t.created_at).toLocaleTimeString() : new Date().toLocaleTimeString(),
            strategyName: t.strategy_name || 'Market Execution',
            symbol: t.symbol,
            side: t.transaction_type || t.side || 'BUY',
            entryPrice: Number(t.price || 0),
            exitPrice: Number(t.price || 0),
            quantity: Number(t.quantity || 0),
            pnl: 0,
            pnlPercent: 0,
            status: 'CLOSED',
            orderId: t.order_id || t.broker_order_id || ''
          }));
          setTrades(mappedTrades);
        }
      } catch {}
    } catch (err: any) {
      console.warn('Sync broker data notice:', err?.message);
    }
  }, []);

  // Synchronize broker session connection state with backend API
  const consecutiveBrokerFailuresRef = useRef<number>(0);

  useEffect(() => {
    const syncBrokerStatus = async () => {
      try {
        // 1. Check if backend has active validated Upstox session
        const upstoxStatus = await apiClient.get('/brokers/upstox/session-status').catch(() => null);
        if (upstoxStatus?.data?.has_token && upstoxStatus?.data?.is_valid) {
          consecutiveBrokerFailuresRef.current = 0;
          setBrokerState('Connected');
          localStorage.setItem('auratrade-broker-state', 'Connected');
          localStorage.setItem('auratrade-connected-broker-id', 'broker-upstox');
          setBrokers(prev => prev.map(b => (b.id === 'broker-upstox' || b.name?.toLowerCase().includes('upstox')) ? {
            ...b,
            connected: true,
            status: 'Connected',
            clientId: upstoxStatus.data.user_id || b.clientId
          } : b));
          syncBrokerData();
          return;
        }

        // If active live ticks are still streaming via WebSocket, preserve connection state
        if (marketFeedService.hasReceivedRecentTicks(20000)) {
          consecutiveBrokerFailuresRef.current = 0;
          return;
        }

        // Debounce disconnections: require 3 consecutive failed checks before dropping connection
        consecutiveBrokerFailuresRef.current += 1;
        if (consecutiveBrokerFailuresRef.current >= 3) {
          setBrokerState('Not Connected');
          localStorage.removeItem('auratrade-broker-state');
          setBrokers(prev => prev.map(b => (b.id === 'broker-upstox' || b.name?.toLowerCase().includes('upstox')) ? {
            ...b,
            connected: false,
            status: 'Not Connected'
          } : b));
        }
      } catch {
        consecutiveBrokerFailuresRef.current += 1;
        if (consecutiveBrokerFailuresRef.current >= 3 && !marketFeedService.hasReceivedRecentTicks(20000)) {
          setBrokerState('Not Connected');
          localStorage.removeItem('auratrade-broker-state');
        }
      }
    };

    syncBrokerStatus();
    const interval = setInterval(syncBrokerStatus, 15000);
    return () => clearInterval(interval);
  }, [syncBrokerData]);

  // Synchronize Authoritative Market Session and Frozen/Live baseline Snapshots
  const lastSnapshotTimestampRef = useRef<number>(0);

  useEffect(() => {
    const syncMarketSession = async () => {
      try {
        const [info, snapshots] = await Promise.all([
          marketSessionService.getSessionStatus(),
          marketSessionService.getSnapshots(),
        ]);
        setMarketSession(info);

        if (snapshots && Object.keys(snapshots).length > 0) {
          const now = Date.now();
          if (now < lastSnapshotTimestampRef.current) return;
          lastSnapshotTimestampRef.current = now;

          // 1. Update/Lock Instruments with real Upstox quotes
          setInstruments(prev => prev.map(inst => {
            const sym = inst.symbol.toUpperCase();
            const snap = snapshots[sym];
            if (snap && snap.price > 0) {
              return {
                ...inst,
                price: snap.price,
                change: snap.change_absolute,
                changePercent: snap.change_percent,
                open: snap.open_price || inst.open,
                high: snap.high_price || inst.high,
                low: snap.low_price || inst.low,
                volume: snap.volume || inst.volume,
                lastTickDirection: 'NONE' as const,
              };
            }
            return inst;
          }));

          // 2. Update/Lock Major Indices with real Upstox values
          setIndices(prev => prev.map(idx => {
            const sym = idx.symbol.toUpperCase();
            const snap = snapshots[sym] ||
                         (sym === 'NIFTY' ? snapshots['NIFTY 50'] : undefined) ||
                         (sym === 'BANK NIFTY' ? snapshots['NIFTY BANK'] : undefined) ||
                         (sym === 'FINNIFTY' ? snapshots['NIFTY FINANCIAL SERVICES'] : undefined);

            if (snap && snap.price > 0) {
              return {
                ...idx,
                price: snap.price,
                change: snap.change_absolute,
                changePercent: snap.change_percent,
                status: info.is_open ? ('OPEN' as const) : ('CLOSED' as const),
              };
            }
            return {
              ...idx,
              status: info.is_open ? ('OPEN' as const) : ('CLOSED' as const),
            };
          }));
        }
      } catch {
        // Keep current state if network busy
      }
    };

    syncMarketSession();
    const interval = setInterval(syncMarketSession, 15000);
    return () => clearInterval(interval);
  }, []);



  // Update Positions & Portfolio based on price ticks
  useEffect(() => {
    setPositions(prev => {
      return prev.map(pos => {
        const inst = instruments.find(i => i.symbol === pos.symbol);
        if (!inst) return pos;
        const currentLtp = inst.price;
        const pnl = +((currentLtp - pos.avgPrice) * pos.quantity).toFixed(2);
        const pnlPercent = +(((currentLtp - pos.avgPrice) / pos.avgPrice) * 100).toFixed(2);
        const dayPnl = +(pos.quantity * inst.change).toFixed(2);
        return {
          ...pos,
          ltp: currentLtp,
          pnl,
          pnlPercent,
          dayPnl
        };
      });
    });
  }, [instruments]);

  // Internal Order Execution Engine
  const executeOrderInternal = useCallback(async (params: {
    symbol: string;
    side: OrderSide;
    orderType: OrderType;
    product: ProductType;
    quantity: number;
    price: number;
    strategyName?: string;
    skipConfirmation?: boolean;
  }): Promise<{ success: boolean; orderId?: string; message: string }> => {
    if (tradingMode === 'LIVE' && brokerState !== 'Connected') {
      setIsBrokerModalOpen(true);
      addToast({
        type: 'warning',
        title: 'Broker Connection Required',
        message: 'Please link your Upstox Demat account to place and execute live market orders.'
      });
      return { success: false, message: 'Broker connection required for live orders' };
    }

    const inst = instruments.find(i => i.symbol === params.symbol);
    const executionPrice = params.orderType === 'MARKET' ? (inst?.price || params.price) : params.price;
    const totalValue = +(executionPrice * params.quantity).toFixed(2);
    const requiredMargin = params.product === 'MIS' ? +(totalValue * 0.20).toFixed(2) : totalValue;

    if (tradingMode === 'PAPER' && params.side === 'BUY' && portfolio.availableMargin > 0 && requiredMargin > portfolio.availableMargin) {
      addToast({
        type: 'error',
        title: 'Margin Exceeded',
        message: `Order requires ₹${requiredMargin.toLocaleString('en-IN')}, available margin is ₹${portfolio.availableMargin.toLocaleString('en-IN')}`
      });
      return { success: false, message: 'Insufficient margin' };
    }

    // 1. LIVE MODE: Dispatch to genuine Upstox Broker endpoint via backend
    if (tradingMode === 'LIVE') {
      try {
        const isMarketClosed = marketSession ? !marketSession.is_open : false;
        const res = await orderService.placeOrder({
          symbol: params.symbol,
          exchange: ((inst?.exchange as any) || 'NSE'),
          transaction_type: params.side,
          order_type: params.orderType,
          product_type: (params.product as any) || 'MIS',
          quantity: params.quantity,
          price: executionPrice,
          strategy_name: params.strategyName,
          is_amo: isMarketClosed,
        });

        const orderData = res;
        const orderId = orderData.id || orderData.client_order_id || `ORD-${Date.now()}`;
        const timeStr = new Date().toLocaleTimeString();

        const newOrder: Order = {
          id: orderId,
          symbol: params.symbol,
          name: inst?.name || params.symbol,
          exchange: inst?.exchange || 'NSE',
          side: params.side,
          orderType: params.orderType,
          product: params.product,
          quantity: params.quantity,
          price: executionPrice,
          avgPrice: orderData.average_price || executionPrice,
          status: (orderData.status as any) || 'SUBMITTED',
          timestamp: timeStr
        };

        setOrders(prev => [newOrder, ...prev.filter(o => o.id !== orderId)]);

        addToast({
          type: 'success',
          title: `${params.side} Order Submitted`,
          message: `${params.quantity}x ${params.symbol} @ ₹${executionPrice.toFixed(2)} (${params.product}) — Status: ${orderData.status || 'SUBMITTED'}${isMarketClosed ? ' [AMO]' : ''}`
        });

        return { success: true, orderId, message: 'Order submitted to exchange' };
      } catch (err: any) {
        const errorDetail = err?.response?.data?.detail || err?.message || 'Broker order execution rejected';
        addToast({
          type: 'error',
          title: `${params.side} Order Rejected`,
          message: `${params.symbol}: ${errorDetail}`
        });
        return { success: false, message: errorDetail };
      }
    }

    // 2. PAPER SANDBOX MODE: Simulate virtual order execution
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randNum = Math.floor(10000 + Math.random() * 90000);
    const orderId = `ORD-${dateStr}-${randNum}`;
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    const newOrder: Order = {
      id: orderId,
      symbol: params.symbol,
      name: inst?.name || params.symbol,
      exchange: inst?.exchange || 'NSE',
      side: params.side,
      orderType: params.orderType,
      product: params.product,
      quantity: params.quantity,
      price: executionPrice,
      avgPrice: executionPrice,
      status: 'FILLED',
      timestamp: timeStr
    };

    setOrders(prev => [newOrder, ...prev]);

    setPositions(prev => {
      const existing = prev.find(p => p.symbol === params.symbol && p.product === params.product);
      if (existing) {
        const isSameSide = (existing.quantity > 0 && params.side === 'BUY') || (existing.quantity < 0 && params.side === 'SELL');
        if (isSameSide) {
          const totalQty = existing.quantity + (params.side === 'BUY' ? params.quantity : -params.quantity);
          const totalCost = (Math.abs(existing.quantity) * existing.avgPrice) + (params.quantity * executionPrice);
          const newAvg = +(totalCost / Math.abs(totalQty)).toFixed(2);
          return prev.map(p => p.id === existing.id ? {
            ...p,
            quantity: totalQty,
            avgPrice: newAvg,
            ltp: executionPrice,
            pnl: +((executionPrice - newAvg) * totalQty).toFixed(2),
            pnlPercent: +(((executionPrice - newAvg) / newAvg) * 100).toFixed(2)
          } : p);
        } else {
          const remainingQty = existing.quantity + (params.side === 'BUY' ? params.quantity : -params.quantity);
          if (remainingQty === 0) {
            return prev.filter(p => p.id !== existing.id);
          }
          return prev.map(p => p.id === existing.id ? {
            ...p,
            quantity: remainingQty,
            ltp: executionPrice,
            pnl: +((executionPrice - existing.avgPrice) * remainingQty).toFixed(2),
            pnlPercent: +(((executionPrice - existing.avgPrice) / existing.avgPrice) * 100).toFixed(2)
          } : p);
        }
      } else {
        const qty = params.side === 'BUY' ? params.quantity : -params.quantity;
        const newPos: Position = {
          id: `pos-${Date.now()}`,
          symbol: params.symbol,
          name: inst?.name || params.symbol,
          exchange: inst?.exchange || 'NSE',
          product: params.product,
          quantity: qty,
          avgPrice: executionPrice,
          ltp: executionPrice,
          pnl: 0,
          dayPnl: 0,
          pnlPercent: 0
        };
        return [newPos, ...prev];
      }
    });

    const newTrade: TradeRecord = {
      id: `TRD-${Date.now()}`,
      date: now.toISOString().slice(0, 10),
      time: timeStr,
      strategyName: params.strategyName || 'Manual Order Ticket',
      symbol: params.symbol,
      side: params.side,
      entryPrice: executionPrice,
      exitPrice: executionPrice,
      quantity: params.quantity,
      pnl: 0,
      pnlPercent: 0,
      status: 'OPEN',
      orderId
    };
    setTrades(prev => [newTrade, ...prev]);

    setPortfolio(prev => {
      const marginChange = params.side === 'BUY' ? totalValue : -totalValue;
      return {
        ...prev,
        usedMargin: Math.max(0, +(prev.usedMargin + marginChange).toFixed(2)),
        availableMargin: Math.max(0, +(prev.availableMargin - marginChange).toFixed(2))
      };
    });

    addToast({
      type: 'success',
      title: `${params.side} Paper Order Executed`,
      message: `${params.quantity}x ${params.symbol} @ ₹${executionPrice.toFixed(2)} (${params.product})`
    });

    return { success: true, orderId, message: 'Paper order executed successfully' };
  }, [tradingMode, brokerState, instruments, portfolio.availableMargin, addToast]);

  // Order Placement with Semi-Automated Safeguard (Enforces User Permission)
  const placeOrder = useCallback(async (params: {
    symbol: string;
    side: OrderSide;
    orderType: OrderType;
    product: ProductType;
    quantity: number;
    price: number;
    strategyName?: string;
    skipConfirmation?: boolean;
  }) => {
    if (requireUserApproval && !params.skipConfirmation) {
      requestTradeApproval(params);
      return { success: true, message: 'Trade authorization requested' };
    }
    return await executeOrderInternal(params);
  }, [requireUserApproval, requestTradeApproval, executeOrderInternal]);

  const confirmApprovedTrade = useCallback(async () => {
    if (!pendingTradeToConfirm) return;
    const trade = { ...pendingTradeToConfirm };
    setIsTradeConfirmModalOpen(false);
    setPendingTradeToConfirm(null);
    await executeOrderInternal({ ...trade, skipConfirmation: true });
  }, [pendingTradeToConfirm, executeOrderInternal]);

  const cancelOrder = useCallback((orderId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'CANCELLED' } : o));
    orderService.cancelOrder(orderId).catch(err => {
      console.warn('Backend order cancel API sync notice:', err?.message);
    });
    addToast({
      type: 'info',
      title: 'Order Cancelled',
      message: `Order ${orderId} has been cancelled.`
    });
  }, [addToast]);


  const updateOrder = useCallback((orderId: string, updates: { price?: number; quantity?: number }) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          price: updates.price !== undefined ? updates.price : o.price,
          quantity: updates.quantity !== undefined ? updates.quantity : o.quantity
        };
      }
      return o;
    }));
    addToast({
      type: 'info',
      title: 'Order Updated',
      message: `Order ${orderId} modified.`
    });
  }, [addToast]);

  const exitPosition = useCallback((positionId: string) => {
    const pos = positions.find(p => p.id === positionId);
    if (!pos) return;

    setPositions(prev => prev.filter(p => p.id !== positionId));

    // Add completed trade record
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    const newTrade: TradeRecord = {
      id: `TRD-${Date.now()}`,
      date: now.toISOString().slice(0, 10),
      time: timeStr,
      strategyName: 'Manual Exit Ticket',
      symbol: pos.symbol,
      side: pos.quantity > 0 ? 'SELL' : 'BUY',
      entryPrice: pos.avgPrice,
      exitPrice: pos.ltp,
      quantity: Math.abs(pos.quantity),
      pnl: pos.pnl,
      pnlPercent: pos.pnlPercent,
      status: 'CLOSED',
      orderId: `ORD-${Date.now()}`
    };
    setTrades(prev => [newTrade, ...prev]);

    addToast({
      type: pos.pnl >= 0 ? 'success' : 'warning',
      title: 'Position Squared Off',
      message: `Closed ${pos.quantity} ${pos.symbol} | P&L: ₹${pos.pnl.toLocaleString('en-IN')}`
    });
  }, [positions, addToast]);

  const convertPositionProduct = useCallback((positionId: string, newProduct: ProductType) => {
    setPositions(prev => prev.map(p => {
      if (p.id === positionId) {
        return { ...p, product: newProduct };
      }
      return p;
    }));
    addToast({
      type: 'info',
      title: 'Product Type Converted',
      message: `Position product converted to ${newProduct}`
    });
  }, [addToast]);

  const pledgeHolding = useCallback((holdingId: string, qtyToPledge: number) => {
    setHoldings(prev => prev.map(h => {
      if (h.id === holdingId) {
        const collateralValue = +(qtyToPledge * h.currentPrice * 0.85).toFixed(2); // 15% haircut
        setPortfolio(port => ({
          ...port,
          availableMargin: +(port.availableMargin + collateralValue).toFixed(2),
          collateral: +(port.collateral + collateralValue).toFixed(2)
        }));
        return h;
      }
      return h;
    }));
    addToast({
      type: 'success',
      title: 'Holdings Pledged',
      message: `Pledged ${qtyToPledge} shares for margin collateral.`
    });
  }, [addToast]);

  const addFunds = useCallback((amount: number) => {
    setPortfolio(prev => ({
      ...prev,
      availableMargin: +(prev.availableMargin + amount).toFixed(2),
      availableFunds: +(prev.availableFunds + amount).toFixed(2),
      portfolioValue: +(prev.portfolioValue + amount).toFixed(2),
      payIn: +(prev.payIn + amount).toFixed(2)
    }));
    addToast({
      type: 'success',
      title: 'Funds Added',
      message: `₹${amount.toLocaleString('en-IN')} added to trading balance.`
    });
  }, [addToast]);

  const withdrawFunds = useCallback((amount: number) => {
    setPortfolio(prev => {
      if (amount > prev.availableMargin) {
        addToast({
          type: 'error',
          title: 'Withdrawal Failed',
          message: 'Requested amount exceeds available free cash margin.'
        });
        return prev;
      }
      addToast({
        type: 'info',
        title: 'Withdrawal Requested',
        message: `₹${amount.toLocaleString('en-IN')} payout initiated to linked bank account.`
      });
      return {
        ...prev,
        availableMargin: +(prev.availableMargin - amount).toFixed(2),
        availableFunds: +(prev.availableFunds - amount).toFixed(2),
        portfolioValue: +(prev.portfolioValue - amount).toFixed(2),
        payOut: +(prev.payOut + amount).toFixed(2)
      };
    });
  }, [addToast]);

  const toggleBrokerConnection = useCallback((brokerId: string) => {
    setBrokers(prev => prev.map(b => {
      if (b.id === brokerId) {
        const nextConnected = !b.connected;
        return {
          ...b,
          connected: nextConnected,
          status: nextConnected ? 'Connected' : 'Not Connected',
          lastSync: nextConnected ? 'Just now' : b.lastSync
        };
      }
      return b;
    }));
  }, []);

  const connectBrokerWithCredentials = useCallback(async (brokerId: string, credentials: any): Promise<boolean> => {
    setBrokers(prev => prev.map(b => b.id === brokerId ? { ...b, status: 'Syncing' } : b));
    setBrokerState('Syncing');

    try {
      // Attempt backend API connect
      await apiClient.post(`/brokers/${brokerId}/connect`, {
        broker_type: 'UPSTOX',
        client_id: credentials.clientId || credentials.username || 'UPSTOX_USER',
        api_key: credentials.apiKey,
        api_secret: credentials.apiSecret,
        totp_secret: credentials.totpSecret,
        pin: credentials.password || credentials.pin,
        password: credentials.password || credentials.pin,
        environment: credentials.environment || 'LIVE'
      }).catch(err => {
        const msg = extractApiErrorMessage(err);
        console.warn('Backend connect notification:', msg);
        if (err?.response?.status === 401 || err?.response?.status === 400) {
          throw new Error(msg || 'Invalid credentials or expired 2FA TOTP secret.');
        }
      });

      // Fetch live holdings and funds from backend API
      let liveFunds = 250000.00;
      let liveHoldings: Holding[] = [];
      let livePositions: Position[] = [];

      try {
        const fundsRes = await apiClient.get(`/brokers/${brokerId}/funds`);
        if (fundsRes?.data?.data) {
          liveFunds = Number(fundsRes.data.data.available_funds || fundsRes.data.data.available_margin || 0);
        }
      } catch { }

      try {
        const holdingsRes = await apiClient.get(`/brokers/${brokerId}/holdings`);
        if (holdingsRes?.data?.data && Array.isArray(holdingsRes.data.data)) {
          liveHoldings = holdingsRes.data.data.map((h: any, idx: number) => ({
            id: `h-${idx}-${h.symbol}`,
            symbol: h.symbol,
            name: `${h.symbol} Ltd`,
            exchange: h.exchange || 'NSE',
            quantity: h.quantity,
            avgPrice: h.avg_price,
            ltp: h.current_price,
            investedValue: h.invested_value,
            currentValue: h.current_value,
            pnl: h.total_return,
            pnlPercent: h.total_return_percent,
            dayChange: 0,
            dayChangePercent: 0
          }));
        }
      } catch { }

      try {
        const positionsRes = await apiClient.get(`/brokers/${brokerId}/positions`);
        if (positionsRes?.data?.data && Array.isArray(positionsRes.data.data)) {
          livePositions = positionsRes.data.data.map((p: any, idx: number) => ({
            id: `pos-${idx}-${p.symbol}`,
            symbol: p.symbol,
            name: p.symbol,
            exchange: p.exchange || 'NSE',
            product: p.product || 'MIS',
            quantity: p.quantity,
            avgPrice: p.buy_price || p.avg_price || 0,
            ltp: p.ltp || 0,
            pnl: p.pnl || 0,
            dayPnl: p.day_pnl || p.pnl || 0,
            pnlPercent: 0
          }));
        }
      } catch { }

      setBrokerState('Connected');
      if (typeof window !== 'undefined') {
        localStorage.setItem('auratrade-broker-state', 'Connected');
        localStorage.setItem('auratrade-connected-broker-id', brokerId);
      }

      setHoldings(liveHoldings);
      setPositions(livePositions);
      const totalHoldingsVal = liveHoldings.reduce((sum, h) => sum + h.currentValue, 0);
      const totalHoldingsPnl = liveHoldings.reduce((sum, h) => sum + (h.totalReturn || 0), 0);
      const totalInv = liveHoldings.reduce((sum, h) => sum + h.investedValue, 0);
      const overallReturnPct = totalInv > 0 ? (totalHoldingsPnl / totalInv) * 100 : 0;

      setPortfolio({
        portfolioValue: totalHoldingsVal + liveFunds,
        todayPnl: 0,
        todayPnlPercent: 0,
        overallPnl: totalHoldingsPnl,
        overallPnlPercent: overallReturnPct,
        availableFunds: liveFunds,
        usedMargin: 0,
        availableMargin: liveFunds,
        collateral: 0,
        payIn: 0,
        payOut: 0
      });

      setBrokers(prev => prev.map(b => {
        if (b.id === brokerId) {
          return {
            ...b,
            connected: true,
            status: 'Connected',
            lastSync: 'Just now',
            clientId: credentials.clientId || 'UPSTOX_LIVE',
            marginSynced: liveFunds,
            credentials: {
              clientId: credentials.clientId,
              apiKey: '••••••••',
              apiSecret: '••••••••',
              totpSecret: '••••••••',
              environment: credentials.environment || 'LIVE'
            }
          };
        }
        return b;
      }));

      addToast({
        type: 'success',
        title: 'Upstox Pro Connected',
        message: `Upstox broker linked. Live Demat holdings (${liveHoldings.length}) and funds (₹${liveFunds.toLocaleString('en-IN')}) synced.`
      });

      return true;
    } catch (err: any) {
      setBrokerState('Not Connected');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auratrade-broker-state');
        localStorage.removeItem('auratrade-connected-broker-id');
      }
      setBrokers(prev => prev.map(b => b.id === brokerId ? { ...b, status: 'Not Connected', connected: false } : b));
      addToast({
        type: 'error',
        title: 'Connection Failed',
        message: err?.message || 'Could not verify Upstox credentials.'
      });
      return false;
    }
  }, [addToast]);

  const disconnectBroker = useCallback((brokerId: string) => {
    apiClient.post(`/brokers/${brokerId}/disconnect`).catch(() => { });
    setBrokerState('Not Connected');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auratrade-broker-state');
      localStorage.removeItem('auratrade-connected-broker-id');
    }
    if (tradingMode === 'LIVE') {
      setPortfolio(ZERO_PORTFOLIO);
      setHoldings([]);
      setPositions([]);
      setOrders([]);
      setTrades([]);
    }
    setBrokers(prev => prev.map(b => {
      if (b.id === brokerId) {
        return {
          ...b,
          connected: false,
          status: 'Not Connected',
          credentials: undefined,
          marginSynced: 0
        };
      }
      return b;
    }));
    addToast({
      type: 'info',
      title: 'Broker Disconnected',
      message: 'Upstox broker session unlinked. Demat holdings & live sync cleared.'
    });
  }, [tradingMode, addToast]);

  const openBrokerModal = useCallback((broker?: BrokerConnection | null) => {
    setSelectedBrokerForConnect(broker || null);
    setIsBrokerModalOpen(true);
  }, []);

  const closeBrokerModal = useCallback(() => {
    setIsBrokerModalOpen(false);
    setSelectedBrokerForConnect(null);
  }, []);

  const saveStrategy = useCallback((strategy: Strategy) => {
    setStrategies(prev => {
      const idx = prev.findIndex(s => s.id === strategy.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = strategy;
        return next;
      }
      return [...prev, strategy];
    });
    addToast({
      type: 'success',
      title: 'Strategy Saved',
      message: `Strategy "${strategy.name}" updated successfully.`
    });
  }, [addToast]);

  const runStrategy = useCallback(async (strategy: Strategy) => {
    setIsScanning(true);
    setScanProgress(0);

    for (let i = 1; i <= 5; i++) {
      await new Promise(r => setTimeout(r, 120));
      setScanProgress(i * 20);
    }

    setIsScanning(false);
    setActiveStrategyForResults(strategy);
    setCurrentPage('strategy-results');
  }, []);

  const navigateToInstrument = useCallback((symbol: string) => {
    setSelectedSymbol(symbol.toUpperCase());
    setCurrentPage('instrument');
  }, [setSelectedSymbol, setCurrentPage]);

  const navigateToChart = useCallback((symbol: string) => {
    setSelectedSymbol(symbol.toUpperCase());
    getInstrument(symbol);
    setCurrentPage('chart');
  }, [getInstrument, setSelectedSymbol, setCurrentPage]);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    addToast({
      type: 'info',
      title: 'Notifications Cleared',
      message: 'All notifications marked as read.'
    });
  }, [addToast]);

  const openQuickOrder = useCallback((params: Omit<QuickOrderState, 'isOpen'>) => {
    setQuickOrder({ ...params, isOpen: true });
  }, []);

  const closeQuickOrder = useCallback(() => {
    setQuickOrder(prev => ({ ...prev, isOpen: false }));
  }, []);

  return (
    <TradingContext.Provider value={{
      currentPage,
      setCurrentPage,
      selectedSymbol,
      setSelectedSymbol,
      navigateToInstrument,
      navigateToChart,
      theme,
      toggleTheme,
      tradingMode,
      setTradingMode,
      isLiveConfirmOpen,
      setIsLiveConfirmOpen,
      brokerState,
      setBrokerState,
      syncBrokerData,
      instruments,
      indices,
      getInstrument,
      strategies,
      currentStrategyId,
      setCurrentStrategyId,
      activeStrategyForResults,
      setActiveStrategyForResults,
      saveStrategy,
      runStrategy,
      isScanning,
      scanProgress,
      orders,
      positions,
      holdings,
      trades,
      portfolio,
      brokers,
      selectedOrderForDetails,
      setSelectedOrderForDetails,
      placeOrder,
      cancelOrder,
      updateOrder,
      exitPosition,
      convertPositionProduct,
      pledgeHolding,
      isTradeConfirmModalOpen,
      pendingTradeToConfirm,
      requestTradeApproval,
      confirmApprovedTrade,
      cancelPendingTrade,
      requireUserApproval,
      setRequireUserApproval,
      addFunds,
      withdrawFunds,
      toggleBrokerConnection,
      connectBrokerWithCredentials,
      disconnectBroker,
      isBrokerModalOpen,
      selectedBrokerForConnect,
      openBrokerModal,
      closeBrokerModal,
      quickOrder,
      openQuickOrder,
      closeQuickOrder,
      isSearchOpen,
      setIsSearchOpen,
      notifications,
      markNotificationRead,
      markAllNotificationsRead,
      toasts,
      addToast,
      removeToast,
      currentUser,
      userRole,
      isAuthenticated,
      isAuthLoading,
      canCreateStrategy,
      canAccessAdminStats,
      canManageUsers,
      clientUsers,
      isLoadingClients,
      fetchClients,
      toggleBlockUser,
      isAuthModalOpen,
      authModalTab,
      setAuthModalTab,
      openAuthModal,
      closeAuthModal,
      switchRole,
      loginWithCredentials,
      loginApi,
      registerApi,
      logout,
      updateUserSettings,
      isBackendConnected,
      marketSession,
      isMarketOpen,
      marketStatusLabel

    }}>
      {children}
    </TradingContext.Provider>

  );
};

export const useTrading = () => {
  const context = useContext(TradingContext);
  if (!context) {
    throw new Error('useTrading must be used within a TradingProvider');
  }
  return context;
};
