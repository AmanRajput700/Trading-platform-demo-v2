/**
 * Service client for S0 Near Upper Circuit Momentum Strategy.
 */

import { apiClient } from './apiClient';
import { CircuitLimitItem, CircuitSignalData } from '../types/circuit';

export const circuitService = {
  /**
   * Fetch active Strategy 0 signals
   */
  async getActiveSignals(): Promise<CircuitSignalData[]> {
    try {
      const res = await apiClient.get('/circuit/watch/active');
      return res?.data?.data || [];
    } catch {
      return [];
    }
  },

  /**
   * Fetch all signals for a date
   */
  async getAllSignals(dateStr?: string, statusFilter?: string): Promise<CircuitSignalData[]> {
    try {
      const params = new URLSearchParams();
      if (dateStr) params.append('strategy_date', dateStr);
      if (statusFilter) params.append('status_filter', statusFilter);
      const res = await apiClient.get(`/circuit/watch?${params.toString()}`);
      return res?.data?.data || [];
    } catch {
      return [];
    }
  },

  /**
   * Fetch 10% price band universe limits
   */
  async getCircuitLimits(bandPct: number = 10.0, series: string = 'EQ'): Promise<CircuitLimitItem[]> {
    try {
      const res = await apiClient.get(`/circuit/limits?band_pct=${bandPct}&series=${series}`);
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
};
