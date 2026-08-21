import React, { useState } from 'react';
import { 
  Search
} from 'lucide-react';
import { useTrading } from '../../context/TradingContext';
import { OrderStatus, OrderSide } from '../../types';

import { PageHeader } from '../../components/common/PageHeader';
import { X } from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const { orders, cancelOrder, navigateToInstrument, openQuickOrder, setSelectedOrderForDetails } = useTrading();
  const [activeTab, setActiveTab] = useState<'ALL' | 'OPEN' | 'EXECUTED'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | OrderStatus>('ALL');
  const [sideFilter, setSideFilter] = useState<'ALL' | OrderSide>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'OPEN' && order.status !== 'PENDING' && order.status !== 'SUBMITTED') return false;
    if (activeTab === 'EXECUTED' && order.status !== 'FILLED' && order.status !== 'CANCELLED') return false;
    if (statusFilter !== 'ALL' && order.status !== statusFilter) return false;
    if (sideFilter !== 'ALL' && order.side !== sideFilter) return false;
    if (searchQuery && !order.symbol.toLowerCase().includes(searchQuery.toLowerCase()) && !order.id.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 1280, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      {/* Header */}
      <PageHeader
        title="Orders & Execution Log"
        subtitle="Real-time simulated order status, fills, open orders & cancellation"
        badge={{ text: `${orders.length} Total`, variant: 'accent' }}
      />

      {/* Filter and Tab Bar */}
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
        {/* Main Tabs */}
        <div style={{ display: 'flex', gap: 4 }}>
          {(['ALL', 'OPEN', 'EXECUTED'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 11,
                fontWeight: activeTab === tab ? 600 : 500,
                backgroundColor: activeTab === tab ? 'var(--text-primary)' : 'transparent',
                color: activeTab === tab ? '#FFFFFF' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {tab === 'ALL' ? `All Orders (${orders.length})` : tab === 'OPEN' ? 'Open Orders' : 'Executed / History'}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
            <span className="text-secondary">Side:</span>
            <select
              value={sideFilter}
              onChange={(e) => setSideFilter(e.target.value as any)}
              className="select"
              style={{ height: 28, fontSize: 11 }}
            >
              <option value="ALL">All Sides</option>
              <option value="BUY">Buy</option>
              <option value="SELL">Sell</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
            <span className="text-secondary">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="select"
              style={{ height: 28, fontSize: 11 }}
            >
              <option value="ALL">All Statuses</option>
              <option value="FILLED">Filled</option>
              <option value="PENDING">Pending</option>
              <option value="CANCELLED">Cancelled</option>
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
              placeholder="Search order ID or symbol..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
                title="Clear search"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="surface-card" style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Time / Order ID</th>
              <th>Instrument</th>
              <th>Side</th>
              <th>Type</th>
              <th>Product</th>
              <th className="text-right">Qty</th>
              <th className="text-right">Price (₹)</th>
              <th>Status</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-secondary)' }}>
                  No orders found matching the filter criteria.
                </td>
              </tr>
            ) : (
              filteredOrders.map(order => {
                const isBuy = order.side === 'BUY';
                const isFilled = order.status === 'FILLED';
                const isPending = order.status === 'PENDING' || order.status === 'SUBMITTED';

                return (
                  <tr key={order.id} style={{ cursor: 'pointer' }}>
                    <td onClick={() => setSelectedOrderForDetails(order)}>
                      <div className="mono" style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent-primary)' }}>{order.timestamp}</div>
                      <div className="mono text-muted" style={{ fontSize: 10 }}>{order.id}</div>
                    </td>

                    <td onClick={() => setSelectedOrderForDetails(order)}>
                      <span 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateToInstrument(order.symbol);
                        }}
                        style={{ fontWeight: 600, fontSize: 12.5, cursor: 'pointer', color: 'var(--accent-primary)' }}
                      >
                        {order.symbol}
                      </span>
                      <span className="badge badge-neutral" style={{ fontSize: 9, marginLeft: 4 }}>{order.exchange}</span>
                    </td>

                    <td onClick={() => setSelectedOrderForDetails(order)}>
                      <span className={`badge ${isBuy ? 'badge-positive' : 'badge-negative'}`}>
                        {order.side}
                      </span>
                    </td>

                    <td className="mono" style={{ fontSize: 11 }} onClick={() => setSelectedOrderForDetails(order)}>
                      {order.orderType}
                    </td>

                    <td onClick={() => setSelectedOrderForDetails(order)}>
                      <span className="badge badge-neutral" style={{ fontSize: 9 }}>
                        {order.product}
                      </span>
                    </td>

                    <td className="text-right mono" style={{ fontWeight: 600 }} onClick={() => setSelectedOrderForDetails(order)}>
                      {order.quantity}
                    </td>

                    <td className="text-right mono" style={{ fontWeight: 600 }} onClick={() => setSelectedOrderForDetails(order)}>
                      ₹{order.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    <td onClick={() => setSelectedOrderForDetails(order)}>
                      <span className={`badge ${isFilled ? 'badge-positive' : isPending ? 'badge-warning' : 'badge-neutral'}`}>
                        {order.status}
                      </span>
                    </td>

                    <td className="text-right" style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                        <button
                          onClick={() => setSelectedOrderForDetails(order)}
                          className="btn btn-secondary btn-sm"
                          style={{ height: 22, padding: '0 6px', fontSize: 10 }}
                          title="View Execution Timeline"
                        >
                          Timeline
                        </button>
                        {isPending ? (
                          <button
                            onClick={() => cancelOrder(order.id)}
                            className="btn btn-ghost btn-sm text-negative"
                            style={{ height: 22, padding: '0 6px', fontSize: 10 }}
                          >
                            Cancel
                          </button>
                        ) : (
                          <button
                            onClick={() => openQuickOrder({
                              symbol: order.symbol,
                              name: order.name,
                              side: order.side,
                              price: order.price,
                              initialQty: order.quantity
                            })}
                            className="btn btn-secondary btn-sm"
                            style={{ height: 22, padding: '0 8px', fontSize: 10 }}
                          >
                            Repeat
                          </button>
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
    </div>
  );
};
