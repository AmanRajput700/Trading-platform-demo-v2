import { MarketDepthData, DepthLevel, ConnectionStatus } from '../types';
import { INITIAL_INSTRUMENTS, MAJOR_INDICES } from '../mock/marketData';
import { marketSessionService } from './marketSessionService';
import { marketFeedService, LiveMarketTick } from './marketFeedService';

type DepthListener = (data: MarketDepthData) => void;
type StatusListener = (status: ConnectionStatus) => void;

interface Subscription {
  symbol: string;
  depthListeners: Set<DepthListener>;
  statusListeners: Set<StatusListener>;
  currentData?: MarketDepthData;
  status: ConnectionStatus;
  isPaused: boolean;
  feedUnsub?: () => void;
}

class MarketDepthService {
  private subscriptions: Map<string, Subscription> = new Map();

  /**
   * Subscribe to Market Depth / Order Book updates for a symbol.
   * Session-Aware: Frozen immutable state when market is closed; live feed when open.
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
      const initialStatus: ConnectionStatus = isMarketOpen ? 'connected' : 'market_closed';

      sub = {
        symbol: normalizedSymbol,
        depthListeners: new Set(),
        statusListeners: new Set(),
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

    // Immediately emit current valid depth snapshot to new listener
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

    // Clean up subscription if no remaining listeners
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
    this.updateStatus(sub, 'reconnecting');

    setTimeout(() => {
      this.initializeSymbolDepth(normalizedSymbol);
    }, 400);
  }

  public isPaused(symbol: string): boolean {
    const sub = this.subscriptions.get(symbol.toUpperCase());
    return sub ? sub.isPaused : false;
  }

  public getCurrentDepth(symbol: string): MarketDepthData | undefined {
    return this.subscriptions.get(symbol.toUpperCase())?.currentData;
  }

  /**
   * Deterministically generates or retrieves the closing / baseline depth snapshot.
   * Freezes data strictly without random mutating intervals.
   */
  public generateDeterministicDepth(symbol: string, basePrice?: number): MarketDepthData {
    const normalized = symbol.toUpperCase();
    const inst = INITIAL_INSTRUMENTS.find(i => i.symbol.toUpperCase() === normalized);
    const idx = MAJOR_INDICES.find(i => i.symbol.toUpperCase() === normalized);
    const ltp = basePrice || idx?.price || inst?.price || 24151.20;
    const tickSize = 0.05;

    // Use deterministic hash of symbol so book is stable and identical across reloads
    const hash = normalized.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const bestBid = +(ltp - tickSize).toFixed(2);
    const bestAsk = +(ltp + tickSize).toFixed(2);

    const buyLevels: DepthLevel[] = [];
    const sellLevels: DepthLevel[] = [];

    let cumBuy = 0;
    let cumSell = 0;

    for (let i = 0; i < 20; i++) {
      const bidPrice = +(bestBid - i * tickSize).toFixed(2);
      const askPrice = +(bestAsk + i * tickSize).toFixed(2);

      const bidQty = Math.floor(400 + ((hash * (i + 1) * 37) % 2200));
      const bidOrders = Math.max(2, Math.floor(bidQty / 120));

      const askQty = Math.floor(380 + ((hash * (i + 1) * 53) % 2100));
      const askOrders = Math.max(2, Math.floor(askQty / 110));

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
      imbalancePercent > 5 ? 'BUY_PRESSURE' : imbalancePercent < -5 ? 'SELL_PRESSURE' : 'NEUTRAL';

    return {
      symbol: normalized,
      ltp,
      timestamp: '15:30:00 IST',
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
      high: inst?.high || +(ltp * 1.008).toFixed(2),
      low: inst?.low || +(ltp * 0.992).toFixed(2),
      volume: inst?.volume || 0,
      circuitLimits: {
        upperCircuit: +(ltp * 1.10).toFixed(2),
        lowerCircuit: +(ltp * 0.90).toFixed(2)
      }
    };
  }

  /**
   * Initializes depth and binds to live feed ONLY when market is open.
   */
  private initializeSymbolDepth(symbol: string): void {
    const sub = this.subscriptions.get(symbol);
    if (!sub) return;

    const isMarketOpen = marketSessionService.isSessionOpen();
    const depthSnapshot = this.generateDeterministicDepth(symbol);
    sub.currentData = depthSnapshot;

    if (!isMarketOpen) {
      // Market is CLOSED: lock status to market_closed and DO NOT start live listeners
      this.updateStatus(sub, 'market_closed');
      this.emitData(sub, depthSnapshot);
      return;
    }

    // Market is OPEN: bind to live feed
    this.updateStatus(sub, 'connected');
    this.emitData(sub, depthSnapshot);

    if (sub.feedUnsub) {
      sub.feedUnsub();
    }

    sub.feedUnsub = marketFeedService.subscribeSymbols([symbol], (tick: LiveMarketTick) => {
      if (sub.isPaused || !marketSessionService.isSessionOpen()) return;
      if (!sub.currentData) return;

      const updated = this.applyLiveTickToDepth(sub.currentData, tick);
      sub.currentData = updated;
      this.emitData(sub, updated);
    });
  }

  private applyLiveTickToDepth(prev: MarketDepthData, tick: LiveMarketTick): MarketDepthData {
    const ltp = tick.price;
    const tickSize = 0.05;
    const bestBid = +(ltp - tickSize).toFixed(2);
    const bestAsk = +(ltp + tickSize).toFixed(2);

    const buy = prev.depth.buy.map((b, i) => ({
      ...b,
      price: +(bestBid - i * tickSize).toFixed(2),
    }));

    const sell = prev.depth.sell.map((s, i) => ({
      ...s,
      price: +(bestAsk + i * tickSize).toFixed(2),
    }));

    const timeStr = tick.timestamp ? new Date(tick.timestamp).toLocaleTimeString('en-IN', { hour12: false }) : new Date().toLocaleTimeString('en-IN', { hour12: false });

    return {
      ...prev,
      ltp,
      timestamp: timeStr,
      depth: { buy, sell },
      bestBid,
      bestAsk,
      high: tick.high || prev.high,
      low: tick.low || prev.low,
      volume: tick.volume || prev.volume
    };
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
}

export const marketDepthService = new MarketDepthService();
