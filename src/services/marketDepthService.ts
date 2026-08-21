import { MarketDepthData, DepthLevel, ConnectionStatus } from '../types';
import { INITIAL_INSTRUMENTS } from '../mock/marketData';

type DepthListener = (data: MarketDepthData) => void;
type StatusListener = (status: ConnectionStatus) => void;

interface Subscription {
  symbol: string;
  depthListeners: Set<DepthListener>;
  statusListeners: Set<StatusListener>;
  timerId?: ReturnType<typeof setInterval>;
  lastTickTime: number;
  currentData?: MarketDepthData;
  status: ConnectionStatus;
  isPaused: boolean;
}

class MarketDepthService {
  private subscriptions: Map<string, Subscription> = new Map();
  private staleCheckTimer?: ReturnType<typeof setInterval>;

  constructor() {
    // Start global stale check watchdog
    if (typeof window !== 'undefined') {
      this.staleCheckTimer = setInterval(() => this.checkStaleSubscriptions(), 3000);
    }
  }

  public destroy(): void {
    if (this.staleCheckTimer) {
      clearInterval(this.staleCheckTimer);
    }
  }

  /**
   * Subscribe to live Market Depth / Order Book updates for a symbol.
   * Returns an unsubscribe function for automatic cleanup.
   */
  public subscribe(
    symbol: string,
    onData: DepthListener,
    onStatus?: StatusListener
  ): () => void {
    const normalizedSymbol = symbol.toUpperCase();
    let sub = this.subscriptions.get(normalizedSymbol);

    if (!sub) {
      sub = {
        symbol: normalizedSymbol,
        depthListeners: new Set(),
        statusListeners: new Set(),
        lastTickTime: Date.now(),
        status: 'connecting',
        isPaused: false,
      };
      this.subscriptions.set(normalizedSymbol, sub);
      this.startSymbolStream(normalizedSymbol);
    }

    sub.depthListeners.add(onData);
    if (onStatus) {
      sub.statusListeners.add(onStatus);
      onStatus(sub.status);
    }

    // If we already have current data, immediately emit to new listener
    if (sub.currentData) {
      onData(sub.currentData);
    }

    return () => {
      this.unsubscribe(normalizedSymbol, onData, onStatus);
    };
  }

  /**
   * Unsubscribe a specific listener.
   */
  public unsubscribe(
    symbol: string,
    onData: DepthListener,
    onStatus?: StatusListener
  ): void {
    const normalizedSymbol = symbol.toUpperCase();
    const sub = this.subscriptions.get(normalizedSymbol);
    if (!sub) return;

    sub.depthListeners.delete(onData);
    if (onStatus) {
      sub.statusListeners.delete(onStatus);
    }

    // If no more listeners, clean up subscription and stop timers
    if (sub.depthListeners.size === 0) {
      if (sub.timerId) {
        clearInterval(sub.timerId);
      }
      this.subscriptions.delete(normalizedSymbol);
    }
  }

  /**
   * Pause or resume the feed for a symbol.
   */
  public togglePause(symbol: string, pause?: boolean): boolean {
    const sub = this.subscriptions.get(symbol.toUpperCase());
    if (!sub) return false;

    const nextState = pause !== undefined ? pause : !sub.isPaused;
    sub.isPaused = nextState;

    if (nextState) {
      this.updateStatus(sub, 'stale');
    } else {
      sub.lastTickTime = Date.now();
      this.updateStatus(sub, 'connected');
    }
    return sub.isPaused;
  }

  /**
   * Manually trigger a reconnect flow for a symbol.
   */
  public reconnect(symbol: string): void {
    const normalizedSymbol = symbol.toUpperCase();
    const sub = this.subscriptions.get(normalizedSymbol);
    if (!sub) return;

    if (sub.timerId) {
      clearInterval(sub.timerId);
    }

    sub.isPaused = false;
    this.updateStatus(sub, 'reconnecting');

    setTimeout(() => {
      this.startSymbolStream(normalizedSymbol);
    }, 600);
  }

  /**
   * Check if a symbol is currently paused.
   */
  public isPaused(symbol: string): boolean {
    const sub = this.subscriptions.get(symbol.toUpperCase());
    return sub ? sub.isPaused : false;
  }

  /**
   * Get current cached depth data for a symbol.
   */
  public getCurrentDepth(symbol: string): MarketDepthData | undefined {
    return this.subscriptions.get(symbol.toUpperCase())?.currentData;
  }

