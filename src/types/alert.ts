/**
 * Real-Time Price Alert Interfaces & Types
 */

export type AlertType = 'PREV_HIGH_BREAKOUT' | 'PREV_LOW_BREAKDOWN' | 'CIRCUIT_APPROACH';

export interface PriceAlertData {
  id: number;
  symbol: string;
  exchange: string;
  alert_type: AlertType;
  trigger_price: number;
  reference_price: number; // Previous Day High, Low, or Upper Circuit Limit
  prev_close?: number;
  change_pct?: number;
  distance_pct?: number; // % above breakout, % below breakdown, or % progress to circuit
  circuit_price?: number;
  volume?: number;
  triggered_at: string;
  // Rolling alert metadata (from backend WS payload)
  rolling_count?: number;  // how many breakouts/breakdowns today for this symbol+type
  is_repeat?: boolean;     // true if this is the 2nd+ breakout/breakdown today
}

export interface AlertStats {
  total: number;
  breakouts: number;
  breakdowns: number;
  circuit_approaches: number;
}

export interface AlertHistoryResponse {
  items: PriceAlertData[];
  total: number;
  limit: number;
  offset: number;
}

export interface AlertFilters {
  alert_type?: AlertType | 'ALL';
  symbol?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
}

export interface AlertSettingsConfig {
  soundEnabled: boolean;
  autoDismissSeconds: number;
  enableBreakouts: boolean;
  enableBreakdowns: boolean;
  enableCircuitApproaches: boolean;
}
