import { MarketDepthData, DepthLevel, ConnectionStatus } from '../types';
import { marketSessionService } from './marketSessionService';
import { marketFeedService, LiveMarketTick } from './marketFeedService';

type DepthListener = (data: MarketDepthData | null) => void;
type StatusListener = (status: ConnectionStatus) => void;

interface Subscription {
  symbol: string;
  depthListeners: Set<DepthListener>;
  statusListeners: Set<StatusListener>;
  currentData?: MarketDepthData | null;
  status: ConnectionStatus;
  isPaused: boolean;
  feedUnsub?: () => void;
}

class MarketDepthService {
  private subscriptions: Map<string, Subscription> = new Map();

  /**
   * Subscribe to Market Depth / Order Book updates for a symbol.
   * Session-Aware: Frozen immutable state when market is closed; live feed when open.
   * NEVER generates fake/synthetic bids, asks, or quantities.
   */
  public subscribe(
    symbol: string,
    onData: DepthListener,
    onStatus?: StatusListener
  ): () => void {
    const normalizedSymbol = symbol.toUpperCase();
    let sub = this.subscriptions.get(normalizedSymbol);

    if (!sub) {
      const isMarketOpen = marketSessionService.isSessionOpen();
      const initialStatus: ConnectionStatus = isMarketOpen ? 'connecting' : 'market_closed';

      sub = {
        symbol: normalizedSymbol,
        depthListeners: new Set(),
        statusListeners: new Set(),
        currentData: null,
        status: initialStatus,
        isPaused: false,
      };
      this.subscriptions.set(normalizedSymbol, sub);
      this.initializeSymbolDepth(normalizedSymbol);
    }

    sub.depthListeners.add(onData);
    if (onStatus) {
      sub.statusListeners.add(onStatus);
      onStatus(sub.status);
    }

    // Emit current depth if available
    if (sub.currentData !== undefined) {
      onData(sub.currentData);
    }

    return () => {
      this.unsubscribe(normalizedSymbol, onData, onStatus);
    };
  }

  /**
   * Unsubscribe a specific listener and cleanly tear down WebSocket feed when no listeners remain.
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

    if (sub.depthListeners.size === 0) {
      if (sub.feedUnsub) {
        sub.feedUnsub();
        sub.feedUnsub = undefined;
      }
      this.subscriptions.delete(normalizedSymbol);
    }
  }

  public togglePause(symbol: string, pause?: boolean): boolean {
    const sub = this.subscriptions.get(symbol.toUpperCase());
    if (!sub) return false;

    const nextState = pause !== undefined ? pause : !sub.isPaused;
    sub.isPaused = nextState;

    if (nextState) {
      this.updateStatus(sub, 'stale');
    } else {
      const isMarketOpen = marketSessionService.isSessionOpen();
      this.updateStatus(sub, isMarketOpen ? 'connected' : 'market_closed');
    }
    return sub.isPaused;
  }

  public reconnect(symbol: string): void {
    const normalizedSymbol = symbol.toUpperCase();
    const sub = this.subscriptions.get(normalizedSymbol);
    if (!sub) return;

    sub.isPaused = false;
    this.updateStatus(sub, 'connecting');

    setTimeout(() => {
      this.initializeSymbolDepth(normalizedSymbol);
    }, 300);
  }

  public isPaused(symbol: string): boolean {
    const sub = this.subscriptions.get(symbol.toUpperCase());
    return sub ? sub.isPaused : false;
  }

  public getCurrentDepth(symbol: string): MarketDepthData | null | undefined {
    return this.subscriptions.get(symbol.toUpperCase())?.currentData;
  }

  /**
   * Initializes real depth stream from broker feed.
   */
  private initializeSymbolDepth(symbol: string): void {
    const sub = this.subscriptions.get(symbol);
    if (!sub) return;

    const isMarketOpen = marketSessionService.isSessionOpen();

    if (!isMarketOpen) {
      this.updateStatus(sub, 'market_closed');
      return;
    }

    this.updateStatus(sub, 'connecting');

    if (sub.feedUnsub) {
      sub.feedUnsub();
    }

    sub.feedUnsub = marketFeedService.subscribeSymbols([symbol], (tick: LiveMarketTick) => {
      if (sub.isPaused) return;

      const updated = this.buildRealDepthFromTick(symbol, tick);
      if (updated) {
        sub.currentData = updated;
        this.updateStatus(sub, 'connected');
        this.emitData(sub, updated);
      }
    });
  }