  /**
   * Internal generator for initial Order Book state based on market instrument price.
   */
  public generateInitialDepth(symbol: string, basePrice?: number): MarketDepthData {
    const inst = INITIAL_INSTRUMENTS.find(i => i.symbol.toUpperCase() === symbol.toUpperCase());
    const ltp = basePrice || inst?.price || 1482.30;
    const tickSize = 0.05;

    // Determine spread: usually 1 to 3 ticks
    const spreadTicks = Math.random() > 0.3 ? 1 : 2;
    const bestBid = +(ltp - (spreadTicks * tickSize) / 2).toFixed(2);
    const bestAsk = +(bestBid + spreadTicks * tickSize).toFixed(2);

    const buyLevels: DepthLevel[] = [];
    const sellLevels: DepthLevel[] = [];

    let cumBuy = 0;
    let cumSell = 0;

    // Generate up to 20 levels
    for (let i = 0; i < 20; i++) {
      const bidPrice = +(bestBid - i * tickSize).toFixed(2);
      const askPrice = +(bestAsk + i * tickSize).toFixed(2);

      // Realistic random quantities and orders
      // Near top of book, quantities vary, occasionally with larger "support/resistance walls"
      const isBidWall = i === 4 && Math.random() > 0.5;
      const isAskWall = i === 5 && Math.random() > 0.6;

      const bidQtyBase = Math.floor(200 + Math.random() * 1800);
      const bidQty = isBidWall ? bidQtyBase * 4 : bidQtyBase;
      const bidOrders = Math.max(2, Math.floor(bidQty / (50 + Math.random() * 80)));

      const askQtyBase = Math.floor(200 + Math.random() * 1800);
      const askQty = isAskWall ? askQtyBase * 4 : askQtyBase;
      const askOrders = Math.max(2, Math.floor(askQty / (50 + Math.random() * 80)));

      cumBuy += bidQty;
      cumSell += askQty;

      buyLevels.push({
        price: bidPrice,
        quantity: bidQty,
        orders: bidOrders,
        total: cumBuy
      });

      sellLevels.push({
        price: askPrice,
        quantity: askQty,
        orders: askOrders,
        total: cumSell
      });
    }

    const totalBuyQuantity = cumBuy;
    const totalSellQuantity = cumSell;
    const totalBuyOrders = buyLevels.reduce((acc, l) => acc + l.orders, 0);
    const totalSellOrders = sellLevels.reduce((acc, l) => acc + l.orders, 0);
    const spread = +(bestAsk - bestBid).toFixed(2);
    const spreadPercent = +((spread / ltp) * 100).toFixed(3);
    const buySellRatio = +(totalBuyQuantity / (totalSellQuantity || 1)).toFixed(2);
    const imbalancePercent = +(((totalBuyQuantity - totalSellQuantity) / (totalBuyQuantity + totalSellQuantity)) * 100).toFixed(1);

    const sentiment: 'BUY_PRESSURE' | 'SELL_PRESSURE' | 'NEUTRAL' =
      imbalancePercent > 8 ? 'BUY_PRESSURE' : imbalancePercent < -8 ? 'SELL_PRESSURE' : 'NEUTRAL';

    const now = new Date();
    const timestamp = now.toISOString();

    return {
      symbol: symbol.toUpperCase(),
      ltp,
      timestamp,
      depth: {
        buy: buyLevels,
        sell: sellLevels
      },
      totalBuyQuantity,
      totalSellQuantity,
      totalBuyOrders,
      totalSellOrders,
      bestBid,
      bestAsk,
      spread,
      spreadPercent,
      buySellRatio,
      imbalancePercent,
      sentiment,
      high: inst?.high || +(ltp * 1.02).toFixed(2),
      low: inst?.low || +(ltp * 0.98).toFixed(2),
      volume: inst?.volume || 1250000,
      circuitLimits: {
        upperCircuit: +(ltp * 1.10).toFixed(2),
        lowerCircuit: +(ltp * 0.90).toFixed(2)
      }
    };
  }

