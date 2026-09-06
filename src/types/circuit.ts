/**
 * TypeScript Interfaces for Strategy 0 (Near Upper Circuit Momentum).
 */

export type CircuitAlertTier = 'HIGH_CONFIDENCE' | 'MEDIUM_CONFIDENCE' | 'CIRCUIT_LOCK_WARNING' | 'LOW_RR_WARNING' | 'INFO_ONLY';

export type CircuitAlertState = 'NORMAL' | 'NEAR_UPPER' | 'AT_UPPER_CIRCUIT' | 'NEAR_LOWER' | 'AT_LOWER_CIRCUIT';

export type RecommendationDirection = 'BUY' | 'SELL_CAUTION';

export interface CircuitSignalData {
  id: number;
  symbol: string;
  exchange: string;
  direction: 'UPPER' | 'LOWER';
  alert_state?: CircuitAlertState | string;
  price_band_pct: number;
  previous_close: number;
  upper_limit?: number;
  lower_limit?: number;
  live_price: number;
  change_pct: number;
  circuit_progress_pct: number;
  trigger_price: number;
  stop_loss_price: number;
  target_price: number;
  risk_reward_ratio: number;
  quality_score: number;
  status_label: CircuitAlertTier | string;
  action_label?: string;
  is_tradable: boolean;
  disclaimer?: string;
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
  upper_limit?: number | null;
  lower_limit?: number | null;
  is_circuit_applicable?: boolean;
  report_date: string;
}

export interface CircuitAuditItem {
  id: number;
  symbol: string;
  exchange: string;
  strategy_date: string;
  timestamp: string;
  direction: 'BUY' | 'SELL_CAUTION';
  state_from: string;
  state_to: string;
  ltp: number;
  trigger_price: number;
  upper_limit: number | null;
  lower_limit: number | null;
  previous_close: number;
  quality_score: number;
  volume_at_trigger: number;
  reason: string | null;
  disclaimer_text: string;
}

export interface CircuitStrategyConfigData {
  default_threshold_pct: number;
  default_hysteresis_pct: number;
  min_quality_score: number;
  min_volume_shares: number;
  stop_loss_progress_pct: number;
  target_progress_pct: number;
  min_rr_ratio: number;
  max_concurrent_signals: number;
  supported_bands: number[];
}
