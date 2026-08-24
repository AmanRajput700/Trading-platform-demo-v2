/**
 * Real-Time WebSocket Market Feed Client for AuraTrade
 * Connects to the backend FastAPI /ws/market-feed gateway powered by Upstox V3 & Redis PubSub.
 */

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

class MarketFeedService {
  private ws: WebSocket | null = null;
  private subscribers: Map<string, Set<TickCallback>> = new Map();
  private globalSubscribers: Set<TickCallback> = new Set();
  private activeSubscriptions: Set<string> = new Set(['NIFTY 50', 'SENSEX', 'BANK NIFTY', 'NIFTY IT', 'FINNIFTY']);
  private isConnected = false;
  private reconnectTimer: any = null;
  private pingTimer: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.connect();
    }
  }

  private getWsUrl(): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname || 'localhost';
    return `${protocol}//${host}:8000/ws/market-feed`;
  }

  public connect(): void {
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

    return () => {
      if (callback) {
        symbols.forEach((sym) => {
          const normalized = sym.toUpperCase();
          this.subscribers.get(normalized)?.delete(callback);
        });
      }
    };
  }

  public subscribeGlobal(callback: TickCallback): () => void {
    this.globalSubscribers.add(callback);
    return () => {
      this.globalSubscribers.delete(callback);
    };
  }

  private notify(tick: LiveMarketTick): void {
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

  public isFeedActive(): boolean {
    return this.isConnected;
  }
}

export const marketFeedService = new MarketFeedService();
