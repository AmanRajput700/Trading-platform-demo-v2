import { apiClient } from './apiClient';

export interface OptionGreekData {
  instrumentKey: string;
  ltp: number;
  change: number;
  changePercent: number;
  oi: number;
  volume: number;
  iv: number;
  delta: number;
  theta: number;
  gamma: number;
  vega: number;
}

export interface OptionChainContract {
  strike: number;
  expiry: string;
  spotPrice: number;
  call: OptionGreekData;
  put: OptionGreekData;
}

export interface OptionChainResponse {
  symbol: string;
  spotPrice: number;
  totalCallOI: number;
  totalPutOI: number;
  totalCallVolume: number;
  totalPutVolume: number;
  pcr: number;
  maxPain: number;
  contracts: OptionChainContract[];
}

export const optionChainService = {
  async getOptionChain(symbol: string, expiry?: string): Promise<OptionChainResponse | null> {
    try {
      const encoded = encodeURIComponent(symbol);
      const url = expiry ? `/market/option-chain/${encoded}?expiry=${encodeURIComponent(expiry)}` : `/market/option-chain/${encoded}`;
      const res = await apiClient.get<{ status: string; data: OptionChainResponse }>(url);
      if (res?.data?.status === 'success' && res?.data?.data) {
        return res.data.data;
      }
      return null;
    } catch (err) {
      console.warn('Failed to fetch option chain from backend:', err);
      return null;
    }
  }
};
