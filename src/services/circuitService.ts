/**
 * Service client for S0 Near Upper Circuit Momentum Strategy.
 */

import { apiClient } from './apiClient';
import { CircuitAuditItem, CircuitLimitItem, CircuitSignalData, CircuitStrategyConfigData } from '../types/circuit';

export const circuitService = {
  /**
   * Fetch active Strategy 0 signals, optionally filtered by direction
   */
  async getActiveSignals(direction?: string): Promise<CircuitSignalData[]> {
    try {
      const params = new URLSearchParams();
      if (direction) params.append('direction', direction);
      const res = await apiClient.get(`/circuit/watch/active?${params.toString()}`);
      return res?.data?.data || [];
    } catch {
      return [];
    }
  },

  /**
   * Fetch all signals for a date, optionally filtered by status and direction
   */
  async getAllSignals(dateStr?: string, statusFilter?: string, direction?: string): Promise<CircuitSignalData[]> {
    try {
      const params = new URLSearchParams();
      if (dateStr) params.append('strategy_date', dateStr);
      if (statusFilter) params.append('status_filter', statusFilter);
      if (direction) params.append('direction', direction);
      const res = await apiClient.get(`/circuit/watch?${params.toString()}`);
      return res?.data?.data || [];
    } catch {
      return [];
    }
  },

  /**
   * Fetch price band universe limits (all or filtered by band)
   */
  async getCircuitLimits(bandPct?: number, series: string = 'EQ'): Promise<CircuitLimitItem[]> {
    try {
      const params = new URLSearchParams();
      if (bandPct !== undefined && bandPct !== null) params.append('band_pct', String(bandPct));
      if (series) params.append('series', series);
      const res = await apiClient.get(`/circuit/limits?${params.toString()}`);
      return res?.data?.data || [];
    } catch {
      return [];
    }
  },

  /**
   * Upload NSE Price Band CSV file
   */
  async uploadLimitsCsv(file: File, reportDate?: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    if (reportDate) formData.append('report_date', reportDate);
    const res = await apiClient.post('/circuit/limits/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res?.data;
  },

  /**
   * Manually trigger Engine 2 universe sweep
   */
  async triggerUniverseSweep(): Promise<any> {
    const res = await apiClient.post('/circuit/strategy/run');
    return res?.data;
  },

  /**
   * Update signal status (acted_on or skipped)
   */
  async updateSignalAction(signalId: number, action: 'acted_on' | 'skipped' | 'expired'): Promise<any> {
    const res = await apiClient.patch(`/circuit/watch/${signalId}/action?action=${action}`);
    return res?.data;
  },

  /**
   * Fetch compliance recommendation audit trail
   */
  async getRecommendationAudits(dateStr?: string, symbol?: string, direction?: string, limit: number = 100): Promise<CircuitAuditItem[]> {
    try {
      const params = new URLSearchParams();
      if (dateStr) params.append('strategy_date', dateStr);
      if (symbol) params.append('symbol', symbol);
      if (direction) params.append('direction', direction);
      params.append('limit', String(limit));
      const res = await apiClient.get(`/circuit/recommendations/audit?${params.toString()}`);
      return res?.data?.data || [];
    } catch {
      return [];
    }
  },

  /**
   * Fetch strategy configurable parameters
   */
  async getStrategyConfig(): Promise<CircuitStrategyConfigData | null> {
    try {
      const res = await apiClient.get('/circuit/config');
      return res?.data?.config || null;
    } catch {
      return null;
    }
  },

  /**
   * Update strategy parameters (threshold_pct, hysteresis_pct, min_volume)
   */
  async updateStrategyConfig(thresholdPct?: number, hysteresisPct?: number, minVolume?: number): Promise<any> {
    const params = new URLSearchParams();
    if (thresholdPct !== undefined) params.append('threshold_pct', String(thresholdPct));
    if (hysteresisPct !== undefined) params.append('hysteresis_pct', String(hysteresisPct));
    if (minVolume !== undefined) params.append('min_volume', String(minVolume));
    const res = await apiClient.put(`/circuit/config?${params.toString()}`);
    return res?.data;
  },

  /**
   * Update stock circuit limit mid-session
   */
  async updateIntradayLimit(symbol: string, newBandPct: number, newUpperLimit?: number, newLowerLimit?: number): Promise<any> {
    const params = new URLSearchParams();
    params.append('symbol', symbol);
    params.append('new_band_pct', String(newBandPct));
    if (newUpperLimit !== undefined) params.append('new_upper_limit', String(newUpperLimit));
    if (newLowerLimit !== undefined) params.append('new_lower_limit', String(newLowerLimit));
    const res = await apiClient.post(`/circuit/limits/update-intraday?${params.toString()}`);
    return res?.data;
  },
};
