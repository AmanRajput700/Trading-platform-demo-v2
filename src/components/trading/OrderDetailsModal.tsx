import React from 'react';
import { X, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import { useTrading } from '../../context/TradingContext';

export const OrderDetailsModal: React.FC = () => {
  const { selectedOrderForDetails, setSelectedOrderForDetails, navigateToInstrument } = useTrading();

  if (!selectedOrderForDetails) return null;

  const order = selectedOrderForDetails;
  const isBuy = order.side === 'BUY';
  const isFilled = order.status === 'FILLED';
  const isRejected = order.status === 'REJECTED';

  const timelineSteps = [
    { title: 'Signal Generated', time: '10:42:12 AM', detail: 'Strategy trigger or manual ticket placement verified', status: 'completed' },
    { title: 'Pre-Trade Risk Check', time: '10:42:13 AM', detail: 'Margin, circuit limits & daily loss guard passed', status: 'completed' },
    { title: 'Order Submitted to DMA', time: '10:42:14 AM', detail: 'Routed via Zerodha Kite Connect FIX protocol', status: 'completed' },
    { title: 'Exchange Execution', time: order.timestamp, detail: isFilled ? `Filled @ ₹${order.price.toFixed(2)} on NSE` : isRejected ? 'Rejected by broker risk engine' : 'Pending in central limit order book', status: isFilled ? 'completed' : isRejected ? 'failed' : 'current' }
  ];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(11, 14, 20, 0.65)',
      backdropFilter: 'blur(3px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 115,
      padding: 'var(--space-4)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: 520,
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-modal)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          backgroundColor: 'var(--bg-sunken)',
          borderBottom: '1px solid var(--border-default)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className={`badge ${isBuy ? 'badge-positive' : 'badge-negative'}`}>
              {order.side}
            </span>
            <span style={{ fontWeight: 700, fontSize: 14 }}>{order.symbol}</span>
            <span className="badge badge-neutral" style={{ fontSize: 10 }}>{order.exchange}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className={`badge ${
              order.status === 'FILLED' ? 'badge-positive' : order.status === 'PENDING' ? 'badge-warning' : 'badge-negative'
            }`}>
              {order.status}
            </span>
            <button 
              onClick={() => setSelectedOrderForDetails(null)}
              className="btn btn-ghost btn-sm"
              style={{ padding: 4 }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 14, maxHeight: '80vh', overflowY: 'auto' }}>
          {/* Order Summary Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 8,
            backgroundColor: 'var(--bg-sunken)',
            padding: '10px 12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: 11
          }}>
            <div>
              <div className="text-secondary" style={{ fontSize: 10 }}>Order ID</div>
              <div className="mono" style={{ fontWeight: 600, fontSize: 11 }}>{order.id}</div>
            </div>
            <div>
              <div className="text-secondary" style={{ fontSize: 10 }}>Order Type</div>
              <div style={{ fontWeight: 600 }}>{order.orderType} · {order.product}</div>
            </div>
            <div>
              <div className="text-secondary" style={{ fontSize: 10 }}>Quantity</div>
              <div className="mono" style={{ fontWeight: 700 }}>{order.quantity} shares</div>
            </div>
            <div>
              <div className="text-secondary" style={{ fontSize: 10 }}>Price</div>
              <div className="mono" style={{ fontWeight: 700 }}>₹{order.price.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-secondary" style={{ fontSize: 10 }}>Avg Fill Price</div>
              <div className="mono" style={{ fontWeight: 700 }}>₹{(order.avgPrice || order.price).toFixed(2)}</div>
            </div>
            <div>
              <div className="text-secondary" style={{ fontSize: 10 }}>Total Value</div>
              <div className="mono" style={{ fontWeight: 700 }}>₹{(order.price * order.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            </div>
          </div>

          {/* Rejection Notice if rejected */}
          {order.status === 'REJECTED' && (
            <div style={{
              backgroundColor: 'var(--negative-bg)',
              border: '1px solid var(--negative-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 12px',
              fontSize: 11.5,
              color: 'var(--negative)'
            }}>
              <strong>Rejection Reason:</strong> {order.rejectionReason || 'Insufficient collateral margin for execution.'}
            </div>
          )}

          {/* 4-Stage Execution Timeline */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)', marginBottom: 8 }}>
              Execution Lifecycle Timeline
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {timelineSteps.map((step, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    backgroundColor: step.status === 'completed' ? 'var(--positive-bg)' : step.status === 'failed' ? 'var(--negative-bg)' : 'var(--bg-sunken)',
                    border: `1px solid ${step.status === 'completed' ? 'var(--positive-border)' : step.status === 'failed' ? 'var(--negative-border)' : 'var(--border-default)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: 1
                  }}>
                    {step.status === 'completed' ? (
                      <CheckCircle size={11} style={{ color: 'var(--positive)' }} />
                    ) : (
                      <Clock size={11} style={{ color: 'var(--text-secondary)' }} />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{step.title}</span>
                      <span className="mono text-muted" style={{ fontSize: 10 }}>{step.time}</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 1 }}>
                      {step.detail}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 16px',
          borderTop: '1px solid var(--border-default)',
          backgroundColor: 'var(--bg-sunken)'
        }}>
          <button
            onClick={() => {
              setSelectedOrderForDetails(null);
              navigateToInstrument(order.symbol);
            }}
            className="btn btn-secondary btn-sm"
            style={{ gap: 5, fontSize: 11.5 }}
          >
            <ExternalLink size={12} />
            <span>View Instrument & Depth</span>
          </button>
          <button
            onClick={() => setSelectedOrderForDetails(null)}
            className="btn btn-primary btn-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
