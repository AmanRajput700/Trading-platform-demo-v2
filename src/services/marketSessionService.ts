/**
 * Market Session & Frozen Snapshot Client Service.
 * Connects to authoritative backend market session state.
 */

import { apiClient } from './apiClient';


export interface MarketSessionInfo {
  is_open: boolean;
  session_type: 'OPEN' | 'CLOSED' | 'PRE_OPEN' | 'POST_CLOSE' | 'WEEKEND' | 'HOLIDAY';
  status_label: string;
  exchange: string;
  timezone: string;
  current_time: string;
  allows_live_ticks: boolean;
  allows_signal_generation: boolean;
  session_close?: string;
  next_session_open?: string;
}

export interface InstrumentSnapshot {
  symbol: string;
  exchange: string;
  price: number;
  close_price: number;
  open_price: number;
  high_price: number;
  low_price: number;
  change_percent: number;
  change_absolute: number;
  volume: number;
  is_frozen: boolean;
  snapshot_timestamp: string;
}

export const marketSessionService = {
  /**
   * Fetch current authoritative market session info (IST).
   */
  async getSessionStatus(): Promise<MarketSessionInfo> {
    try {
      const res = await apiClient.get<{ status: string; data: MarketSessionInfo }>('/market/session-status');
      return res.data.data;
    } catch {
      // Fallback conservative local IST evaluation if backend offline
      const now = new Date();
      const istHours = (now.getUTCHours() + 5) % 24 + (now.getUTCMinutes() + 30 >= 60 ? 1 : 0);
      const istMins = (now.getUTCMinutes() + 30) % 60;
      const day = now.getUTCDay();
      const isWeekend = day === 0 || day === 6;
      const isOpen = !isWeekend && (istHours > 9 || (istHours === 9 && istMins >= 15)) && (istHours < 15 || (istHours === 15 && istMins <= 30));

      return {
        is_open: isOpen,
        session_type: isOpen ? 'OPEN' : isWeekend ? 'WEEKEND' : 'CLOSED',
        status_label: isOpen ? 'LIVE MARKET OPEN' : 'MARKET CLOSED',
        exchange: 'NSE',
        timezone: 'Asia/Kolkata',
        current_time: now.toISOString(),
        allows_live_ticks: isOpen,
        allows_signal_generation: isOpen,
      };
    }
  },

  /**
   * Fetch immutable closing snapshot dictionary for all instruments.
   */
  async getSnapshots(): Promise<Record<string, InstrumentSnapshot>> {
    try {
      const res = await apiClient.get<{ status: string; data: Record<string, InstrumentSnapshot> }>('/market/snapshots');
      return res.data.data || {};
    } catch {
      return {};
    }
  },
};
