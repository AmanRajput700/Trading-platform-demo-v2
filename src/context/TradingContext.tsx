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
  ProductType
} from '../types';
import { INITIAL_INSTRUMENTS, MAJOR_INDICES } from '../mock/marketData';
import { INITIAL_STRATEGIES } from '../mock/strategies';
import { 
  INITIAL_ORDERS, 
  INITIAL_POSITIONS, 
  INITIAL_HOLDINGS, 
  INITIAL_PORTFOLIO, 
  INITIAL_BROKERS 
} from '../mock/accountData';

export type PageId = 
  | 'dashboard' 
  | 'strategies' 
  | 'strategy-builder' 
  | 'strategy-results'
  | 'market' 
  | 'instrument' 
  | 'options'
  | 'orders' 
  | 'positions' 
  | 'holdings' 
  | 'funds' 
  | 'brokers' 
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
  
  // Orders, Positions, Holdings
  orders: Order[];
  positions: Position[];
  holdings: Holding[];
  portfolio: PortfolioSummary;
  brokers: BrokerConnection[];
  
  // Order Operations
  placeOrder: (params: {
    symbol: string;
    side: OrderSide;
    orderType: OrderType;
    product: ProductType;
    quantity: number;
    price: number;
  }) => { success: boolean; orderId?: string; message: string };
  cancelOrder: (orderId: string) => void;
  exitPosition: (positionId: string) => void;
  
  // Funds Operations
  addFunds: (amount: number) => void;
  withdrawFunds: (amount: number) => void;
  toggleBrokerConnection: (brokerId: string) => void;
  
  // Quick Order Modal
  quickOrder: QuickOrderState;
  openQuickOrder: (params: Omit<QuickOrderState, 'isOpen'>) => void;
  closeQuickOrder: () => void;
  
  // Global Search Modal
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  
  // Notifications / Toasts
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id' | 'timestamp'>) => void;
  removeToast: (id: string) => void;
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
  
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [positions, setPositions] = useState<Position[]>(INITIAL_POSITIONS);
  const [holdings] = useState<Holding[]>(INITIAL_HOLDINGS);
  const [portfolio, setPortfolio] = useState<PortfolioSummary>(INITIAL_PORTFOLIO);
  const [brokers, setBrokers] = useState<BrokerConnection[]>(INITIAL_BROKERS);
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [quickOrder, setQuickOrder] = useState<QuickOrderState>({
    isOpen: false,
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd.',
    side: 'BUY',
    price: 1482.30,
    initialQty: 10
  });

  const addToast = useCallback((toast: Omit<ToastMessage, 'id' | 'timestamp'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    const now = new Date();
    const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    const newToast: ToastMessage = { ...toast, id, timestamp };
    
    setToasts(prev => [newToast, ...prev.slice(0, 4)]);
    
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
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

  // Order Placement
  const placeOrder = useCallback((params: {
    symbol: string;
    side: OrderSide;
    orderType: OrderType;
    product: ProductType;
    quantity: number;
    price: number;
  }) => {
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
  }, [instruments, portfolio.availableMargin, addToast]);

  const cancelOrder = useCallback((orderId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'CANCELLED' } : o));
    addToast({
      type: 'info',
      title: 'Order Cancelled',
      message: `Order ${orderId} has been cancelled.`
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

  const toggleBrokerConnection = useCallback((brokerId: string) => {
    setBrokers(prev => prev.map(b => {
      if (b.id !== brokerId) return b;
      const isConnecting = !b.connected;
      return {
        ...b,
        connected: isConnecting,
        status: isConnecting ? 'Connected' : 'Not Connected',
        lastSync: isConnecting ? 'Just now' : undefined,
        accountNumber: isConnecting ? (b.accountNumber || `ACC-${Math.floor(1000 + Math.random() * 9000)}`) : undefined
      };
    }));
  }, []);

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
      portfolio,
      brokers,
      placeOrder,
      cancelOrder,
      exitPosition,
      addFunds,
      withdrawFunds,
      toggleBrokerConnection,
      quickOrder,
      openQuickOrder,
      closeQuickOrder,
      isSearchOpen,
      setIsSearchOpen,
      toasts,
      addToast,
      removeToast
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
