import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  Instrument, 
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
  TraderClient
} from '../types';
import { INITIAL_INSTRUMENTS, MAJOR_INDICES } from '../mock/marketData';
import { INITIAL_STRATEGIES } from '../mock/strategies';
import { 
  INITIAL_ORDERS, 
  INITIAL_POSITIONS, 
  INITIAL_HOLDINGS, 
  INITIAL_PORTFOLIO, 
  INITIAL_BROKERS, 
  INITIAL_TRADES, 
  INITIAL_NOTIFICATIONS,
  MOCK_USERS,
  MOCK_TRADER_CLIENTS
} from '../mock/accountData';

export type PageId = 
  | 'dashboard' 
  | 'strategies' 
  | 'strategy-builder' 
  | 'strategy-results'
  | 'backtester'
  | 'market' 
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
  
  // Theme (Dark / Light)
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  
  // Trading Mode & Safety Kill Switch (V1 mandate)
  tradingMode: TradingMode;
  setTradingMode: (mode: TradingMode) => void;
  isLiveConfirmOpen: boolean;
  setIsLiveConfirmOpen: (open: boolean) => void;
  isKillSwitchActive: boolean;
  isKillSwitchModalOpen: boolean;
  setIsKillSwitchModalOpen: (open: boolean) => void;
  haltTrading: () => void;
  resumeTrading: () => void;

  // Broker Connection State (V1 Concept)
  brokerState: BrokerState;
  setBrokerState: (state: BrokerState) => void;

  // Market Data
  instruments: Instrument[];
  indices: typeof MAJOR_INDICES;
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
  }) => { success: boolean; orderId?: string; message: string };
  cancelOrder: (orderId: string) => void;
  updateOrder: (orderId: string, updates: { price?: number; quantity?: number }) => void;
  exitPosition: (positionId: string) => void;
  convertPositionProduct: (positionId: string, newProduct: ProductType) => void;
  pledgeHolding: (holdingId: string, qtyToPledge: number) => void;
  
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

  // Authentication & 3-Tier Role Management
  currentUser: UserAccount;
  userRole: UserRole;
  canCreateStrategy: boolean;
  canAccessAdminStats: boolean;
  canManageUsers: boolean;
  clientUsers: TraderClient[];
  toggleBlockUser: (clientId: string) => void;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  switchRole: (role: UserRole) => void;
  loginWithCredentials: (email: string, name?: string, role?: UserRole) => void;
}

const TradingContext = createContext<TradingContextType | undefined>(undefined);

