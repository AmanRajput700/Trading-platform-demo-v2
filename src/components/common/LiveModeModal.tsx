import React, { useState } from 'react';
import { ShieldAlert, X, CheckSquare, Square, Zap } from 'lucide-react';
import { useTrading } from '../../context/TradingContext';

export const LiveModeModal: React.FC = () => {
  const { isLiveConfirmOpen, setIsLiveConfirmOpen, setTradingMode, addToast } = useTrading();
  const [hasAcknowledged, setHasAcknowledged] = useState(false);

  if (!isLiveConfirmOpen) return null;

  const handleConfirm = () => {
    if (!hasAcknowledged) return;
    setTradingMode('LIVE');
    setIsLiveConfirmOpen(false);
    setHasAcknowledged(false);
    addToast({
      type: 'warning',
      title: 'LIVE TRADING ACTIVE',
      message: 'Switched to Live Trading mode. Automated signals will route orders to connected broker adapter.'
    });
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(11, 14, 20, 0.65)',
      backdropFilter: 'blur(3px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 120,
      padding: 'var(--space-4)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: 440,
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-modal)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 16px',
          backgroundColor: 'var(--warning-bg)',
          borderBottom: '1px solid var(--border-default)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldAlert size={18} style={{ color: 'var(--warning)' }} />
            <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--warning)' }}>
              Enable Live Trading Mode
            </span>
          </div>
          <button 
            onClick={() => setIsLiveConfirmOpen(false)}
            className="btn btn-ghost btn-sm"
            style={{ padding: 4 }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{
            backgroundColor: 'var(--bg-sunken)',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            fontSize: 12,
            lineHeight: 1.5
          }}>
            <strong>Live Order Routing Notice:</strong>
            <p style={{ marginTop: 4, color: 'var(--text-secondary)' }}>
              You are about to activate <strong>Live Trading mode</strong>. Triggered strategy conditions and manual order tickets will result in live orders dispatched to the linked broker (Zerodha Kite / Angel One).
            </p>
          </div>

          {/* Checkbox */}
          <div 
            onClick={() => setHasAcknowledged(!hasAcknowledged)}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
              cursor: 'pointer',
              userSelect: 'none',
              padding: '4px 0'
            }}
          >
            {hasAcknowledged ? (
              <CheckSquare size={16} style={{ color: 'var(--accent-primary)', flexShrink: 0, marginTop: 2 }} />
            ) : (
              <Square size={16} style={{ color: 'var(--text-tertiary)', flexShrink: 0, marginTop: 2 }} />
            )}
            <span style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.4 }}>
              I understand that algorithmic conditions may execute real trades with simulated or real margin balances.
            </span>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button
              onClick={() => setIsLiveConfirmOpen(false)}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!hasAcknowledged}
              className="btn btn-primary"
              style={{
                flex: 1.5,
                gap: 6,
                fontWeight: 700,
                opacity: hasAcknowledged ? 1 : 0.5,
                cursor: hasAcknowledged ? 'pointer' : 'not-allowed'
              }}
            >
              <Zap size={14} />
              <span>Activate Live Mode</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
