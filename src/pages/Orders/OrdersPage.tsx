import React, { useState, useEffect } from 'react';
import { 
  Search, 
  X, 
  Edit3, 
  RotateCcw, 
  Plus,
  RefreshCw,
  CheckCircle2,
  Compass,
  Zap
} from 'lucide-react';
import { useTrading } from '../../context/TradingContext';
import { OrderSide, ProductType, Order } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { BrokerEmptyState } from '../../components/common/BrokerEmptyState';

function getTimeAgo(date: Date | null): string {
  if (!date) return 'Just now';
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSec < 5) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  return `${diffHr}h ago`;
}

interface OrdersConnectedEmptyProps {
  isSyncing: boolean;
  lastSynced: Date | null;
  onSync: () => void;
  onNewOrder: () => void;
  onMarket: () => void;
}

const OrdersConnectedEmpty: React.FC<OrdersConnectedEmptyProps> = ({
  isSyncing,
  lastSynced,
  onSync,
  onNewOrder,
  onMarket
}) => {
  return (
    <div
      className="surface-card"
      style={{
        padding: '48px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 'var(--space-4)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, rgba(34, 197, 94, 0.03) 0%, var(--bg-surface) 100%)'
      }}
    >
      {/* Top Emerald Glow Line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '360px',
          height: '2px',
          background: 'linear-gradient(90deg, transparent, var(--positive), transparent)'
        }}
      />

      {/* DMA Status Pill */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '3px 10px',
          borderRadius: 14,
          backgroundColor: 'rgba(34, 197, 94, 0.12)',
          border: '1px solid rgba(34, 197, 94, 0.25)',
          color: 'var(--positive)',
          fontSize: 10.5,
          fontWeight: 700,
          letterSpacing: '0.04em'
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: 'var(--positive)',
            boxShadow: '0 0 6px var(--positive)'
          }}
        />
        UPSTOX PRO LIVE — DMA GATEWAY ACTIVE
      </div>

      {/* Center Checkmark Icon */}
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 4,
          boxShadow: '0 0 20px rgba(34, 197, 94, 0.15)'
        }}
      >
        <CheckCircle2 size={28} style={{ color: 'var(--positive)' }} />
      </div>

      {/* Headings */}
      <div style={{ maxWidth: 480 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
          No Orders Placed Today
        </h3>
        <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
          Your Upstox Pro Direct Market Access (DMA) terminal is listening. Orders placed via the quick order ticket, market depth, or strategy triggers will appear here in real time.
        </p>
      </div>

      {/* Last Synced & Sync Now */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 11,
          color: 'var(--text-muted)'
        }}
      >
        <span>Last synced: <span className="mono text-secondary">{getTimeAgo(lastSynced)}</span></span>
        <span>•</span>
        <button
          onClick={onSync}
          disabled={isSyncing}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            color: 'var(--accent-primary)',
            cursor: isSyncing ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 11,
            fontWeight: 600
          }}
          title="Refresh orders from Upstox"
        >
          <RefreshCw size={11} className={isSyncing ? 'animate-spin' : ''} />
          <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
        </button>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 10, marginTop: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={onNewOrder}
          className="btn btn-primary btn-sm"
          style={{ gap: 6, fontWeight: 700, padding: '7px 16px' }}
        >
          <Plus size={14} />
          <span>Place New Order</span>
        </button>
        <button
          onClick={onMarket}
          className="btn btn-secondary btn-sm"
          style={{ gap: 6, fontWeight: 600, padding: '7px 16px' }}
        >
          <Compass size={14} />
          <span>View Market</span>
        </button>
      </div>

      {/* Live Sync Info Strip */}
      <div
        style={{
          marginTop: 12,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 14px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--bg-sunken)',
          border: '1px solid var(--border-default)',
          fontSize: 11,
          color: 'var(--text-tertiary)'
        }}
      >
        <Zap size={12} style={{ color: 'var(--positive)' }} />
        <span>Live order book synchronizes directly with Upstox API. Zero artificial / mock data is injected.</span>
      </div>
    </div>
  );
};

