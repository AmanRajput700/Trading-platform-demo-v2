/**
 * Real-Time WebSocket & Fallback Polling Market Feed Client for AuraTrade
 * Connects to the backend FastAPI /ws/market-feed gateway powered by Upstox V3 & Redis PubSub.
 * Automatically falls back to high-frequency live REST quotes whenever WebSocket is unavailable,
 * blocked by browser HTTPS mixed-content policies, or in reconnecting state.
 */

import { apiClient } from './apiClient';
import { PriceAlertData } from '../types/alert';

export interface LiveMarketTick {
  instrument_key: string;
  symbol: string;
  type: 'INDEX' | 'STOCK' | 'OPTION';
  price: number;
  close_price: number;
  change: number;
  change_percent: number;
  last_trade_qty?: number;
  last_trade_time?: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  oi?: number;
  bids?: Array<{ price: number; quantity: number }>;
  asks?: Array<{ price: number; quantity: number }>;
  option_greeks?: {
    delta?: number;
    theta?: number;
    gamma?: number;
    vega?: number;
    rho?: number;
  };
  timestamp: number;
  source?: string;
}

type TickCallback = (tick: LiveMarketTick) => void;
type AlertCallback = (alert: PriceAlertData) => void;

// Benchmark liquid stocks to keep ticking on dashboard & market watch
const DEFAULT_LIQUID_STOCKS = [
  'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK',
  'SBIN', 'BHARTIARTL', 'ASIANPAINT', 'TATASTEEL', 'WIPRO',
  'SUZLON', 'ITC', 'LT', 'MARUTI', 'SUNPHARMA', 'TITAN',
  'BAJFINANCE', 'ZOMATO', 'VEDL', 'HINDALCO', 'JSWSTEEL', 'IRFC'
];

const DEFAULT_INDICES = ['NIFTY 50', 'SENSEX', 'BANK NIFTY', 'NIFTY IT', 'FINNIFTY'];

