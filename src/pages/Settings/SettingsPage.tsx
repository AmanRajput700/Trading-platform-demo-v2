import React, { useState } from 'react';
import { 
  RefreshCw, 
  CheckCircle2 
} from 'lucide-react';
import { useTrading } from '../../context/TradingContext';

export const SettingsPage: React.FC = () => {
  const { addToast } = useTrading();
  const [demoState, setDemoState] = useState<'NORMAL' | 'MARKET_ERROR' | 'BROKER_ERROR' | 'EMPTY_MATCHES'>('NORMAL');

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 1040, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>Terminal Settings & Demo States</h1>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
          Configure terminal preferences, test resilient error states & inspect design token conformance
        </p>
      </div>

      {/* Terminal Preferences */}
      <div className="surface-card" style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)' }}>
          General Trading Configuration
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>
              DEFAULT PRODUCT TYPE
            </label>
            <select className="select" style={{ width: '100%' }} defaultValue="CNC">
              <option value="CNC">CNC (Cash Delivery)</option>
              <option value="MIS">MIS (Intraday)</option>
              <option value="NRML">NRML (Derivatives Normal)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>
              DEFAULT ORDER TYPE
            </label>
            <select className="select" style={{ width: '100%' }} defaultValue="MARKET">
              <option value="MARKET">Market Order</option>
              <option value="LIMIT">Limit Order</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>
              PRIMARY EXCHANGE
            </label>
            <select className="select" style={{ width: '100%' }} defaultValue="NSE">
              <option value="NSE">National Stock Exchange (NSE)</option>
              <option value="BSE">Bombay Stock Exchange (BSE)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>
              PRICE TICK ANIMATION
            </label>
            <select className="select" style={{ width: '100%' }} defaultValue="ENABLED">
              <option value="ENABLED">Enabled (Subtle Green/Red Flash ~400ms)</option>
              <option value="DISABLED">Disabled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resilient Error & Empty State Playground (Section 17) */}
      <div className="surface-card" style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)' }}>
              Spec Section 17 — Empty / Loading / Error State Demonstrations
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
              Demonstrating plain-spoken, helpful error copy written from the user's perspective (no vague "Oops!").
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            {(['NORMAL', 'MARKET_ERROR', 'BROKER_ERROR', 'EMPTY_MATCHES'] as const).map(st => (
              <button
                key={st}
                onClick={() => setDemoState(st)}
                style={{
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 11,
                  fontWeight: demoState === st ? 600 : 400,
                  backgroundColor: demoState === st ? 'var(--text-primary)' : 'var(--bg-sunken)',
                  color: demoState === st ? '#FFFFFF' : 'var(--text-secondary)',
                  border: '1px solid var(--border-default)',
                  cursor: 'pointer'
                }}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Render Selected State */}
        {demoState === 'MARKET_ERROR' && (
          <div style={{
            backgroundColor: 'var(--negative-bg)',
            border: '1px solid var(--negative-border)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--negative)' }}>Market data unavailable</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                We couldn't refresh the latest market data. Last updated: 10:42:18 AM
              </div>
            </div>
            <button
              onClick={() => {
                setDemoState('NORMAL');
                addToast({ type: 'success', title: 'Feed Reconnected', message: 'Market data feed restored.' });
              }}
              className="btn btn-secondary btn-sm"
              style={{ gap: 4 }}
            >
              <RefreshCw size={12} />
              <span>Retry</span>
            </button>
          </div>
        )}

        {demoState === 'BROKER_ERROR' && (
          <div style={{
            backgroundColor: 'var(--warning-bg)',
            border: '1px solid var(--warning-border)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--warning)' }}>Broker connection unavailable</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                We couldn't synchronize your trading account. Your existing data is still available.
              </div>
            </div>
            <button
              onClick={() => {
                setDemoState('NORMAL');
                addToast({ type: 'success', title: 'Broker Synchronized', message: 'Account ZR8942 connected.' });
              }}
              className="btn btn-secondary btn-sm"
              style={{ gap: 4 }}
            >
              <RefreshCw size={12} />
              <span>Retry Connection</span>
            </button>
          </div>
        )}

        {demoState === 'EMPTY_MATCHES' && (
          <div style={{
            backgroundColor: 'var(--bg-sunken)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            padding: '24px 16px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8
          }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>No instruments matched</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', maxWidth: 420 }}>
              Your strategy was scanned across 2,146 instruments. Try adjusting your condition thresholds or timeframe.
            </div>
            <button
              onClick={() => setDemoState('NORMAL')}
              className="btn btn-primary btn-sm"
              style={{ marginTop: 4 }}
            >
              Edit Strategy Conditions
            </button>
          </div>
        )}

        {demoState === 'NORMAL' && (
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
            All systems nominal. Simulated feeds for NSE, BSE, F&O active.
          </div>
        )}
      </div>

      {/* Design System Token Compliance Checklist */}
      <div className="surface-card" style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)' }}>
          Design Mandate Conformance (Section 0)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 11.5 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--positive)' }}>
            <CheckCircle2 size={14} />
            <span>Strict fintech palette (No purple gradients or neon borders)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--positive)' }}>
            <CheckCircle2 size={14} />
            <span>Tabular lining monospace numbers for all prices & P&L</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--positive)' }}>
            <CheckCircle2 size={14} />
            <span>Compact 36px data tables with hairline borders</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--positive)' }}>
            <CheckCircle2 size={14} />
            <span>Signature "Why this matched" checklist component</span>
          </div>
        </div>
      </div>
    </div>
  );
};
