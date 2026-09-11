/**
 * Real-Time Price Alerts REST Service Client
 */

import { apiClient } from './apiClient';
import { AlertHistoryResponse, AlertStats, AlertType, PriceAlertData } from '../types/alert';

export const alertService = {
  /**
   * Fetch today's active price alerts
   */
  async getActiveAlerts(alertType?: string, symbol?: string, limit: number = 100): Promise<PriceAlertData[]> {
    try {
      const params = new URLSearchParams();
      if (alertType && alertType !== 'ALL') params.append('alert_type', alertType);
      if (symbol) params.append('symbol', symbol);
      params.append('limit', String(limit));

      const res = await apiClient.get(`/alerts/active?${params.toString()}`);
      return Array.isArray(res?.data) ? res.data : (res?.data?.data || []);
    } catch {
      return [];
    }
  },

  /**
   * Fetch paginated historical alerts with date range and filter criteria
   */
  async getAlertHistory(
    dateFrom?: string,
    dateTo?: string,
    alertType?: string,
    symbol?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<AlertHistoryResponse> {
    try {
      const params = new URLSearchParams();
      if (dateFrom) params.append('date_from', dateFrom);
      if (dateTo) params.append('date_to', dateTo);
      if (alertType && alertType !== 'ALL') params.append('alert_type', alertType);
      if (symbol) params.append('symbol', symbol);
      params.append('limit', String(limit));
      params.append('offset', String(offset));

      const res = await apiClient.get(`/alerts/history?${params.toString()}`);
      return res?.data || { items: [], total: 0, limit, offset };
    } catch {
      return { items: [], total: 0, limit, offset };
    }
  },

  /**
   * Fetch today's alert statistics summary
   */
  async getAlertStats(): Promise<AlertStats> {
    try {
      const res = await apiClient.get('/alerts/stats');
      return res?.data || { total: 0, breakouts: 0, breakdowns: 0, circuit_approaches: 0 };
    } catch {
      return { total: 0, breakouts: 0, breakdowns: 0, circuit_approaches: 0 };
    }
  },

  /**
   * Developer / Demo utility: Simulate an alert
   */
  async simulateAlert(payload: {
    symbol: string;
    alert_type: AlertType;
    trigger_price: number;
    reference_price?: number;
    prev_close?: number;
    change_pct?: number;
    distance_pct?: number;
    volume?: number;
  }): Promise<boolean> {
    try {
      await apiClient.post('/alerts/simulate', payload);
      return true;
    } catch {
      return false;
    }
  }
};
