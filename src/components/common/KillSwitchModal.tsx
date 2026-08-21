import React from 'react';
import { OctagonAlert, X, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useTrading } from '../../context/TradingContext';

export const KillSwitchModal: React.FC = () => {
  const { 
    isKillSwitchActive, 
    isKillSwitchModalOpen, 
    setIsKillSwitchModalOpen, 
    haltTrading, 
    resumeTrading 
  } = useTrading();

  if (!isKillSwitchModalOpen) return null;

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
          backgroundColor: isKillSwitchActive ? 'var(--bg-sunken)' : 'var(--negative-bg)',
          borderBottom: '1px solid var(--border-default)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <OctagonAlert size={18} style={{ color: isKillSwitchActive ? 'var(--positive)' : 'var(--negative)' }} />
            <span style={{ fontWeight: 700, fontSize: 14, color: isKillSwitchActive ? 'var(--text-primary)' : 'var(--negative)' }}>
              {isKillSwitchActive ? 'Resume Trading System' : 'Emergency Kill Switch'}
            </span>
          </div>
          <button 
            onClick={() => setIsKillSwitchModalOpen(false)}
            className="btn btn-ghost btn-sm"
            style={{ padding: 4 }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {!isKillSwitchActive ? (
            <>
              <div style={{
                backgroundColor: 'var(--bg-sunken)',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                fontSize: 12,
                lineHeight: 1.5,
                color: 'var(--text-primary)'
              }}>
                <strong>Halt all trading?</strong>
                <p style={{ marginTop: 4, color: 'var(--text-secondary)' }}>
                  This immediately stops new order placement across all active strategies, scanners, and manual order tickets. Existing open positions are <strong>not closed</strong>.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, color: 'var(--warning)' }}>
                <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                <span>Requires manual resumption once risk conditions clear.</span>
              </div>
            </>
          ) : (
            <div style={{
              backgroundColor: 'var(--positive-bg)',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--positive-border)',
              fontSize: 12,
              lineHeight: 1.5
            }}>
              <strong>Resume standard trading operations?</strong>
              <p style={{ marginTop: 4, color: 'var(--text-secondary)' }}>
                Active strategies will resume live scanning and order execution according to defined parameters.
              </p>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button
              onClick={() => setIsKillSwitchModalOpen(false)}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              Cancel
            </button>

            {!isKillSwitchActive ? (
              <button
                onClick={haltTrading}
                className="btn btn-sell"
                style={{ flex: 1.5, gap: 6, fontWeight: 700 }}
              >
                <OctagonAlert size={14} />
                <span>Halt Trading Now</span>
              </button>
            ) : (
              <button
                onClick={resumeTrading}
                className="btn btn-buy"
                style={{ flex: 1.5, gap: 6, fontWeight: 700 }}
              >
                <ShieldCheck size={14} />
                <span>Resume Trading</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
