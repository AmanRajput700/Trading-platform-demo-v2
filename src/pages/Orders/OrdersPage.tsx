import React, { useState } from 'react';
import { 
  Search, 
  X, 
  Edit3, 
  RotateCcw, 
  Plus
} from 'lucide-react';
import { useTrading } from '../../context/TradingContext';
import { OrderSide, ProductType, Order } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';

export const OrdersPage: React.FC = () => {
  const { 
    orders, 
    cancelOrder, 
    updateOrder, 
    navigateToInstrument, 
    openQuickOrder, 
    setSelectedOrderForDetails 
  } = useTrading();

  const [activeTab, setActiveTab] = useState<'ALL' | 'OPEN' | 'EXECUTED' | 'GTT' | 'CANCELLED'>('OPEN');
  const [productFilter, setProductFilter] = useState<'ALL' | ProductType>('ALL');
  const [sideFilter, setSideFilter] = useState<'ALL' | OrderSide>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

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
      {/* Header */}
      <PageHeader
        title="Orders & Execution Book"
        subtitle="Motilal Oswal style order lifecycle management, open limit tickets, fills & trade audit"
        badge={{ text: `MO Trader`, variant: 'accent' }}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => openQuickOrder({
                symbol: 'RELIANCE',
                name: 'Reliance Industries Ltd.',
                side: 'BUY',
                price: 1482.30,
                initialQty: 10
              })}
              className="btn btn-primary btn-sm"
              style={{ gap: 6, fontWeight: 700 }}
            >
              <Plus size={14} />
              <span>Place New Order</span>
            </button>
          </div>
        }
      />

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