  /**
   * Apply realistic incremental L2 tick updates to existing depth data.
   */
  private updateDepthTick(prev: MarketDepthData): MarketDepthData {
    const tickSize = 0.05;
    let ltp = prev.ltp;

    // Small chance to adjust LTP
    if (Math.random() > 0.65) {
      const dir = Math.random() > 0.5 ? 1 : -1;
      ltp = +(ltp + dir * tickSize).toFixed(2);
    }

    const buy = [...prev.depth.buy.map(l => ({ ...l }))];
    const sell = [...prev.depth.sell.map(l => ({ ...l }))];

    // Mutate 1 to 3 random levels with quantity / order adjustments
    const numChanges = Math.floor(1 + Math.random() * 3);
    for (let i = 0; i < numChanges; i++) {
      const isBuySide = Math.random() > 0.5;
      const targetList = isBuySide ? buy : sell;
      const idx = Math.floor(Math.random() * Math.min(8, targetList.length));

      if (targetList[idx]) {
        // Delta between -25% and +30%
        const deltaFactor = 0.75 + Math.random() * 0.55;
        let newQty = Math.floor(targetList[idx].quantity * deltaFactor);
        if (newQty < 50) newQty = Math.floor(100 + Math.random() * 500);

        targetList[idx].quantity = newQty;
        targetList[idx].orders = Math.max(1, Math.floor(newQty / (60 + Math.random() * 40)));
      }
    }

    // Recompute cumulative totals
    let cumBuy = 0;
    for (const b of buy) {
      cumBuy += b.quantity;
      b.total = cumBuy;
    }

    let cumSell = 0;
    for (const s of sell) {
      cumSell += s.quantity;
      s.total = cumSell;
    }

    const totalBuyQuantity = cumBuy;
    const totalSellQuantity = cumSell;
    const totalBuyOrders = buy.reduce((acc, l) => acc + l.orders, 0);
    const totalSellOrders = sell.reduce((acc, l) => acc + l.orders, 0);

    const bestBid = buy[0]?.price || +(ltp - tickSize).toFixed(2);
    const bestAsk = sell[0]?.price || +(ltp + tickSize).toFixed(2);
    const spread = +(bestAsk - bestBid).toFixed(2);
    const spreadPercent = +((spread / ltp) * 100).toFixed(3);
    const buySellRatio = +(totalBuyQuantity / (totalSellQuantity || 1)).toFixed(2);
    const imbalancePercent = +(((totalBuyQuantity - totalSellQuantity) / (totalBuyQuantity + totalSellQuantity)) * 100).toFixed(1);

    const sentiment: 'BUY_PRESSURE' | 'SELL_PRESSURE' | 'NEUTRAL' =
      imbalancePercent > 8 ? 'BUY_PRESSURE' : imbalancePercent < -8 ? 'SELL_PRESSURE' : 'NEUTRAL';

    return {
      ...prev,
      ltp,
      timestamp: new Date().toISOString(),
      depth: { buy, sell },
      totalBuyQuantity,
      totalSellQuantity,
      totalBuyOrders,
      totalSellOrders,
      bestBid,
      bestAsk,
      spread,
      spreadPercent,
      buySellRatio,
      imbalancePercent,
      sentiment
    };
  }

  /**
   * Start streaming ticks for a symbol.
   */
  private startSymbolStream(symbol: string): void {
    const sub = this.subscriptions.get(symbol);
    if (!sub) return;

    // Generate initial snapshot
    const initialData = this.generateInitialDepth(symbol);
    sub.currentData = initialData;
    sub.lastTickTime = Date.now();
    this.updateStatus(sub, 'connected');
    this.emitData(sub, initialData);

    // Dynamic streaming interval (approx every 650ms)
    sub.timerId = setInterval(() => {
      if (sub.isPaused || sub.status !== 'connected') return;

      if (sub.currentData) {
        const nextData = this.updateDepthTick(sub.currentData);
        sub.currentData = nextData;
        sub.lastTickTime = Date.now();
        this.emitData(sub, nextData);
      }
    }, 650);
  }

  private emitData(sub: Subscription, data: MarketDepthData): void {
    sub.depthListeners.forEach(listener => {
      try {
        listener(data);
      } catch (err) {
        console.error('Error in market depth listener:', err);
      }
    });
  }

  private updateStatus(sub: Subscription, status: ConnectionStatus): void {
    sub.status = status;
    sub.statusListeners.forEach(listener => {
      try {
        listener(status);
      } catch (err) {
        console.error('Error in market depth status listener:', err);
      }
    });
  }

  /**
   * Watchdog to detect stale feeds (> 8 seconds without a tick).
   */
  private checkStaleSubscriptions(): void {
    const now = Date.now();
    this.subscriptions.forEach(sub => {
      if (!sub.isPaused && sub.status === 'connected' && now - sub.lastTickTime > 8000) {
        this.updateStatus(sub, 'stale');
      }
    });
  }
}

// Export singleton instance
export const marketDepthService = new MarketDepthService();
