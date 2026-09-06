/**
 * Instrument and Stock Universe Service
 * Connects directly to AuraTrade backend FastAPI /api/v1/instruments.
 * 100% Genuine Data — Zero Mock, Dummy, or Synthetic Fallbacks.
 */

import { apiClient } from './apiClient';
import { 
  BackendInstrument, 
  PaginatedInstruments, 
  MarketIndexSummary, 
  MarketIndexDetail, 
  SyncInstrumentsResponse,
  MarketStatus
} from '../types';

export interface StockQueryParams {
  search?: string;
  index?: string;
  series?: string;
  page?: number;
  page_size?: number;
}

export const instrumentService = {
  /**
   * 1. List & Search Stocks
   * GET /api/v1/instruments/stocks?search={query}&index={index}&series={series}&page={page}&page_size={limit}
   */
  async getStocks(params: StockQueryParams = {}): Promise<PaginatedInstruments> {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.index) queryParams.append('index', params.index);
    if (params.series) queryParams.append('series', params.series);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.page_size) queryParams.append('page_size', params.page_size.toString());

    const res = await apiClient.get<PaginatedInstruments | { data: PaginatedInstruments }>(
      `/instruments/stocks${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );
    
    const payload: any = res.data;
    if (payload && payload.items) {
      return payload as PaginatedInstruments;
    }
    if (payload && payload.data && payload.data.items) {
      return payload.data as PaginatedInstruments;
    }
    throw new Error('Invalid instrument stocks response structure from backend.');
  },

  /**
   * 2. Get Single Stock Details
   * GET /api/v1/instruments/stocks/{symbol}?exchange=NSE
   */
  async getStockBySymbol(symbol: string, exchange: string = 'NSE'): Promise<BackendInstrument> {
    const res = await apiClient.get<BackendInstrument | { data: BackendInstrument }>(
      `/instruments/stocks/${encodeURIComponent(symbol)}?exchange=${encodeURIComponent(exchange)}`
    );
    const payload: any = res.data;
    if (payload && payload.data) return payload.data;
    if (payload && payload.symbol) return payload as BackendInstrument;
    throw new Error(`Stock ${symbol} not found on ${exchange}`);
  },

  /**
   * 3. List All Market Indices
   * GET /api/v1/instruments/indices
   */
  async getIndices(): Promise<MarketIndexSummary[]> {
    const res = await apiClient.get<MarketIndexSummary[] | { data: MarketIndexSummary[] }>(
      '/instruments/indices'
    );
    const payload: any = res.data;
    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray(payload.data)) return payload.data;
    return [];
  },

  /**
   * 4. Get Stocks by Index
   * GET /api/v1/instruments/indices/{index_symbol}/stocks
   */
  async getIndexStocks(indexSymbol: string): Promise<MarketIndexDetail> {
    const res = await apiClient.get<MarketIndexDetail | { data: MarketIndexDetail }>(
      `/instruments/indices/${encodeURIComponent(indexSymbol)}/stocks`
    );
    const payload: any = res.data;
    if (payload && payload.data) return payload.data;
    if (payload && payload.symbol) return payload as MarketIndexDetail;
    throw new Error(`Index constituents for ${indexSymbol} not available from backend.`);
  },

  /**
   * 5. Trigger Data Sync (Admin / Background)
   * POST /api/v1/instruments/sync
   */
  async triggerSync(): Promise<SyncInstrumentsResponse> {
    const res = await apiClient.post<SyncInstrumentsResponse | { data: SyncInstrumentsResponse }>(
      '/instruments/sync'
    );
    const payload: any = res.data;
    if (payload && payload.data) return payload.data;
    if (payload && payload.status) return payload as SyncInstrumentsResponse;
    throw new Error('Instrument sync operation failed.');
  },

  /**
   * 6. Get Market Open/Closed Status & Trading Hours
   * GET /api/v1/instruments/market-status
   */
  async getMarketStatus(): Promise<MarketStatus> {
    const res = await apiClient.get<MarketStatus | { data: MarketStatus }>(
      '/instruments/market-status'
    );
    const payload: any = res.data;
    if (payload && payload.status) return payload as MarketStatus;
    if (payload && payload.data && payload.data.status) return payload.data as MarketStatus;
    throw new Error('Market status endpoint unavailable.');
  }
};
