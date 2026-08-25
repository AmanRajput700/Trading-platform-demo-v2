import React from 'react';
import { 
  ShieldCheck, 
  X, 
  Lock, 
  CheckCircle2 
} from 'lucide-react';
import { useTrading } from '../../context/TradingContext';

export const TradeConfirmationModal: React.FC = () => {
  const {
    isTradeConfirmModalOpen,
    pendingTradeToConfirm,
    confirmApprovedTrade,
    cancelPendingTrade,
    portfolio,
    brokerState
  } = useTrading();

  if (!isTradeConfirmModalOpen || !pendingTradeToConfirm) return null;

  const isBuy = pendingTradeToConfirm.side === 'BUY';
  const totalValue = +(pendingTradeToConfirm.price * pendingTradeToConfirm.quantity).toFixed(2);
  const hasSufficientMargin = totalValue <= (portfolio.availableMargin || 250000);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(5, 8, 14, 0.82)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 120,
      padding: '16px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: 520,
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 20px 45px rgba(0, 0, 0, 0.6)',
        overflow: 'hidden',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-default)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: isBuy ? 'rgba(16, 185, 129, 0.06)' : 'rgba(239, 68, 68, 0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 'var(--radius-sm)',
              backgroundColor: isBuy ? 'rgba(16, 185, 129, 0.18)' : 'rgba(239, 68, 68, 0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isBuy ? '#10B981' : '#EF4444'
            }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>Trade Authorization Required</span>
                <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: 4,
                  backgroundColor: 'rgba(56, 189, 248, 0.15)',
                  color: '#38BDF8',
                  letterSpacing: '0.04em'
                }}>
                  SEMI-AUTO SAFEGUARD
                </span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                Please review and approve this order before broker submission
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={cancelPendingTrade}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: 4,
              borderRadius: 'var(--radius-sm)'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Trade Details Card */}
        <div style={{ padding: '20px' }}>
          {/* Main Action Banner */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: isBuy ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
            border: `1px solid ${isBuy ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            marginBottom: 16
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  fontWeight: 900,
                  fontSize: 12,
                  padding: '3px 8px',
                  borderRadius: 4,
                  backgroundColor: isBuy ? '#10B981' : '#EF4444',
                  color: '#FFFFFF'
                }}>
                  {pendingTradeToConfirm.side}
                </span>
                <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-primary)' }}>
                  {pendingTradeToConfirm.symbol}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
                  NSE • {pendingTradeToConfirm.product}
                </span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
                Trigger Source: <strong style={{ color: '#38BDF8' }}>{pendingTradeToConfirm.strategyName || 'Strategy Scanner / Manual Execution'}</strong>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                ₹{pendingTradeToConfirm.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                Qty: <strong style={{ color: 'var(--text-primary)' }}>{pendingTradeToConfirm.quantity}</strong>
              </div>
            </div>
          </div>

          {/* Breakdown Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 10,
            marginBottom: 16
          }}>
            <div style={{
              padding: '10px 12px',
              backgroundColor: 'var(--bg-sunken)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-default)'
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Total Order Value
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                ₹{totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div style={{
              padding: '10px 12px',
              backgroundColor: 'var(--bg-sunken)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-default)'
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Order Type & Validity
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
                {pendingTradeToConfirm.orderType} • DAY
              </div>
            </div>

            <div style={{
              padding: '10px 12px',
              backgroundColor: 'var(--bg-sunken)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-default)'
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Broker Destination
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: brokerState === 'Connected' ? '#10B981' : '#F59E0B' }} />
                <span>Upstox Pro {brokerState === 'Connected' ? '(Live)' : '(Demo Mode)'}</span>
              </div>
            </div>

            <div style={{
              padding: '10px 12px',
              backgroundColor: 'var(--bg-sunken)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-default)'
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Available Margin
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: hasSufficientMargin ? '#10B981' : '#EF4444', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                ₹{(portfolio.availableMargin || 250000).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Safety Notice */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            padding: '10px 12px',
            backgroundColor: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: 20
          }}>
            <Lock size={15} style={{ color: '#F59E0B', flexShrink: 0, marginTop: 2 }} />
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              <strong>Zero Auto-Order Policy Active:</strong> AuraTrade will never dispatch an order to your broker without your direct confirmation. Click <strong>Approve & Place Order</strong> below to execute.
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="button"
              onClick={cancelPendingTrade}
              className="btn btn-secondary"
              style={{ flex: 1, height: 40, fontSize: 12.5, fontWeight: 600 }}
            >
              Cancel / Reject
            </button>
            <button
              type="button"
              onClick={confirmApprovedTrade}
              className="btn btn-primary"
              style={{
                flex: 2,
                height: 40,
                fontSize: 12.5,
                fontWeight: 700,
                backgroundColor: isBuy ? '#10B981' : '#EF4444',
                borderColor: isBuy ? '#10B981' : '#EF4444',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              <CheckCircle2 size={16} />
              <span>Approve & Place {pendingTradeToConfirm.side} Order</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
