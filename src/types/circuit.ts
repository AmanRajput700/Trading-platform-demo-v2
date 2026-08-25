/**
 * TypeScript Interfaces for Strategy 0 (Near Upper Circuit Momentum).
 */

export type CircuitAlertTier = 'HIGH_CONFIDENCE' | 'MEDIUM_CONFIDENCE' | 'CIRCUIT_LOCK_WARNING' | 'LOW_RR_WARNING' | 'INFO_ONLY';

export interface CircuitSignalData {
  id: number;
  symbol: string;
  exchange: string;
  direction: 'UPPER' | 'LOWER';
  price_band_pct: number;
  previous_close: number;
  live_price: number;
  change_pct: number;
  circuit_progress_pct: number;
  trigger_price: number;
  stop_loss_price: number;
  target_price: number;
  risk_reward_ratio: number;
  quality_score: number;
  status_label: CircuitAlertTier | string;
  is_tradable: boolean;
  status: 'active' | 'acted_on' | 'skipped' | 'expired';
  first_detected_at: string;
  last_updated_at: string;
  acted_on_at?: string;
}

export interface CircuitLimitItem {
  id: number;
  symbol: string;
  exchange: string;
  series: string;
  price_band_pct: number;
  previous_close: number | null;
  report_date: string;
}