export const TradingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('RELIANCE');
  const [instruments, setInstruments] = useState<Instrument[]>(INITIAL_INSTRUMENTS);
  const [indices, setIndices] = useState(MAJOR_INDICES);
  const [strategies, setStrategies] = useState<Strategy[]>(INITIAL_STRATEGIES);
  const [currentStrategyId, setCurrentStrategyId] = useState<string | null>('strat-1');
  const [activeStrategyForResults, setActiveStrategyForResults] = useState<Strategy | null>(INITIAL_STRATEGIES[0]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  
  // Theme (Dark / Light)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('auratrade-theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return 'dark'; // Default to dark for sleek fintech terminal experience
    }
    return 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('auratrade-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  // Toasts / Notifications system (declared early so other callbacks can safely invoke addToast)
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id' | 'timestamp'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const newToast: ToastMessage = { ...toast, id, timestamp: timeStr };

    setToasts(prev => [...prev.slice(-4), newToast]); // keep max 5 active toasts

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // User Authentication & 3-Tier Role Management
  const [currentUser, setCurrentUser] = useState<UserAccount>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('auratrade-user');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return MOCK_USERS[0];
        }
      }
    }
    return MOCK_USERS[0]; // Default to Superadmin Developer
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const openAuthModal = useCallback(() => setIsAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => setIsAuthModalOpen(false), []);

  const switchRole = useCallback((role: UserRole) => {
    const target = MOCK_USERS.find(u => u.role === role) || MOCK_USERS[0];
    setCurrentUser(target);
    localStorage.setItem('auratrade-user', JSON.stringify(target));
    
    // If switching to standard user while on strategy builder, redirect to strategies
    if (role === 'user' && currentPage === 'strategy-builder') {
      setCurrentPage('strategies');
    }

    addToast({
      type: 'info',
      title: 'Active Profile Switched',
      message: `Logged in as ${target.name} (${target.roleLabel})`
    });
  }, [currentPage, addToast]);

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

  // Client Users (for Admin & Superadmin management)
  const [clientUsers, setClientUsers] = useState<TraderClient[]>(MOCK_TRADER_CLIENTS);

  const toggleBlockUser = useCallback((clientId: string) => {
    setClientUsers(prev => prev.map(user => {
      if (user.id === clientId) {
        const nextStatus = user.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
        addToast({
          type: nextStatus === 'BLOCKED' ? 'warning' : 'success',
          title: nextStatus === 'BLOCKED' ? 'Trader Account Suspended' : 'Trader Account Activated',
          message: `${user.name} (${user.clientId}) status updated to ${nextStatus}. ${nextStatus === 'BLOCKED' ? 'Order placement & execution revoked.' : 'Full trading permissions restored.'}`
        });
        return { ...user, status: nextStatus };
      }
      return user;
    }));
  }, [addToast]);

  // Trading Mode & Kill Switch States (V1 Mandate)
  const [tradingMode, setTradingMode] = useState<TradingMode>('PAPER');
  const [isLiveConfirmOpen, setIsLiveConfirmOpen] = useState<boolean>(false);
  const [isKillSwitchActive, setIsKillSwitchActive] = useState<boolean>(false);
  const [isKillSwitchModalOpen, setIsKillSwitchModalOpen] = useState<boolean>(false);

  // Broker State (V1 Concept)
  const [brokerState, setBrokerState] = useState<BrokerState>('Connected');

  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [positions, setPositions] = useState<Position[]>(INITIAL_POSITIONS);
  const [holdings] = useState<Holding[]>(INITIAL_HOLDINGS);
  const [trades, setTrades] = useState<TradeRecord[]>(INITIAL_TRADES);
  const [portfolio, setPortfolio] = useState<PortfolioSummary>(INITIAL_PORTFOLIO);
  const [brokers, setBrokers] = useState<BrokerConnection[]>(INITIAL_BROKERS);
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<Order | null>(null);

  // Notifications State
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [quickOrder, setQuickOrder] = useState<QuickOrderState>({
    isOpen: false,
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd.',
    side: 'BUY',
    price: 1482.30,
    initialQty: 10
  });

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  // Navigate to instrument
  const navigateToInstrument = useCallback((symbol: string) => {
    setSelectedSymbol(symbol);
    setCurrentPage('instrument');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const getInstrument = useCallback((symbol: string) => {
    return instruments.find(i => i.symbol.toUpperCase() === symbol.toUpperCase());
  }, [instruments]);

  // Market tick simulation (subtle tick variations every 3.5s)
  useEffect(() => {
    const interval = setInterval(() => {
      setInstruments(prev => {
        return prev.map(inst => {
          // 40% chance of tick update per interval
          if (Math.random() > 0.4) return inst;
          
          const deltaPct = (Math.random() - 0.48) * 0.003;
          const oldPrice = inst.price;
          const newPrice = +(oldPrice * (1 + deltaPct)).toFixed(2);
          const diff = +(newPrice - inst.prevClose).toFixed(2);
          const newChangePct = +((diff / inst.prevClose) * 100).toFixed(2);
          const dir = newPrice > oldPrice ? 'UP' : newPrice < oldPrice ? 'DOWN' : 'NONE';
          
          return {
            ...inst,
            price: newPrice,
            change: diff,
            changePercent: newChangePct,
            high: Math.max(inst.high, newPrice),
            low: Math.min(inst.low, newPrice),
            lastTickDirection: dir
          };
        });
      });

      // Update indices
      setIndices(prev => {
        return prev.map(idx => {
          if (Math.random() > 0.5) return idx;
          const deltaPct = (Math.random() - 0.48) * 0.0015;
          const newPrice = +(idx.price * (1 + deltaPct)).toFixed(2);
          const diff = +(idx.change + (newPrice - idx.price)).toFixed(2);
          const newPct = +((diff / (newPrice - diff)) * 100).toFixed(2);
          return {
            ...idx,
            price: newPrice,
            change: diff,
            changePercent: newPct
          };
        });
      });
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  // Update positions and portfolio when prices change
  useEffect(() => {
    setPositions(prev => {
      return prev.map(pos => {
        const inst = instruments.find(i => i.symbol === pos.symbol);
        if (!inst) return pos;
        const currentLtp = inst.price;
        const pnl = +( (currentLtp - pos.avgPrice) * pos.quantity ).toFixed(2);
        const dayPnl = +( (currentLtp - inst.prevClose) * pos.quantity ).toFixed(2);
        const pnlPercent = +( ((currentLtp - pos.avgPrice) / pos.avgPrice) * 100 ).toFixed(2);
        return {
          ...pos,
          ltp: currentLtp,
          pnl,
          dayPnl,
          pnlPercent
        };
      });
    });
  }, [instruments]);

  const haltTrading = useCallback(() => {
    setIsKillSwitchActive(true);
    setIsKillSwitchModalOpen(false);
    addToast({
      type: 'error',
      title: 'TRADING HALTED',
      message: 'Kill switch activated. All automated and manual order placement has been suspended.'
    });
    // Add notification
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      type: 'risk',
      title: 'Kill Switch Activated',
      message: 'Trading execution immediately halted across all strategies and manual tickets.',
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      read: false,
      actionRoute: 'dashboard'
    };
    setNotifications(prev => [newNotif, ...prev]);
  }, [addToast]);

  const resumeTrading = useCallback(() => {
    setIsKillSwitchActive(false);
    addToast({
      type: 'success',
      title: 'Trading Resumed',
      message: 'System active. Strategy execution and order placement have been restored.'
    });
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      type: 'system',
      title: 'Trading Resumed',
      message: 'Kill switch cleared. System is actively monitoring markets.',
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      read: false,
      actionRoute: 'dashboard'
    };
    setNotifications(prev => [newNotif, ...prev]);
  }, [addToast]);

  // Order Placement
  const placeOrder = useCallback((params: {
    symbol: string;
    side: OrderSide;
    orderType: OrderType;
    product: ProductType;
    quantity: number;
    price: number;
  }) => {
    if (isKillSwitchActive) {
      addToast({
        type: 'error',
        title: 'Trading Halted',
        message: 'Order placement is blocked because the Kill Switch is ACTIVE. Resume trading in the header to place orders.'
      });
      return { success: false, message: 'Trading is halted by Kill Switch' };
    }

    const inst = instruments.find(i => i.symbol === params.symbol);
    const executionPrice = params.orderType === 'MARKET' ? (inst?.price || params.price) : params.price;
    const totalValue = +(executionPrice * params.quantity).toFixed(2);

    if (params.side === 'BUY' && totalValue > portfolio.availableMargin) {
      addToast({
        type: 'error',
        title: 'Margin Exceeded',
        message: `Order requires ₹${totalValue.toLocaleString('en-IN')}, available margin is ₹${portfolio.availableMargin.toLocaleString('en-IN')}`
      });
      return { success: false, message: 'Insufficient margin' };
    }

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

    // Record trade in Trade History
    const newTrade: TradeRecord = {
      id: `TRD-${randNum}`,
      date: now.toISOString().slice(0, 10),
      time: timeStr,
      strategyName: 'Manual Order Ticket',
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

    // Add notification
    const orderNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      type: 'order',
      title: 'Order Executed',
      message: `${params.side} ${params.quantity} ${params.symbol} filled @ ₹${executionPrice.toFixed(2)} (${orderId})`,
      timestamp: timeStr,
      read: false,
      actionRoute: 'orders'
    };
    setNotifications(prev => [orderNotif, ...prev]);

    // Update positions
    setPositions(prev => {
      const existing = prev.find(p => p.symbol === params.symbol && p.product === params.product);
      if (existing) {
        if (params.side === 'BUY') {
          const newQty = existing.quantity + params.quantity;
          const newAvg = +((existing.avgPrice * existing.quantity + executionPrice * params.quantity) / newQty).toFixed(2);
          const pnl = +((executionPrice - newAvg) * newQty).toFixed(2);
          return prev.map(p => p.id === existing.id ? { ...p, quantity: newQty, avgPrice: newAvg, ltp: executionPrice, pnl } : p);
        } else {
          const newQty = existing.quantity - params.quantity;
          if (newQty <= 0) {
            return prev.filter(p => p.id !== existing.id);
          }
          const pnl = +((executionPrice - existing.avgPrice) * newQty).toFixed(2);
          return prev.map(p => p.id === existing.id ? { ...p, quantity: newQty, ltp: executionPrice, pnl } : p);
        }
      } else {
        if (params.side === 'BUY') {
          const newPos: Position = {
            id: `pos-${Date.now()}`,
            symbol: params.symbol,
            name: inst?.name || params.symbol,
            exchange: inst?.exchange || 'NSE',
            product: params.product,
            quantity: params.quantity,
            avgPrice: executionPrice,
            ltp: executionPrice,
            pnl: 0,
            dayPnl: 0,
            pnlPercent: 0
          };
          return [newPos, ...prev];
        }
        return prev;
      }
    });

    // Update portfolio funds
    setPortfolio(prev => {
      const marginChange = params.side === 'BUY' ? totalValue : -totalValue;
      return {
        ...prev,
        usedMargin: Math.max(0, +(prev.usedMargin + marginChange * 0.25).toFixed(2)),
        availableMargin: Math.max(0, +(prev.availableMargin - marginChange * 0.25).toFixed(2)),
        availableFunds: Math.max(0, +(prev.availableFunds - (params.side === 'BUY' ? totalValue : -totalValue)).toFixed(2))
      };
    });

    addToast({
      type: 'success',
      title: 'Order Executed',
      message: `${params.side} ${params.quantity} ${params.symbol} @ ₹${executionPrice.toLocaleString('en-IN')} (${orderId})`
    });

    return { success: true, orderId, message: 'Order filled successfully' };
  }, [instruments, portfolio.availableMargin, isKillSwitchActive, addToast]);

  const cancelOrder = useCallback((orderId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'CANCELLED' } : o));
    addToast({
      type: 'info',
      title: 'Order Cancelled',
      message: `Order ${orderId} has been cancelled.`
    });
  }, [addToast]);

  const updateOrder = useCallback((orderId: string, updates: { price?: number; quantity?: number }) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      return {
        ...o,
        price: updates.price !== undefined ? updates.price : o.price,
        quantity: updates.quantity !== undefined ? updates.quantity : o.quantity
      };
    }));
    addToast({
      type: 'success',
      title: 'Order Modified',
      message: `Order ${orderId} parameters successfully updated with the exchange.`
    });
  }, [addToast]);

  const exitPosition = useCallback((positionId: string) => {
    const pos = positions.find(p => p.id === positionId);
    if (!pos) return;
    
    placeOrder({
      symbol: pos.symbol,
      side: 'SELL',
      orderType: 'MARKET',
      product: pos.product,
      quantity: pos.quantity,
      price: pos.ltp
    });

    addToast({
      type: 'info',
      title: 'Position Squared Off',
      message: `Exited ${pos.quantity} ${pos.symbol} at market price.`
    });
  }, [positions, placeOrder, addToast]);

  const convertPositionProduct = useCallback((positionId: string, newProduct: ProductType) => {
    setPositions(prev => prev.map(p => {
      if (p.id !== positionId) return p;
      return {
        ...p,
        product: newProduct
      };
    }));
    addToast({
      type: 'success',
      title: 'Product Converted',
      message: `Position converted to ${newProduct} successfully.`
    });
  }, [addToast]);

  const pledgeHolding = useCallback((_holdingId: string, qtyToPledge: number) => {
    addToast({
      type: 'success',
      title: 'Shares Pledged for Margin',
      message: `Successfully pledged ${qtyToPledge} shares. Collateral margin updated.`
    });
    setPortfolio(prev => ({
      ...prev,
      collateral: prev.collateral + qtyToPledge * 850,
      availableMargin: prev.availableMargin + qtyToPledge * 850
    }));
  }, [addToast]);

  const addFunds = useCallback((amount: number) => {
    setPortfolio(prev => ({
      ...prev,
      availableFunds: +(prev.availableFunds + amount).toFixed(2),
      availableMargin: +(prev.availableMargin + amount).toFixed(2),
      payIn: +(prev.payIn + amount).toFixed(2)
    }));
    addToast({
      type: 'success',
      title: 'Funds Added',
      message: `₹${amount.toLocaleString('en-IN')} successfully credited to trading account.`
    });
  }, [addToast]);

  const withdrawFunds = useCallback((amount: number) => {
    if (amount > portfolio.availableFunds) {
      addToast({
        type: 'error',
        title: 'Withdrawal Failed',
        message: 'Withdrawal amount exceeds available cash balance.'
      });
      return;
    }
    setPortfolio(prev => ({
      ...prev,
      availableFunds: +(prev.availableFunds - amount).toFixed(2),
      availableMargin: +(prev.availableMargin - amount).toFixed(2),
      payOut: +(prev.payOut + amount).toFixed(2)
    }));
    addToast({
      type: 'info',
      title: 'Withdrawal Initiated',
      message: `Payout of ₹${amount.toLocaleString('en-IN')} requested.`
    });
  }, [portfolio.availableFunds, addToast]);

  // Broker Connect Modal State
  const [isBrokerModalOpen, setIsBrokerModalOpen] = useState<boolean>(false);
  const [selectedBrokerForConnect, setSelectedBrokerForConnect] = useState<BrokerConnection | null>(null);

  const openBrokerModal = useCallback((broker?: BrokerConnection | null) => {
    setSelectedBrokerForConnect(broker || null);
    setIsBrokerModalOpen(true);
  }, []);

  const closeBrokerModal = useCallback(() => {
    setIsBrokerModalOpen(false);
    setSelectedBrokerForConnect(null);
  }, []);

  const connectBrokerWithCredentials = useCallback(async (brokerId: string, credentials: any): Promise<boolean> => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')} IST`;
    
    // Update broker in list
    setBrokers(prev => prev.map(b => {
      if (b.id !== brokerId) return b;
      return {
        ...b,
        connected: true,
        status: 'Connected',
        clientId: credentials.clientId || b.clientId || 'ACC9942',
        accountNumber: `****${(credentials.clientId || '9942').slice(-4)}`,
        lastSync: timeStr,
        marginSynced: b.marginSynced || 250000.00,
        credentials: {
          clientId: credentials.clientId || '',
          apiKey: credentials.apiKey || '',
          apiSecret: '••••••••••••••••••••••••',
          totpSecret: credentials.totpSecret ? '••••••••' : undefined,
          environment: credentials.environment || 'LIVE'
        }
      };
    }));

    setBrokerState('Connected');

    addToast({
      type: 'success',
      title: 'Broker Connected Successfully',
      message: `Direct DMA session established with ${credentials.clientId || 'Client Account'}. Live margin synced.`
    });

    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      type: 'broker',
      title: 'Broker Gateway Connected',
      message: `Linked account ${credentials.clientId || 'gateway'} with active REST & FIX session token.`,
      timestamp: timeStr,
      read: false,
      actionRoute: 'brokers'
    };
    setNotifications(prev => [notif, ...prev]);

    return true;
  }, [addToast]);

  const disconnectBroker = useCallback((brokerId: string) => {
    setBrokers(prev => prev.map(b => {
      if (b.id !== brokerId) return b;
      return {
        ...b,
        connected: false,
        status: 'Not Connected',
        lastSync: undefined
      };
    }));

    // If all brokers disconnected, set brokerState to Not Connected
    setBrokers(latest => {
      const anyConnected = latest.some(b => b.id !== brokerId && b.connected);
      if (!anyConnected) {
        setBrokerState('Not Connected');
      }
      return latest;
    });

    addToast({
      type: 'info',
      title: 'Broker Disconnected',
      message: 'Broker session terminated. Strategy routing suspended for this adapter.'
    });
  }, [addToast]);

  const toggleBrokerConnection = useCallback((brokerId: string) => {
    const target = brokers.find(b => b.id === brokerId);
    if (target?.connected) {
      disconnectBroker(brokerId);
    } else {
      openBrokerModal(target);
    }
  }, [brokers, disconnectBroker, openBrokerModal]);

  const saveStrategy = useCallback((strategy: Strategy) => {
    setStrategies(prev => {
      const idx = prev.findIndex(s => s.id === strategy.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = strategy;
        return copy;
      }
      return [strategy, ...prev];
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
    setActiveStrategyForResults(strategy);
    setCurrentStrategyId(strategy.id);

    // Simulated scanning progress
    for (let p = 15; p <= 100; p += 25) {
      await new Promise(r => setTimeout(r, 180));
      setScanProgress(p);
    }
    
    setIsScanning(false);
    setCurrentPage('strategy-results');
    
    addToast({
      type: 'info',
      title: 'Scan Complete',
      message: `Scanned 2,146 instruments. Found ${strategy.matchCount || 17} matches.`
    });
  }, [addToast]);

  const openQuickOrder = useCallback((params: Omit<QuickOrderState, 'isOpen'>) => {
    setQuickOrder({
      isOpen: true,
      ...params
    });
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
      theme,
      toggleTheme,
      tradingMode,
      setTradingMode,
      isLiveConfirmOpen,
      setIsLiveConfirmOpen,
      isKillSwitchActive,
      isKillSwitchModalOpen,
      setIsKillSwitchModalOpen,
      haltTrading,
      resumeTrading,
      brokerState,
      setBrokerState,
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
      canCreateStrategy,
      canAccessAdminStats,
      canManageUsers,
      clientUsers,
      toggleBlockUser,
      isAuthModalOpen,
      openAuthModal,
      closeAuthModal,
      switchRole,
      loginWithCredentials
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

