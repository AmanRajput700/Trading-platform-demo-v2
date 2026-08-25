/**
 * Real-Time Chart Datafeed for TradingView Lightweight Charts
 * Bridges incoming live WebSocket ticks from Upstox (via marketFeedService)
 * to real-time Candlestick updates on the chart.
 */

import { CandlestickData, HistogramData, UTCTimestamp } from 'lightweight-charts';
import { marketFeedService, LiveMarketTick } from './marketFeedService';
import { ChartTimeframe, TIMEFRAME_SECONDS_MAP } from './ohlcService';

export interface ChartUpdatePayload {
  candle: CandlestickData<UTCTimestamp>;
  volume: HistogramData<UTCTimestamp>;
  isNewBar: boolean;
  symbol: string;
  price: number;
}

export type ChartUpdateListener = (payload: ChartUpdatePayload) => void;

export class RealtimeChartDatafeed {
  private symbol: string;
  private timeframe: ChartTimeframe;
  private currentBar: CandlestickData<UTCTimestamp> | null = null;
  private currentVolume: number = 0;
  private listeners: Set<ChartUpdateListener> = new Set();
  private unsubscribeFeed: (() => void) | null = null;

  constructor(symbol: string, timeframe: ChartTimeframe = '15m', initialLastBar?: CandlestickData<UTCTimestamp>) {
    this.symbol = symbol.toUpperCase();
    this.timeframe = timeframe;
    if (initialLastBar) {
      this.currentBar = { ...initialLastBar };
      this.currentVolume = 500;
    }
  }

  public setLastBar(bar: CandlestickData<UTCTimestamp>, volume: number = 1000): void {
    this.currentBar = { ...bar };
    this.currentVolume = volume;
  }

  public setTimeframe(timeframe: ChartTimeframe): void {
    this.timeframe = timeframe;
  }

  public setSymbol(symbol: string, initialLastBar?: CandlestickData<UTCTimestamp>): void {
    const nextSymbol = symbol.toUpperCase();
    if (this.symbol === nextSymbol) return;

    this.stop();
    this.symbol = nextSymbol;
    this.currentBar = initialLastBar ? { ...initialLastBar } : null;
    this.currentVolume = 500;
    this.start();
  }

  public subscribe(listener: ChartUpdateListener): () => void {
    this.listeners.add(listener);
    if (this.listeners.size === 1) {
      this.start();
    }

    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0) {
        this.stop();
      }
    };
  }

  public start(): void {
    if (this.unsubscribeFeed) return;

    this.unsubscribeFeed = marketFeedService.subscribeSymbols([this.symbol], (tick: LiveMarketTick) => {
      this.handleIncomingTick(tick);
    });
  }

  public stop(): void {
    if (this.unsubscribeFeed) {
      this.unsubscribeFeed();
      this.unsubscribeFeed = null;
    }
  }

  private handleIncomingTick(tick: LiveMarketTick): void {
    if (!tick || !tick.price || tick.price <= 0) return;
    if (tick.symbol?.toUpperCase() !== this.symbol) return;

    const stepSeconds = TIMEFRAME_SECONDS_MAP[this.timeframe] || 900;
    const tickTimeSeconds = tick.timestamp ? Math.floor(tick.timestamp / 1000) : Math.floor(Date.now() / 1000);
    const barTimestamp = (Math.floor(tickTimeSeconds / stepSeconds) * stepSeconds) as UTCTimestamp;

    let isNewBar = false;

    if (!this.currentBar || (barTimestamp > this.currentBar.time)) {
      // New candle bar started
      isNewBar = true;
      this.currentBar = {
        time: barTimestamp,
        open: tick.price,
        high: Math.max(tick.price, tick.high || tick.price),
        low: Math.min(tick.price, tick.low || tick.price),
        close: tick.price,
      };
      this.currentVolume = tick.last_trade_qty || 25;
    } else {
      // Update existing candle bar
      this.currentBar = {
        time: this.currentBar.time,
        open: this.currentBar.open,
        high: Math.max(this.currentBar.high, tick.price),
        low: Math.min(this.currentBar.low, tick.price),
        close: tick.price,
      };
      this.currentVolume += tick.last_trade_qty || 15;
    }

    const isUp = this.currentBar.close >= this.currentBar.open;
    const volumeData: HistogramData<UTCTimestamp> = {
      time: this.currentBar.time,
      value: this.currentVolume,
      color: isUp ? 'rgba(16, 185, 129, 0.45)' : 'rgba(239, 68, 68, 0.45)',
    };

    const payload: ChartUpdatePayload = {
      candle: { ...this.currentBar },
      volume: volumeData,
      isNewBar,
      symbol: this.symbol,
      price: tick.price,
    };

    this.listeners.forEach((listener) => {
      try {
        listener(payload);
      } catch (err) {
        console.warn('Error in chart realtime listener', err);
      }
    });
  }
}