class MarketFeedService {
  private ws: WebSocket | null = null;
  private subscribers: Map<string, Set<TickCallback>> = new Map();
  private globalSubscribers: Set<TickCallback> = new Set();
  private alertSubscribers: Set<AlertCallback> = new Set();
  private statsResetSubscribers: Set<() => void> = new Set();
  private activeSubscriptions: Set<string> = new Set([...DEFAULT_INDICES, ...DEFAULT_LIQUID_STOCKS]);
  private isConnected = false;
  private reconnectTimer: any = null;
  private pingTimer: any = null;
  private pollingTimer: any = null;
  private isPolling = false;
  private lastTickTimestamp: number = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      this.connect();
      this.startPollingEngine();
    }
  }

  private getWsUrl(): string {
    const envWs = (import.meta as any).env?.VITE_WS_BASE_URL;
    if (envWs) {
      const clean = envWs.replace(/\/+$/, '');
      return clean.endsWith('/ws/market-feed') ? clean : `${clean}/ws/market-feed`;
    }
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname || 'localhost';
    return `${protocol}//${host}:8000/ws/market-feed`;
  }

  public connect(): void {
    if (typeof window === 'undefined') return;
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      const url = this.getWsUrl();
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.sendSubscription([...this.activeSubscriptions]);
        this.startHeartbeat();
      };

      this.ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'TICK' || payload.type === 'SNAPSHOT') {
            const tick: LiveMarketTick = payload.data;
            this.notify(tick);
          } else if (payload.type === 'PRICE_ALERT') {
            const alert: PriceAlertData = payload.data;
            this.notifyAlert(alert);
          } else if (payload.type === 'STATS_RESET') {
            this.notifyStatsReset();
          }
        } catch {
          // ignore malformed frame
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.stopHeartbeat();
        this.scheduleReconnect();
      };

      this.ws.onerror = () => {
        if (this.ws) {
          try {
            this.ws.close();
          } catch {
            // ignore
          }
        }
      };
    } catch {
      this.scheduleReconnect();
    }
  }

  /**
   * Continuous live polling engine:
   * Polls every 1.5 seconds. If WebSocket is actively delivering ticks (<2.5s old),
   * skips HTTP requests. Otherwise smoothly feeds live Upstox quotes to all subscribers.
   */
  private startPollingEngine(): void {
    if (this.pollingTimer) return;
    this.pollingTimer = setInterval(() => {
      this.pollQuotes();
    }, 1500);

    // Initial immediate poll on startup
    setTimeout(() => {
      this.pollQuotes();
    }, 100);
  }

  public async pollQuotes(): Promise<void> {
    // If WebSocket is alive and receiving live ticks in the last 2.5 seconds, skip HTTP polling
    if (this.ws && this.ws.readyState === WebSocket.OPEN && (Date.now() - this.lastTickTimestamp < 2500)) {
      return;
    }
    if (this.isPolling) return;
    this.isPolling = true;

    try {
      // Gather all active subscribed symbols + default liquid indices & equities
      const symbolsToPoll = new Set<string>([
        ...DEFAULT_INDICES,
        ...DEFAULT_LIQUID_STOCKS,
        ...this.activeSubscriptions
      ]);

      const symList = Array.from(symbolsToPoll).join(',');
      const res = await apiClient.get<{ data: Record<string, any> }>('/instruments/quotes', {
        params: { symbols: symList },
        timeout: 4500,
      });

      const data = res.data?.data;
      if (data && typeof data === 'object') {
        Object.entries(data).forEach(([key, item]: [string, any]) => {
          if (!item || typeof item !== 'object') return;
          const rawPrice = item.price;
          if (typeof rawPrice !== 'number' || rawPrice <= 0) return;

          const sym = (item.symbol || key.split(':').pop()?.split('|').pop() || key).toUpperCase();
          const tick: LiveMarketTick = {
            instrument_key: item.instrument_key || key,
            symbol: sym,
            type: (item.type || (sym.includes('NIFTY') || sym.includes('SENSEX') ? 'INDEX' : 'STOCK')) as any,
            price: Number(item.price),
            close_price: Number(item.close_price || item.price),
            change: Number(item.change || 0),
            change_percent: Number(item.change_percent || 0),
            open: Number(item.open || item.price),
            high: Number(item.high || item.price),
            low: Number(item.low || item.price),
            volume: Number(item.volume || 0),
            oi: Number(item.oi || 0),
            bids: Array.isArray(item.bids) ? item.bids : [],
            asks: Array.isArray(item.asks) ? item.asks : [],
            timestamp: item.timestamp || Date.now(),
            source: item.source || 'UPSTOX_LIVE',
          };

          this.notify(tick);
        });
      }
    } catch {
      // Ignore background network blips
    } finally {
      this.isPolling = false;
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.pingTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ action: 'ping' }));
      }
    }, 25000);
  }

  private stopHeartbeat(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 4000);
  }

  private sendSubscription(symbols: string[]): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN && symbols.length > 0) {
      this.ws.send(JSON.stringify({
        action: 'subscribe',
        symbols,
      }));
    }
  }

  private sendUnsubscription(symbols: string[]): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN && symbols.length > 0) {
      this.ws.send(JSON.stringify({
        action: 'unsubscribe',
        symbols,
      }));
    }
  }

  public subscribeSymbols(symbols: string[], callback?: TickCallback): () => void {
    symbols.forEach((sym) => {
      const normalized = sym.toUpperCase();
      this.activeSubscriptions.add(normalized);
      if (callback) {
        if (!this.subscribers.has(normalized)) {
          this.subscribers.set(normalized, new Set());
        }
        this.subscribers.get(normalized)!.add(callback);
      }
    });

    this.sendSubscription(symbols);

    // Trigger an immediate poll so newly subscribed symbols get real quotes right away
    if (!this.hasReceivedRecentTicks(2000)) {
      this.pollQuotes();
    }

    return () => {
      symbols.forEach((sym) => {
        const normalized = sym.toUpperCase();
        if (callback) {
          this.subscribers.get(normalized)?.delete(callback);
        }
        if (!this.subscribers.get(normalized) || this.subscribers.get(normalized)!.size === 0) {
          // Do not delete default indices/stocks from active subscriptions
          if (!DEFAULT_INDICES.includes(normalized) && !DEFAULT_LIQUID_STOCKS.includes(normalized)) {
            this.activeSubscriptions.delete(normalized);
            this.sendUnsubscription([normalized]);
          }
        }
      });
    };
  }

  public subscribeGlobal(callback: TickCallback): () => void {
    this.globalSubscribers.add(callback);
    return () => {
      this.globalSubscribers.delete(callback);
    };
  }

  public subscribeAlerts(callback: AlertCallback): () => void {
    this.alertSubscribers.add(callback);
    return () => {
      this.alertSubscribers.delete(callback);
    };
  }

  public subscribeStatsReset(callback: () => void): () => void {
    this.statsResetSubscribers.add(callback);
    return () => {
      this.statsResetSubscribers.delete(callback);
    };
  }

  private notifyStatsReset(): void {
    this.statsResetSubscribers.forEach((cb) => {
      try {
        cb();
      } catch {
        // ignore callback error
      }
    });
  }

  private notifyAlert(alert: PriceAlertData): void {
    this.alertSubscribers.forEach((cb) => {
      try {
        cb(alert);
      } catch {
        // ignore callback error
      }
    });
  }

  public notify(tick: LiveMarketTick): void {
    this.lastTickTimestamp = Date.now();
    const sym = tick.symbol?.toUpperCase();
    if (sym && this.subscribers.has(sym)) {
      this.subscribers.get(sym)!.forEach((cb) => {
        try {
          cb(tick);
        } catch {
          // ignore callback error
        }
      });
    }

    this.globalSubscribers.forEach((cb) => {
      try {
        cb(tick);
      } catch {
        // ignore callback error
      }
    });
  }

  /**
   * Returns true if ticks have been received (via WebSocket or HTTP fallback) within the last `windowMs`.
   */
  public hasReceivedRecentTicks(windowMs: number = 4000): boolean {
    return (Date.now() - this.lastTickTimestamp < windowMs);
  }

  public isFeedActive(): boolean {
    return this.hasReceivedRecentTicks();
  }

  public isWebSocketConnected(): boolean {
    return this.isConnected;
  }

  public getLastTickTime(): number {
    return this.lastTickTimestamp;
  }
}

export const marketFeedService = new MarketFeedService();
