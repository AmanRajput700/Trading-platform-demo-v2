import { apiClient } from './apiClient';


export interface OrderPlacePayload {
  client_order_id?: string;
  symbol: string;
  exchange: 'NSE' | 'BSE';
  transaction_type: 'BUY' | 'SELL';
  order_type: 'MARKET' | 'LIMIT' | 'SL' | 'SL-M';
  product_type: 'MIS' | 'CNC';
  validity?: 'DAY' | 'IOC';
  quantity: number;
  disclosed_quantity?: number;
  price?: number;
  trigger_price?: number;
  source?: 'MANUAL' | 'STRATEGY' | 'API' | 'SYSTEM';
  strategy_id?: string;
  strategy_name?: string;
  signal_id?: number;
  is_amo?: boolean;
  tag?: string;
}

export interface OrderEventItem {
  id: string;
  order_id: string;
  event_type: string;
  previous_status?: string;
  new_status: string;
  filled_delta: number;
  fill_price?: number;
  message?: string;
  broker_response_payload?: any;
  created_at: string;
}

export interface TradeItem {
  id: string;
  broker_trade_id: string;
  broker_order_id: string;
  order_id: string;
  symbol: string;
  exchange: string;
  transaction_type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  trade_value: number;
  brokerage_charges: number;
  exchange_timestamp?: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  client_order_id: string;
  broker_order_id?: string;
  broker_type: string;
  symbol: string;
  instrument_key: string;
  exchange: string;
  transaction_type: 'BUY' | 'SELL';
  order_type: 'MARKET' | 'LIMIT' | 'SL' | 'SL-M';
  product_type: 'MIS' | 'CNC';
  validity: 'DAY' | 'IOC';
  quantity: number;
  filled_quantity: number;
  remaining_quantity: number;
  disclosed_quantity: number;
  price?: number;
  trigger_price?: number;
  average_price?: number;
  status: string;
  rejection_reason?: string;
  cancellation_reason?: string;
  source: string;
  strategy_id?: string;
  strategy_name?: string;
  signal_id?: number;
  is_amo: boolean;
  created_at: string;
  submitted_at?: string;
  filled_at?: string;
  cancelled_at?: string;
  events?: OrderEventItem[];
  trades?: TradeItem[];
}

export interface PositionItem {
  id: string;
  symbol: string;
  exchange: string;
  product_type: 'MIS' | 'CNC';
  quantity: number;
  buy_quantity: number;
  sell_quantity: number;
  buy_avg_price: number;
  sell_avg_price: number;
  last_price: number;
  realized_pnl: number;
  unrealized_pnl: number;
  status: string;
  last_synced_at: string;
}

export interface HoldingItem {
  id: string;
  symbol: string;
  exchange: string;
  isin?: string;
  quantity: number;
  t1_quantity: number;
  collateral_quantity: number;
  avg_buy_price: number;
  current_price: number;
  invested_value: number;
  current_value: number;
  pnl: number;
  pnl_percent: number;
  last_synced_at: string;
}

export const orderService = {
  async placeOrder(payload: OrderPlacePayload): Promise<OrderItem> {
    const resp = await apiClient.post<OrderItem>('/orders/place', payload);
    return resp.data;
  },

  async cancelOrder(orderId: string): Promise<OrderItem> {
    const resp = await apiClient.post<OrderItem>(`/orders/${orderId}/cancel`);
    return resp.data;
  },

  async modifyOrder(orderId: string, updates: { price?: number; quantity?: number; trigger_price?: number }): Promise<OrderItem> {
    const resp = await apiClient.put<OrderItem>(`/orders/${orderId}/modify`, updates);
    return resp.data;
  },

  async getOrders(params?: { status?: string; symbol?: string; limit?: number; offset?: number }): Promise<OrderItem[]> {
    const resp = await apiClient.get<OrderItem[]>('/orders', { params });
    return resp.data;
  },

  async getOrderById(orderId: string): Promise<OrderItem> {
    const resp = await apiClient.get<OrderItem>(`/orders/${orderId}`);
    return resp.data;
  },

  async getTrades(params?: { symbol?: string; limit?: number }): Promise<TradeItem[]> {
    const resp = await apiClient.get<TradeItem[]>('/orders/history/trades', { params });
    return resp.data;
  },

  async getPositions(): Promise<PositionItem[]> {
    const resp = await apiClient.get<PositionItem[]>('/orders/portfolio/positions');
    return resp.data;
  },

  async getHoldings(): Promise<HoldingItem[]> {
    const resp = await apiClient.get<HoldingItem[]>('/orders/portfolio/holdings');
    return resp.data;
  },
};