export const OrdersPage: React.FC = () => {
  const { 
    orders, 
    cancelOrder, 
    updateOrder, 
    navigateToInstrument, 
    openQuickOrder, 
    setSelectedOrderForDetails,
    syncBrokerData,
    brokerState,
    addToast,
    setIsSearchOpen,
    setCurrentPage
  } = useTrading();

  const [activeTab, setActiveTab] = useState<'ALL' | 'OPEN' | 'EXECUTED' | 'GTT' | 'CANCELLED'>('OPEN');
  const [productFilter, setProductFilter] = useState<'ALL' | ProductType>('ALL');
  const [sideFilter, setSideFilter] = useState<'ALL' | OrderSide>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [, setTick] = useState(0);

  // Auto-sync on mount when broker is connected (silent background sync)
  useEffect(() => {
    if (brokerState === 'Connected') {
      if (typeof syncBrokerData === 'function') {
        syncBrokerData()
          .then(() => setLastSyncedAt(new Date()))
          .catch(() => {});
      } else {
        setLastSyncedAt(new Date());
      }
    }
  }, [brokerState]);

  // Periodic interval to keep "X seconds ago" fresh every 15s
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 15000);
    return () => clearInterval(interval);
  }, []);

  const handleSyncOrders = async () => {
    setIsSyncing(true);
    try {
      if (typeof syncBrokerData === 'function') {
        await syncBrokerData();
      }
      setLastSyncedAt(new Date());
      addToast({
        type: 'success',
        title: 'Order Book Synced',
        message: 'Refreshed active order book and execution statuses directly from Upstox.'
      });
    } catch {
      addToast({
        type: 'warning',
        title: 'Sync Notice',
        message: 'Failed to synchronize orders from broker.'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Modify Order Modal State
  const [modifyingOrder, setModifyingOrder] = useState<Order | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editQty, setEditQty] = useState<number>(0);

  // Filter calculations
  const openOrdersCount = orders.filter(o => o.status === 'PENDING' || o.status === 'SUBMITTED').length;
  const executedOrdersCount = orders.filter(o => o.status === 'FILLED').length;
  const cancelledOrdersCount = orders.filter(o => o.status === 'CANCELLED' || o.status === 'REJECTED').length;
  const totalTurnover = orders
    .filter(o => o.status === 'FILLED')
    .reduce((acc, o) => acc + (o.avgPrice || o.price) * o.quantity, 0);

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'OPEN' && order.status !== 'PENDING' && order.status !== 'SUBMITTED') return false;
    if (activeTab === 'EXECUTED' && order.status !== 'FILLED') return false;
    if (activeTab === 'CANCELLED' && order.status !== 'CANCELLED' && order.status !== 'REJECTED') return false;
    if (activeTab === 'GTT' && order.orderType !== 'LIMIT' && order.status !== 'PENDING') return false;
    
    if (productFilter !== 'ALL' && order.product !== productFilter) return false;
    if (sideFilter !== 'ALL' && order.side !== sideFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!order.symbol.toLowerCase().includes(q) && !order.id.toLowerCase().includes(q) && !order.name.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  const handleOpenModify = (order: Order) => {
    setModifyingOrder(order);
    setEditPrice(order.price);
    setEditQty(order.quantity);
  };

  const handleSaveModify = (e: React.FormEvent) => {
    e.preventDefault();
    if (modifyingOrder) {
      updateOrder(modifyingOrder.id, {
        price: Number(editPrice),
        quantity: Number(editQty)
      });
      setModifyingOrder(null);
    }
  };

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 1300, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      {/* Header - Always visible */}
      <PageHeader
        title="Orders & Execution Book"
        subtitle="Motilal Oswal style order lifecycle management, open limit tickets, fills & trade audit"
        badge={{ text: `MO Trader`, variant: 'accent' }}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleSyncOrders}
              disabled={isSyncing}
              className="btn btn-secondary btn-sm"
              style={{ gap: 6, fontWeight: 600 }}
              title="Sync orders directly with Upstox"
            >
              <RefreshCw size={13} className={isSyncing || brokerState === 'Syncing' ? 'animate-spin' : ''} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Broker'}</span>
            </button>
            <button
              onClick={() => setIsSearchOpen(true)}
              className="btn btn-primary btn-sm"
              style={{ gap: 6, fontWeight: 700 }}
              title="Search instrument to place order"
            >
              <Plus size={14} />
              <span>Place New Order</span>
            </button>
          </div>
        }
      />

      {/* CASE A: Not Connected -> Full page broker empty state */}
      {brokerState !== 'Connected' ? (
        <BrokerEmptyState type="orders" />
      ) : (
        <>
          {/* Connection Status Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'rgba(34, 197, 94, 0.06)',
            border: '1px solid rgba(34, 197, 94, 0.2)',
            borderRadius: 'var(--radius-md)',
            padding: '8px 14px',
            fontSize: 11.5,
            flexWrap: 'wrap',
            gap: 8
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '2px 8px',
                borderRadius: 12,
                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                color: 'var(--positive)',
                fontWeight: 700,
                fontSize: 10.5,
                letterSpacing: '0.04em'
              }}>
                <span style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: 'var(--positive)',
                  boxShadow: '0 0 6px var(--positive)'
                }} />
                UPSTOX PRO LIVE
              </span>
              <span className="text-secondary" style={{ fontSize: 11 }}>
                Direct Market Access (DMA) Session Active · Real-time Order Stream
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span className="text-muted" style={{ fontSize: 11 }}>
                Synced {getTimeAgo(lastSyncedAt)}
              </span>
              <button
                onClick={handleSyncOrders}
                disabled={isSyncing}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: 'var(--positive)',
                  cursor: isSyncing ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 11,
                  fontWeight: 600
                }}
                title="Synchronize orders with Upstox"
              >
                <RefreshCw size={11} className={isSyncing ? 'animate-spin' : ''} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
              </button>
            </div>
          </div>

          {/* Motilal Oswal Summary Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-4)'
          }}>
            <div className="surface-card" style={{ padding: '12px 16px' }}>
              <div className="text-secondary" style={{ fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase' }}>
                Open / Pending Orders
              </div>
              <div className="mono" style={{ fontSize: 20, fontWeight: 700, marginTop: 3, color: openOrdersCount > 0 ? 'var(--warning)' : 'var(--text-primary)' }}>
                {openOrdersCount} Orders
              </div>
              <div className="text-muted" style={{ fontSize: 10, marginTop: 2 }}>
                Awaiting limit match / trigger
              </div>
            </div>

            <div className="surface-card" style={{ padding: '12px 16px' }}>
              <div className="text-secondary" style={{ fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase' }}>
                Executed Fills Today
              </div>
              <div className="mono text-positive" style={{ fontSize: 20, fontWeight: 700, marginTop: 3 }}>
                {executedOrdersCount} Completed
              </div>
              <div className="text-muted" style={{ fontSize: 10, marginTop: 2 }}>
                Direct DMA confirmed fills
              </div>
            </div>

            <div className="surface-card" style={{ padding: '12px 16px' }}>
              <div className="text-secondary" style={{ fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase' }}>
                Today's Traded Turnover
              </div>
              <div className="mono" style={{ fontSize: 20, fontWeight: 700, marginTop: 3 }}>
                ₹{totalTurnover.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-muted" style={{ fontSize: 10, marginTop: 2 }}>
                Calculated across all executed legs
              </div>
            </div>

            <div className="surface-card" style={{ padding: '12px 16px' }}>
              <div className="text-secondary" style={{ fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase' }}>
                Cancelled / Rejected
              </div>
              <div className="mono text-secondary" style={{ fontSize: 20, fontWeight: 700, marginTop: 3 }}>
                {cancelledOrdersCount} Orders
              </div>
              <div className="text-muted" style={{ fontSize: 10, marginTop: 2 }}>
                User cancelled or RMS filtered
              </div>
            </div>
          </div>

          {/* CASE B: Connected + 0 orders */}
          {orders.length === 0 ? (
            <OrdersConnectedEmpty
              isSyncing={isSyncing}
              lastSynced={lastSyncedAt}
              onSync={handleSyncOrders}
              onNewOrder={() => setIsSearchOpen(true)}
              onMarket={() => setCurrentPage('market')}
            />
          ) : (
            /* CASE C: Connected + has orders */
            <>
              {/* Filter and Tab Bar (MO Style) */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                padding: '8px 12px',
                flexWrap: 'wrap',
                gap: 10
              }}>
                {/* Motilal Oswal Sub-Tabs */}
                <div style={{ display: 'flex', gap: 4, overflowX: 'auto' }}>
                  {([
                    { id: 'OPEN', label: `Open (${openOrdersCount})` },
                    { id: 'EXECUTED', label: `Executed (${executedOrdersCount})` },
                    { id: 'GTT', label: 'GTT / Triggers' },
                    { id: 'CANCELLED', label: `Cancelled (${cancelledOrdersCount})` },
                    { id: 'ALL', label: `All Orders (${orders.length})` }
                  ] as const).map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      style={{
                        padding: '5px 12px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: 11.5,
                        fontWeight: activeTab === tab.id ? 700 : 500,
                        backgroundColor: activeTab === tab.id ? 'var(--text-primary)' : 'transparent',
                        color: activeTab === tab.id ? '#FFFFFF' : 'var(--text-secondary)',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 120ms ease',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Dropdown Filters & Search */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
                    <span className="text-secondary">Side:</span>
                    <select
                      value={sideFilter}
                      onChange={e => setSideFilter(e.target.value as any)}
                      className="select"
                      style={{ height: 28, fontSize: 11 }}
                    >
                      <option value="ALL">All Sides</option>
                      <option value="BUY">BUY</option>
                      <option value="SELL">SELL</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
                    <span className="text-secondary">Product:</span>
                    <select
                      value={productFilter}
                      onChange={e => setProductFilter(e.target.value as any)}
                      className="select"
                      style={{ height: 28, fontSize: 11 }}
                    >
                      <option value="ALL">All Products</option>
                      <option value="CNC">CNC (Delivery)</option>
                      <option value="MIS">MIS (Intraday)</option>
                      <option value="NRML">NRML (F&O)</option>
                    </select>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    backgroundColor: 'var(--bg-sunken)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0 8px',
                    height: 28
                  }}>
                    <Search size={13} style={{ color: 'var(--text-tertiary)' }} />
                    <input
                      type="text"
                      placeholder="Search scrip or order ID..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      style={{
                        border: 'none',
                        outline: 'none',
                        fontSize: 11,
                        backgroundColor: 'transparent',
                        color: 'var(--text-primary)',
                        width: 170
                      }}
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          color: 'var(--text-tertiary)'
                        }}
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Motilal Oswal Orders Table */}
              <div className="surface-card" style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Time / Order No</th>
                      <th>Scrip / Instrument</th>
                      <th>Side</th>
                      <th>Type</th>
                      <th>Product</th>
                      <th className="text-right">Qty (Filled / Total)</th>
                      <th className="text-right">Order Price (₹)</th>
                      <th className="text-right">Avg. Traded (₹)</th>
                      <th>Status</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={10} style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-secondary)' }}>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>No orders found</div>
                          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
                            {searchQuery ? 'No orders match your search criteria.' : activeTab === 'OPEN' ? 'You have no open pending orders.' : 'No orders recorded in this category.'}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map(order => {
                        const isBuy = order.side === 'BUY';
                        const isFilled = order.status === 'FILLED';
                        const isPending = order.status === 'PENDING' || order.status === 'SUBMITTED';

                        return (
                          <tr key={order.id} style={{ cursor: 'pointer' }}>
                            {/* Time & ID */}
                            <td onClick={() => setSelectedOrderForDetails(order)}>
                              <div className="mono" style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-primary)' }}>
                                {order.timestamp}
                              </div>
                              <div className="mono text-muted" style={{ fontSize: 10 }}>
                                {order.id}
                              </div>
                            </td>

                            {/* Scrip */}
                            <td onClick={() => setSelectedOrderForDetails(order)}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span 
                                  onClick={e => {
                                    e.stopPropagation();
                                    navigateToInstrument(order.symbol);
                                  }}
                                  style={{ fontWeight: 700, fontSize: 13, color: 'var(--accent-primary)', cursor: 'pointer' }}
                                >
                                  {order.symbol}
                                </span>
                                <span className="badge badge-neutral" style={{ fontSize: 9 }}>{order.exchange}</span>
                              </div>
                              <div style={{ fontSize: 10.5, color: 'var(--text-secondary)' }}>{order.name}</div>
                            </td>

                            {/* Side */}
                            <td onClick={() => setSelectedOrderForDetails(order)}>
                              <span className={`badge ${isBuy ? 'badge-positive' : 'badge-negative'}`} style={{ fontWeight: 700 }}>
                                {order.side}
                              </span>
                            </td>

                            {/* Type */}
                            <td className="mono" style={{ fontSize: 11 }} onClick={() => setSelectedOrderForDetails(order)}>
                              {order.orderType}
                            </td>

                            {/* Product */}
                            <td onClick={() => setSelectedOrderForDetails(order)}>
                              <span className="badge badge-neutral" style={{ fontSize: 9.5 }}>
                                {order.product === 'CNC' ? 'CNC (Delivery)' : order.product === 'MIS' ? 'MIS (Intraday)' : 'NRML'}
                              </span>
                            </td>

                            {/* Qty */}
                            <td className="text-right mono" style={{ fontWeight: 700 }} onClick={() => setSelectedOrderForDetails(order)}>
                              {isFilled ? `${order.quantity} / ${order.quantity}` : isPending ? `0 / ${order.quantity}` : `0 / ${order.quantity}`}
                            </td>

                            {/* Order Price */}
                            <td className="text-right mono" style={{ fontWeight: 600 }} onClick={() => setSelectedOrderForDetails(order)}>
                              ₹{order.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>

                            {/* Avg Traded Price */}
                            <td className="text-right mono" style={{ fontWeight: 600 }} onClick={() => setSelectedOrderForDetails(order)}>
                              {order.avgPrice ? `₹${order.avgPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                            </td>

                            {/* Status */}
                            <td onClick={() => setSelectedOrderForDetails(order)}>
                              <span className={`badge ${isFilled ? 'badge-positive' : isPending ? 'badge-warning' : 'badge-neutral'}`} style={{ fontWeight: 600 }}>
                                {order.status === 'FILLED' ? 'Completed' : order.status === 'PENDING' ? 'Open Limit' : order.status}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="text-right" style={{ whiteSpace: 'nowrap' }}>
                              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                                {isPending ? (
                                  <>
                                    <button
                                      onClick={() => handleOpenModify(order)}
                                      className="btn btn-secondary btn-sm"
                                      style={{ height: 24, padding: '0 8px', fontSize: 10.5, gap: 3 }}
                                      title="Modify Limit Price / Qty"
                                    >
                                      <Edit3 size={11} />
                                      <span>Modify</span>
                                    </button>
                                    <button
                                      onClick={() => cancelOrder(order.id)}
                                      className="btn btn-ghost btn-sm text-negative"
                                      style={{ height: 24, padding: '0 8px', fontSize: 10.5, border: '1px solid var(--negative-border)' }}
                                      title="Cancel Order"
                                    >
                                      Cancel
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => setSelectedOrderForDetails(order)}
                                      className="btn btn-secondary btn-sm"
                                      style={{ height: 24, padding: '0 6px', fontSize: 10.5 }}
                                      title="View Order Journey Timeline"
                                    >
                                      Timeline
                                    </button>
                                    <button
                                      onClick={() => openQuickOrder({
                                        symbol: order.symbol,
                                        name: order.name,
                                        side: order.side,
                                        price: order.price,
                                        initialQty: order.quantity
                                      })}
                                      className="btn btn-secondary btn-sm"
                                      style={{ height: 24, padding: '0 8px', fontSize: 10.5, gap: 3 }}
                                      title="Repeat Order"
                                    >
                                      <RotateCcw size={11} />
                                      <span>Repeat</span>
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}

      {/* Motilal Oswal Modify Order Modal */}
      {modifyingOrder && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(11, 14, 20, 0.75)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 115,
          padding: 'var(--space-4)'
        }}>
          <div style={{
            width: '100%',
            maxWidth: 420,
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-modal)',
            padding: '18px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-default)', paddingBottom: 10 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Modify Order Ticket</h3>
                <div className="mono text-secondary" style={{ fontSize: 11 }}>
                  {modifyingOrder.symbol} ({modifyingOrder.side} · {modifyingOrder.product})
                </div>
              </div>
              <button
                onClick={() => setModifyingOrder(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveModify} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>
                  QUANTITY (SHARES)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={editQty}
                  onChange={e => setEditQty(Number(e.target.value))}
                  className="input mono"
                  style={{ width: '100%', height: 34 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>
                  LIMIT PRICE (₹)
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0.05"
                  required
                  value={editPrice}
                  onChange={e => setEditPrice(Number(e.target.value))}
                  className="input mono"
                  style={{ width: '100%', height: 34 }}
                />
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                <button
                  type="button"
                  onClick={() => setModifyingOrder(null)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1.2, fontWeight: 700 }}
                >
                  Confirm Modification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