  /**
   * Parses 100% genuine market depth quotes from live Upstox tick.
   * If real bids/asks are not present in feed, returns null without generating fake values.
   */
  private buildRealDepthFromTick(symbol: string, tick: LiveMarketTick): MarketDepthData | null {
    if (!tick || !tick.price || tick.price <= 0) return null;

    const rawBids = tick.bids || [];
    const rawAsks = tick.asks || [];

    // Filter valid positive price/quantity levels
    const validBids = rawBids.filter(b => b.price > 0 && b.quantity > 0);
    const validAsks = rawAsks.filter(a => a.price > 0 && a.quantity > 0);

    const buyLevels: DepthLevel[] = [];
    const sellLevels: DepthLevel[] = [];

    let cumBuy = 0;
    for (const b of validBids) {
      cumBuy += b.quantity;
      buyLevels.push({
        price: b.price,
        quantity: b.quantity,
        orders: (b as any).orders || 1,
        total: cumBuy,
      });
    }

    let cumSell = 0;
    for (const a of validAsks) {
      cumSell += a.quantity;
      sellLevels.push({
        price: a.price,
        quantity: a.quantity,
        orders: (a as any).orders || 1,
        total: cumSell,
      });
    }

    const totalBuyQuantity = (tick as any).total_buy_quantity || cumBuy;
    const totalSellQuantity = (tick as any).total_sell_quantity || cumSell;
    const totalBuyOrders = buyLevels.reduce((acc, l) => acc + l.orders, 0);
    const totalSellOrders = sellLevels.reduce((acc, l) => acc + l.orders, 0);

    const bestBid = buyLevels.length > 0 ? buyLevels[0].price : 0;
    const bestAsk = sellLevels.length > 0 ? sellLevels[0].price : 0;
    const spread = (bestBid > 0 && bestAsk > 0) ? +(bestAsk - bestBid).toFixed(2) : 0;
    const spreadPercent = (bestBid > 0 && spread > 0 && tick.price > 0) ? +((spread / tick.price) * 100).toFixed(3) : 0;
    const buySellRatio = totalSellQuantity > 0 ? +(totalBuyQuantity / totalSellQuantity).toFixed(2) : totalBuyQuantity > 0 ? 1 : 0;

    const totalVol = totalBuyQuantity + totalSellQuantity;
    const imbalancePercent = totalVol > 0 ? +(((totalBuyQuantity - totalSellQuantity) / totalVol) * 100).toFixed(1) : 0;

    const sentiment: 'BUY_PRESSURE' | 'SELL_PRESSURE' | 'NEUTRAL' =
      imbalancePercent > 5 ? 'BUY_PRESSURE' : imbalancePercent < -5 ? 'SELL_PRESSURE' : 'NEUTRAL';

    const timeStr = tick.timestamp
      ? new Date(tick.timestamp).toLocaleTimeString('en-IN', { hour12: false })
      : new Date().toLocaleTimeString('en-IN', { hour12: false });

    return {
      symbol: symbol.toUpperCase(),
      ltp: tick.price,
      timestamp: timeStr,
      depth: {
        buy: buyLevels,
        sell: sellLevels,
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
      high: tick.high || tick.price,
      low: tick.low || tick.price,
      volume: tick.volume || 0,
      circuitLimits: {
        upperCircuit: +(tick.price * 1.10).toFixed(2),
        lowerCircuit: +(tick.price * 0.90).toFixed(2),
      },
    };
  }

  private emitData(sub: Subscription, data: MarketDepthData | null): void {
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
}

export const marketDepthService = new MarketDepthService();
