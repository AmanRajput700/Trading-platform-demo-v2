import { apiClient } from './apiClient';

export interface MarketMoverItem {
  symbol: string;
  name: string;
  exchange: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  open: number;
  high: number;
  low: number;
}

export interface MarketMoversResponse {
  timestamp: string;
  market_session: string;
  gainers: MarketMoverItem[];
  losers: MarketMoverItem[];
  volume_leaders: MarketMoverItem[];
}

export const marketMoversService = {
  async getMarketMovers(): Promise<MarketMoversResponse | null> {
    try {
      const res = await apiClient.get<{ status: string; data: MarketMoversResponse }>('/market/movers');
      if (res?.data?.status === 'success' && res?.data?.data) {
        return res.data.data;
      }
      return null;
    } catch (err) {
      console.warn('Failed to fetch real market movers from backend:', err);
      return null;
    }
  }
};
